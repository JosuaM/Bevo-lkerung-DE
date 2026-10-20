/* Die sechs Folien: Frage, Animation 1, Differenz, Animation 2, Ergebnis (Dashboard: dashboards/explorer.js). */
const Q2 = 'Wie hätte sich Deutschlands Bevölkerung\nohne Ein- und Auswanderung verändert?';
const BQ = 'Was hat Deutschlands\nBevölkerungsentwicklung beeinflusst?';
const KEYS1 = ['Bevölkerung', 'ohne Ein- und Auswanderung'];
const KEYS2 = ['Bevölkerungsentwicklung'];
const qs = $('qs'), qtext = $('qtext'), btext = $('btext'), bnext = $('bnext'), br = $('br'), fin = $('fin');
let introTyped = false, introRun = 0, bridgeDone = false, finDone = false, resultVisited = false;

/* ---- Text: Zeile für Zeile einblenden, Kernwörter hervorheben ---- */
function typeInto(el, str, done){
  el.replaceChildren();
  str.split('\n').forEach((line, i) => {
    const span = document.createElement('span');
    span.className = 'reveal-line';
    span.textContent = line;
    span.style.animationDuration = '1.9s';
    span.style.animationDelay = (i * .7) + 's';
    el.appendChild(span);
  });
  later(3800, () => { if (done) done(); });
}
function highlight(el, str, keys, instant){        // alles grau, nur die Kernwörter bleiben weiß
  let html = '', i = 0;
  while (i < str.length){
    const key = keys.find(k => str.startsWith(k, i));
    if (key){
      html += '<span class="w">' + key + '</span>';
      i += key.length;
    }else{
      let j = i;
      while (j < str.length && !keys.some(k => str.startsWith(k, j))) j++;
      html += '<span class="g">' + str.slice(i, j) + '</span>';
      i = j;
    }
  }
  el.innerHTML = html;
  if (instant) el.classList.add('hl');
  else requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('hl')));
}

/* ---- Folie 0: Frage ---- */
function sceneIntro(instant){
  qtext.classList.remove('hl');
  introTyped = false;
  qs.className = 'on';
  qtext.innerHTML = '';
  qtext.style.transition = 'none';
  qtext.style.opacity = 0;
  const fontReady = Promise.race([document.fonts.load('300 40px "IBM Plex Sans"'), new Promise(resolve => setTimeout(resolve, 1200))]);
  const run = ++introRun;
  fontReady.then(() => {                           // erst mit geladener Schrift einblenden, damit nichts springt
    if (run !== introRun || scene !== 0) return;
    void qtext.offsetWidth;
    qtext.style.transition = '';
    qtext.style.opacity = 1;
    if (instant){ introFull(); return; }
    later(250, () => typeInto(qtext, Q2, () => { introTyped = true; later(500, () => goScene(1)); }));
  });
}
function introFull(){
  cancelSeq();
  introTyped = true;
  qtext.classList.remove('hl');
  qtext.textContent = Q2;
}

/* ---- Folie 1: Animation ohne Wanderung ---- */
function sceneAnim1(fromIntro){
  startHold = 0;
  setPhase(0);
  beginEntrance();
  startHold = entranceAt + 850;
  const controls = document.querySelector('.controls');
  controls.style.transition = 'none';
  controls.style.opacity = 0;
  later(850, () => { controls.style.transition = 'opacity .65s ease'; controls.style.opacity = 1; });
  qs.className = 'docked';
  if (fromIntro){
    later(1100, () => highlight(qtext, Q2, KEYS1));  // Fokus erst, wenn der Text oben steht
  }else{
    qtext.style.opacity = 1;
    highlight(qtext, Q2, KEYS1, true);
  }
}

/* ---- Folie 2: Geburtendefizit pro Jahr ---- */
const bc = $('bc'), bctx = bc.getContext('2d');
let bridgeT0 = 0, bridgeFull = false, bridgeBars = 0;
let bcClear = true, bcLeave = 0;                   // Balkenfläche nach dem Verlassen erst ausblenden, dann löschen

