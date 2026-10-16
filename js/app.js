/* Hauptschleife, Folienwechsel, E-Menü, Tastatur und Start. */

/* ---- Dashboard (dashboards/explorer.js) ---- */
const dashboardApi = {
  DATA, FIRST, LAST, BASE, cumN, EVENTS, COLORS, fmt, sgn, clamp,
  year: FIRST, d: byYear[FIRST],
  selectYear(year){ t = clamp(year, FIRST, LAST); setPaused(true); },
};
function drawDash(){
  dashboardApi.year = clamp(Math.floor(t), FIRST, LAST);
  dashboardApi.d = byYear[dashboardApi.year];
  window.populationExplorer.render(dashboardApi);
}
function draw(){
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
  if (isDash()) drawDash();
  else if (isAnim()){
    ctx.setTransform(DPR * SC, 0, 0, DPR * SC, 0, 0);
    drawAnim(state(t));
  }
}

/* ---- Hauptschleife ---- */
let lastFrame = performance.now();
function frame(now){
  try{ frameBody(now); }catch(error){ console.error(error); }
  requestAnimationFrame(frame);
}
function frameBody(now){
  if (cv.width === 0 || Math.abs(cv.clientWidth * Math.min(devicePixelRatio || 1, 2) - cv.width) > 1) resize();
  const dt = Math.min(.25, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!paused) vt += dt * 1000;
  runTimers();
  layout();
  if (isAnim()) advanceAnimation(dt);
  else if (isDash() && !paused && !dragging){      // Leertaste im Dashboard: alle Jahre nacheinander
    t += dt / .45;
    if (t >= LAST){ t = LAST; setPaused(true); }
  }
  updateTimeline();
  draw();
  drawBridge();
  if (scene === 4) drawFinalClouds();
}

/* ---- Folien ---- */
const NAVIGATION_STATE_KEY = 'bev-navigation';
function persistSlideState(){
  try{ sessionStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify({scene, t, paused, finDone: scene === 4 && finDone, resultVisited})); }catch{}
}
addEventListener('pagehide', persistSlideState);
addEventListener('beforeunload', persistSlideState);

let dashboardTransition = false, dashboardTransitionId = 0;
function enterDashboard(){                         // Ergebnis → Dashboard über einen schwarzen Vorhang
  if (dashboardTransition) return;
  dashboardTransition = true;
  const id = ++dashboardTransitionId;
  setPaused(true);
  const curtain = $('dashboardFade');
  curtain.classList.add('active');
  setTimeout(() => {
    if (id !== dashboardTransitionId) return;
    if (scene !== 4){ curtain.classList.remove('active'); dashboardTransition = false; return; }
    // Vorherige Folie hinter dem Vorhang sofort entfernen
    const transition = fin.style.transition;
    fin.style.transition = 'none';
    goScene(5, {throughBlack: true});
    void fin.offsetWidth;
    fin.style.transition = transition;
    setTimeout(() => {
      if (id !== dashboardTransitionId) return;
      curtain.classList.remove('active');
      setTimeout(() => { dashboardTransition = false; }, 650);
    }, 180);
  }, 700);
}

