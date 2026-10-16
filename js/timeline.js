/* Wiedergabe, Zeitstrahl am unteren Rand und Ereignistexte der Animationsfolien. */
const playBtn = $('play');
const ICON_PLAY = '<svg viewBox="0 0 20 20"><path d="M4 2 L17 10 L4 18 Z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 20 20"><path d="M4 2h4v16H4zM12 2h4v16h-4z"/></svg>';

function setPaused(value){
  paused = value;
  playBtn.innerHTML = value ? ICON_PLAY : ICON_PAUSE;
  playBtn.setAttribute('aria-label', value ? 'Abspielen' : 'Pause');
}
setPaused(false);
playBtn.onclick = () => {
  if (isDash() && t >= LAST){ t = FIRST; setPaused(false); return; }
  setPaused(!paused);
};

/* ---- Skala ---- */
const track = $('track'), rail = $('rail'), fillEl = $('fill'), headEl = $('head'), headLbl = $('headlbl');
const posPct = year => (year - FIRST) / (LAST - FIRST) * 100;
track.setAttribute('aria-valuemax', LAST);
for (let year = FIRST; year <= LAST; year++){
  const major = year % 5 === 0 || year === FIRST || year === LAST;
  const tick = document.createElement('div');
  tick.className = 'tick' + (major ? ' major' : '');
  tick.style.left = posPct(year) + '%';
  track.appendChild(tick);
  if (major){
    const label = document.createElement('div');
    label.className = 'tlab';
    label.textContent = year;
    label.style.left = posPct(year) + '%';
    track.appendChild(label);
  }
}

/* ---- Ereignisse ---- */
const evEl = $('event');
const marks = {};                         // Ereignismarken am Zeitstrahl, nach Jahr
let evHideAt = 0, evHover = false, evPinned = null, evYear = null;

function hideEvent(){
  evEl.classList.remove('on');
  evHover = false; evPinned = null; evYear = null;
}
function showEvent(year, pin = false){
  const event = EVENTS[year];
  if (!event) return;
  evYear = +year;
  evPinned = pin ? +year : null;
  evHideAt = vt + 3400;
  evEl.innerHTML = '<div class="et"><span class="ey">' + year + '</span>' + event.t + '</div><div class="es">' + event.s + '</div><div class="eline"></div>';
  evEl.classList.add('on');
}
function selectEvent(year){
  t = +year;
  prefill();
  setPaused(true);
  showEvent(year, true);
}
for (const year in EVENTS){
  const mark = document.createElement('button');
  mark.className = 'mk';
  mark.style.left = posPct(+year) + '%';
  mark.setAttribute('aria-label', year + ' · ' + EVENTS[year].t);
  mark.dataset.year = year;
  mark.addEventListener('pointerdown', e => e.stopPropagation());
  mark.addEventListener('click', e => { e.stopPropagation(); selectEvent(year); });
  mark.addEventListener('pointerenter', () => { evHover = true; if (evPinned === null) showEvent(year); });
  mark.addEventListener('pointerleave', () => { evHover = false; evHideAt = vt + 1200; });
  track.appendChild(mark);
  marks[year] = mark;
}
evEl.addEventListener('pointerenter', () => { evHover = true; });
evEl.addEventListener('pointerleave', () => { evHover = false; evHideAt = vt + 1200; });

/* ---- Jahr per Zeitstrahl wählen ---- */
let dragging = false, timelinePointer = null;
function seek(e){
  const box = rail.getBoundingClientRect();
  t = Math.round(FIRST + clamp((e.clientX - box.left) / box.width, 0, 1) * (LAST - FIRST));
  prefill();
  setPaused(true);
}
function stopDragging(){ dragging = false; timelinePointer = null; }
track.addEventListener('pointerdown', e => {
  if (evPinned !== null){ evPinned = null; evHideAt = vt + 1200; }
  dragging = true;
  timelinePointer = e.pointerId;
  track.setPointerCapture(e.pointerId);
  seek(e);
});
track.addEventListener('pointermove', e => { if (dragging) seek(e); });
track.addEventListener('pointerup', stopDragging);
track.addEventListener('pointercancel', stopDragging);
track.addEventListener('lostpointercapture', stopDragging);

/* ---- Anzeige pro Bild aktualisieren ---- */
let lastYear = 0;
const eventTextTop = () => ((CY + R_MAX * Math.sqrt(83.6e6 / REF_POP)) * SC + 24) + 'px';   // fest, unabhängig vom wachsenden Kreis
function updateTimeline(){
  // Variante 2: Der Zeitstrahl erreicht 2025 erst zusammen mit dem Endstand (siehe animation.js)
  const headYear = approach && t >= LAST - 1 ? lerp(LAST - 1, LAST, (t - (LAST - 1)) / (END - (LAST - 1))) : Math.min(t, LAST);
  const position = posPct(headYear) + '%';
  headEl.style.left = position;
  fillEl.style.width = position;
  const year = clamp(Math.floor(t), FIRST, LAST);
  if (year !== lastYear){
    if (scene === 3 && EVENTS[year] && !paused && evPinned === null) showEvent(year);
    headLbl.textContent = year;
    track.setAttribute('aria-valuenow', year);
    lastYear = year;
  }
  if (evEl.classList.contains('on') && !evHover && evPinned === null && vt > evHideAt) hideEvent();
  if (scene === 3){
    for (const y in marks){
      marks[y].classList.toggle('seen', +y <= year);
      marks[y].classList.toggle('highlight', evEl.classList.contains('on') && +y === evYear);
    }
    evEl.style.top = eventTextTop();
  }
}
