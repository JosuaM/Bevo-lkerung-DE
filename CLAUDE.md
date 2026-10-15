# Bevölkerung Deutschlands 1991–2025 (Uni-Projekt)

Statische Visualisierung mit `index.html` und einem Dashboard in `dashboards/explorer.js` (kein Build).
Daten stehen in `index.html` (`DATA`), Rohdaten in `Data/`.

## Dashboard

Es gibt nur ein Dashboard, das aus der früheren Variante „Dashboard 2“ hervorgegangen ist.
Diagramme: „Mit & ohne Wanderung“ und „Bevölkerungsbilanz“.
Schriftgrößen über `FS`, Farben über `COLORS`; Details in `dashboards/README.md`.

## Steuerung

Obere Navigation startet die gewählte Folie neu. Folie „Differenz“ wartet auf „Weiter“.
E: Einstellungen; D: weiter; A: zurück; Leertaste: Pause; Pfeiltasten: Jahr auswählen und pausieren.
Die Zeitleiste wird nur auf den beiden Animationsfolien angezeigt. Jahresauswahl pausiert Zeit und Punkte.

## Gemeinsame Einstellungen

Projekt mit `Starten.command` (macOS) oder `python3 serve.py` starten. Der lokale Server öffnet die Vorschau und speichert sämtliche E-Einstellungen automatisch in `const DEFAULTS` der `index.html`. Nur Python-Standardbibliothek; Schreibzugriff ausschließlich über localhost und Sitzungstoken.

Beim direkten Öffnen als HTML-Datei ist in Chrome/Edge einmal eine Dateifreigabe erforderlich. Es gibt keine lokalen Farb-/Tempo-Overrides mehr. Neue Einstellungen mit Git committen/pushen, damit andere Geräte sie nach dem Pull erhalten.
