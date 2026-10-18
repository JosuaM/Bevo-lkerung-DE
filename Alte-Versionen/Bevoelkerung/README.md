# Bevölkerung Deutschlands 1991–2023/2025: Entwicklung der Webseite

Vier Zwischenstände aus der Git-Geschichte dieses Repositories. Jeder Ordner ist ein lauffähiger Stand (ohne Rohdaten, die liegen in `../../Bevoelkerung-DE/Data`); in `Bilder/` stehen die Folien als Screenshots. Die aktuelle, finale Version liegt in [`../../Bevoelkerung-DE`](../../Bevoelkerung-DE).

Die Frage bleibt in allen Ständen gleich: *Konnte die Ein- und Auswanderung Deutschlands Geburtendefizit ausgleichen?* Geändert haben sich Darstellung, Dashboards und Bedienung.

| Nr. | Ordner | Datum | Git-Stand |
|---|---|---|---|
| 1 | [`01_Erste-Version_Frage-Animationen-Ergebnis`](01_Erste-Version_Frage-Animationen-Ergebnis) | 14.10.2026 | `d649372` |
| 2 | [`02_Drei-Dashboards-je-Person`](02_Drei-Dashboards-je-Person) | 14.10.2026 | `a4c527f` |
| 3 | [`03_Explorer-Dashboard-und-Personen-Dashboards`](03_Explorer-Dashboard-und-Personen-Dashboards) | 15.10.2026 | `ce2fc89` |
| 4 | [`04_Gemeinsames-Dashboard`](04_Gemeinsames-Dashboard) | 16.10.2026 | `2bfbc2f` |
| 5 | [`../../Bevoelkerung-DE`](../../Bevoelkerung-DE) (final) | 16.10.2026 | aktueller Stand |

## 1 · Erste Version
Eine einzige `index.html`, Daten 1991–2023. Eingangsfrage, Animation 1 (Bevölkerung ohne Wanderung), Differenz-Folie, Animation 2 (mit Wanderung) und Ergebnis-Bildschirm. Die Bevölkerung ist ein leuchtender Kreis mit Verlauf, links und rechts strömen Punkte hinein und hinaus. Die Beschriftung sagt noch „Zuzüge“ und „Fortzüge“. Das Ergebnis ist ein einzelner großer Kreis mit dem Überschuss (+6.436.166).
Bilder: `01_…/Bilder`.

## 2 · Drei Dashboards je Person
Die Folien heißen jetzt Frage · Animation 1 · Differenz · Animation 2 · Ergebnis · Dashboard, dazu Zeitstrahl und E-Menü. Auf der letzten Folie gibt es drei Dashboards, jedes in einer eigenen Datei, damit niemand die Arbeit der anderen überschreibt:
- `dashboards/josua.js` – Liniendiagramm, Kuchen („bereits da“ / geboren / zugewandert) und Zahlen zum Ausgleich des Defizits
- `dashboards/jeremy.js` – zwei Linien: Geburtendefizit und Wanderungssaldo, aufsummiert seit 1991
- `dashboards/philipp.js` – Balken je Jahr für Geburten − Gestorbene und Einwanderung − Auswanderung

Bilder: `02_…/Bilder` (`6_Dashboard_*`). Umschalten im Dashboard mit **E**.

## 3 · Explorer-Dashboard neben den Personen-Dashboards
Neu ist `dashboards/explorer.js` („Bevölkerung verstehen“): ein interaktives Dashboard mit den Ansichten „Bevölkerungsbilanz“ (Balken je Jahr, einzeln oder als Bilanz) und „Mit & ohne Wanderung“, Jahresauswahl, Ereignislinien und dem Kasten „Warum Zuwanderung zählt“. Die drei Personen-Dashboards sind noch vorhanden.
Bilder: `03_…/Bilder` (`6_Dashboard_Explorer.png` zeigt den Explorer).

## 4 · Gemeinsames Dashboard
Die Personen-Dashboards entfallen, aus dem Explorer wird das einzige Dashboard. Die Animationen sind überarbeitet (Ereignisse erscheinen am Zeitstrahl, die Daten reichen bis 2025) und die Einstellungen aus dem E-Menü werden über einen kleinen lokalen Server (`serve.py`, `Starten.command`) direkt in die Datei gespeichert.
Bilder: `04_…/Bilder`.

## 5 · Stand mit `jeremy.html`
Letzter Stand der Webseite vor dem Entfernen der Weiterleitung `jeremy.html` (leitet auf `index.html` um; sonst identisch zu Stand 6, ohne `Data/`). Enthält bereits den Hinweis zur Jeremy-Version im README.
Bilder: `05_…/Bilder` (noch leer).

## 6 · Finale Version
Siehe [`../../Bevoelkerung-DE`](../../Bevoelkerung-DE): neu gegliederter Code, Punkte werden am Kreisrand abgeschnitten, zählende Zahlen, abgestimmtes Ende der Animationen, Klang der Balken auf der Differenz-Folie, überarbeitete Ereignistexte und ein Dashboard, das sich der Fenstergröße anpasst.

## Hinweise zum Öffnen
Die Stände 2 und 3 laden ihre Dashboards aus `dashboards/*.js`; am zuverlässigsten öffnet man sie über einen lokalen Server: im jeweiligen Ordner `python3 -m http.server` ausführen und `http://localhost:8000` aufrufen.
