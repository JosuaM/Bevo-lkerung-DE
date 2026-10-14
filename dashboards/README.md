# Dashboards

Jedes Dashboard ist eine eigene Datei. Jede Person ändert nur ihre eigene:

| Dashboard | Datei            | gehört |
|-----------|------------------|--------|
| Josua     | `josua.js`       | Josua  |
| Jeremy    | `jeremy.js`      | Jeremy |
| Philipp   | `philipp.js`     | Philipp |

So gibt es keine Konflikte beim Mergen. Neues Dashboard: neue Datei anlegen und in `index.html` neben den anderen `<script src="dashboards/…">`-Zeilen eintragen.

Im Dashboard (letzte Folie) wechselt man mit **E** oben zwischen den Dashboards.

## Aufbau einer Datei

```js
registerDashboard({
  id: 'meinname',
  name: 'Mein Name',
  draw(api){
    const {ctx, w, h, year /* … */} = api;
    // auf ctx zeichnen (Canvas 2D). Wird bei jedem Frame aufgerufen.
  }
});
```

Pixel-Koordinaten: `0,0` ist oben links, `w`/`h` sind Breite/Höhe des Fensters.

## Was `api` enthält

| Name | Bedeutung |
|------|-----------|
| `ctx`, `w`, `h` | Canvas-Kontext, Breite, Höhe in Pixeln |
| `year` | gewähltes Jahr (1991–2023). Der Zeitstrahl unten und Klicks im Diagramm ändern es |
| `t`, `frac` | Zeit (Jahr mit Nachkommastellen), Anteil des Jahres (wichtig, wenn Play gedrückt wird) |
| `d` | Datensatz des gewählten Jahres: `d.wb` Lebendgeborene, `d.wd` Gestorbene, `d.zu` Zuzüge, `d.fort` Fortzüge, `d.wp` Bevölkerung zum Jahresende |
| `DATA` | alle Jahre als Liste (`{y, wb, wd, zu, fort, wp}`) |
| `byYear` | dasselbe als Objekt: `byYear[2015]` |
| `cumN`, `cumB`, `cumD`, `cumZ`, `cumF` | aufsummiert seit 1991 bis einschließlich Jahr: Defizit/Überschuss, Geburten, Tode, Zuzüge, Fortzüge (z. B. `cumN[year]`) |
| `popNow` | Bevölkerung im gewählten Jahr |
| `popWithoutMigration` | Bevölkerung, wenn es keine Zu- und Abwanderung gegeben hätte |
| `BASE` | Bevölkerung Ende 1990 |
| `FIRST`, `LAST` | 1991, 2023 |
| `COLORS` | `birth`, `death`, `in`, `out` – die im E-Menü einstellbaren Farben, bitte benutzen |
| `FS` | drei Schriftgrößen: `FS.l` groß, `FS.m` mittel, `FS.s` klein (bitte nur diese verwenden) |
| `FONT` | Schriftfamilie für `ctx.font` |
| `bg` | aktuelle Hintergrundfarbe |
| `mouse` | `{x, y}` Mausposition für Hover |
| `fmt(n)`, `sgn(n)` | Zahl deutsch formatiert / mit Vorzeichen |
| `clamp`, `lerp` | Hilfsfunktionen |
| `setClickArea({x0,x1,y0,y1})` | Bereich, in dem ein Klick das Jahr wählt (Jahr wird linear von x0 = 1991 bis x1 = 2023 berechnet) |

## Mit Claude arbeiten

„Ändere das Dashboard Philipp: …“ – dann bitte nur `dashboards/philipp.js` bearbeiten.
Fehler im eigenen Dashboard werden oben links rot angezeigt und halten die Seite nicht an.
