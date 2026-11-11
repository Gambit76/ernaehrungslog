/**
 * Api.gs – Schnittstelle für die Ernährungslog-App (PWA auf GitHub Pages)
 *
 * Gehört in das Apps Script des Google Sheets „Ernährungslog“
 * (Sheet öffnen → Erweiterungen → Apps Script → Inhalt von Code.gs durch diese Datei ersetzen).
 *
 * Einrichtung (Details in docs/Einrichtung.md):
 *  1. Funktion „setupKey“ einmal ausführen, Schlüssel aus dem Ausführungsprotokoll kopieren.
 *  2. Bereitstellen → Neue Bereitstellung → Web-App, Ausführen als: Ich, Zugriff: Jeder.
 *     (Geschützt wird über den Schlüssel. Ohne Schlüssel liefert die Schnittstelle keine Daten.)
 *
 * Blätter (werden bei Bedarf automatisch angelegt):
 *  - Einträge:      eine Zeile pro Lebensmittel und Mahlzeit
 *  - Tage:          Tagestyp (Training/Gravel/Ruhetag), Phase und Notiz je Datum
 *  - Lebensmittel:  eigene Lebensmittel und korrigierte Nährwerte (überschreiben die App-Standardwerte)
 *  - Tagesübersicht: Summen je Tag (Formel, nur zum Anschauen)
 */

const NL_ENTRIES = 'Einträge';
const NL_DAYS = 'Tage';
const NL_FOODS = 'Lebensmittel';
const NL_OVERVIEW = 'Tagesübersicht';
const NL_LOAD_DAYS = 400; // so viele Tage zurück lädt die App

const NL_HEAD = {};
NL_HEAD[NL_ENTRIES] = ['Datum', 'Mahlzeit', 'Lebensmittel', 'Menge', 'Einheit', 'kcal', 'Protein (g)', 'KH (g)', 'Fett (g)', 'Quelle', 'ID', 'Lebensmittel-ID', 'Geändert'];
NL_HEAD[NL_DAYS] = ['Datum', 'Tagestyp', 'Phase', 'Notiz', 'Geändert'];
NL_HEAD[NL_FOODS] = ['ID', 'Name', 'Bezug', 'kcal', 'Protein (g)', 'KH (g)', 'Fett (g)', 'Einheiten', 'Kategorie', 'Notiz', 'Geändert'];

const NL_MEALS = { fruehstueck: 'Frühstück', mittag: 'Mittag', snack: 'Snacks & Getränke', abend: 'Abend' };
const NL_TYPES = { train: 'Krafttraining', gravel: 'Gravelbike', rest: 'Ruhetag' };
const NL_PHASES = { bulk: 'Lean Bulk', erhaltung: 'Erhaltung', diaet: 'Mini-Diät' };

/** Einmal ausführen: erzeugt den geheimen App-Schlüssel (erneut ausführen = neuer Schlüssel). */
function setupKey() {
  const key = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
  PropertiesService.getScriptProperties().setProperty('NL_KEY', key);
  NL_ensureSheets_();
  Logger.log('Dein App-Schlüssel: ' + key);
}

/** Legt fehlende Blätter und Kopfzeilen an. Kann jederzeit gefahrlos ausgeführt werden. */
function setupSheets() {
  NL_ensureSheets_();
  Logger.log('Blätter geprüft.');
}

function doGet(e) {
  return NL_handle_((e && e.parameter) || {}, false);
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return NL_json_({ ok: false, error: 'bad_request', message: 'Ungültige Anfrage' });
  }
  return NL_handle_(body, true);
}

function NL_handle_(p, isPost) {
  try {
    const key = PropertiesService.getScriptProperties().getProperty('NL_KEY');
    if (!key) return NL_json_({ ok: false, error: 'no_key' });
    if (String(p.key || '') !== key) return NL_json_({ ok: false, error: 'unauthorized' });

    if (p.action === 'ping') return NL_json_({ ok: true, app: 'ernaehrungslog' });
    if (p.action === 'load') return NL_json_(NL_load_());
    if (p.action === 'apply' && isPost) return NL_json_(NL_apply_(p.ops));
    return NL_json_({ ok: false, error: 'bad_request', message: 'Unbekannte Aktion' });
  } catch (err) {
    return NL_json_({ ok: false, error: 'server', message: String((err && err.message) || err) });
  }
}

/* ---------- Lesen ---------- */