let panelOpen = false;
function goScene(n, opt = {}){
  if (n === 5 && scene === 4 && !opt.throughBlack){ enterDashboard(); return; }
  if (!opt.throughBlack){
    dashboardTransitionId++;
    dashboardTransition = false;
    $('dashboardFade').classList.remove('active');
  }
  if (bridgeHeadingAnimation){ bridgeHeadingAnimation.cancel(); bridgeHeadingAnimation = null; }
  const previous = scene;
  if (timelinePointer !== null && track.hasPointerCapture(timelinePointer)) track.releasePointerCapture(timelinePointer);
  stopDragging();
  waitingForArrival = false;
  lastYear = 0;
  panelOpen = false;
  $('panel').classList.remove('open');
  if (n === 3 && previous === 2 && !bridgeDone) finishBridge();
  cancelSeq();
  finId++;
  drainingParticles = false;
  if (n !== 3){                                    // Einblendung von Animation 2 zurücksetzen
    const controls = document.querySelector('.controls');
    [cv, controls].forEach(el => { el.style.transition = ''; el.style.opacity = ''; });
  }
  scene = n;
  document.body.dataset.scene = String(n);
  document.body.classList.toggle('exploring', n === 5);
  track.classList.toggle('ev', n === 3);
  if (n !== 3) hideEvent();
  setPaused(false);
  if (n !== 4) fin.classList.remove('on');
  switch (n){
    case 0: sceneIntro(!!opt.instant); break;
    case 1: sceneAnim1(previous === 0); break;
    case 2: showBridge(!!opt.instant); break;
    case 3: sceneAnim2(previous === 2); break;
    case 4: {
      qs.className = 'bridge docked2';
      const showEndState = !!opt.instant || (previous === 5 && resultVisited);
      resultVisited = true;
      showFinal(showEndState);
      break;
    }
    case 5:
      qs.className = '';
      phase = 2;
      t = LAST;
      prefill();
      setPaused(true);
      break;
  }
  updateMenus();
  persistSlideState();
}
function next(){
  if (scene === 0){ if (!introTyped) introFull(); else goScene(1); }
  else if (scene === 1) goScene(2);
  else if (scene === 2){ if (!bridgeDone) finishBridge(); }
  else if (scene === 3) goScene(4);
  else if (scene === 4){ if (!finDone) finishFinal(); else goScene(5); }
}
const prevScene = () => { if (scene > 0) goScene(scene - 1); };
qs.addEventListener('click', () => { if (scene !== 2) next(); });
bnext.addEventListener('click', e => { e.stopPropagation(); goScene(3); });
$('fNext').onclick = () => goScene(5);

/* ---- Navigation oben ---- */
const stepper = $('stepper');
SCENES.forEach((name, i) => {
  const button = document.createElement('button');
  button.innerHTML = '<span>' + name + '</span>';
  button.onclick = () => goScene(i);
  stepper.appendChild(button);
});

/* ---- E-Menü ---- */
const panel = $('panel'), scenesEl = $('scenes');

const speedRange = $('speedrng');
speedRange.value = timelineSpeed;
function updateTimelineSpeed(){
  timelineSpeed = +speedRange.value;
  $('speedlbl').textContent = timelineSpeed.toLocaleString('de-DE', {minimumFractionDigits: 1}) + ' × Standardtempo';
}
speedRange.addEventListener('input', () => { updateTimelineSpeed(); saveSettings(); });
updateTimelineSpeed();

const dotRange = $('dotrng');
const dotFromSlider = v => parseFloat((1000 * Math.pow(1000, v / 100)).toPrecision(2));
function updateDot(){
  DOT = dotFromSlider(+dotRange.value);
  $('dotlbl').textContent = '1 Punkt = ' + fmt(DOT) + ' Personen';
  if (isAnim()) prefill();
}
dotRange.value = 100 * Math.log(DOT / 1000) / Math.log(1000);
dotRange.addEventListener('input', () => { updateDot(); saveSettings(); });
updateDot();

const sizeMin = $('szmin'), sizeMax = $('szmax');
sizeMin.value = SZMIN;
sizeMax.value = SZMAX;
function updateSizes(e){
  SZMIN = +sizeMin.value;
  SZMAX = +sizeMax.value;
  if (SZMAX < SZMIN){
    if (e && e.target === sizeMin) SZMAX = sizeMax.value = SZMIN;
    else SZMIN = sizeMin.value = SZMAX;
  }
  $('szminlbl').textContent = 'kleinster Punkt: ' + SZMIN.toFixed(1).replace('.', ',') + ' px Radius';
  $('szmaxlbl').textContent = 'größter Punkt: ' + SZMAX.toFixed(1).replace('.', ',') + ' px Radius';
}
[sizeMin, sizeMax].forEach(input => input.addEventListener('input', e => { updateSizes(e); saveSettings(); }));
updateSizes();

for (const key in COLORS){
  const input = $('c-' + key);
  input.value = COLORS[key];
  input.addEventListener('input', () => {
    COLORS[key] = input.value;
    applyColorVars();
    if (fin.classList.contains('on')) renderFinal();
    saveSettings();
  });
}
const bgInput = $('c-bg');
function applyBackground(){
  const color = BGS[scene], n = parseInt(color.slice(1), 16), rgb = (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255);
  const root = document.documentElement.style;
  root.setProperty('--bg', color);
  root.setProperty('--bg90', 'rgba(' + rgb + ',.9)');
  root.setProperty('--bg80', 'rgba(' + rgb + ',.8)');
  bgInput.value = color;
}
bgInput.addEventListener('input', () => { BGS[scene] = bgInput.value; applyBackground(); saveSettings(); });

