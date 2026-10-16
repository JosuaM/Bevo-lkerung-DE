// Ansicht "Netzwerk" (nur Deutschland): Level-1-Kugeln mit Krankheiten-Punkten, Zeitlinie mit Peaks,
// Top-5-Balken als Legende. Daten: netzwerk-data.js (siehe tools/build_netzwerk_data.py).
// Bevölkerung kommt aus POP.de in index.html. Einstiegspunkte: NET.show() / NET.hide().
const NET = (() => {
  const D = NETDATA, years = D.years, n = years.length, LAST = n - 1;
  const SPEED = 2;                          // Jahre pro Sekunde
  const TOP = 5;                            // Anzahl Standard-Ursachen (Level 2, nach 2023)
  const SHORT = {295: ["Übertragbare", "Krankheiten"], 409: ["Nicht übertragbare", "Krankheiten"], 687: ["Verletzungen"]};
  const L1COL = {295: "#a9a4dc", 409: "#19d4a0", 687: "#ff9d68"};
  const TOP_COLS = ["#833b96", "#a63d45", "#3d93a3", "#5f9f3e", "#c76f6f"];
  const EXTRA_COLS = ["#e0a63a", "#4f86e0", "#d86fb0", "#7fcfa8", "#b58be6", "#e07b39", "#8ea6c0", "#c9c34a"];
  const LAB_W = 390, BAR_X = 440, BAR_W = 72;
  const NS = "http://www.w3.org/2000/svg";
  const fmt = v => Math.round(v).toLocaleString("de-DE");
  const pc = (v, d = 1) => v.toLocaleString("de-DE", {minimumFractionDigits: d, maximumFractionDigits: d}) + " %";
  const pcPop = v => pc(v, v < 0.1 ? 3 : 2);
  const lerpAt = (arr, t) => { const i = Math.min(arr.length - 1, Math.floor(t)), j = Math.min(arr.length - 1, i + 1), f = t - i; return arr[i] * (1 - f) + arr[j] * f; };
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const mix = (hex, k) => { const c = parseInt(hex.slice(1), 16), m = x => Math.round(x + (255 - x) * k).toString(16).padStart(2, "0"); return "#" + m(c >> 16) + m(c >> 8 & 255) + m(c & 255); };

  // ---------- Daten ----------
  const L1 = new Map(D.l1.map(x => [x.id, x])), L2 = new Map(D.l2.map(x => [x.id, x]));
  const det = D.det.map((d, i) => ({...d, i, l1: L2.get(d.l2).l1}));
  const sumOf = idxs => years.map((_, t) => idxs.reduce((s, i) => s + det[i].v[t], 0));
  const total = sumOf(det.map(d => d.i));
  const items = [];                          // alles, was im Dropdown wählbar ist
  D.l1.forEach(x => items.push({key: "l1:" + x.id, level: 1, name: x.name, nodes: det.filter(d => d.l1 === x.id).map(d => d.i)}));
  D.l2.forEach(x => items.push({key: "l2:" + x.id, level: 2, name: x.name, parent: L1.get(x.l1).name, nodes: det.filter(d => d.l2 === x.id).map(d => d.i)}));
  det.forEach(d => items.push({key: "d:" + d.id, level: 3, name: d.name, parent: L2.get(d.l2).name, nodes: [d.i]}));
  items.forEach(it => { it.series = sumOf(it.nodes); it.set = new Set(it.nodes); });
  const byKey = new Map(items.map(it => [it.key, it]));
  const hubItem = id => byKey.get("l1:" + id);

  // ---------- Zustand ----------
  let legTop = 0, netMoving = false, restOn = true, built = false, raf = 0, lastTs = 0, playing = false, tYear = 0, dirty = true, settled = true;
  let pop, rate, entries = [], hlSet = null, hoverEntry = null, hoverNode = null, open = false;
  let root, tl, netSvg, legBox, playBtn, infoBox, tip, pickBox, pickIn, pickList, nodes = [], hubs = [], edges = [], legEls = [], restEl;

  // ---------- Radien ----------
  const maxDet = Math.max(...det.flatMap(d => d.v));
  const vmaxL1 = Math.max(...D.l1.flatMap(x => hubItem(x.id).series));
  const rDet = v => v >= 1 ? 2.2 + 19 * Math.sqrt(v / maxDet) : 0;
  const rHub = v => 26 + 34 * Math.pow(v / vmaxL1, .35);

  // ---------- Layout (einmalig, deterministisch) ----------
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function layout() {
    const rnd = mulberry(5), all = [];
    nodes = det.map(d => {
      const rmax = Math.max(...d.v.map(rDet));
      return {kind: "d", d, item: byKey.get("d:" + d.id), idx: d.i, rmax, x: 0, y: 0, l1: d.l1, l2: d.l2, show: 1};
    });
    // Je Level 1 ein "Revier" (luftig besetzt); die Reviere stoßen aneinander, die Kugel sitzt am Rand des Reviers.
    const reg = {};
    D.l1.forEach(x => {
      const area = nodes.filter(nd => nd.l1 === x.id).reduce((a, nd) => a + (nd.rmax + 6) ** 2, 0);
      reg[x.id] = {R: Math.max(50, Math.sqrt(area / .3))};
    });
    const [A, B, C] = [409, 295, 687], rA = reg[A].R, rB = reg[B].R, rC = reg[C].R;
    const dAB = rA * .72 + rB * .6, dAC = rA * .72 + rC * .6, dBC = (rB + rC) * .75;
    const angB = .55, cosT = (dAB * dAB + dAC * dAC - dBC * dBC) / (2 * dAB * dAC), angC = angB - Math.acos(Math.max(-1, Math.min(1, cosT)));
    reg[A].x = 0; reg[A].y = 0;
    reg[B].x = Math.cos(angB) * dAB; reg[B].y = Math.sin(angB) * dAB;
    reg[C].x = Math.cos(angC) * dAC; reg[C].y = Math.sin(angC) * dAC;
    const mx = (reg[A].x + reg[B].x + reg[C].x) / 3, my = (reg[A].y + reg[B].y + reg[C].y) / 3;
    hubs = D.l1.map(x => {
      const it = hubItem(x.id), rmax = Math.max(...it.series.map(rHub)), g = reg[x.id];
      const ax = g.x - mx, ay = g.y - my, al = Math.hypot(ax, ay) || 1;     // Kugel nach außen versetzt
      const h = {kind: "h", id: x.id, item: it, x: g.x + ax / al * g.R * .25, y: g.y + ay / al * g.R * .25, rmax, fixed: true, color: L1COL[x.id]};
      all.push(h); return h;
    });
    const hubOf = new Map(hubs.map(h => [h.id, h]));
    nodes.forEach(nd => {
      const g = reg[nd.l1], others = D.l1.filter(x => x.id !== nd.l1).map(x => reg[x.id]);
      const stray = rnd() < .14, o = others[Math.floor(rnd() * 2)];
      const bx = stray ? g.x + (o.x - g.x) * .55 : g.x, by = stray ? g.y + (o.y - g.y) * .55 : g.y, R = stray ? g.R * .35 : g.R;
      const a = rnd() * 6.2832, r = Math.sqrt(rnd()) * R;
      nd.x = bx + Math.cos(a) * r; nd.y = by + Math.sin(a) * r; nd.tx = bx; nd.ty = by;
    });
    all.push(...nodes);
    for (let it = 0; it < 500; it++) {
      const alpha = 1 - it / 500;
      nodes.forEach(nd => { nd.x += (nd.tx - nd.x) * .0015; nd.y += (nd.ty - nd.y) * .0015; });
      for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) {
        const p = all[a], q = all[b];
        let dx = q.x - p.x, dy = q.y - p.y, dist = Math.hypot(dx, dy) || .01;
        const min = p.rmax + q.rmax + (p.kind === "h" || q.kind === "h" ? 9 : 7) + 3 * alpha;
        if (dist >= min) continue;
        const push = (min - dist) / dist * .5; dx *= push; dy *= push;
        if (p.fixed) { q.x += dx * 2; q.y += dy * 2; } else if (q.fixed) { p.x -= dx * 2; p.y -= dy * 2; } else { p.x -= dx; p.y -= dy; q.x += dx; q.y += dy; }
      }
    }
    // Kanten: jeder Punkt zu den nächsten Nachbarn (auch aus anderen Clustern), teils zur Kugel, Cluster untereinander
    const seen = new Set(); edges = [];
    all.forEach(o => o.uid = o.kind + (o.kind === "h" ? o.id : o.idx));
    const link = (a, b, w) => { const k = a.uid + ">" + b.uid; if (a === b || seen.has(k) || seen.has(b.uid + ">" + a.uid)) return; seen.add(k); edges.push({a, b, w}); };
    const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
    nodes.forEach(nd => {
      const near = nodes.filter(o => o !== nd).sort((a, b) => dist(nd, a) - dist(nd, b));
      near.slice(0, 2).forEach(o => link(nd, o, .5));
      const far = near.slice(3, 14).filter(o => o.l1 !== nd.l1)[0]; if (far && rnd() < .5) link(nd, far, .3);
      if (rnd() < .3) link(nd, hubOf.get(nd.l1), .8);
    });
    hubs.forEach((h, i) => hubs.forEach((o, j) => {
      if (j <= i) return;
      link(h, o, .9);
      const prs = []; nodes.filter(nd => nd.l1 === h.id).forEach(p => nodes.filter(nd => nd.l1 === o.id).forEach(q => prs.push([dist(p, q), p, q])));
      prs.sort((x, y) => x[0] - y[0]).slice(0, 10).forEach(([, p, q]) => link(p, q, .4));
      nodes.filter(nd => nd.l1 === h.id).sort((a, b) => dist(a, o) - dist(b, o)).slice(0, 4).forEach(p => link(p, o, .6));
      nodes.filter(nd => nd.l1 === o.id).sort((a, b) => dist(a, h) - dist(b, h)).slice(0, 4).forEach(p => link(p, h, .6));
    }));
    nodes.forEach(nd => nd.color = mix(L1COL[nd.l1], ((nd.l2 * 7) % 5) * .07));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    all.forEach(o => { x0 = Math.min(x0, o.x - o.rmax); y0 = Math.min(y0, o.y - o.rmax); x1 = Math.max(x1, o.x + o.rmax); y1 = Math.max(y1, o.y + o.rmax); });
    return [x0 - 20, y0 - 20, x1 - x0 + 40, y1 - y0 + 40];
  }

  // ---------- Legende-Einträge ----------
  const entryOf = key => entries.find(e => e.item.key === key);
  function addEntry(key, color) {
    if (entryOf(key)) return;
    const used = new Set(entries.map(e => e.color));
    const e = {item: byKey.get(key), color: color || EXTRA_COLS.find(c => !used.has(c)) || EXTRA_COLS[entries.length % EXTRA_COLS.length], on: true, ly: null, desc: "", pct: "", peak: peakOf(byKey.get(key))};
    entries.push(e); rebuildLegend(); dirty = true;
  }
  function removeEntry(e) { entries = entries.filter(x => x !== e); if (hoverEntry === e) setHover(null); rebuildLegend(); dirty = true; }
  function peakOf(it) {              // Höchststand nur, wenn er zwischen erstem und letztem Jahr liegt
    const p = it.series.map((v, i) => v / pop[i] * 100);
    let k = 0; p.forEach((v, i) => { if (v > p[k]) k = i; });
    return k > 0 && k < LAST ? {i: k, p: p[k]} : null;
  }
  const contains = (a, b) => a.level < b.level && [...b.set].every(i => a.set.has(i));
  function exclusive(t) {            // Wert je aktivem Eintrag ohne die enthaltenen, ebenfalls aktiven Einträge
    const act = entries.filter(e => e.on), out = new Map();
    act.forEach(e => {
      const inner = act.filter(c => c !== e && contains(e.item, c.item)).filter(c => !act.some(m => m !== c && m !== e && contains(e.item, m.item) && contains(m.item, c.item)));
      out.set(e, Math.max(0, lerpAt(e.item.series, t) - inner.reduce((s, c) => s + lerpAt(c.item.series, t), 0)));
    });
    return out;
  }
  function top3(it, yi) {
    return [...it.nodes].sort((a, b) => det[b].v[yi] - det[a].v[yi]).filter(i => det[i].v[yi] > 0).slice(0, 3).map(i => det[i].name);
  }

  // ---------- Aufbau ----------
  function build() {
    pop = years.map(y => POP.de[y]); rate = total.map((v, i) => v / pop[i] * 100);
    const box = layout();
    const css = el("style"); css.textContent = CSS; document.head.appendChild(css);
    root = el("div"); root.id = "netview";
    root.innerHTML = `<div class="nv-main"><div class="nv-top"><button id="nv-play" type="button" aria-label="Start / Pause">▶</button><svg id="nv-tl" aria-label="Zeitlinie: Todesfälle in % der Bevölkerung"></svg></div>` +
      `<div class="nv-cap">Linie: Todesfälle insgesamt in % der Bevölkerung · zum Springen klicken oder ziehen</div><div class="nv-panel"><div id="nv-info"></div><svg id="nv-net" role="img" aria-label="Netzwerk der Krankheiten"></svg></div></div>` +
      `<div class="nv-side"><div class="nv-pick"><div class="nv-t">Allgemeine Auswahl</div><div class="nv-box"><input type="text" placeholder="Krankheit suchen …" autocomplete="off" aria-label="Krankheit suchen"><span>▾</span></div><div class="nv-list" hidden></div></div>` +
      `<div class="nv-t nv-lt">Legende</div><div class="nv-leg" id="nv-leg"></div></div>`;
    document.querySelector(".wrap").before(root);
    tip = el("div"); tip.id = "nv-tip"; document.body.appendChild(tip);
    tl = root.querySelector("#nv-tl"); netSvg = root.querySelector("#nv-net"); legBox = root.querySelector("#nv-leg");
    playBtn = root.querySelector("#nv-play"); infoBox = root.querySelector("#nv-info");
    pickBox = root.querySelector(".nv-box"); pickIn = pickBox.querySelector("input"); pickList = root.querySelector(".nv-list");
    // Netzwerk-SVG
    netSvg.setAttribute("viewBox", box.map(v => v.toFixed(0)).join(" "));
    let s = `<g id="nv-edges">`;
    edges.forEach((e, i) => s += `<line data-e="${i}" x1="${e.a.x.toFixed(1)}" y1="${e.a.y.toFixed(1)}" x2="${e.b.x.toFixed(1)}" y2="${e.b.y.toFixed(1)}" stroke="#fff" stroke-opacity="${(.16 + e.w * .26).toFixed(2)}" stroke-width="${(.5 + e.w * .5).toFixed(2)}"/>`);
    s += `</g><g id="nv-nodes">`;
    nodes.forEach(nd => s += `<circle data-k="${nd.uid}" cx="${nd.x.toFixed(1)}" cy="${nd.y.toFixed(1)}" r="0" fill="${nd.color}"/>`);
    hubs.forEach(h => s += `<circle data-k="${h.uid}" cx="${h.x.toFixed(1)}" cy="${h.y.toFixed(1)}" r="0" fill="${h.color}"/>`);
    s += `</g><g id="nv-labels" pointer-events="none">`;
    hubs.forEach(h => s += `<text data-l="${h.id}" x="${h.x.toFixed(1)}" y="${h.y.toFixed(1)}" text-anchor="middle">${SHORT[h.item.key.slice(3)].map((w, i, a) => `<tspan x="${h.x.toFixed(1)}" dy="${i ? 12 : (1 - a.length) * 6 + 4}">${w}</tspan>`).join("")}</text>`);
    netSvg.innerHTML = s + `</g>`;
    const cir = new Map([...netSvg.querySelectorAll("circle")].map(c => [c.dataset.k, c]));
    [...nodes, ...hubs].forEach(o => o.c = cir.get(o.uid));
    const ls = [...netSvg.querySelectorAll("#nv-edges line")]; edges.forEach((e, i) => e.l = ls[i]);
    hubs.forEach(h => h.t = netSvg.querySelector(`text[data-l="${h.item.key.slice(3)}"]`));
    // Standard: Top-5 Level 2 nach dem letzten Jahr
    D.l2.map(g => byKey.get("l2:" + g.id)).sort((a, b) => b.series[LAST] - a.series[LAST]).slice(0, TOP).forEach((it, k) => addEntry(it.key, TOP_COLS[k]));
    bind();
    built = true;
  }

  // ---------- Ereignisse ----------
  function setHover(e, node) {
    hoverEntry = e || null; hoverNode = node || null;
    hlSet = e ? e.item.set : node ? (node.kind === "h" ? node.item.set : new Set([node.idx])) : null;
    applyHL(); dirty = true;
  }
  function applyHL() {
    const on = i => !hlSet || hlSet.has(i);
    nodes.forEach(nd => nd.c.style.opacity = on(nd.idx) ? 1 : .15);
    hubs.forEach(h => h.c.style.opacity = !hlSet || hoverNode === h || [...hlSet].some(i => det[i].l1 === h.item.key.slice(3) * 1) ? 1 : .35);
    const ina = o => o.kind === "h" || hlSet.has(o.idx);
    edges.forEach(e => e.l.style.opacity = !hlSet || (ina(e.a) && ina(e.b)) ? 1 : .1);
  }
  function setPlaying(p) { playing = p; playBtn.textContent = p ? "❚❚" : "▶"; }
  function bind() {
    playBtn.onclick = () => { if (!playing && tYear >= LAST) tYear = 0; setPlaying(!playing); dirty = true; };
    const scrub = e => { const r = tl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 1000; tYear = Math.min(LAST, Math.max(0, (x - TL.x0) / (TL.x1 - TL.x0) * LAST)); dirty = true; };
    tl.addEventListener("pointerdown", e => { tl.setPointerCapture(e.pointerId); setPlaying(false); scrub(e); });
    tl.addEventListener("pointermove", e => { if (tl.hasPointerCapture(e.pointerId)) scrub(e); else peakHover(e); });
    tl.addEventListener("pointerleave", () => { if (peakFocus) { peakFocus = null; dirty = true; } });
    const nodeOf = e => { const c = e.target.closest("circle"); return c && ([...nodes, ...hubs].find(o => o.uid === c.dataset.k)); };
    netSvg.addEventListener("pointermove", e => {
      const o = nodeOf(e);
      if (o !== hoverNode) setHover(null, o);
      if (!o) { tip.style.display = "none"; return; }
      const yi = Math.round(tYear), v = o.kind === "h" ? lerpAt(o.item.series, tYear) : lerpAt(o.d.v, tYear);
      const nm = o.kind === "h" ? o.item.name : o.d.name, sub = o.kind === "h" ? "Level 1" : L2.get(o.l2).name;
      tip.innerHTML = `<b>${nm}</b><br><span class="d">${sub}</span><br>${years[yi]}: ${fmt(v)} Todesfälle<br>${pcPop(v / lerpAt(pop, tYear) * 100)} der Bevölkerung · ${pc(v / lerpAt(total, tYear) * 100)} aller Todesfälle<br><span class="d">Klick: zur Legende hinzufügen</span>`;
      moveTip(e);
    });
    netSvg.addEventListener("pointerleave", () => { setHover(null); tip.style.display = "none"; });
    netSvg.addEventListener("click", e => { const o = nodeOf(e); if (o) addEntry(o.kind === "h" ? o.item.key : o.item.key); });
    // Dropdown
    const items0 = () => { const q = norm(pickIn.value.trim());
      if (!q) return {head: true, list: items.filter(i => i.level <= 2)};
      return {head: false, list: items.filter(i => norm(i.name).includes(q)).sort((a, b) => a.level - b.level)}; };
    let act = -1;
    const draw = () => {
      const {head, list} = items0(); let h = "", last = 0;
      list.forEach((it, k) => {
        if (it.level !== last) { last = it.level; h += `<div class="hd">${["", "Level 1 · Oberkategorien", "Level 2", "Krankheiten (detailliert)"][it.level]}</div>`; }
        h += `<div class="it${k === act ? " act" : ""}" data-key="${it.key}"><span>${it.name}${it.parent ? `<small>${it.parent}</small>` : ""}</span><i>${entryOf(it.key) ? "✓" : ""}</i></div>`;
      });
      if (head) h += `<div class="hint">Tippen, um alle ${det.length} Krankheiten zu durchsuchen</div>`;
      if (!list.length) h = `<div class="hint">Keine Treffer</div>`;
      pickList.innerHTML = h; pickList._n = list;
    };
    const openList = () => { open = true; pickList.hidden = false; act = -1; draw(); };
    const closeList = () => { open = false; pickList.hidden = true; pickIn.blur(); };
    const choose = it => { const e = entryOf(it.key); e ? removeEntry(e) : addEntry(it.key); draw(); };
    pickBox.addEventListener("click", () => { if (!open) { openList(); pickIn.focus(); } });
    pickIn.addEventListener("focus", () => { if (!open) openList(); });
    pickIn.addEventListener("input", () => { act = 0; draw(); });
    pickIn.addEventListener("keydown", e => {
      const l = pickList._n || [];
      if (e.key === "ArrowDown") { act = Math.min(l.length - 1, act + 1); draw(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { act = Math.max(0, act - 1); draw(); e.preventDefault(); }
      else if (e.key === "Enter" && l[Math.max(0, act)]) { choose(l[Math.max(0, act)]); }
      else if (e.key === "Escape") closeList();
      const a = pickList.querySelector(".act"); if (a) a.scrollIntoView({block: "nearest"});
    });
    pickList.addEventListener("mousedown", e => { e.preventDefault(); const r = e.target.closest(".it"); if (r) choose(byKey.get(r.dataset.key)); });
    document.addEventListener("mousedown", e => { if (open && !e.target.closest(".nv-pick")) closeList(); });
    window.addEventListener("resize", () => { measureTop(); dirty = true; legEls.forEach(l => l.measure = true); });
  }
  function measureTop() { legTop = legBox.getBoundingClientRect().top + scrollY; }
  function moveTip(e) {
    tip.style.display = "block";
    tip.style.left = Math.max(0, Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8)) + "px";
    tip.style.top = Math.max(0, Math.min(e.clientY + 14, innerHeight - tip.offsetHeight - 8)) + "px";
  }

  // ---------- Zeitlinie ----------
  const TL = {x0: 40, x1: 960, yTop: 80, yBot: 130, yAxis: 164};
  let peakFocus = null;
  const tx = i => TL.x0 + i / LAST * (TL.x1 - TL.x0);
  const PK_COLS = ["#6cc8ff", "#ffd166", "#ef8fb7", "#9be37c", "#c9a7ff", "#ff9f6b", "#7fe3d4"];
  const peakCol = it => { const e = entryOf(it.key); return e ? mix(e.color, .4) : PK_COLS[parseInt(it.key.slice(3)) % 7]; };
  let pkList = [];
  function peakHover(e) {
    const r = tl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 1000;
    const near = pkList.slice().sort((a, b) => Math.abs(tx(a.i) - x) - Math.abs(tx(b.i) - x))[0];
    const f = near && Math.abs(tx(near.i) - x) < 12 ? near.it : null;
    if (f !== peakFocus) { peakFocus = f; dirty = true; }
  }
  function drawTimeline() {
    // Höchststand je Level-2-Ursache (nur Zwischenjahre), nur für sichtbare Gruppen; Beschriftungen in Reihen gestaffelt
    pkList = [];
    D.l2.map(g => byKey.get("l2:" + g.id)).forEach(it => {
      if (it.peak === undefined) it.peak = peakOf(it);
      if (it.peak && it.nodes.some(i => visT[i])) pkList.push({it, i: it.peak.i, p: it.peak.p});
    });
    pkList.sort((a, b) => a.i - b.i);
    const tiers = [];
    pkList.forEach(o => {
      const nm = o.it.name.length > 34 ? o.it.name.slice(0, 32) + "…" : o.it.name;
      o.text = `${nm} · ${years[o.i]} · ${pcPop(o.p)}`;
      const w = o.text.length * 6.9 + 6, x = tx(o.i), end = x + w > 995;
      o.a = end ? [x - w, x] : [x, x + w]; o.anchor = end ? "end" : "start";
      let t = tiers.findIndex(rs => rs.every(r => o.a[0] > r[1] + 6 || o.a[1] < r[0] - 6));
      if (t < 0) { t = tiers.length; tiers.push([]); }
      tiers[t].push(o.a); o.tier = t;
    });
    TL.yTop = 24 + Math.max(1, tiers.length) * 16 + 12; TL.yBot = TL.yTop + 48; TL.yAxis = TL.yBot + 34;
    const lo = Math.min(...rate), hi = Math.max(...rate);
    const py = v => TL.yBot - (v - lo) / (hi - lo || 1) * (TL.yBot - TL.yTop);
    const pts = rate.map((v, i) => [tx(i), py(v)]), t = Math.min(LAST, tYear), i0 = Math.floor(t), f = t - i0, i1 = Math.min(LAST, i0 + 1);
    const cur = [tx(t), py(rate[i0] * (1 - f) + rate[i1] * f)], past = pts.slice(0, i0 + 1).concat([cur]);
    const P = a => a.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    let s = `<defs><linearGradient id="nv-g" gradientUnits="userSpaceOnUse" x1="${TL.x0}" x2="${TL.x1}"><stop offset="0" stop-color="#f7c52b"/><stop offset="1" stop-color="#f08a2c"/></linearGradient></defs>`;
    s += `<polyline fill="none" stroke="#5a6088" stroke-width="3" stroke-linejoin="round" points="${P(pts)}"/>`;
    s += `<polyline fill="none" stroke="url(#nv-g)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" points="${P(past)}"/>`;
    years.forEach((y, i) => { if (y % 10 === 0 || i === LAST) s += `<line x1="${tx(i)}" x2="${tx(i)}" y1="${TL.yAxis - 14}" y2="${TL.yAxis - 8}" stroke="#7d84b0"/><text x="${tx(i)}" y="${TL.yAxis + 4}" text-anchor="middle" class="${y % 10 ? "dm" : ""}">${y}</text>`; });
    pkList.forEach(o => {
      const x = tx(o.i), col = peakCol(o.it), on = o.it === peakFocus || (hoverEntry && o.it.nodes.every(i => hoverEntry.item.set.has(i)));
      const ly = 20 + o.tier * 16;
      s += `<line x1="${x}" x2="${x}" y1="${ly + 3}" y2="${py(rate[o.i])}" stroke="${col}" stroke-width="${on ? 3 : 1.6}" stroke-opacity="${on ? 1 : .75}"/>`;
      s += `<text x="${x + (o.anchor === "end" ? -4 : 4)}" y="${ly}" text-anchor="${o.anchor}" class="pk${on ? " on" : ""}" style="fill:${col}">${o.text}</text>`;
    });
    s += `<circle cx="${cur[0]}" cy="${cur[1]}" r="6" fill="#f5b324" stroke="#fff" stroke-width="2"/>`;
    s += `<text x="${Math.min(TL.x1 - 10, Math.max(TL.x0 + 10, cur[0]))}" y="${cur[1] - 14}" text-anchor="middle" class="cy">${years[Math.round(t)]}</text>`;
    tl.setAttribute("viewBox", `0 0 1000 ${TL.yAxis + 10}`); tl.innerHTML = s;
  }

  // ---------- Netzwerk & Legende je Bild ----------
  let visT = [];                       // je Krankheit: gehört sie zu einem aktiven Eintrag (oder zu "Übrige", falls an)?
  function computeVis() {
    const act = entries.filter(e => e.on);
    visT = det.map(d => act.some(e => e.item.set.has(d.i)) || (restOn && !entries.some(e => e.item.set.has(d.i))));
  }
  function drawNetwork(dt) {
    const t = tYear, k = 1 - Math.exp(-dt * 10); let moving = false;
    const hsum = new Map(), hval = new Map();
    nodes.forEach(nd => {
      const tg = visT[nd.idx] ? 1 : 0;
      nd.show += (tg - nd.show) * k; if (Math.abs(tg - nd.show) < .01) nd.show = tg; else moving = true;
      const v = lerpAt(nd.d.v, t), r = rDet(v) * nd.show, vis = r > .05;
      nd.c.setAttribute("r", r.toFixed(2)); if (vis !== nd.vis) { nd.vis = vis; nd.c.style.display = vis ? "" : "none"; }
      hsum.set(nd.l1, (hsum.get(nd.l1) || 0) + nd.show); hval.set(nd.l1, (hval.get(nd.l1) || 0) + v * nd.show);
    });
    hubs.forEach(h => {
      const sh = Math.min(1, (hsum.get(h.id) || 0)), r = hval.get(h.id) > 0 ? rHub(hval.get(h.id)) * sh : 0, vis = r > .5;
      h.r = r; h.c.setAttribute("r", r.toFixed(2)); h.vis = vis; h.c.style.display = vis ? "" : "none"; h.t.style.display = r > 22 ? "" : "none";
    });
    edges.forEach(e => { const v = !!(e.a.vis && e.b.vis); if (v !== e.vis) { e.vis = v; e.l.style.display = v ? "" : "none"; } });
    netMoving = moving;
    const yi = Math.round(t), tot = lerpAt(total, t);
    infoBox.innerHTML = `<b>${years[yi]}</b><span>${fmt(tot)} Todesfälle · ${pcPop(tot / lerpAt(pop, t) * 100)} der Bevölkerung</span>`;
  }
  function rebuildLegend() {
    if (!legBox) return;
    legBox.innerHTML = `<svg class="lead"></svg><div class="bar"></div>`;
    const bar = legBox.querySelector(".bar");
    const mk = (e, rest) => {
      const l = {e, rest, measure: true, seg: el("div", "seg"), lab: el("div", "lab" + (rest ? " rest" : ""))};
      l.lab.innerHTML = `<div class="ln">${!rest && entries.indexOf(e) >= TOP ? `<button class="x" title="Entfernen" aria-label="Entfernen">✕</button>` : ""}<b></b><i class="dot"></i><span class="pc"></span></div><div class="ds"></div>`;
      l.b = l.lab.querySelector("b"); l.p = l.lab.querySelector(".pc"); l.d = l.lab.querySelector(".ds"); l.dot = l.lab.querySelector(".dot");
      const color = rest ? "#3b4170" : e.color; l.seg.style.background = color; l.dot.style.background = color;
      if (rest) l.b.textContent = "Übrige Ursachen"; else l.b.textContent = e.item.name;
      if (rest) {
        [l.lab, l.seg].forEach(o => o.addEventListener("click", () => { restOn = !restOn; dirty = true; }));
      } else {
        const toggle = () => { e.on = !e.on; dirty = true; };
        [l.lab, l.seg].forEach(o => { o.addEventListener("click", ev => { if (ev.target.closest(".x")) removeEntry(e); else toggle(); }); o.addEventListener("pointerenter", () => setHover(e)); o.addEventListener("pointerleave", () => setHover(null)); });
      }
      bar.appendChild(l.seg); legBox.appendChild(l.lab); return l;
    };
    const old = new Map(legEls.map(l => [l.e, l]));
    legEls = entries.map(e => mk(e)); legEls.forEach(l => { const o = old.get(l.e); if (o) l.ly = o.ly; });
    restEl = mk(null, true); legEls.push(restEl);
    legBox.querySelector(".lead").innerHTML = legEls.map(() => `<path fill="none" stroke-width="1.3"/>`).join("");
  }
  function updateLegend(dt) {
    const t = tYear, yi = Math.round(t), tot = lerpAt(total, t), ex = exclusive(t);
    let acc = 0, measure = false;
    const rows = legEls.map(l => {
      const e = l.e; let s;
      if (l.rest) s = restOn ? Math.max(0, 1 - acc) : 0;
      else s = e.on ? ex.get(e) / tot : 0;
      const row = {l, s, y0: acc}; acc += s;
      // Texte
      const pcT = (l.rest ? restOn : e.on) ? pc(s * 100) : "ausgeblendet";
      if (pcT !== l.pcT) { l.pcT = pcT; l.p.textContent = pcT; }
      if (!l.rest && (l.descYi !== yi || l.descOn !== e.on)) {
        l.descYi = yi; l.descOn = e.on;
        const tt = top3(e.item, yi);
        const d = e.item.level === 3 ? "Teil von: " + e.item.parent : tt.length ? tt.join(" · ") : "–";
        l.d.textContent = d; measure = true;
      }
      if (l.rest && !l.d.textContent) l.d.textContent = "alle weiteren Ursachen";
      if (l.measure) measure = true;
      l.lab.classList.toggle("off", l.rest ? !restOn : !e.on);
      return row;
    });
    if (measure) { rows.forEach(r => { r.l.h = r.l.lab.offsetHeight; r.l.measure = false; }); }
    const gap = 8, need = rows.reduce((a, r) => a + (r.l.h || 50) + gap, 0);
    const H = Math.max(Math.max(460, innerHeight - legTop - 34), need);
    legBox.style.height = H + "px";
    // Zielpositionen der Labels (Reihenfolge bleibt, Überlappung wird aufgelöst)
    const tops = rows.map(r => (r.y0 + r.s / 2) * H - (r.l.h || 50) / 2);
    for (let i = 0; i < tops.length; i++) tops[i] = Math.max(i ? tops[i - 1] + rows[i - 1].l.h + gap : 0, tops[i]);
    const lastR = rows.length - 1; if (tops[lastR] + rows[lastR].l.h > H) tops[lastR] = H - rows[lastR].l.h;
    for (let i = lastR - 1; i >= 0; i--) tops[i] = Math.min(tops[i], tops[i + 1] - gap - rows[i].l.h);
    const k = 1 - Math.exp(-dt * 12); let moving = false;
    const lead = legBox.querySelectorAll(".lead path");
    rows.forEach((r, i) => {
      const l = r.l;
      l.ly = l.ly == null ? tops[i] : l.ly + (tops[i] - l.ly) * k;
      if (Math.abs(tops[i] - l.ly) > .4) moving = true;
      l.lab.style.top = l.ly.toFixed(1) + "px";
      const hpx = r.s * H, segC = (r.y0 + r.s / 2) * H;
      l.seg.style.top = (r.y0 * H + 1).toFixed(1) + "px"; l.seg.style.height = Math.max(0, hpx - 2).toFixed(1) + "px";
      l.seg.style.display = hpx < 2.5 ? "none" : ""; l.seg.style.borderRadius = Math.min(14, hpx / 2) + "px";
      const ly = l.ly + 10, show = hpx >= 2.5;
      lead[i].setAttribute("d", `M${LAB_W + 8},${ly.toFixed(1)}H${LAB_W + 24}L${BAR_X - 10},${segC.toFixed(1)}H${BAR_X - 2}`);
      lead[i].setAttribute("stroke", l.rest ? "#4d5483" : l.e.color); lead[i].style.opacity = show ? .85 : 0;
    });
    legBox.querySelector(".lead").setAttribute("height", H);
    settled = !moving;
  }

  function draw(dt) { computeVis(); drawNetwork(dt); drawTimeline(); updateLegend(dt); settled = settled && !netMoving; }
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.1, (ts - lastTs) / 1000 || 0); lastTs = ts;
    if (playing) { tYear += dt * SPEED; dirty = true; if (tYear >= LAST) { tYear = LAST; setPlaying(false); } }
    if (dirty || !settled) { dirty = false; draw(dt); }
  }

  const CSS = `
body.net { background:#312e66; color:#e8e6f5; }
body.net h1, body.net h2, body.net p.sub, body.net #controls, body.net .wrap, body.net footer { display:none; }
body.net .pick select { background:#262a55; color:#fff; border:1px solid #4a4f86; border-radius:6px; }
body.net .pick select:disabled { opacity:.55; }
body.net .pick { color:#cfd2ee; }
#netview { display:none; margin:0; background:#312e66; padding:6px 8px 24px; box-sizing:border-box; font-family:system-ui,sans-serif; color:#e8e6f5; grid-template-columns:minmax(0,1fr) 560px; gap:0 30px; }
body.net #netview { display:grid; }
#netview .nv-top { display:flex; align-items:center; gap:14px; }
#nv-play { flex:none; width:38px; height:38px; border-radius:50%; border:0; background:#f2b01e; color:#2a2a44; font-size:15px; cursor:pointer; }
#nv-play:hover { background:#ffc83a; }
#nv-tl { flex:1; min-width:0; height:auto; display:block; cursor:ew-resize; touch-action:none; user-select:none; }
#nv-tl text { fill:#d7d9f0; font-size:13px; }
#nv-tl text.dm { fill:#9498c0; } #nv-tl text.sm { font-size:11px; } #nv-tl text.pk { font-size:12px; paint-order:stroke; stroke:#312e66; stroke-width:3px; } #nv-tl text.pk.on { font-size:12.5px; font-weight:700; }
#nv-tl text.cy { font-size:12px; font-weight:700; fill:#f5b324; }
.nv-cap { font-size:11px; color:#9498c0; margin:2px 0 0 52px; }
.nv-panel { position:relative; margin-top:8px; box-sizing:border-box; }
#nv-net { display:block; width:100%; height:max(440px, calc(100vh - 300px)); }
#nv-net circle { cursor:pointer; transition:opacity .15s; }
#nv-net line { transition:opacity .15s; }
#nv-net text { fill:#fff; font-size:12px; font-weight:600; paint-order:stroke; stroke:rgba(30,20,70,.55); stroke-width:3px; }
#nv-info { position:absolute; left:16px; top:12px; z-index:1; pointer-events:none; line-height:1.25; }
#nv-info b { display:block; font-size:34px; font-weight:600; color:#f3f1ff; } #nv-info span { font-size:12px; color:#a7abd6; }
.nv-side { border-left:2px solid #fff; padding-left:28px; min-width:0; }
.nv-t { font-size:14px; margin-bottom:10px; } .nv-lt { margin-top:26px; }
.nv-pick { position:relative; }
.nv-box { display:flex; align-items:center; background:#dcdcdc; border-radius:4px; height:34px; padding:0 10px; cursor:text; }
.nv-box input { flex:1; min-width:0; border:0; background:transparent; font:inherit; font-size:13px; color:#222; outline:none; }
.nv-box span { color:#555; }
.nv-list { position:absolute; z-index:20; left:0; right:0; top:70px; max-height:360px; overflow:auto; background:#23274a; border:1px solid #5a6094; border-radius:6px; box-shadow:0 8px 24px rgba(0,0,0,.5); }
.nv-list[hidden] { display:none; }
.nv-list .hd { position:sticky; top:0; background:#1b1e3f; color:#9ba0d0; font-size:11px; letter-spacing:.04em; text-transform:uppercase; padding:6px 12px; }
.nv-list .it { display:flex; justify-content:space-between; gap:10px; padding:6px 12px; font-size:13px; cursor:pointer; }
.nv-list .it small { display:block; color:#8b8fb8; font-size:11px; }
.nv-list .it:hover, .nv-list .it.act { background:#343a73; } .nv-list .it i { font-style:normal; color:#5fd68a; }
.nv-list .hint { padding:8px 12px; color:#8b8fb8; font-size:12px; }
.nv-leg { position:relative; width:${BAR_X + BAR_W}px; max-width:100%; }
.nv-leg .lead { position:absolute; left:0; top:0; width:${BAR_X + BAR_W}px; overflow:visible; pointer-events:none; }
.nv-leg .bar { position:absolute; left:${BAR_X}px; top:0; width:${BAR_W}px; bottom:0; }
.nv-leg .seg { position:absolute; left:0; right:0; cursor:pointer; }
.nv-leg .lab { position:absolute; left:0; width:${LAB_W}px; text-align:right; cursor:pointer; }
.nv-leg .ln { font-size:15px; line-height:1.25; }
.nv-leg .ln b { font-weight:600; } .nv-leg .pc { color:#c9ccea; margin-left:6px; font-size:13px; }
.nv-leg .dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-left:7px; vertical-align:baseline; }
.nv-leg .ds { font-size:12.5px; line-height:1.3; color:#9ca0cc; margin-top:2px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.nv-leg .lab:hover .ln b { text-decoration:underline; }
.nv-leg .lab.off { opacity:.45; } .nv-leg .lab.rest { opacity:.75; }
.nv-leg .x { background:none; border:0; color:#9ca0cc; cursor:pointer; font-size:11px; padding:0 6px 0 0; } .nv-leg .x:hover { color:#fff; }
#nv-tip { position:fixed; z-index:30; display:none; pointer-events:none; background:#0f1129; border:1px solid #4a4f86; border-radius:6px; padding:7px 10px; font-size:12.5px; line-height:1.4; max-width:320px; color:#e8e6f5; box-shadow:0 2px 10px rgba(0,0,0,.5); }
#nv-tip .d { color:#8b8fb8; }
@media (max-width:1100px) { #netview { grid-template-columns:minmax(0,1fr); } .nv-side { border-left:0; padding:24px 0 0; } }
`;

  return {
    show() {
      if (!built) build();
      document.body.classList.add("net"); measureTop();
      dirty = true; lastTs = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    },
    hide() {
      if (!built) return;
      cancelAnimationFrame(raf); setPlaying(false); tip.style.display = "none";
      document.body.classList.remove("net");
    }
  };
})();