function NL_load_() {
  const ss = NL_ensureSheets_();
  const tz = ss.getSpreadsheetTimeZone();
  const minIso = Utilities.formatDate(new Date(Date.now() - NL_LOAD_DAYS * 86400000), tz, 'yyyy-MM-dd');

  const entries = [];
  NL_rows_(ss.getSheetByName(NL_ENTRIES), 13).forEach(function (r) {
    const date = NL_toISO_(r[0], tz);
    const id = String(r[10] || '').trim();
    if (!date || !id || date < minIso) return;
    entries.push({
      id: id, date: date, meal: NL_mealKey_(r[1]), name: String(r[2] || ''),
      qty: NL_num_(r[3]), unit: String(r[4] || ''),
      kcal: NL_num_(r[5]) || 0, p: NL_num_(r[6]) || 0, c: NL_num_(r[7]) || 0, f: NL_num_(r[8]) || 0,
      src: String(r[9] || ''), fid: String(r[11] || '')
    });
  });

  const days = [];
  NL_rows_(ss.getSheetByName(NL_DAYS), 4).forEach(function (r) {
    const date = NL_toISO_(r[0], tz);
    if (!date || date < minIso) return;
    days.push({ date: date, type: NL_revKey_(NL_TYPES, r[1]), phase: NL_revKey_(NL_PHASES, r[2]), note: String(r[3] || '') });
  });

  const foods = [];
  NL_rows_(ss.getSheetByName(NL_FOODS), 10).forEach(function (r) {
    const id = String(r[0] || '').trim();
    if (!id) return;
    foods.push({
      id: id, name: String(r[1] || ''), per: String(r[2] || '100 g'),
      kcal: NL_num_(r[3]) || 0, p: NL_num_(r[4]) || 0, c: NL_num_(r[5]) || 0, f: NL_num_(r[6]) || 0,
      units: String(r[7] || ''), cat: String(r[8] || ''), note: String(r[9] || '')
    });
  });

  return { ok: true, entries: entries, days: days, foods: foods };
}

/* ---------- Schreiben ---------- */

/**
 * ops: [{t:'put', e:{…}}, {t:'del', id}, {t:'day', date, type, phase, note}, {t:'food', f:{…}}, {t:'fooddel', id}]
 * Mehrfaches Senden derselben Operation ist unschädlich (Abgleich über ID bzw. Datum).
 */
function NL_apply_(ops) {
  if (!Array.isArray(ops)) return { ok: false, error: 'bad_request', message: 'Keine Änderungen übergeben' };
  if (!ops.length) return { ok: true, applied: 0 };

  // Pro ID / Datum zählt nur die letzte Operation
  const ent = {}, day = {}, food = {};
  ops.forEach(function (o) {
    if (!o || !o.t) return;
    if (o.t === 'put' && o.e && o.e.id) ent[o.e.id] = o;
    else if (o.t === 'del' && o.id) ent[o.id] = o;
    else if (o.t === 'day' && /^\d{4}-\d{2}-\d{2}$/.test(String(o.date || ''))) day[o.date] = o;
    else if (o.t === 'food' && o.f && o.f.id) food[o.f.id] = o;
    else if (o.t === 'fooddel' && o.id) food[o.id] = o;
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = NL_ensureSheets_();
    const tz = ss.getSpreadsheetTimeZone();
    const now = new Date();
    NL_applyEntries_(ss.getSheetByName(NL_ENTRIES), ent, now);
    NL_applyDays_(ss.getSheetByName(NL_DAYS), day, tz, now);
    NL_applyFoods_(ss.getSheetByName(NL_FOODS), food, now);
  } finally {
    lock.releaseLock();
  }
  return { ok: true, applied: ops.length };
}

function NL_applyEntries_(sh, ops, now) {
  const ids = Object.keys(ops);
  if (!ids.length) return;
  const index = NL_index_(sh, 11); // Spalte K = ID
  const appends = [], dels = [];

  ids.forEach(function (id) {
    const o = ops[id];
    const row = index[id];
    if (o.t === 'del') { if (row) dels.push(row); return; }
    const e = o.e;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(e.date || ''))) return;
    const vals = [
      NL_serial_(e.date), NL_MEALS[e.meal] || String(e.meal || ''), String(e.name || '').slice(0, 200),
      NL_cell_(e.qty), String(e.unit || ''),
      NL_round_(e.kcal, 0), NL_round_(e.p, 1), NL_round_(e.c, 1), NL_round_(e.f, 1),
      String(e.src || ''), id, String(e.fid || ''), now
    ];
    if (row) NL_writeRow_(sh, row, vals);
    else appends.push(vals);
  });

  if (appends.length) {
    const start = NL_lastRow_(sh) + 1;
    const rng = sh.getRange(start, 1, appends.length, 13);
    rng.setValues(appends);
    sh.getRange(start, 1, appends.length, 1).setNumberFormat('dd.MM.yyyy');
    sh.getRange(start, 13, appends.length, 1).setNumberFormat('dd.MM.yyyy HH:mm');
  }
  dels.sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
}

function NL_applyDays_(sh, ops, tz, now) {
  const dates = Object.keys(ops);
  if (!dates.length) return;
  const index = {};
  NL_rows_(sh, 1).forEach(function (r, i) { const d = NL_toISO_(r[0], tz); if (d) index[d] = i + 2; });
  dates.forEach(function (d) {
    const o = ops[d];
    const vals = [NL_serial_(d), NL_TYPES[o.type] || '', NL_PHASES[o.phase] || '', String(o.note || '').slice(0, 500), now];
    if (index[d]) NL_writeRow_(sh, index[d], vals);
    else {
      const row = NL_lastRow_(sh) + 1;
      sh.getRange(row, 1, 1, 5).setValues([vals]);
      sh.getRange(row, 1).setNumberFormat('dd.MM.yyyy');
      sh.getRange(row, 5).setNumberFormat('dd.MM.yyyy HH:mm');
      index[d] = row;
    }
  });
}