const soundSelect = $('soundSel');
for (const key in SOUNDS) soundSelect.add(new Option(SOUNDS[key].label, key));
soundSelect.value = soundName;
soundSelect.addEventListener('change', () => { soundName = soundSelect.value; playSound(); saveSettings(); soundSelect.blur(); });

$('restartScene').onclick = () => { togglePanel(); goScene(scene); };
$('resetset').onclick = () => location.reload();
$('savefile').onclick = () => { saveState.revision++; connectSettingsFile(true); };
$('copyset').onclick = () => {
  const text = JSON.stringify(currentSettings());
  const button = $('copyset');
  const copied = () => { button.textContent = 'Kopiert ✓'; setTimeout(() => button.textContent = 'Einstellungen kopieren', 1800); };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(copied, () => prompt('Einstellungen kopieren:', text));
  else prompt('Einstellungen kopieren:', text);
};

SCENES.forEach((name, i) => {
  const button = document.createElement('button');
  button.textContent = (i + 1) + ' · ' + name;
  button.onclick = () => { if (panelOpen) togglePanel(); goScene(i); };
  scenesEl.appendChild(button);
});
function updateMenus(){
  applyBackground();
  stepper.classList.toggle('persistent', scene >= 4);
  [...stepper.children].forEach((button, i) => {
    button.classList.toggle('current', i === scene);
    if (i === scene) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  [...scenesEl.children].forEach((button, i) => button.classList.toggle('on', i === scene));
  $('soundSec').hidden = scene !== 2;
}
function togglePanel(){
  panelOpen = !panelOpen;
  panel.classList.toggle('open', panelOpen);
  setPaused(panelOpen);
  updateMenus();
}

/* ---- Variantenvergleich (temporär) ---- */
const variantSelect = $('variantSel');
variantSelect.value = String(animVariant);
variantSelect.onchange = e => {
  animVariant = +e.target.value;
  try{ localStorage.setItem('bev-anim-variant', String(animVariant)); }catch{}
  e.target.blur();
};

/* ---- Tastatur ---- */
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('select, button, input, [role=tab]')) return;
  const key = e.code;
  if (key === 'KeyE'){ e.preventDefault(); togglePanel(); }
  else if (key === 'KeyD'){ e.preventDefault(); next(); }
  else if (key === 'KeyA'){ e.preventDefault(); prevScene(); }
  else if (key === 'Space'){
    e.preventDefault();
    if (isDash() && t >= LAST){ t = FIRST; setPaused(false); }
    else setPaused(!paused);
  }else if ((key === 'ArrowRight' || key === 'ArrowLeft') && (isAnim() || isDash())){
    e.preventDefault();
    t = clamp(Math.floor(t) + (key === 'ArrowRight' ? 1 : -1), FIRST, LAST);
    prefill();
    setPaused(true);
  }
});
document.addEventListener('click', e => { const button = e.target.closest && e.target.closest('button'); if (button) button.blur(); });

/* ---- Start: Folie aus ?slide=, ?year= oder dem Stand vor dem Neuladen ---- */
document.title = 'Bevölkerung Deutschlands ' + FIRST + '–' + LAST;
const params = new URLSearchParams(location.search);
let restored = null;
if (performance.getEntriesByType('navigation')[0]?.type === 'reload'){
  try{ restored = JSON.parse(sessionStorage.getItem(NAVIGATION_STATE_KEY) || 'null'); }catch{}
}
const startScene = restored?.scene ?? Number(params.get('slide') || 0);
if (restored?.resultVisited) resultVisited = true;
goScene(Number.isInteger(startScene) && startScene >= 0 && startScene < SCENES.length ? startScene : 0,
  {instant: startScene === 4 && restored?.finDone === true});
const startYear = restored?.t ?? Number(params.get('year'));
if (isAnim() && Number.isFinite(startYear) && startYear > FIRST && startYear <= END){
  t = startYear;
  prefill();
  if (restored?.paused) setPaused(true);
}
requestAnimationFrame(frame);
