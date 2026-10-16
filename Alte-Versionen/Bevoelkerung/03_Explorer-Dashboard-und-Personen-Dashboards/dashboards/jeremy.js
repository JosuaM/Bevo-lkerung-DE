/* ============================================================
   Dashboard von Jeremy
   Diese Datei gehört Jeremy. Die anderen Dashboards liegen in
   josua.js und philipp.js – dort bitte nichts ändern.
   Die verfügbaren Werte (api) stehen in dashboards/README.md
   ============================================================ */
registerDashboard({
  id: 'jeremy',
  name: 'Jeremy',
  draw(api){
    const {ctx, w, h, FS, FONT, COLORS, FIRST, LAST, byYear, cumN, cumZ, cumF, fmt, sgn, year, popNow, setClickArea} = api;
    const text = (str, x, y, size, color, weight, align) => {
      ctx.font = `${weight || 400} ${size}px ${FONT}`; ctx.fillStyle = color || '#fff';
      ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
    };

    // Startpunkt: aufsummierte Kurven seit 1991 (Geburtendefizit und Wanderungssaldo)
    const x0 = w * 0.12, x1 = w * 0.62, y0 = 160, y1 = h - 150;
    const A = y => cumN[y], B = y => cumZ[y] - cumF[y];
    let lo = 0, hi = 0;
    for (let y = FIRST; y <= LAST; y++){ lo = Math.min(lo, A(y), B(y)); hi = Math.max(hi, A(y), B(y)); }
    const X = y => x0 + (y - FIRST) / (LAST - FIRST) * (x1 - x0);
    const Y = v => y1 - (v - lo) / (hi - lo) * (y1 - y0);
    setClickArea({x0, x1, y0, y1});                 // Klick im Diagramm wählt das Jahr

    ctx.fillStyle = '#4a5366'; ctx.fillRect(x0, Y(0) - 1, x1 - x0, 2);
    for (const [fn, col] of [[A, COLORS.death], [B, COLORS.in]]){
      ctx.beginPath();
      for (let y = FIRST; y <= LAST; y++) y === FIRST ? ctx.moveTo(X(y), Y(fn(y))) : ctx.lineTo(X(y), Y(fn(y)));
      ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(year), Y(fn(year)), 5, 0, 6.2832); ctx.fill();
    }

    text('Bevölkerung ' + year, w * 0.72, 90, FS.s, '#7d879b');
    text(fmt(popNow), w * 0.72, 90 + FS.l * 0.9, FS.l, '#fff', 300);
    text('Geburtendefizit seit 1991: ' + sgn(A(year)), w * 0.72, 90 + FS.l * 2.1, FS.m, COLORS.death, 300);
    text('Wanderungssaldo seit 1991: ' + sgn(B(year)), w * 0.72, 90 + FS.l * 2.1 + FS.m * 1.6, FS.m, COLORS.in, 300);
  }
});