function NL_applyFoods_(sh, ops, now) {
  const ids = Object.keys(ops);
  if (!ids.length) return;
  const index = NL_index_(sh, 1);
  const dels = [];
  ids.forEach(function (id) {
    const o = ops[id];
    if (o.t === 'fooddel') { if (index[id]) dels.push(index[id]); return; }
    const f = o.f;
    const vals = [id, String(f.name || '').slice(0, 120), String(f.per || '100 g'),
      NL_round_(f.kcal, 0), NL_round_(f.p, 1), NL_round_(f.c, 1), NL_round_(f.f, 1),
      String(f.units || ''), String(f.cat || ''), String(f.note || '').slice(0, 300), now];
    if (index[id]) NL_writeRow_(sh, index[id], vals);
    else {
      const row = NL_lastRow_(sh) + 1;
      sh.getRange(row, 1, 1, 11).setValues([vals]);
      sh.getRange(row, 11).setNumberFormat('dd.MM.yyyy HH:mm');
      index[id] = row;
    }
  });
  dels.sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
}

/* ---------- Blätter ---------- */

function NL_ensureSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [NL_ENTRIES, NL_DAYS, NL_FOODS].forEach(function (name) {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (String(sh.getRange(1, 1).getValue() || '') === '') {
      const head = NL_HEAD[name];
      sh.getRange(1, 1, 1, head.length).setValues([head])
        .setFontWeight('bold').setBackground('#17784a').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
  if (!ss.getSheetByName(NL_OVERVIEW)) {
    const ov = ss.insertSheet(NL_OVERVIEW);
    ov.getRange('A1').setFormula(
      "=IFERROR(QUERY('" + NL_ENTRIES + "'!A:I,\"select A, sum(F), sum(G), sum(H), sum(I) where A is not null " +
      "group by A order by A desc label sum(F) 'kcal', sum(G) 'Protein (g)', sum(H) 'KH (g)', sum(I) 'Fett (g)'\",1),\"Noch keine Einträge\")");
    ov.getRange('A:A').setNumberFormat('dd.MM.yyyy');
    ov.getRange('B:E').setNumberFormat('0');
    ov.setFrozenRows(1);
  }
  return ss;
}

/* ---------- Helfer ---------- */

function NL_rows_(sh, cols) {
  const last = NL_lastRow_(sh);
  return last >= 2 ? sh.getRange(2, 1, last - 1, cols).getValues() : [];
}

function NL_index_(sh, col) {
  const out = {};
  const last = NL_lastRow_(sh);
  if (last < 2) return out;
  sh.getRange(2, col, last - 1, 1).getValues().forEach(function (r, i) {
    const k = String(r[0] || '').trim();
    if (k) out[k] = i + 2;
  });
  return out;
}

function NL_writeRow_(sh, row, vals) {
  sh.getRange(row, 1, 1, vals.length).setValues([vals]);
}

function NL_lastRow_(sh) {
  const n = sh.getLastRow();
  if (n < 2) return 1;
  const col = sh.getRange(1, 1, n, 1).getValues();
  for (let i = n - 1; i >= 1; i--) {
    if (col[i][0] !== '' && col[i][0] !== null) return i + 1;
  }
  return 1;
}

function NL_mealKey_(v) {
  const s = String(v || '').trim();
  for (const k in NL_MEALS) if (NL_MEALS[k] === s || k === s) return k;
  return 'snack';
}

function NL_revKey_(map, v) {
  const s = String(v || '').trim();
  for (const k in map) if (map[k] === s || k === s) return k;
  return '';
}

function NL_num_(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  const x = Number(String(v).trim().replace(',', '.'));
  return isFinite(x) ? x : null;
}

function NL_cell_(v) {
  if (v === null || v === undefined || v === '') return '';
  const x = Number(v);
  return isFinite(x) ? x : '';
}

function NL_round_(v, dec) {
  const x = Number(v);
  if (!isFinite(x)) return 0;
  const m = Math.pow(10, dec);
  return Math.round(x * m) / m;
}

function NL_toISO_(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  if (typeof v === 'number' && v > 0) {
    return Utilities.formatDate(new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000), 'UTC', 'yyyy-MM-dd');
  }
  const s = String(v || '').trim();
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : null;
}

/** Datum als Tabellen-Seriennummer: unabhängig von Zeitzonen. */
function NL_serial_(iso) {
  const p = iso.split('-').map(Number);
  return Math.round((Date.UTC(p[0], p[1] - 1, p[2]) - Date.UTC(1899, 11, 30)) / 86400000);
}

function NL_json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