const bridgeLines = () => [...document.querySelectorAll('#bl .l1,#bl .l2')];
function finishBridge(){
  cancelSeq();
  bridgeLines().forEach(el => el.classList.add('in'));
  $('bdef').textContent = sgn(cumN[LAST]);
  btext.classList.remove('hl');
  btext.textContent = BQ;
  bnext.classList.add('on');
  bridgeDone = bridgeFull = true;
}
function showBridge(instant){
  bridgeT0 = vt; bridgeFull = false; bridgeBars = 0;
  const lines = bridgeLines();
  lines.forEach(el => el.classList.remove('in'));
  $('bdef').textContent = '0';
  btext.innerHTML = '';
  btext.classList.remove('hl');
  btext.removeAttribute('style');
  br.removeAttribute('style');
  bnext.classList.remove('on');
  bnext.style.transitionDuration = '';
  bridgeDone = false;
  qs.className = 'on bridge';
  if (instant){ finishBridge(); return; }
  later(500, () => {
    lines.forEach(el => el.classList.add('in'));
    later(4800, () => {                              // der Zähler oben läuft in drawBridge mit den Balken
      typeInto(btext, BQ);
      later(1700, () => { bnext.classList.add('on'); bridgeDone = true; });
    });
  });
}
function niceStep(raw){
  const power = Math.pow(10, Math.floor(Math.log10(raw))), mantissa = raw / power;
  return (mantissa <= 1 ? 1 : mantissa <= 2 ? 2 : mantissa <= 5 ? 5 : 10) * power;
}
let lastHovered = -1;
function drawBridge(){
  if (scene !== 2){
    lastHovered = -1;
    if (!bcClear){
      if (!bcLeave) bcLeave = performance.now();
      if (performance.now() - bcLeave > 700){
        bctx.setTransform(1, 0, 0, 1, 0, 0);
        bctx.clearRect(0, 0, bc.width, bc.height);
        bcClear = true;
        bcLeave = 0;
      }
    }
    return;
  }
  bcClear = false;
  bcLeave = 0;
  const w = bc.clientWidth, h = bc.clientHeight;
  if (!w || !h) return;
  if (bc.width !== Math.round(w * DPR) || bc.height !== Math.round(h * DPR)){
    bc.width = Math.round(w * DPR);
    bc.height = Math.round(h * DPR);
  }
  const c = bctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.clearRect(0, 0, w, h);
  const elapsed = bridgeFull ? 1e9 : vt - bridgeT0;
  const axisAlpha = clamp((elapsed - 200) / 600, 0, 1);                // erst die Zeitlinie ...
  if (axisAlpha <= 0) return;
  const n = LAST - FIRST + 1;
  const progress = clamp((elapsed - 700) / 2800, 0, 1) * n;             // ... dann die Balken nach und nach
  const x0 = 130 * UI, x1 = w - 60 * UI, top = h * .74, bottom = h - 62 * UI;
  const bars = Math.min(n, Math.ceil(progress));
  if (bridgeFull || paused) bridgeBars = bars;
  else if (bars > bridgeBars){ bridgeBars = bars; playSound(); }

  let lo = 0, hi = 0;
  DATA.forEach(d => { const v = d.wb - d.wd; lo = Math.min(lo, v); hi = Math.max(hi, v); });
  hi = Math.max(hi, -lo * .12);
  const zero = top + hi / (hi - lo) * (bottom - top), yOf = v => zero - v / (hi - lo) * (bottom - top);
  const slot = (x1 - x0) / n, barWidth = slot * .56;
  let hovered = -1;
  if (mouse.x >= x0 && mouse.x < x1 && mouse.y > top - 26 && mouse.y < bottom + 36){
    const i = Math.floor((mouse.x - x0) / slot);
    if (i >= 0 && i < n && progress > i + .4) hovered = i;
  }
  if (hovered !== lastHovered){ lastHovered = hovered; if (hovered >= 0) playSound(); }

  const titleY = top - FS.l * .95;
  c.globalAlpha = axisAlpha;
  c.textBaseline = 'middle';
  c.font = `300 ${FS.l}px ${FONT}`;
  c.fillStyle = '#fff';
  c.textAlign = 'left';
  c.fillText('Geburtendefizit pro Jahr', x0, titleY);
  // Y-Achse mit Skala
  const step = niceStep((hi - lo) / 4);
  c.font = `400 ${FS.s * .8}px ${FONT}`;
  c.textAlign = 'right';
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1; v += step){
    const y = yOf(v);
    c.fillStyle = '#262c38';
    c.fillRect(x0, y - .5, x1 - x0, 1);
    c.fillStyle = '#7d879b';
    c.fillText(Math.abs(v) < 1 ? '0' : sgn(v).replace('+', ''), x0 - 12, y);
  }
  c.fillStyle = '#4a5366';
  c.fillRect(x0 - 1, top, 2, bottom - top);
  // Jahresmarken
  c.textAlign = 'center';
  c.fillStyle = '#7d879b';
  for (let year = FIRST; year <= LAST; year++){
    if (year % 5 !== 0 && year !== FIRST && year !== LAST) continue;
    const x = x0 + (year - FIRST + .5) * slot;
    c.fillRect(x - 1, bottom + 6, 2, 6);
    c.fillText(String(year), x, bottom + 26);
  }
  // Balken; das Geburtendefizit oben links zählt mit ihnen hoch (0 am Anfang, Endwert wenn der letzte Balken steht)
  c.globalAlpha = 1;
  let running = 0;
  DATA.forEach((d, i) => {
    const grow = ease(clamp(progress - i, 0, 1));
    if (grow <= 0) return;
    const v = d.wb - d.wd, x = x0 + (i + .5) * slot, y = yOf(v * grow);
    running += v * grow;
    c.globalAlpha = hovered >= 0 && i !== hovered ? .4 : 1;
    c.fillStyle = v < 0 ? COLORS.death : COLORS.birth;
    c.fillRect(x - barWidth / 2, Math.min(zero, y), barWidth, Math.max(Math.abs(y - zero), 1));
  });
  const deficit = Math.round(running) === 0 ? '0' : sgn(running);
  if ($('bdef').textContent !== deficit) $('bdef').textContent = deficit;
  c.fillStyle = '#fff';
  c.globalAlpha = axisAlpha;
  c.fillRect(x0, zero - 1, (x1 - x0) * axisAlpha, 2);
  c.globalAlpha = 1;
  if (hovered >= 0){                                                    // Wert des Jahres
    const d = DATA[hovered], v = d.wb - d.wd;
    c.textAlign = 'right';
    c.font = `300 ${FS.l}px ${FONT}`;
    c.fillStyle = v < 0 ? COLORS.death : COLORS.birth;
    c.fillText(sgn(v), x1, titleY);
    const valueWidth = c.measureText(sgn(v)).width;
    c.font = `400 ${FS.m}px ${FONT}`;
    c.fillStyle = '#a4adbd';
    c.fillText(String(d.y), x1 - valueWidth - 18, titleY);
    c.font = `400 ${FS.s * .9}px ${FONT}`;
    c.fillStyle = '#7d879b';
    c.fillText(fmt(d.wb) + ' Geborene − ' + fmt(d.wd) + ' Gestorbene', x1, titleY + FS.l * .78);
  }
}

