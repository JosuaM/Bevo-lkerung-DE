# Dashboard

`explorer.js` steuert das Dashboard „Bevölkerung verstehen“ (Markup in `index.html`, Gestaltung in `explorer.css`).
`particle-cloud.js` zeichnet die Partikelwolke in der Seitenleiste.

Zwei Diagrammansichten: „Mit & ohne Wanderung“ und „Bevölkerungsbilanz“.
Die Ereignislinien lassen sich mit Maus und Tastatur auswählen. Die Daten kommen aus `js/data.js` (1991–2025).

Das Dashboard wird proportional zur Fenstergröße skaliert (Referenz 1512 × 860, Variable `--ex-z`); alle Maße und Schriftgrößen in `explorer.css` gelten für diese Referenz.

Die Animationen und die gemeinsame Foliennavigation stehen in `js/`. Es gibt keinen Build-Schritt.
