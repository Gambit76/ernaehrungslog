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
| `apps-script/info.txt` | Verweis: `Api.gs` liegt im privaten Repo `Gambit76/apps-script` (Ordner `ernaehrungslog/`) | Apps Script im Sheet „Ernährungslog“ |
| `docs/Einrichtung.md` | Ersteinrichtung Schritt für Schritt | – |
| `docs/APP-STANDARD.md` | Gemeinsamer Design- und Technik-Standard der drei Apps (hell/dunkel, Einstellungen, Versionen) | – |

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

**Änderungen an `Api.gs` (privates Repo `Gambit76/apps-script`)** landen nicht automatisch im Sheet: Inhalt im Apps-Script-Editor einfügen, speichern, dann **Bereitstellen → Bereitstellungen verwalten → Bearbeiten → Version: Neue Version → Bereitstellen** (URL bleibt gleich).

## Versionen

- **v1** – Eintragen mit Vorlagen-Chips, Datenbank und freier Eingabe; Analyse Tag/Zeitraum; Info mit Garanleitungen und Plan; Offline-Warteschlange
- **v3** – Chips modular: Basis-Chips plus „+“-Bausteine (Belag, Samstags-Extra, Quark-/Brot-Extras, Abend: Eiweiß · Gemüse · Beilage · Extras). Mengen sind Startwerte und in der Liste änderbar; gleicher Baustein erhöht die Menge. Neue Lebensmittel: Leberwurst, Gouda, Kartoffeln, Putenschnitzel; Scheiben-Einheit für Aufschnitt
- **v4** – Phase pro Tag per Dropdown im Reiter Eintragen (neue Tage erben die Phase des Vortags); Frühstücks-Chips bereinigt (Lachsschinken raus, Ei und Quark-Bowl zu den Snacks)
- **v5** – Fitline-Streichkäse entfernt; körniger Frischkäse fettreduziert (0,9 %) als Basis; Buko Balance/India/Ananas als Chips beim Mittag
- **v6** – Neues Lebensmittel „Brot (Vollkorn/Mischbrot, normal)“ in Brot & Brötchen (Scheibe ≈ 45 g)
- **v12** – Neues Lebensmittel „Rapsöl (zum Braten)“. Abend-Chips „Frostergemüse“ und „Hähnchenbrust“ tragen das Bratöl gleich mit ein (2 EL bzw. 1 EL, Öl-Zeilen summieren sich zu einer Zeile); „+ Rapsöl 1 EL“ ersetzt „+ Olivenöl“; Chip „Ruhetag schnell“ mit 2 EL Rapsöl. sw.js wiederhergestellt (war seit v6 leer)
- **v13** – Auch „Putenschnitzel“, „Kabeljau“ und „Lachs“ tragen 1 EL Rapsöl mit ein (wie Hähnchen); Garanleitungen auf 1 EL Rapsöl angepasst
- **v14** – Neuer Chip „Gemüse ohne Öl (z. B. Sommergemüse)“ für Frostergemüse, das ohne Bratöl mit etwas Wasser gegart wird
- **v15** – Neues Lebensmittel „Lätta Extra Fit (28 % Fett)“ (269 kcal/100 g). Die Mittags-Brot-Chips tragen es mit ein: 3 Aldi-Eiweißbrot + 15 g, 2 Lieken-Eiweißbrot + 10 g (≈ 5 g pro Scheibe, in der Liste änderbar)
- **v16** – Neuer Snack-Chip „Latte Macchiato · 260 ml Milch“ (Milch 1,5 %, Kaffee zählt nicht); jedes Tippen addiert 260 ml zur Milch-Zeile
- **v17** – Grüne Hinterlegung nur noch bei „+“-Chips (Zusatz zur Mahlzeit); Ei und Latte Macchiato bleiben mehrfach addierbar, aber neutral gefärbt
- **v18** – Zwei neue Snack-Chips für den Whey-Shake Schoko: ganz (1 Scoop = 30 g + 300 ml Milch) und halb (15 g + 150 ml). Dafür neues Lebensmittel „Milch 1,8 % (Halbfett)“ (49 kcal/100 ml)
- **v19** – Alter Chip „Whey-Shake mit Milch“ (Milch 1,5 %) entfernt; es bleiben die beiden Whey-Shake-Chips ganz und halb mit Milch 1,8 %
- **v20** – Ei gibt es jetzt in den Größen M („Stück“, 60 g), L (70 g) und XL (80 g), die Größe wählst du beim Hinzufügen bei der Einheit. Neuer Abend-Chip „Ei (Gr. L)“ unter Eiweiß, mehrfaches Tippen addiert Eier (ohne Öl)
- **v21** – Mengen per Auswahlwalze (iOS-Stil) statt Tippen: beim Hinzufügen und per Tipp auf die Menge in der Liste. Schritte je Einheit: g 5 g bis 100 g, danach 10 g; ml 10 ml; Stück, Scheibe, Portion, EL usw. 0,5; Eier-Größen 1; Flasche 0,25. Über „Zahl eintippen“ geht jede beliebige Menge, Werte außerhalb des Rasters bleiben erhalten
- **v22** – Neues Lebensmittel „Kasten-Roggenbrot“ (Richtwerte 220 kcal, 6,5 g Protein, 43 g KH, 1,3 g Fett je 100 g; Scheibe = 40 g) unter Brot & Brötchen. Scheibengewicht und Werte lassen sich unter Info → Lebensmittel-Werte anpassen
- **v23** – Lean-Bulk-Ziele angehoben (+200 kcal, Protein und Fett unverändert, Mehrkalorien über Kohlenhydrate): Kraft/Bike 3.100–3.200 kcal und 380–420 g KH, Ruhetag 2.800–2.900 kcal und 330–370 g KH. Gravel bleibt bei 3.350–3.450 kcal. Grund: Gewicht blieb 10 Tage flach, Hunger nachts und morgens. Kontrolle am 26.11. über das 7-Tage-Mittel der Waage
- **v24** – Neues Lebensmittel „Frosta Gemüse Pfanne all'Italiana“ (48 kcal, 1,4 g Protein, 4,1 g KH, 2,4 g Fett je 100 g; Beutel = 480 g) und Abend-Chip „Gemüse Pfanne all'Italiana · 2 EL Öl“ (480 g plus 2 EL Rapsöl)
- **v25** – Chip „Gemüse Pfanne all'Italiana“ trägt nur noch das Gemüse (480 g), das Rapsöl wird über „+ Rapsöl 1 EL“ separat ergänzt. Neue Garanleitung „Putenschnitzel / Putenbrust in der Pfanne“ unter Info → Garanleitungen
- **v26** – Neues Lebensmittel „Rührei (Eier, Milch, Schnittlauch)“: Menge = Anzahl Eier, Größe M/L/XL über die Einheit (wie beim Ei). Pro Ei sind 7,5 ml Milch 1,8 % eingerechnet (1 EL auf 2 Eier), Schnittlauch zählt nicht, Bratfett separat (≈ 127 kcal, 11,5 g Protein, 1,1 g KH, 8,6 g Fett je 100 g)
- **v27** – Neues Lebensmittel „Emmer-Dinkel-Vollkornbrot“ unter Brot & Brötchen (Richtwerte geschätzt: 240 kcal, 9,5 g Protein, 41 g KH, 2 g Fett je 100 g). Einheiten: Gramm oder Scheibe dünn (35 g), Scheibe (50 g), Scheibe dick (70 g)