/* ---- Folie 3: Animation mit Wanderung ---- */
let bridgeHeadingAnimation = null;
function sceneAnim2(glide){
  startHold = 0;
  ypsCur = narrativeSpeed();
  setPhase(1);
  beginEntrance();
  const controls = document.querySelector('.controls'), fading = [cv, controls];
  fading.forEach(el => { el.style.transition = 'none'; el.style.opacity = glide ? 0 : ''; });
  if (!glide){ startHold = entranceAt + 850; dockQuestion(null); return; }
  // Nach der Differenzfolie: erst blendet „Weiter“ aus, dann gleitet die Frage nach oben, danach blenden Kreis, Zahlen und
  // Zeitleiste weich ein. Die Animation startet erst, wenn sie sichtbar wird.
  startHold = vt + 250 + 800;
  entranceAt = startHold;
  startHold += 850;
  bnext.style.transitionDuration = '.25s';
  bnext.classList.remove('on');
  later(250, () => {
    dockQuestion(btext.getBoundingClientRect());
    later(800, () => {
      // Der Canvas blendet Kategorien und Zahlen selbst vor dem restlichen Inhalt ein.
      cv.style.transition = 'none'; cv.style.opacity = 1;
      later(850, () => { controls.style.transition = 'opacity .65s ease'; controls.style.opacity = 1; });
    });
  });
}
function dockQuestion(previousBox){
  // Jede Textzeile einzeln vermessen: Beim Zentrieren legt die kürzere Zeile
  // einen anderen Weg zurück. Ein Transform auf dem ganzen Block lässt sie springen.
  let lines = [], previousLines = [];
  if (previousBox){
    btext.replaceChildren(...BQ.split('\n').map(line => {
      const row = document.createElement('span');
      row.style.display = 'block';
      const content = document.createElement('span');
      content.style.cssText = 'display:inline-block;transform-origin:0 0';
      content.textContent = line;
      row.appendChild(content);
      lines.push(content);
      return row;
    }));
    previousLines = lines.map(line => line.getBoundingClientRect());
  }
  br.removeAttribute('style');
  btext.style.cssText = 'font-size:var(--fs-m);transform-origin:0 0';
  btext.classList.remove('hl');
  if (!previousBox) btext.textContent = BQ;
  qs.className = 'bridge docked2';
  if (!previousBox){ highlight(btext, BQ, KEYS2, true); return; }
  const animations = lines.map((line, index) => {
    const from = previousLines[index], to = line.getBoundingClientRect();
    return line.animate([
      {transform: `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / Math.max(to.width, 1)})`},
      {transform: 'translate(0,0) scale(1)'},
    ], {duration: 800, easing: 'cubic-bezier(.65,0,.25,1)'});
  });
  bridgeHeadingAnimation = {cancel(){ animations.forEach(animation => animation.cancel()); }};
  later(850, () => highlight(btext, BQ, KEYS2));
}

