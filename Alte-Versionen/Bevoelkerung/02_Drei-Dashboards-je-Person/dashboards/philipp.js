/* ============================================================
   Dashboard von Philipp
   Diese Datei gehört Philipp. Die anderen Dashboards liegen in
   josua.js und jeremy.js – dort bitte nichts ändern.
   Die verfügbaren Werte (api) stehen in dashboards/README.md
   ============================================================ */
registerDashboard({
  id: 'philipp',
  name: 'Philipp',
  draw(api){
    const {ctx, w, h, FS, FONT, COLORS, FIRST, LAST, DATA, fmt, sgn, year, d, popNow, setClickArea} = api;
    const text = (str, x, y, size, color, weight, align) => {
      ctx.font = `${weight || 400} ${size}px ${FONT}`; ctx.fillStyle = color || '#fff';
      ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
    };

    // Startpunkt: Balken pro Jahr – Geburtenüberschuss/-defizit und Wanderungssaldo nebeneinander
    const x0 = w * 0.1, x1 = w * 0.64, y0 = 160, y1 = h - 150;
    let lo = 0, hi = 0;
    DATA.forEach(r => { for (const v of [r.wb - r.wd, r.zu - r.fort]){ lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    const slot = (x1 - x0) / (LAST - FIRST + 1);
    const Y = v => y1 - (v - lo) / (hi - lo) * (y1 - y0);
    setClickArea({x0, x1, y0, y1});                 // Klick im Diagramm wählt das Jahr

    ctx.fillStyle = '#4a5366'; ctx.fillRect(x0, Y(0) - 1, x1 - x0, 2);
    DATA.forEach((r, i) => {
      const cx = x0 + (i + 0.5) * slot, sel = r.y === year;
      [[r.wb - r.wd, COLORS.death, -0.3], [r.zu - r.fort, COLORS.in, 0.3]].forEach(([v, col, off]) => {
        ctx.globalAlpha = sel ? 1 : 0.45; ctx.fillStyle = col;
        ctx.fillRect(cx + off * slot - slot * 0.14, Math.min(Y(0), Y(v)), slot * 0.28, Math.abs(Y(v) - Y(0)));
      });
    });
    ctx.globalAlpha = 1;

    text('Bevölkerung ' + year, w * 0.72, 90, FS.s, '#7d879b');
    text(fmt(popNow), w * 0.72, 90 + FS.l * 0.9, FS.l, '#fff', 300);
    text('Geburten − Gestorbene: ' + sgn(d.wb - d.wd), w * 0.72, 90 + FS.l * 2.1, FS.m, COLORS.death, 300);
    text('Einwanderung − Auswanderung: ' + sgn(d.zu - d.fort), w * 0.72, 90 + FS.l * 2.1 + FS.m * 1.6, FS.m, COLORS.in, 300);
  }
});
