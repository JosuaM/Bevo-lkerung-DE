# Dashboard

`explorer.js` steuert das Dashboard „Bevölkerung verstehen“ (Markup in `index.html`, Gestaltung in `explorer.css`).
`particle-cloud.js` zeichnet die Partikelwolke in der Seitenleiste.

Zwei Diagrammansichten: „Mit & ohne Wanderung“ und „Bevölkerungsbilanz“.
Die Ereignislinien lassen sich mit Maus und Tastatur auswählen. Die Daten kommen aus `js/data.js` (1991–2025).

Das Dashboard wird proportional zur Fenstergröße skaliert (Referenz 1512 × 860, Variable `--ex-z`); alle Maße und Schriftgrößen in `explorer.css` gelten für diese Referenz.

Die Animationen und die gemeinsame Foliennavigation stehen in `js/`. Es gibt keinen Build-Schritt.

## Partikelübergang

Der Übergang aus der bisherigen Variation 1 ist der Standard der gesamten Seite.
Es gibt keine Versionsauswahl mehr. `js/dashboard-transition.js` übernimmt die sichtbaren
Ergebnis-Partikel auf ein temporäres Bildschirm-Canvas.
Gleichzeitig mit dem Ausblenden des Ergebnistexts wandern sie in rund fünf Sekunden zur tatsächlichen
Position der Dashboard-Wolke, wechseln ins Grün der Geburtenfarbe und reduzieren ihre Anzahl.
Ihre schwebende Eigenbewegung läuft während des gesamten Übergangs weiter.
Die Zielpositionen stammen aus der laufenden Dashboard-Animation; am Ende erfolgt eine weiche
Übergabe. Beim Eintritt ist „Mit & ohne Wanderung / Anzahl“ aktiv. Navigation bricht den Übergang
sauber ab; reduzierte Bewegung verwendet einen kurzen Übergang ohne Flugbahn.