/* ---- Folie 4: Ergebnis ---- */
/* Punktwolken: gleiche repräsentative Personenzahl pro Punkt auf beiden Seiten. */
function cloudRandom(i, salt = 0){
  let seed = Math.imul((i + 1) ^ Math.imul(salt + 1, 374761393), 668265263);
  seed = Math.imul(seed ^ (seed >>> 13), 1274126177);
  return ((seed ^ (seed >>> 16)) >>> 0) / 4294967296;
}
function cloudPoint(i, radius, clock = vt / 1000){
  const angle = cloudRandom(i, 1) * Math.PI * 2;
  const r = radius * Math.sqrt(cloudRandom(i, 2));
  const contour = 1 + .12 * Math.sin(angle * 3 + clock * .22) + .07 * Math.cos(angle * 5 - clock * .17);
  return {
    x: Math.cos(angle) * r * contour * 1.06 + Math.sin(clock * (.32 + cloudRandom(i, 3) * .35) + i) * radius * .095,
    y: Math.sin(angle) * r * contour * .83 + Math.cos(clock * (.28 + cloudRandom(i, 4) * .3) + i * 2) * radius * .085,
  };
}
function cloudDot(c, x, y, i, color, alpha = 1){
  const size = 1.1 + Math.pow(cloudRandom(i, 5), 2.1) * 5.6;
  finalParticleSnapshot.push({x, y, i, size, color, alpha: alpha * (.4 + cloudRandom(i, 6) * .55)});
  c.globalAlpha = alpha * (.4 + cloudRandom(i, 6) * .55);
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, size, 0, Math.PI * 2);
  c.fill();
}
function cloudReveal(value, index, count){
  const linearTime = value < .5 ? Math.sqrt(value / 2) : 1 - Math.sqrt((1 - value) / 2);
  const local = clamp((linearTime - .62 * index / count) / .38, 0, 1);
  return local * local * (3 - 2 * local);
}
function cloudArrival(i, point, growth, radius){
  const spread = .9 + .1 * growth;
  const wander = Math.sin(growth * Math.PI) * radius * .055;
  const phase = cloudRandom(i, 41) * Math.PI * 2;
  return {
    x: point.x * spread + Math.sin(phase + growth * 4) * wander,
    y: point.y * spread + Math.cos(phase + growth * 3) * wander,
  };
}
const finalCanvas = $('finalParticles'), finalCtx = finalCanvas.getContext('2d');
const F = {a: 0, b: 0, m: 0};                      // Fortschritt: a Defizit, b Wanderungssaldo, m Zusammenführung
const finalParticleSnapshot = [];
function finValues(){
  const def = cumN[LAST], net = cumZ[LAST] - cumF[LAST];
  return {def, net, rest: net + def};
}
function drawFinalClouds(){
  finalParticleSnapshot.length = 0;
  const c = finalCtx, w = innerWidth, h = innerHeight;
  if (finalCanvas.width !== Math.round(w * DPR) || finalCanvas.height !== Math.round(h * DPR)){
    finalCanvas.width = Math.round(w * DPR);
    finalCanvas.height = Math.round(h * DPR);
  }
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.clearRect(0, 0, w, h);
  const {def, net} = finValues(), blueCount = 1000, redCount = Math.round(Math.abs(def) / net * blueCount);
  const cy = h * .54, radius = Math.max(36, Math.min(w * .21, cy - Math.max(h * .1, 76) - 115, h * .26));
  const redRadius = radius * Math.sqrt(Math.abs(def) / net);
  // Die Wolkenzentren bleiben stehen; nur die einzelnen Punkte ziehen zur Mitte.
  const left = w * .25, right = w * .75;
  const survivorRadius = radius * Math.sqrt((blueCount - redCount) / blueCount);
  const meetOf = i => ease(clamp((F.m - .08 - cloudRandom(i, 21) * .22) / .62, 0, 1));
  for (let i = 0; i < blueCount; i++){
    const p = cloudPoint(i + 9001, radius);
    const growth = cloudReveal(F.b, i, blueCount);      // neue Punkte erscheinen über den gesamten Zählvorgang verteilt
    if (growth <= 0) continue;
    const arrival = cloudArrival(i + 9001, p, growth, radius);
    let x = right + arrival.x, y = cy + arrival.y, alpha = growth;
    if (i < redCount){
      const pair = cloudPoint(i + 18001, Math.min(radius, redRadius) * .9);
      const meet = meetOf(i);
      const swirl = Math.sin(meet * Math.PI) * (cloudRandom(i, 22) - .5) * radius * .4;
      x = lerp(x, w * .5 + pair.x, meet);
      y = lerp(y, cy + pair.y, meet) + swirl;
      alpha *= 1 - ease(clamp((meet - .65) / .35, 0, 1));
    }else{
      const end = cloudPoint(i + 9001, survivorRadius);
      const drift = ease(clamp((F.m - .08 - cloudRandom(i, 23) * .15) / .75, 0, 1));
      x = lerp(x, w * .5 + end.x, drift);
      y = lerp(y, cy + end.y, drift);
    }
    if (alpha > .005) cloudDot(c, x, y, i, COLORS.in, alpha);
  }
  for (let i = 0; i < redCount; i++){
    const p = cloudPoint(i, redRadius), pair = cloudPoint(i + 18001, Math.min(radius, redRadius) * .9);
    const growth = cloudReveal(F.a, i, redCount);
    const meet = meetOf(i);
    const alpha = growth * (1 - ease(clamp((meet - .65) / .35, 0, 1)));
    if (alpha <= .005) continue;
    const swirl = -Math.sin(meet * Math.PI) * (cloudRandom(i, 22) - .5) * radius * .4;
    const arrival = cloudArrival(i, p, growth, redRadius);
    cloudDot(c, lerp(left + arrival.x, w * .5 + pair.x, meet), lerp(cy + arrival.y, cy + pair.y, meet) + swirl, i, COLORS.death, alpha);
  }
  c.globalAlpha = 1;
}

