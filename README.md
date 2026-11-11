# Ernährungslog-App

iPhone-Web-App (PWA) für Saschas Ernährungsplan. Läuft über GitHub Pages, speichert alle Einträge im Google Sheet **Ernährungslog** und funktioniert auch offline. Gegenstück zur [Trainingslog-App](https://github.com/Gambit76/trainingslog).

## Zugriffsschutz

Im Repo liegen **keine Daten, keine URL und kein Schlüssel**, nur die App-Oberfläche. Wer die Seite ohne Zugangsdaten aufruft, sieht nur die Verbindungsmaske. Lesen und Schreiben im Sheet geht ausschließlich mit Web-App-URL **und** geheimem Schlüssel (Apps-Script-Funktion `setupKey`). Beides wird nur in der installierten App auf dem iPhone gespeichert.

## Aufbau

| Pfad | Zweck | Wo es läuft |
|---|---|---|
| `index.html` | Die komplette App (Oberfläche, Lebensmittel-Werte, Vorlagen, Ziele) | GitHub Pages |
| `sw.js` | Offline-Cache. **Bei jeder Änderung `VERSION` hochzählen** | GitHub Pages |
| `manifest.webmanifest`, `icons/` | Name und Icon auf dem Home-Bildschirm | GitHub Pages |
| `apps-script/Api.gs` | Schnittstelle zum Sheet (Lesen/Schreiben) | Apps Script im Sheet „Ernährungslog“ |
| `docs/Einrichtung.md` | Ersteinrichtung Schritt für Schritt | – |

## Funktionen (v1)

- **Eintragen:** Tag wählen, Tagestyp (Kraft / Gravel / Ruhetag, vorbelegt nach Wochentag). Pro Mahlzeit Chips mit Vorlagen (z. B. „2 Eiweißbrötchen · Hüttenkäse · Pute“, „Kabeljau · Gemüse · Reis“ mit Reismenge je Phase und Tagestyp), „Wie Mo 10.11.“ zum Übernehmen der letzten gleichen Mahlzeit, Lebensmittel aus der Datenbank mit Einheiten (Stück, Scheibe, EL …) oder freie Eingabe. Mengen direkt in der Liste änderbar, Nährwerte rechnen sich mit. Tagessumme oben mit Zielkorridor.
- **Analyse:** Tagesansicht (Makros gegen Ziel, Energieverteilung, Protein je Mahlzeit gegen die 40-g-Schwelle, konkrete Hinweise was noch fehlt, Top-Proteinquellen) und Zeitraum (7/14/30/90 Tage oder frei: Durchschnitte, Tage im Ziel, Kalorien- und Proteinverlauf, Tagestabelle).
- **Info:** Tagesziele je Phase (Phase umstellbar), Tagesplan, Garanleitungen (Hähnchenbrust, Kabeljau, Lachs, Thermomix, Auftauen), Eiweiß-Upgrades und Aufstrich-Vergleich, Carb Cycling, Wein & Events, No-Gos, Lebensmittel-Werte bearbeiten.

## Google Sheet

| Blatt | Inhalt |
|---|---|
| Einträge | Eine Zeile pro Lebensmittel: Datum, Mahlzeit, Lebensmittel, Menge, Einheit, kcal, Protein, KH, Fett, Quelle, ID … |
| Tage | Tagestyp, Phase und Notiz je Datum |
| Lebensmittel | Eigene Lebensmittel und korrigierte Werte (gelten vor den Standardwerten in `index.html`) |
| Tagesübersicht | Summen je Tag (Formel) |

## Update veröffentlichen

1. Dateien ändern.
2. In `sw.js` die Zeile `const VERSION = "ernaehrungslog-vN"` um eins erhöhen, in `index.html` `APP_VERSION` ebenso.
3. Committen und pushen. Nach 1–2 Minuten ist die neue Version online. App auf dem iPhone **zweimal** öffnen.

**Änderungen an `apps-script/Api.gs`** landen nicht automatisch im Sheet: Inhalt im Apps-Script-Editor einfügen, speichern, dann **Bereitstellen → Bereitstellungen verwalten → Bearbeiten → Version: Neue Version → Bereitstellen** (URL bleibt gleich).

## Versionen

- **v1** – Eintragen mit Vorlagen-Chips, Datenbank und freier Eingabe; Analyse Tag/Zeitraum; Info mit Garanleitungen und Plan; Offline-Warteschlange
