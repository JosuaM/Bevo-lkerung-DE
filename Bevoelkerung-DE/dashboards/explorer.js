/* Dashboard „Bevölkerung verstehen“: Diagramme „Mit & ohne Wanderung“ und „Bevölkerungsbilanz“.
   Markup in index.html (#explorer), Gestaltung in explorer.css. Die Folie ruft render(api) in jedem Bild auf. */
window.populationExplorer = (() => {
  const $ = id => document.getElementById(id);
  const el = $('explorer');
  const svg = $('ex-chart');
  const tabs = [...el.querySelectorAll('[role=tab]')];
  const eventTooltip = $('ex-event-tooltip');
  const [valueTooltip, comparisonTooltip] = el.querySelectorAll('.ex-value-tooltip');
  const valueTooltips = [valueTooltip, comparisonTooltip];

  /* Schriftgrößen im Diagramm (Referenz der festen Stufe --fs-s in explorer.css) */
  const AXIS_FONT = Math.round(20.563 * .85);
  const CHART_PAD = {left: 90, right: 20, top: 47, bottom: 64, yearInset: 12};
  const SHORT_NAMES = {1992: 'Jugoslawienkriege', 1993: 'Asylkompromiss', 2011: 'EU-Freizügigkeit', 2012: 'Eurokrise',
    2014: 'Bulgarien & Rumänien', 2015: 'Flucht aus Syrien', 2020: 'Corona', 2022: 'Ukrainekrieg'};
  const WHITE = '#eef2f6';

  let view = 'population', detail = false, populationPercent = false;
  let api = null, lastKey = '', selectedEventYear = null;
  let hoverGeometry = null, valueHoverKey = '';
  let twoLineHeading = true;                   // Überschrift zweizeilig (neu) oder einzeilig (alt), temporärer Vergleich

  /* ---- Einfädeln: nach jedem Wechsel der Ansicht laufen Linien und Balken von links ins Diagramm ---- */
  const REVEAL_MS = 1400;
  let revealStart = -1;
  function reveal(delay = 0){ revealStart = performance.now() + delay; lastKey = ''; }
  function revealProgress(){
    if (revealStart < 0) return 1;
    const p = Math.max(0, Math.min(1, (performance.now() - revealStart) / REVEAL_MS));
    if (p >= 1) revealStart = -1;
    return p < .5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
  }

  /* ---- Skalierung: das Dashboard sieht in jeder Fenstergröße gleich aus (Referenz 1512 × 860) ---- */
  let zoom = 1;
  function applyZoom(){
    zoom = Math.max(.4, Math.min(3, Math.min(innerWidth / 1512, innerHeight / 860)));
    el.style.setProperty('--ex-z', zoom);
  }
  applyZoom();
  addEventListener('resize', applyZoom);
  const localRect = node => {                  // Maße in Dashboard-Pixeln statt Bildschirm-Pixeln
    const r = node.getBoundingClientRect();
    return {left: r.left / zoom, top: r.top / zoom, width: r.width / zoom, height: r.height / zoom};
  };
  const cloud = createParticleCloud($('ex-surplus-particles'), () => zoom);

  /* ---- Formatierung und Hilfsfunktionen ---- */
  const percentFmt = n => n.toLocaleString('de-DE', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' %';
  const compact = n => Math.abs(n) >= 1e6
    ? (n / 1e6).toLocaleString('de-DE', {maximumFractionDigits: 1}) + ' Mio.'
    : Math.round(n / 1000).toLocaleString('de-DE') + ' Tsd.';
  const overallBalance = ['Gesamtbilanz', WHITE, r => r.wb - r.wd + r.zu - r.fort];
  const linearValue = (values, position) => {
    const i = Math.min(values.length - 2, Math.floor(position)), f = position - i;
    return values[i] * (1 - f) + values[i + 1] * f;
  };
  const linearPath = (rows, series, X, Y) => rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${X(r.y)} ${Y(series[2](r))}`).join(' ');
  const svgPoint = e => {                      // Mauszeiger in Diagramm-Koordinaten
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };
  const choose = (year, fromEvent = false) => {
    selectedEventYear = fromEvent ? year : null;
    api.selectYear(year);
    lastKey = '';
  };

  /* ---- Werte beim Überfahren des Diagramms ---- */
  function clearValueHover(){
    svg.querySelectorAll('.bar-hover').forEach(bar => bar.classList.remove('bar-hover'));
    svg.classList.remove('value-hover');
    valueTooltips.forEach(box => box.hidden = true);
    valueHoverKey = '';
    const marker = svg.querySelector('#ex-value-marker');
    if (marker) marker.replaceChildren();
  }
  function showBalanceHover(local, position){
    const {rows, sets, X, Y, top, formatValue} = hoverGeometry;
    const row = rows[Math.round(position)], x = X(row.y), zero = Y(0);
    const hoverSets = detail ? sets : [...sets, overallBalance];
    const near = hoverSets.some(series => {
      if (detail) return Math.abs(local.y - linearValue(rows.map(r => Y(series[2](r))), position)) < 32;
      const y = Y(series[2](row));
      return local.y >= Math.min(y, zero) - 24 && local.y <= Math.max(y, zero) + 24;
    });
    if (!near){ clearValueHover(); return false; }
    const panel = localRect(svg.parentElement), chart = localRect(svg);
    const groups = detail ? [sets.slice(0, 2), sets.slice(2)] : sets.map(series => [series]);
    let nextTop = Math.max(8, chart.top - panel.top + top + 12);
    groups.forEach((group, index) => {
      const box = valueTooltips[index];
      box.innerHTML = '<span>' + row.y + '</span>' + group.map(series =>
        '<span>' + series[0] + '</span><strong style="color:' + series[1] + '">' + api.sgn(series[2](row)) + '</strong>').join('');
      box.hidden = false;
      box.style.left = Math.max(10, Math.min(panel.width - box.offsetWidth - 10, chart.left - panel.left + x + 18)) + 'px';
      box.style.top = nextTop + 'px';
      nextTop += box.offsetHeight + 10;
    });
    valueHoverKey = 'balance-' + row.y;
    svg.querySelector('#ex-value-marker').replaceChildren();
    svg.querySelectorAll('.bar-hover').forEach(bar => bar.classList.remove('bar-hover'));
    if (!detail){
      const bar = [...svg.querySelectorAll('rect[data-baryear]')].reverse().find(rect => {
        const box = rect.getBBox();
        return local.x >= box.x - 3 && local.x <= box.x + box.width + 3 && local.y >= box.y - 4 && local.y <= box.y + box.height + 4;
      });
      if (bar) svg.querySelectorAll('rect[data-baryear="' + bar.dataset.baryear + '"]').forEach(segment => segment.classList.add('bar-hover'));
    }
    return true;
  }
  function showPopulationHover(local, position){
    const {rows, sets, X, Y, top, bottom, formatValue} = hoverGeometry;
    let nearest = null;
    sets.forEach((series, index) => {
      const distance = Math.abs(local.y - linearValue(rows.map(r => Y(series[2](r))), position));
      if (distance < 32 && (!nearest || distance < nearest.distance)) nearest = {series, index, distance};
    });
    if (!nearest){ clearValueHover(); return false; }
    const row = rows[Math.round(position)], x = X(row.y), key = String(row.y), changed = key !== valueHoverKey;
    const panel = localRect(svg.parentElement), chart = localRect(svg);

    if (populationPercent){                    // eine Karte zwischen den Linien: Abstand zur tatsächlichen Bevölkerung
      const box = valueTooltip, model = sets[1], modelValue = model[2](row);
      comparisonTooltip.hidden = true;
      if (changed) box.innerHTML = '<span>' + row.y + ' · Abstand zur tatsächlichen Bevölkerung</span><strong>' + percentFmt(100 - modelValue) + '</strong>';
      box.hidden = false;
      const upper = Y(100), lower = Y(modelValue), middle = (upper + lower) / 2;
      const sx = chart.width / svg.viewBox.baseVal.width, sy = chart.height / svg.viewBox.baseVal.height;
      const originX = chart.left - panel.left, originY = chart.top - panel.top;
      const minLeft = originX + X(api.FIRST) * sx, maxLeft = originX + X(api.LAST) * sx - box.offsetWidth;
      const left = Math.max(minLeft, Math.min(Math.max(minLeft, maxLeft), originX + x * sx - box.offsetWidth / 2));
      const cardTop = Math.max(originY + top * sy + 12, Math.min(originY + bottom * sy - box.offsetHeight - 8, originY + middle * sy - box.offsetHeight / 2));
      box.style.left = left + 'px';
      box.style.top = cardTop + 'px';
      const edge = (left - originX + box.offsetWidth / 2) / sx;
      const upperEnd = (cardTop - originY - 4) / sy, lowerEnd = (cardTop - originY + box.offsetHeight + 4) / sy;
      svg.querySelector('#ex-value-marker').innerHTML =
        `<line x1="${x}" y1="${upper}" x2="${edge}" y2="${upperEnd}" stroke="${WHITE}" stroke-width="1.5"/>` +
        `<line x1="${x}" y1="${lower}" x2="${edge}" y2="${lowerEnd}" stroke="${model[1]}" stroke-width="1.5"/>` +
        `<circle cx="${x}" cy="${lower}" r="5" fill="${model[1]}" stroke="#121212" stroke-width="2"/>`;
      valueHoverKey = key;
      return true;
    }

    const positions = sets.map((series, index) => {
      const box = valueTooltips[index], y = Y(series[2](row));
      if (changed) box.innerHTML = '<span>' + row.y + ' · ' + series[0] + '</span><strong style="color:' + series[1] + '">' + formatValue(series[2](row)) + '</strong>';
      box.hidden = false;
      return {
        box, series, y, direction: -1,
        left: Math.max(10, Math.min(panel.width - box.offsetWidth - 10, chart.left - panel.left + x - box.offsetWidth / 2)),
        top: Math.max(8, chart.top - panel.top + y - 42 - box.offsetHeight - 8),
      };
    });
    // Bei eng beieinanderliegenden Linien die zweite Karte unterhalb platzieren.
    if (positions[1].top < positions[0].top + positions[0].box.offsetHeight + 10){
      positions[1].top = chart.top - panel.top + positions[1].y + 50;
      positions[1].direction = 1;
    }
    positions.forEach(item => { item.box.style.left = item.left + 'px'; item.box.style.top = item.top + 'px'; });
    if (changed){
      valueHoverKey = key;
      svg.querySelector('#ex-value-marker').innerHTML = positions.map(({series, y, direction}) =>
        `<line class="value-stem" x1="${x}" x2="${x}" y1="${y}" y2="${Math.max(8, y + direction * 42)}" stroke="${series[1]}" stroke-width="2"/>` +
        `<circle cx="${x}" cy="${y}" r="5" fill="${series[1]}" stroke="#121212" stroke-width="2"/>`).join('');
    }
    return true;
  }
  function showValueHover(e){
    if (!hoverGeometry){ clearValueHover(); return false; }
    const {rows, X, top, bottom} = hoverGeometry;
    const local = svgPoint(e);
    if (local.x < X(api.FIRST) - 8 || local.x > X(api.LAST) + 8 || local.y < top - 14 || local.y > bottom + 10){
      clearValueHover();
      return false;
    }
    const position = api.clamp((local.x - X(api.FIRST)) / (X(api.LAST) - X(api.FIRST)) * (rows.length - 1), 0, rows.length - 1);
    return view === 'balance' ? showBalanceHover(local, position) : showPopulationHover(local, position);
  }

  /* ---- Ereigniskarte ---- */
  eventTooltip.classList.add('expanded');
  function showEventTooltip(target){
    const marker = target && target.closest('[data-eventyear]');
    if (!marker || !api){ eventTooltip.hidden = true; return; }
    const year = +marker.dataset.eventyear, event = api.EVENTS[year];
    eventTooltip.querySelector('.ex-tooltip-heading').textContent = year + ' · ' + event.t;
    eventTooltip.querySelector('p').textContent = event.s;
    eventTooltip.hidden = false;
    const panel = localRect(svg.parentElement), line = localRect(marker.querySelector('line')), chart = localRect(svg);
    const width = Math.min(Math.max(340, eventTooltip.querySelector('.ex-tooltip-heading').scrollWidth + 32), panel.width - 24);
    eventTooltip.style.width = width + 'px';
    eventTooltip.style.left = Math.max(12, Math.min(panel.width - width - 12, line.left - panel.left + 12)) + 'px';
    eventTooltip.style.top = (chart.top - panel.top + chart.height * .25) + 'px';
  }
  const clearEventHover = () => svg.querySelectorAll('.chart-event.hovered').forEach(marker => marker.classList.remove('hovered'));

  /* ---- Bedienung ---- */
  svg.addEventListener('pointermove', e => {
    clearEventHover();
    if (showValueHover(e)){ svg.classList.add('value-hover'); eventTooltip.hidden = true; return; }
    const marker = e.target.closest('[data-eventyear]');
    if (marker){ marker.classList.add('hovered'); showEventTooltip(marker); }
    else eventTooltip.hidden = true;
  });
  svg.addEventListener('pointerleave', () => { clearEventHover(); clearValueHover(); eventTooltip.hidden = true; });
  svg.addEventListener('focusin', e => showEventTooltip(e.target));
  svg.addEventListener('focusout', () => { eventTooltip.hidden = true; });
  svg.addEventListener('pointerdown', e => {
    if (view === 'balance'){                   // sichtbare Balken haben beim Klick Vorrang
      const local = svgPoint(e);
      const bar = [...svg.querySelectorAll('rect[data-baryear]')].reverse().find(rect => {
        const box = rect.getBBox();
        return local.x >= box.x && local.x <= box.x + box.width && local.y >= box.y && local.y <= box.y + box.height;
      });
      if (bar){ e.preventDefault(); choose(+bar.dataset.baryear); return; }
    }
    const marker = e.target.closest('[data-eventyear]');
    if (marker){ e.preventDefault(); choose(+marker.dataset.eventyear, true); return; }
    const {X} = hoverGeometry;
    choose(api.clamp(Math.round(api.FIRST + (svgPoint(e).x - X(api.FIRST)) / (X(api.LAST) - X(api.FIRST)) * (api.LAST - api.FIRST)), api.FIRST, api.LAST));
  });
  svg.addEventListener('keydown', e => {
    const marker = e.target.closest('[data-eventyear]');
    if (marker && (e.key === 'Enter' || e.key === ' ')){
      e.preventDefault(); e.stopPropagation();
      choose(+marker.dataset.eventyear, true);
    }else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
      e.preventDefault(); e.stopPropagation();
      choose(api.year + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  tabs.forEach((tab, i) => {
    tab.onclick = () => { if (view !== tab.dataset.view) reveal(); view = tab.dataset.view; lastKey = ''; render(api); };
    tab.onkeydown = e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation();
      const target = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      tabs[target].focus();
      tabs[target].click();
    };
  });

  /* ---- Seitenleiste ---- */
  const metric = (label, value, color) => `<div class="ex-metric"><span>${label}</span><strong${color ? ` style="color:${color}"` : ''}>${value}</strong></div>`;
  const total = (label, value, color) => `<div class="ex-total">${label}<strong${color ? ` style="color:${color}"` : ''}>${value}</strong></div>`;

  /* Datenreihen, Überschrift und Jahreswerte der aktuellen Ansicht */
  function describeView(a){
    const {d, year, BASE, cumN, COLORS: c, fmt, sgn} = a;
    if (view === 'balance'){
      if (detail) return {
        heading: 'Vier Größen hinter\nDeutschlands Bevölkerungsbilanz', unit: 'Menschen', rows: a.DATA,
        sets: [['Geburten', c.birth, r => r.wb], ['Sterbefälle', c.death, r => -r.wd], ['Einwanderung', c.in, r => r.zu], ['Auswanderung', c.out, r => -r.fort]],
        metrics: metric('Geburten', fmt(d.wb), c.birth) + metric('Sterbefälle', fmt(d.wd), c.death)
          + metric('Einwanderung', fmt(d.zu), c.in) + metric('Auswanderung', fmt(d.fort), c.out),
      };
      return {
        heading: 'Was hat Deutschlands\nBevölkerungsentwicklung beeinflusst?', unit: 'Menschen', rows: a.DATA,
        sets: [['Geburten − Sterbefälle', c.death, r => r.wb - r.wd], ['Einwanderung − Auswanderung', c.in, r => r.zu - r.fort]],
        metrics: metric('Geburten − Sterbefälle', sgn(d.wb - d.wd), c.death) + metric('Einwanderung −<br>Auswanderung', sgn(d.zu - d.fort), c.in)
          + total('Bilanz der beiden Salden', sgn(d.wb - d.wd + d.zu - d.fort), WHITE),
      };
    }
    const heading = 'Wie hat sich Deutschlands Bevölkerung\nmit und ohne Wanderung entwickelt?';
    if (populationPercent){
      const modelShare = (BASE + cumN[year]) / d.wp * 100;
      return {
        heading, unit: 'Anteil an der tatsächlichen Bevölkerung (%)', rows: a.DATA,
        sets: [['Tatsächliche Bevölkerung', WHITE, () => 100], ['Modell ohne Wanderung', c.death, r => (BASE + cumN[r.y]) / r.wp * 100]],
        metrics: metric('Tatsächlich', percentFmt(100)) + metric('Modell ohne Wanderung', percentFmt(modelShare), c.death)
          + total('Abstand zum Modell', percentFmt(100 - modelShare), c.birth),
      };
    }
    return {
      heading, unit: 'Menschen', rows: a.DATA,
      sets: [['Tatsächliche Bevölkerung', WHITE, r => r.wp], ['Modell ohne Wanderung', c.death, r => BASE + cumN[r.y]]],
      metrics: metric('Tatsächlich', fmt(d.wp)) + metric('Modell ohne Wanderung', fmt(BASE + cumN[year]), c.death)
        + total('Abstand zum Modell', sgn(d.wp - (BASE + cumN[year])), c.birth),
    };
  }

  /* ---- Diagramm zeichnen ---- */
  function axisScale(values){
    let lo = Math.min(...values), hi = Math.max(...values), ticks;
    if (view === 'balance') lo = Math.min(0, lo);
    const pad = (hi - lo) * .12 || 1;
    if (lo !== 0) lo -= pad;
    hi += pad;
    if (view === 'balance' || populationPercent){
      const roughStep = (hi - lo) / 5, power = 10 ** Math.floor(Math.log10(roughStep));
      const step = ([1, 2, 5, 10].find(n => n * power >= roughStep) || 10) * power;
      lo = Math.floor(lo / step) * step;
      hi = Math.ceil(hi / step) * step;
      ticks = Array.from({length: Math.round((hi - lo) / step) + 1}, (_, i) => lo + i * step);
    }else ticks = Array.from({length: 5}, (_, i) => lo + (hi - lo) * i / 4);
    if (view === 'population' && populationPercent){
      hi = 100;
      ticks = ticks.filter(v => v <= 100);
      if (!ticks.includes(100)) ticks.push(100);
    }
    return {lo, hi, ticks};
  }
  const lineDash = index => view === 'population' ? (index === 1 ? '8 5' : '') : ['', '8 5', '2 5', '10 4 2 4'][index];

  function renderLegend(sets){
    const series = view === 'balance' && !detail ? [...sets, overallBalance] : sets;
    $('ex-legend').innerHTML = series.map(([label, color], index) => {
      if (view === 'population' || detail || index === sets.length){
        const dash = index === sets.length ? '' : lineDash(index);
        return `<span class="ex-key-line"><svg aria-hidden="true" viewBox="0 0 24 12"><line x1="0" x2="24" y1="6" y2="6" stroke="${color}" stroke-width="2.5" stroke-dasharray="${dash}"/></svg>${label}</span>`;
      }
      return `<span style="--key:${color}">${label}</span>`;
    }).join('');
    return series;
  }
  function renderSwitch(){
    const labels = view === 'population' ? ['Anzahl', 'Prozent'] : ['Bilanz', 'Einzelwerte'];
    const active = Number(view === 'population' ? populationPercent : detail);
    const box = $('ex-switch');
    box.setAttribute('aria-label', view === 'population' ? 'Darstellung der Bevölkerung' : 'Darstellung der Bilanz');
    box.innerHTML = labels.map((label, i) => `<button aria-pressed="${i === active}" data-option="${i}">${label}</button>`).join('');
    box.querySelectorAll('button').forEach(button => button.onclick = () => {
      if (+button.dataset.option !== active) reveal();
      if (view === 'population') populationPercent = !!+button.dataset.option;
      else detail = !!+button.dataset.option;
      lastKey = '';
      render(api);
    });
  }
  function populationFill(rows, sets, X, Y, bottom, c){
    const [actual, model] = sets;
    const modelEdge = linearPath(rows, model, X, Y);
    const returnEdge = linearPath([...rows].reverse(), model, X, Y).replace(/^M/, 'L');
    const modelYs = rows.map(r => Y(model[2](r)));
    const redTop = Math.min(...modelYs), whiteTop = Math.min(...rows.map(r => Y(actual[2](r)))), whiteBottom = Math.max(...modelYs);
    const gradient = (id, y1, y2, color, stops) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}">`
      + stops.map(([offset, opacity]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`).join('') + '</linearGradient>';
    return '<defs>'
      + gradient('population-red-fill', redTop, bottom, c.death, [[0, .32], [.65, .13], [1, .025]])
      + gradient('population-white-fill', whiteTop, whiteBottom, '#92f2bd', [[0, .18], [.6, .075], [1, .025]])
      + '</defs><g pointer-events="none">'
      + `<path d="${modelEdge} L${X(api.LAST)} ${bottom} L${X(api.FIRST)} ${bottom} Z" fill="url(#population-red-fill)"/>`
      + `<path d="${linearPath(rows, actual, X, Y)} ${returnEdge} Z" fill="url(#population-white-fill)"/></g>`;
  }
  function eventMarkers(markers, plotWidth, top, bottom, year){
    const {FIRST, LAST} = api;
    return markers.map(marker => {
      const selected = year === marker.year && selectedEventYear === year ? 'selected' : '';
      const half = Math.min(9, plotWidth / (LAST - FIRST) * .4), width = Math.min(18, plotWidth / (LAST - FIRST) * .8);
      return `<g class="chart-event ${selected}" data-eventyear="${marker.year}" role="button" tabindex="0" aria-label="Jahr auswählen: ${marker.year} · ${marker.label}">`
        + `<rect x="${marker.x - half}" y="${top - 18}" width="${width}" height="${bottom - top + 18}" fill="transparent"/>`
        + `<text class="event-star" x="${marker.x}" y="${top - 10}" text-anchor="middle">★</text>`
        + `<line x1="${marker.x}" x2="${marker.x}" y1="${top}" y2="${bottom}"/></g>`;
    }).join('');
  }

  function render(a){
    api = a;
    el.classList.toggle('ex-individual', view === 'balance' && detail);
    const {FIRST, LAST, year, d, COLORS: c} = a;
    const mode = view === 'balance' ? (detail ? 'detail' : 'balance') : 'surplus';
    cloud.draw({mode, d, surplus: Math.max(0, d.wp - (a.BASE + a.cumN[year])), colors: c});

    const chartWidth = Math.max(280, Math.round(svg.clientWidth)), chartHeight = Math.max(220, Math.round(svg.clientHeight));
    const grow = revealProgress();
    const key = [chartWidth, chartHeight, view, detail, populationPercent, year, ...Object.values(c), selectedEventYear, twoLineHeading, grow].join('|');
    if (key === lastKey) return;
    lastKey = key;

    tabs.forEach(tab => {
      const selected = tab.dataset.view === view;
      tab.setAttribute('aria-selected', selected);
      tab.tabIndex = selected ? 0 : -1;
    });
    $('ex-year').textContent = year;
    const {heading, unit, rows, sets, metrics} = describeView(a);
    $('ex-heading').textContent = twoLineHeading ? heading : heading.replace('\n', ' ');
    $('ex-metrics').innerHTML = metrics;
    renderSwitch();
    const displayedSeries = renderLegend(sets);
    const {lo, hi, ticks} = axisScale(rows.flatMap(r => displayedSeries.map(s => s[2](r))));

    // Eine SVG-Einheit entspricht einem CSS-Pixel: Schrift bleibt unverzerrt.
    svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
    const {left: leftMargin, right: rightPad, top, bottom: bottomPad, yearInset} = CHART_PAD;
    const right = chartWidth - rightPad, bottom = chartHeight - bottomPad, plotWidth = right - leftMargin;
    const X = y => leftMargin + yearInset + (y - FIRST) / (LAST - FIRST) * (plotWidth - 2 * yearInset);
    const Y = v => bottom - (v - lo) / (hi - lo) * (bottom - top);
    const markers = Object.entries(a.EVENTS).map(([y, event]) => ({year: +y, label: SHORT_NAMES[y] || event.t, x: X(+y)}));
    const formatValue = view === 'population' && populationPercent ? percentFmt : a.fmt;
    hoverGeometry = {rows, sets, X, Y, top, bottom, formatValue};
    clearValueHover();

    // Einfädeln: die Kante läuft etwas über das Diagramm hinaus, damit auch der letzte Balken ganz hochwächst
    const edge = grow * 1.12, barGrow = x => grow >= 1 ? 1 : Math.max(0, Math.min(1, (edge - (x - leftMargin) / plotWidth) / .12));
    let out = `<text x="8" y="15" text-anchor="start" fill="#a4adbd" font-size="${AXIS_FONT}">${unit}</text>`;
    let data = view === 'population' ? populationFill(rows, sets, X, Y, bottom, c) : '';
    for (const v of ticks){
      const y = Y(v);
      const label = view === 'population' && populationPercent ? percentFmt(v) : v === 0 ? '0' : compact(v);
      out += `<path d="M${leftMargin} ${y}H${right}" stroke="#30343b"/><text x="${leftMargin - 11}" y="${y + 4}" text-anchor="end" fill="#a4adbd" font-size="${AXIS_FONT}">${label}</text>`;
    }
    for (let y = FIRST; y <= LAST; y++){
      const major = y === FIRST || y === LAST || y % 5 === 0;
      out += `<line x1="${X(y)}" x2="${X(y)}" y1="${bottom + 3}" y2="${bottom + (major ? 12 : 8)}" stroke="${major ? '#a4adbd' : '#667183'}" stroke-width="${major ? 1.5 : 1}"/>`;
    }
    for (const y of [FIRST, 1995, 2000, 2005, 2010, 2015, 2020, LAST]){
      out += `<text x="${X(y)}" y="${bottom + 42}" text-anchor="middle" fill="#a4adbd" font-size="${AXIS_FONT}">${y}</text>`;
    }
    out += eventMarkers(markers, plotWidth, top, bottom, year);    // liegen hinter den Daten; Balken und Linien haben Vorrang

    if (view === 'balance'){
      out += `<path d="M${leftMargin} ${Y(0)}H${right}" stroke="#7d879b"/>`;
      const slot = plotWidth / (LAST - FIRST + 1), barWidth = slot * .38 / (detail ? sets.length : 1);
      if (detail){
        sets.forEach((series, index) => {
          data += `<path class="ex-individual-line" stroke-dasharray="${lineDash(index)}" d="${linearPath(rows, series, X, Y)}" fill="none" stroke="${series[1]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
          data += `<circle cx="${X(year)}" cy="${Y(series[2](d))}" r="4" fill="${series[1]}" stroke="#121212" stroke-width="2"/>`;
        });
      }else{
        rows.forEach(r => sets.forEach(s => {
          const v = s[2](r) * barGrow(X(r.y)), x = X(r.y) - barWidth / 2;
          data += `<rect class="ex-bar ${r.y === year ? 'bar-selected' : ''}" data-baryear="${r.y}" x="${x}" y="${Math.min(Y(0), Y(v))}" width="${barWidth - 1}" height="${Math.max(1, Math.abs(Y(v) - Y(0)))}" fill="${s[1]}" opacity="${r.y === year ? 1 : .62}"></rect>`;
        }));
        data += `<path class="ex-balance-line" d="${linearPath(rows, overallBalance, X, Y)}" fill="none" stroke="${overallBalance[1]}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>`;
      }
    }else{
      sets.forEach((s, index) => {
        data += `<path stroke-dasharray="${lineDash(index)}" d="${linearPath(rows, s, X, Y)}" fill="none" stroke="${s[1]}" stroke-width="2.5"/>`;
      });
    }
    if (view !== 'balance') sets.forEach(s => data += `<circle cx="${X(year)}" cy="${Y(s[2](d))}" r="5" fill="${s[1]}" stroke="#121212" stroke-width="2"/>`);
    if (grow < 1) data = `<clipPath id="ex-reveal"><rect x="0" y="0" width="${leftMargin + plotWidth * Math.min(1, edge)}" height="${chartHeight}"/></clipPath>`
      + `<g clip-path="url(#ex-reveal)">${data}</g>`;
    if (selectedEventYear !== year) out += `<path d="M${X(year)} ${top}V${bottom}" stroke="${WHITE}" stroke-dasharray="3 5" opacity=".5"/>`;
    out += data;
    out += '<g id="ex-value-marker" pointer-events="none" aria-hidden="true"></g>';
    svg.innerHTML = out;
  }

  function setTwoLineHeading(on){ twoLineHeading = on; lastKey = ''; }
  return {render, reveal, setTwoLineHeading};
})();
