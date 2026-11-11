---
tags: [ernaehrung, app, anleitung]
erstellt: 2026-11-11
---

# Ernährungslog-App einrichten (iPhone)

Dauer: ca. 10 Minuten, einmalig. Schritte 1–2 am Rechner, Schritt 3 am iPhone. Das Sheet „Ernährungslog“ mit allen Blättern ist schon angelegt, die App ist auf GitHub Pages online.

| Teil | Wo | Aufgabe |
|---|---|---|
| **Schnittstelle** (`Api.gs`) | Apps Script des Sheets „Ernährungslog“ | Liest und schreibt Einträge, Tage, Lebensmittel |
| **App** | `https://gambit76.github.io/ernaehrungslog/` | Oberfläche auf dem iPhone, funktioniert auch offline |

## 1. Schnittstelle im Sheet anlegen

1. Sheet **Ernährungslog** öffnen → **Erweiterungen → Apps Script**.
2. Im Editor den Inhalt von `Code.gs` komplett löschen und den Inhalt von [`apps-script/Api.gs`](../apps-script/Api.gs) einfügen (auf GitHub: Datei öffnen → „Copy raw file“). Speichern (⌘S). Projektname oben z. B. „Ernährungslog API“.
3. In der Funktionsauswahl oben **`setupKey`** wählen → **Ausführen**.
4. Berechtigungen: **Berechtigungen prüfen** → dein Konto → bei „Google hat diese App nicht überprüft“ **Erweitert → Zu … wechseln (unsicher) → Zulassen**. Das ist bei eigenen Scripts normal.
5. Im **Ausführungsprotokoll** steht `Dein App-Schlüssel: …` → kopieren.

> [!warning] Schlüssel = Passwort
> Wer Schlüssel und URL kennt, kann dein Ernährungslog lesen und beschreiben. Nicht öffentlich ablegen. Falls doch: `setupKey` erneut ausführen und den neuen Schlüssel in der App eintragen (unten „Verbindung ändern“).

## 2. Schnittstelle bereitstellen

1. **Bereitstellen → Neue Bereitstellung** → Zahnrad → **Web-App**.
2. Beschreibung `v1`, **Ausführen als: Ich**, **Zugriff: Jeder** (nötig, damit die App ohne Google-Anmeldung zugreifen kann; geschützt wird über den Schlüssel).
3. **Bereitstellen** → **Web-App-URL** kopieren (endet auf `/exec`).

**Test im Browser:** `DEINE_URL?action=ping&key=DEIN_SCHLÜSSEL` → es muss `{"ok":true,"app":"ernaehrungslog"}` erscheinen.

URL und Schlüssel in einer privaten Apple-Notiz ablegen, damit du sie aufs iPhone bekommst.

## 3. Auf dem iPhone installieren

1. `https://gambit76.github.io/ernaehrungslog/` in **Safari** öffnen.
2. **Teilen → Zum Home-Bildschirm** → Name „Ernährung“ → **Hinzufügen**.
3. Die App **über das neue Icon** starten (das installierte Icon hat einen eigenen Speicher).
4. Web-App-URL und Schlüssel einfügen → **Verbinden**.

## 4. Erster Test

1. Bei Frühstück den Chip „2 Eiweißbrötchen · Hüttenkäse · Pute“ antippen.
2. Status oben wechselt nach 1–2 Sekunden auf „Synchron“.
3. Im Sheet erscheinen im Blatt **Einträge** drei Zeilen, im Blatt **Tage** der heutige Tag, in **Tagesübersicht** die Summe.

## So funktioniert die App

- **Speichern ist automatisch.** Jede Änderung liegt sofort auf dem iPhone und wird 1–2 Sekunden später ins Sheet übertragen, ohne Netz später.
- **Tagestyp:** Mo/Mi/Fr Kraft, Sa Gravel, sonst Ruhetag – pro Tag umstellbar. Er bestimmt Zielwerte und die Reismenge in den Abend-Vorlagen.
- **Phase** (Lean Bulk / Erhaltung / Mini-Diät) unter Info → Tagesziele & Phase. Gilt für alle Tage ohne eigenen Eintrag im Blatt „Tage“.
- **Nährwerte korrigieren:** Info → Lebensmittel-Werte → Lebensmittel antippen. Mit * markierte Werte (Aldi-Eiweißbrot, Whey, Hepafast) sind Schätzwerte, bitte einmal mit der Packung abgleichen.
- **Mengen ändern:** Zahl in der Liste antippen, neuen Wert eingeben, fertig.

## Fehlerbehebung

| Meldung / Problem | Ursache | Lösung |
|---|---|---|
| „Der Schlüssel passt nicht“ | Tippfehler oder `setupKey` erneut ausgeführt | Schlüssel aus dem Protokoll neu eintragen |
| „Unter dieser URL antwortet kein Ernährungslog-Script“ | Editor-URL statt `/exec`-URL | URL aus *Bereitstellungen verwalten* kopieren |
| „Google ist gerade nicht erreichbar“, dauerhaft | Bereitstellung nicht auf „Zugriff: Jeder“ | Bereitstellung bearbeiten |
| „Im Apps Script fehlt noch der Schlüssel“ | `setupKey` nie ausgeführt | Schritt 1.3 nachholen |
| App zeigt alte Version | Cache | App zweimal öffnen bzw. schließen und neu starten |
