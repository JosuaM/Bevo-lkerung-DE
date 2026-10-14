/* ============================================================
   Dashboard von Josua
   Diese Datei gehört Josua. Die anderen Dashboards liegen in
   jeremy.js und philipp.js – dort bitte nichts ändern.
   Die verfügbaren Werte (api) stehen in dashboards/README.md
   ============================================================ */
(function(){
  const dashVal = (y, which) => {                 // which 0: Geburten − Gestorbene, 1: Einwanderung − Auswanderung
    const d = window.__bevByYear[y];
    return which === 0 ? d.wb - d.wd : d.zu - d.fort;
  };
  function niceStep(raw){
    const p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }
  let extCache = null;
  function extent(first, last){
    if (extCache) return extCache;
    let lo = 0, hi = 0;
    for (let y = first; y <= last; y++) for (const k of [0, 1]){ const v = dashVal(y, k); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const step = niceStep((hi - lo) / 5);
    return extCache = {lo: Math.floor(lo / step) * step, hi: Math.ceil(hi / step) * step, step};
  }

  registerDashboard({
    id: 'josua',
    name: 'Josua',
    draw(api){
      const {ctx, w, h, FS, FONT, COLORS, FIRST, LAST, BASE, byYear, cumN, cumZ, cumF, fmt, sgn, clamp, lerp, mouse, t, bg: BGC, setClickArea} = api;
      window.__bevByYear = byYear;
      const v = 0, ex = extent(FIRST, LAST);
  const tx = (str, x, y, size, color, weight, align) => {
      ctx.font = `${weight || 400} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
    };
    const yr = clamp(Math.floor(t), FIRST, LAST), d = byYear[yr], f = (t - yr) > 0 ? clamp(t - yr, 0, 1) : 1;   // ganzes Jahr, wenn ein Jahr gewählt ist
    const popNow = lerp(yr === FIRST ? BASE : byYear[yr-1].wp, d.wp, f);
    const popNo = BASE + cumN[yr-1] + f * (d.wb - d.wd);                 // ohne Zu- und Abwanderung
    const net = (cumZ[yr-1] + f * d.zu) - (cumF[yr-1] + f * d.fort);   // Wanderungssaldo seit 1991
    const def = cumN[yr-1] + f * (d.wb - d.wd);                          // Geburtendefizit seit 1991
    const MUTE = '#7d879b', DIM = '#5d667a';
  
    // Kopf links: Titel
  
    // Kopf Mitte: Bevölkerung (groß) und darunter ausgegraut ohne Zuwanderung
    const mx = w * 0.5;
    tx('Bevölkerung ' + yr, mx, 30, FS.s, MUTE, 400, 'center');
    tx(fmt(popNow), mx, 30 + FS.s * 0.5 + FS.l * 0.62, FS.l, '#fff', 300, 'center');
    tx(fmt(popNo), mx, 30 + FS.s * 0.5 + FS.l * 1.3 + FS.m * 0.5, FS.m, DIM, 400, 'center');
    tx('ohne Zuwanderung seit 1991', mx, 30 + FS.s * 0.5 + FS.l * 1.3 + FS.m * 1.3, FS.s * 0.9, DIM, 400, 'center');
  
    // Kopf rechts: die Frage aus dem Intro, jetzt als Antwort (rechtsbündig, Zahlen farbig)
    const rx = w * 0.66, rw = w - 40 - rx, rxr = w - 40;
    let y = 30 + FS.m * 0.6;
    const SOFT = '#e6e9ef';
    const lineM = str => { tx(str, rxr, y, FS.m, SOFT, 300, 'right'); y += FS.m * 1.4; };
    const lineL = (str, col) => { y += FS.l * 0.14; tx(str, rxr, y + FS.l * 0.1, FS.l, col, 400, 'right'); y += FS.l * 1.0; };
    if (def < -1000){
      const ratio = net / -def;
      lineM('Seit 1991 bringt die Einwanderung');
      lineL(sgn(net) + ' Menschen', COLORS.in);
      lineM('gegenüber einem Geburtendefizit von');
      lineL(sgn(def), COLORS.death);
      ctx.font = `300 ${FS.m}px ${FONT}`;
      const tail = ratio >= 1 ? 'vollständig ausgeglichen.' : 'zu ' + Math.round(ratio * 100) + ' % ausgeglichen.';
      ctx.font = `500 ${FS.m}px ${FONT}`;
      const wt = ctx.measureText(tail).width;
      tx(tail, rxr, y, FS.m, ratio >= 1 ? COLORS.in : COLORS.out, 500, 'right');
      tx('Damit ist es ', rxr - wt, y, FS.m, SOFT, 300, 'right');
      y += FS.m * 1.4;
    } else {
      lineM('Seit 1991 gab es bisher kein Defizit,');
      lineL(sgn(net) + ' Menschen', COLORS.in);
      lineM('kamen durch Einwanderung hinzu.');
    }
  
    // Kuchendiagramm: die ganze Bevölkerung, davon die in diesem Jahr Geborenen und Zugewanderten als herausgezogene Stücke
    const total = popNow, born = d.wb, zuz = d.zu, rest = Math.max(total - born - zuz, 0), sum = rest + born + zuz;
    const pieTop = y + FS.m * 1.1, legH = 58, pieBot = h - 140 - legH;
    const R = clamp(Math.min(rw * 0.36, (pieBot - pieTop) / 2 - 12), 50, 200);
    const pcx = rx + rw * 0.5, pcy = (pieTop + pieBot) / 2;
    const bgc = BGC || '#121212';
    const slices = [[born, COLORS.birth, 1], [zuz, COLORS.in, 1], [rest, '#4a5366', 0]];
    let ang = -Math.PI / 2;
    slices.forEach(sl => {
      const a2 = ang + sl[0] / sum * Math.PI * 2, mid = (ang + a2) / 2, off = sl[2] ? 10 : 0;
      const ox = Math.cos(mid) * off, oy = Math.sin(mid) * off;
      ctx.beginPath(); ctx.moveTo(pcx + ox, pcy + oy); ctx.arc(pcx + ox, pcy + oy, R, ang, a2); ctx.closePath();
      ctx.fillStyle = sl[1]; ctx.fill(); ctx.strokeStyle = bgc; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
      ang = a2;
    });
    const items = [['Bereits da', rest, '#4a5366'], ['Geboren ' + yr, born, COLORS.birth], ['Zugewandert ' + yr, zuz, COLORS.in]];
    items.forEach((it, i) => {
      const lx = rx + i * rw / 3, ly = h - 140 - legH + 34;
      ctx.fillStyle = it[2]; ctx.fillRect(lx, ly - FS.s * 0.6, 4, FS.s * 1.8);
      tx(it[0], lx + 12, ly, FS.s * 0.8, MUTE);
      tx(fmt(it[1]), lx + 12, ly + FS.s * 0.95, FS.s * 0.85, '#fff');
    });
  
    // Liniendiagramm links (umgedrehtes T: senkrechte Achse + Nulllinie, darunter der negative Bereich)
    const x0 = w * 0.14, x1 = w * 0.55, y0 = 250, y1 = h - 140;
    const X = yy => x0 + (yy - FIRST) / (LAST - FIRST) * (x1 - x0);
    const Y = val => y1 - (val - ex.lo) / (ex.hi - ex.lo) * (y1 - y0);
    const zero = Y(0);
    setClickArea({x0, x1, y0, y1});
    const bal = [
      ['Geburten', COLORS.birth, d.wb, 'Gestorbene', COLORS.death, d.wd],
      ['Einwanderung', COLORS.in, d.zu, 'Auswanderung', COLORS.out, d.fort],
    ];
    bal.forEach((r, i) => {
      const ly = 172 + i * 26, sz = FS.s * 0.9; let cx2 = x0;
      const part = (str, col, wgt) => { ctx.font = `${wgt || 400} ${sz}px ${FONT}`; tx(str, cx2, ly, sz, col, wgt); cx2 += ctx.measureText(str).width; };
      const g = ctx.createLinearGradient(cx2, 0, cx2 + 30, 0); g.addColorStop(0, r[1]); g.addColorStop(1, r[4]);
      ctx.fillStyle = g; ctx.fillRect(cx2, ly - 1, 30, 3); cx2 += 42;
      part(r[0] + ' ' + fmt(r[2]), r[1]); part('  −  ', MUTE); part(r[3] + ' ' + fmt(r[5]), r[4]); part('  =  ', MUTE);
      const diff = r[2] - r[5];
      part(sgn(diff), diff >= 0 ? COLORS.in : COLORS.death, 500);
      part('  (' + yr + ')', DIM);
    });
    for (let val = ex.lo; val <= ex.hi + 1; val += ex.step){
      if (Math.abs(val) < 1) continue;
      tx(sgn(val).replace('+', ''), x0 - 12, Y(val), FS.s * 0.75, MUTE, 400, 'right');
    }
    tx('0', x0 - 12, zero, FS.s * 0.75, MUTE, 400, 'right');
    ctx.fillStyle = '#4a5366'; ctx.fillRect(x0 - 1, y0, 2, y1 - y0); ctx.fillRect(x0, zero - 1, x1 - x0, 2);
    for (const q of [1991, 2000, 2010, 2020, 2023]) tx(String(q), X(q), y1 + 16, FS.s * 0.75, MUTE, 400, 'center');
  
    const tt = clamp(t, FIRST, LAST), yi = Math.floor(tt), ff = tt - yi, sx = X(tt);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(sx - 0.5, y0, 1, y1 - y0);
    for (const sr of [{w: 0, a: COLORS.birth, b: COLORS.death}, {w: 1, a: COLORS.in, b: COLORS.out}]){
      const all = [];
      for (let q = FIRST; q <= LAST; q++) all.push([X(q), Y(dashVal(q, sr.w))]);
      const pts = all.slice(0, yi - FIRST + 1);
      if (ff > 0 && yi < LAST) pts.push([sx, Y(lerp(dashVal(yi, sr.w), dashVal(yi + 1, sr.w), ff))]);
      const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, sr.a); g.addColorStop(1, sr.b);
      if (v === 2){                                   // Flächen-Variante
        for (const [arr, fill, al] of [[all, '#4a5366', 0.14], [pts, g, 0.3]]){
          ctx.beginPath(); ctx.moveTo(arr[0][0], zero);
          arr.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(arr[arr.length-1][0], zero); ctx.closePath();
          ctx.globalAlpha = al; ctx.fillStyle = fill; ctx.fill(); ctx.globalAlpha = 1;
        }
      }
      ctx.lineJoin = 'round'; ctx.lineWidth = 2;
      ctx.beginPath(); all.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.strokeStyle = '#3d4553'; ctx.stroke();      // alles, was nach dem gewählten Jahr liegt
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.strokeStyle = g; ctx.stroke();               // alles bis zum gewählten Jahr in Farbe
      const e = pts[pts.length - 1];
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(e[0], e[1], 5, 0, 6.2832); ctx.fill();
    }
    tx(String(yr), sx, y1 + 34, FS.s * 0.9, '#fff', 500, 'center');
  
    // Interaktion: Maus über ein Jahr zeigt die Werte
    const maxY = LAST;
    if (mouse.x >= x0 - 8 && mouse.x <= x1 + 8 && mouse.y >= y0 - 14 && mouse.y <= y1 + 14){
      const hy = clamp(Math.round(FIRST + (mouse.x - x0) / (x1 - x0) * (LAST - FIRST)), FIRST, LAST);
      if (hy <= maxY){
        const hd = byYear[hy], hx = X(hy);
        ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(hx - 0.5, y0, 1, y1 - y0);
        [0, 1].forEach(wi => { ctx.fillStyle = wi ? COLORS.in : COLORS.birth; ctx.beginPath(); ctx.arc(hx, Y(dashVal(hy, wi)), 5, 0, 6.2832); ctx.fill(); });
        const lines = [
          [String(hy), '#fff', 500],
          ['Geburten ' + fmt(hd.wb) + ' − Gestorbene ' + fmt(hd.wd), '#c9d0dc', 400],
          ['= ' + sgn(hd.wb - hd.wd), COLORS.death, 500],
          ['Einwanderung ' + fmt(hd.zu) + ' − Auswanderung ' + fmt(hd.fort), '#c9d0dc', 400],
          ['= ' + sgn(hd.zu - hd.fort), COLORS.in, 500],
        ];
        const fz = FS.s * 0.85, lh = fz * 1.55;
        ctx.font = `400 ${fz}px ${FONT}`;
        const bw2 = Math.max(...lines.map(l => ctx.measureText(l[0]).width)) + 28, bh = lines.length * lh + 18;
        let bx = hx + 16, by = clamp(mouse.y - bh / 2, y0, y1 - bh);
        if (bx + bw2 > w - 20) bx = hx - 16 - bw2;
        ctx.fillStyle = '#12161d'; ctx.fillRect(bx, by, bw2, bh);
        ctx.strokeStyle = '#3a4252'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw2 - 1, bh - 1);
        lines.forEach((l, k) => { ctx.font = `${l[2]} ${fz}px ${FONT}`; ctx.fillStyle = l[1]; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(l[0], bx + 14, by + 9 + lh * (k + 0.5)); });
      }
    }
  
    }
  });
})();
