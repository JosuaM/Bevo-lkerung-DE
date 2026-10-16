// Linked age view: absolute death estimates, fixed scale across all years per cause.
let ageCause = 'Kardiovaskuläre Erkrankungen', ageSignature = '';
const agePanel = document.getElementById('agePanel');
function selectAgeCause(name) {
  ageCause = name; ageSignature = ''; drawAgeHeatmap();
}
function drawAgeHeatmap() {
  if (selMode.value !== 'radialbars') return;
  if (!series.some(c => c.name === ageCause)) ageCause = series[0].name;
  const data = AGE_DATA[key], rows = data.causes[ageCause];
  const signature = key + '|' + ageCause;
  if (signature !== ageSignature) {
    ageSignature = signature;
    const maximum = Math.max(0, ...(rows || []).flat().filter(v => v !== null));
    const left = 82, top = 12, cw = 10.5, rh = 36, bottom = top + data.ages.length * rh, width = left + data.years.length * cw + 112;
    const causeColor = series.find(c => c.name === ageCause)?.color || '#a8acd0';
    const opacity = value => maximum ? value / maximum : 0;
    let labels = '', paint = '', hits = '';
    labels += `<text id="ageValueYear" x="${width-4}" y="9" text-anchor="end" style="font-size:12px"></text>`;
    data.ages.forEach((age, a) => {
      const rowY = top + (data.ages.length - 1 - a) * rh;
      labels += `<text x="${left-6}" y="${rowY+rh/2+3}" text-anchor="end">${age.replace(' Jahre','')}</text>`;
      labels += `<text id="ageValue${a}" x="${width-4}" y="${rowY+rh/2+3}" text-anchor="end" style="font-size:13px;font-variant-numeric:tabular-nums"></text>`;
      data.years.forEach((year, y) => {
        const value = rows?.[a]?.[y] ?? null;
        const box = `x="${left+y*cw}" y="${rowY}" width="${cw}" height="${rh}"`;
        if (value !== null) {
          paint += `<rect x="${left+y*cw}" y="${rowY}" width="${cw-1}" height="${rh-1}" fill="${causeColor}" fill-opacity="${opacity(value)}"/>`;
        } else paint += `<rect x="${left+y*cw}" y="${rowY}" width="${cw-1}" height="${rh-1}" fill="#51566e"/>`;
        hits += `<rect class="age-hit" data-age="${a}" data-age-year="${y}" ${box} fill="transparent"><title>${age} · ${year}: ${value === null ? 'Keine Daten' : Math.round(value).toLocaleString('de-DE')+' Todesfälle'}</title></rect>`;
      });
    });
    let svg = `<svg viewBox="0 0 ${width} ${bottom + 70}" role="img" aria-label="Todesfälle nach Altersgruppe und Jahr für ${ageCause}">
      <defs><linearGradient id="ageOpacity"><stop offset="0" stop-color="${causeColor}" stop-opacity="0"/><stop offset="1" stop-color="${causeColor}" stop-opacity="1"/></linearGradient></defs>
      <g pointer-events="none">${paint}${labels}</g>${hits}`;
    data.years.forEach((year, y) => { if (year%10===0 || year===2023) svg += `<text x="${left+(y+.5)*cw}" y="${bottom+20}" text-anchor="middle">${year}</text>`; });
    svg += `<line id="ageYearMarker" y1="8" y2="${bottom+3}" stroke="#fff" stroke-width="1.5" pointer-events="none"/>
      <rect x="${left}" y="${bottom+32}" width="${data.years.length*cw}" height="8" fill="url(#ageOpacity)"/>
      <text x="${left}" y="${bottom+56}">0</text>
      <text x="${left+data.years.length*cw}" y="${bottom+56}" text-anchor="end">${Math.round(maximum).toLocaleString('de-DE')} Todesfälle</text></svg>`;
    agePanel.innerHTML = `<h3 style="margin-left:${left/width*100}%">Altersgruppen im Zeitverlauf</h3><label class="age-pick" style="margin-left:${left/width*100}%;width:${data.years.length*cw/width*100}%">Todesursache <select id="ageCauseSelect"></select></label>${svg}<p class="age-note" style="margin-left:${left/width*100}%;width:${data.years.length*cw/width*100}%">${rows ? 'Todesfälle · beide Geschlechter · 1980–2023' : 'Für diese Unterkategorie fehlen Altersgruppendaten in den vorhandenen CSVs.'}</p><div id="ageTimeline" style="margin-left:${(left-48*data.years.length*cw/542)/width*100}%;width:${data.years.length*cw*600/542/width*100}%"></div>`;
    document.getElementById('ageTimeline').append(controls);
    const picker = document.getElementById('ageCauseSelect');
    series.forEach(c => { const option = document.createElement('option'); option.value = c.name; option.textContent = c.name; picker.append(option); });
    picker.value = ageCause; picker.onchange = () => selectAgeCause(picker.value);
  }
  const marker = document.getElementById('ageYearMarker'), year = years[Math.round(tYear)], y = data.years.indexOf(year);
  marker.style.display = y < 0 ? 'none' : '';
  marker.setAttribute('x1',82+(y+.5)*10.5); marker.setAttribute('x2',82+(y+.5)*10.5);
  const values = data.ages.map((_,a) => rows?.[a]?.[y] ?? null);
  const highest = Math.max(...values.filter(v => v !== null));
  document.getElementById('ageValueYear').textContent = `Todesfälle ${year}`;
  const causeColor = series.find(c => c.name === ageCause)?.color || '#a8acd0';
  values.forEach((value,a) => {
    const label = document.getElementById(`ageValue${a}`);
    label.textContent = value === null ? '–' : Math.round(value).toLocaleString('de-DE');
    const isHighest = value !== null && value === highest;
    label.style.fill = isHighest ? causeColor : '#b9bdd9';
    label.style.fontWeight = isHighest ? '700' : '400';
    label.setAttribute('aria-label', `${data.ages[a]}, ${year}: ${value === null ? 'Keine Daten' : Math.round(value).toLocaleString('de-DE')+' Todesfälle'}${isHighest ? ', höchster Wert der Altersgruppen' : ''}`);
  });
}
agePanel.addEventListener('click', e => {
  const cell = e.target.closest('[data-age]'); if (!cell) return;
  setPlaying(false); tYear = years.indexOf(AGE_DATA[key].years[Number(cell.dataset.ageYear)]); dirty = true;
});

// Match the heatmap heading to the radial heading even when the legend sets row height.
function alignAgeHeading() {
  if (selMode.value !== 'radialbars') return;
  const radial = document.getElementById('radialPanel');
  const wrap = document.querySelector('.wrap');
  if (getComputedStyle(wrap).display !== 'grid') { agePanel.style.marginTop = '12px'; return; }
  const offset = radial.getBoundingClientRect().top - wrap.getBoundingClientRect().top;
  agePanel.style.marginTop = `${Math.max(0, offset)}px`;
}
const ageLayoutObserver = new ResizeObserver(alignAgeHeading);
ageLayoutObserver.observe(document.getElementById('radialPanel'));
ageLayoutObserver.observe(document.querySelector('.wrap'));
window.addEventListener('resize', alignAgeHeading);