const fsL = $('fsL'), fsR = $('fsR'), fvL = $('fvL'), fvR = $('fvR'), flR = $('flR'), fcap = $('fcap'), fbtn = $('fbtn');
const finalBalance = $('finalBalance');
const sgn0 = n => Math.round(n) === 0 ? '0' : sgn(n);
let finId = 0;                                     // macht laufende Ergebnis-Abläufe ungültig, sobald die Folie wechselt
let finTicks = 0;                                  // Zählschritte, für die schon ein Tick erklungen ist

/* Beim Hoch- und Runterzählen derselbe Tick wie bei den Balken der Differenz-Folie: je Zähler 35 Schritte (ein Schritt pro Jahr). */
function finalTick(){
  const n = LAST - FIRST + 1, merge = ease(clamp((F.m - .4) / .35, 0, 1));
  const steps = Math.floor(F.a * n) + Math.floor(F.b * n) + Math.floor(merge * n);
  if (steps > finTicks){ finTicks = steps; if (!paused) playSound(); }
}

function renderFinal(){
  const {def, net} = finValues();
  const h = innerHeight, sideTop = Math.max(h * .1, 76);
  const merge = ease(clamp((F.m - .4) / .35, 0, 1)), settle = ease(clamp((F.m - .75) / .25, 0, 1));
  const deficit = def * F.a * (1 - merge), surplus = net * F.b + def * merge;
  fvL.style.color = COLORS.death;
  fvR.style.color = COLORS.in;
  fcap.style.setProperty('--final-accent', COLORS.in);
  fsL.style.left = innerWidth * .25 + 'px';
  fsL.style.top = sideTop + 'px';
  fsR.style.left = lerp(innerWidth * .75, innerWidth * .5, settle) + 'px';
  fsR.style.top = sideTop + 'px';
  fvL.textContent = sgn0(deficit);
  fvR.textContent = sgn(surplus);
  if (F.m > .64) fsL.style.setProperty('opacity', String(1 - ease(clamp((F.m - .64) / .11, 0, 1))), 'important');
  else fsL.style.removeProperty('opacity');
  flR.textContent = merge >= 1 ? 'Überschuss durch Zuwanderung' : 'Wanderungssaldo';
}
function tween(ms, step, id){
  return new Promise(resolve => {
    const start = vt;
    ticks.push(() => {
      if (id !== finId){ resolve(); return true; }
      const p = clamp((vt - start) / ms, 0, 1);
      step(p);
      finalTick();
      renderFinal();
      if (p >= 1){ resolve(); return true; }
    });
  });
}
function finalText(){
  const {def, net, rest} = finValues();
  fcap.style.setProperty('--final-accent', COLORS.in);
  $('balanceDef').textContent = sgn(def);
  $('balanceDef').style.color = COLORS.death;
  $('balanceNet').textContent = sgn(net);
  $('balanceNet').style.color = COLORS.in;
  fcap.innerHTML = 'Die Zuwanderung gleicht das Geburtendefizit seit 1991 <b>vollständig</b> aus –<br>und liegt noch um <b>' + fmt(rest) + '</b> Menschen darüber.';
}
function finishFinal(){
  finId++;
  cancelSeq();
  F.a = F.b = F.m = 1;
  finalText();
  [fsL, fsR, fcap, fbtn, finalBalance].forEach(el => el.classList.add('in'));
  renderFinal();
  finDone = true;
  updateMenus();
  persistSlideState();
}
async function showFinal(instant, delay = 0){
  const id = ++finId;
  finDone = false;
  F.a = F.b = F.m = 0;
  finTicks = 0;
  const parts = [fsL, fsR, fcap, fbtn, finalBalance];
  parts.forEach(el => { el.style.transition = 'none'; el.classList.remove('in'); });   // Reste eines früheren Durchlaufs sofort ausblenden
  fsL.style.removeProperty('opacity');
  void fin.offsetWidth;
  parts.forEach(el => el.style.transition = '');
  finalText();
  renderFinal();
  if (delay){ await sleep(delay); if (id !== finId) return; }
  fin.classList.add('on');
  if (instant){ finishFinal(); return; }
  await sleep(1600); if (id !== finId) return;
  fsL.classList.add('in');
  await tween(3000, p => { F.a = ease(p); }, id); if (id !== finId) return;
  await sleep(900); if (id !== finId) return;
  fsR.classList.add('in');
  await tween(3400, p => { F.b = ease(p); }, id); if (id !== finId) return;
  await sleep(1800); if (id !== finId) return;
  await tween(6500, p => { F.m = p; }, id); if (id !== finId) return;
  await sleep(500); if (id !== finId) return;
  fcap.classList.add('in');
  finalBalance.classList.add('in');
  await sleep(1200); if (id !== finId) return;
  fbtn.classList.add('in');
  finDone = true;
  updateMenus();
  persistSlideState();
}
addEventListener('resize', () => { if (fin.classList.contains('on')) renderFinal(); });
