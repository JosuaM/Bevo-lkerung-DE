# Bevölkerung Deutschlands 1991–2023 (Uni-Projekt)

Statische Visualisierung, nur `index.html` plus `dashboards/*.js` (kein Build). Daten stehen in `index.html` (`DATA`), Rohdaten in `Data/`.

## Dashboards

Drei Personen arbeiten an je einem Dashboard, jedes liegt in einer eigenen Datei:

- `dashboards/josua.js` – Josua
- `dashboards/jeremy.js` – Jeremy
- `dashboards/philipp.js` – Philipp

Wenn jemand sagt „ändere das Dashboard Philipp …“, nur `dashboards/philipp.js` bearbeiten (analog für die anderen), niemals die Datei einer anderen Person und nicht `index.html`. Die verfügbaren Werte (`api`) stehen in `dashboards/README.md`. Schriftgrößen nur über `api.FS` (groß/mittel/klein), Farben über `api.COLORS`.

## Sonstiges

- Steuerung: E Menü (pausiert), D weiter, A zurück, Leertaste Pause.
- Feste Standardwerte stehen in `index.html` in der Zeile `const DEFAULTS = …` (über den Knopf „Fest in index.html speichern“ im E-Menü erzeugt).
