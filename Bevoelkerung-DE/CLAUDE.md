# Bevölkerung Deutschlands 1991–2025 (Uni-Projekt)

Dieser Ordner (`Bevoelkerung-DE`) ist die finale Webseite; frühere Stände liegen in `../Alte-Versionen`.

Statische Visualisierung (kein Build, nur klassische Skripte, läuft auch direkt aus dem Dateisystem).

- `index.html`: Markup, Dashboard-Gerüst und die Projektwerte `const DEFAULTS` (wird vom E-Menü bzw. `serve.py` überschrieben)
- `css/main.css`: Gestaltung der Folien · `dashboards/explorer.css`: Gestaltung des Dashboards
- `js/data.js`: Jahreswerte `DATA`, `BASE`, `EVENTS` (Rohdaten in `Data/`)
- `js/core.js` (Zustand, Hilfsfunktionen, Zeitplaner) · `js/timeline.js` (Zeitstrahl, Ereignisse) · `js/animation.js` (Punkte, Kreis) · `js/scenes.js` (Folien Frage, Differenz, Ergebnis) · `js/sound.js` · `js/settings.js` (Speichern in `DEFAULTS`) · `js/app.js` (Schleife, Folienwechsel, E-Menü, Start)
- `dashboards/explorer.js` und `dashboards/particle-cloud.js`: das Dashboard

## Dashboard

Es gibt nur ein Dashboard, das aus der früheren Variante „Dashboard 2“ hervorgegangen ist.
Diagramme: „Mit & ohne Wanderung“ und „Bevölkerungsbilanz“.
Schriftgrößen über `FS` (Folien) bzw. feste Stufen in `explorer.css`, Farben über `COLORS`; Details in `dashboards/README.md`. Das Dashboard wird proportional zur Fenstergröße skaliert (Referenz 1512 × 860), damit es auf jedem Bildschirm gleich aussieht.

## Steuerung

Obere Navigation startet die gewählte Folie neu. Folie „Differenz“ wartet auf „Weiter“.
E: Einstellungen (mit „Folie neu starten“); D: weiter; A: zurück; Leertaste: Pause; Pfeiltasten: Jahr auswählen und pausieren.
Die Zeitleiste wird nur auf den beiden Animationsfolien angezeigt. Jahresauswahl pausiert Zeit und Punkte.
Die Punkte werden am Kreisrand hart abgeschnitten (kein Ein-/Ausfaden), die Zahlen springen. Die Balken der Differenz-Folie ticken mit einem festen, hellen Ton (`js/sound.js`, nicht wählbar); Ereignisse haben keinen Klang. „Neustart für Aufnahme“ schaltet zusätzlich ein Mausklick-Geräusch (`sounds/click.mp3`) für jeden Klick ein; es bleibt über den Neustart aktiv, bis die Seite manuell neu geladen wird.
Im Dashboard: Beim Öffnen des Dashboards und bei jedem Wechsel von Ansicht oder Darstellung fädeln Linien und Balken von links ein (`reveal` in `dashboards/explorer.js`).

## Gemeinsame Einstellungen

Projekt mit `Starten.command` (macOS) oder `python3 serve.py` starten. Der lokale Server öffnet die Vorschau und speichert sämtliche E-Einstellungen automatisch in `const DEFAULTS` der `index.html`. Nur Python-Standardbibliothek; Schreibzugriff ausschließlich über localhost und Sitzungstoken.

Beim direkten Öffnen als HTML-Datei ist in Chrome/Edge einmal eine Dateifreigabe erforderlich. Es gibt keine lokalen Farb-/Tempo-Overrides mehr. Neue Einstellungen mit Git committen/pushen, damit andere Geräte sie nach dem Pull erhalten.

## Website-Version

Die einzige Version heißt **Original** (`index.html`) und basiert auf der bisherigen Jeremy-Version. Die frühere Adresse `jeremy.html` leitet zur Hauptversion weiter.

## Gestaltungsentscheidung: Dashboard-Partikel

Ein farbiger Lichtschein und anschließend ein weicher, beweglicher Bodenschatten unter den Partikeln wurden ausprobiert. Der Bodenschatten lag mit Abstand unter der Wolke und folgte den einzelnen Partikeln; seine Deckkraft wurde zuletzt reduziert. Auf Wunsch des Nutzers wurde der Schatten wieder entfernt. Aktueller Stand: Partikel ohne Lichtschein oder Bodenschatten. Diese frühere Variante als Kontext für spätere Wünsche berücksichtigen.
