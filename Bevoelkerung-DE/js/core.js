/* Grundlagen: Konstanten, Einstellungen, Hilfsfunktionen, Zustand, Zeichenfläche und Zeitplaner. */

/* ---- Hilfsfunktionen ---- */
const $ = id => document.getElementById(id);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const fmt = n => Math.round(n).toLocaleString('de-DE');
const sgn = n => (Math.round(n) >= 0 ? '+' : '−') + Math.abs(Math.round(n)).toLocaleString('de-DE');

/* ---- Konstanten ---- */
const FIRST = 1991, LAST = 2025, END = LAST + .999;
const SPEED = 380;                     // Partikelgeschwindigkeit (virtuelle px/s)
const REF_POP = 84e6;                  // Bevölkerung, bei der der Kreis seinen größten Radius hat
const FONT = '"IBM Plex Sans","Segoe UI",system-ui,-apple-system,sans-serif';
const SCENES = ['Frage', 'Animation 1', 'Differenz', 'Animation 2', 'Ergebnis', 'Dashboard'];
const PHASES = [
  {label: 'ohne Ein- und Auswanderung', up: {key: 'wb', ck: 'birth', name: 'Lebendgeborene'}, down: {key: 'wd', ck: 'death', name: 'Gestorbene'}},
  {label: 'tatsächliche Bevölkerung',   up: {key: 'zu', ck: 'in',    name: 'Einwanderung'},   down: {key: 'fort', ck: 'out',  name: 'Auswanderung'}},
];

/* ---- Einstellungen (Standardwerte stehen in DEFAULTS der index.html, Änderungen im E-Menü) ---- */
const COLORS = {birth: '#4ade9a', death: '#ff7a7a', in: '#38e0ff', out: '#ffb454'};
const BGS = Array(SCENES.length).fill('#121212');      // Hintergrund je Folie
let DOT = 3000;                                        // Personen pro Punkt
let SZMIN = 2, SZMAX = 10;                             // Punktradius (px): kleinster / größter Punkt
let timelineSpeed = 1;
const isHex = value => /^#[0-9a-f]{6}$/i.test(value || '');
for (const key in COLORS) if (DEFAULTS.colors && isHex(DEFAULTS.colors[key])) COLORS[key] = DEFAULTS.colors[key];
if (DEFAULTS.bgs) DEFAULTS.bgs.forEach((color, i) => { if (i < BGS.length && isHex(color)) BGS[i] = color; });
if (DEFAULTS.dot > 0) DOT = DEFAULTS.dot;
if (DEFAULTS.szmin > 0) SZMIN = DEFAULTS.szmin;
if (DEFAULTS.szmax > 0) SZMAX = DEFAULTS.szmax;
if (DEFAULTS.speed > 0) timelineSpeed = clamp(DEFAULTS.speed, .5, 2.5);

function currentSettings(){
  return {dot: DOT, szmin: SZMIN, szmax: SZMAX, speed: timelineSpeed, sound: soundName, evsound: eventSoundName, colors: {...COLORS}, bgs: [...BGS]};
}

/* ---- Abgeleitete Daten ---- */
const byYear = Object.fromEntries(DATA.map(d => [d.y, d]));
// Kumulierte Summen seit 1991 (cumN: natürlicher Saldo = Geborene − Gestorbene)
const cumN = {[FIRST - 1]: 0}, cumB = {[FIRST - 1]: 0}, cumD = {[FIRST - 1]: 0}, cumZ = {[FIRST - 1]: 0}, cumF = {[FIRST - 1]: 0};
DATA.forEach(d => {
  cumB[d.y] = cumB[d.y - 1] + d.wb;  cumD[d.y] = cumD[d.y - 1] + d.wd;  cumN[d.y] = cumB[d.y] - cumD[d.y];
  cumZ[d.y] = cumZ[d.y - 1] + d.zu;  cumF[d.y] = cumF[d.y - 1] + d.fort;
});

/* ---- Zustand ---- */
let t = FIRST;                         // aktuelle Zeit in Jahren (Animation: 1991 … 2025,999)
let scene = 0;                         // 0 Frage · 1 Animation 1 · 2 Differenz · 3 Animation 2 · 4 Ergebnis · 5 Dashboard
let phase = 0;                         // 0 ohne Wanderung · 1 tatsächliche Bevölkerung (· 2 Dashboard)
const isAnim = () => scene === 1 || scene === 3;
const isDash = () => scene === 5;
const mouse = {x: -1, y: -1};
addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

function state(time){
  const y = clamp(Math.floor(time), FIRST, LAST), f = clamp(time - y, 0, 1), d = byYear[y];
  const previous = y === FIRST ? BASE : byYear[y - 1].wp;
  const pop = phase === 0 ? BASE + cumN[y - 1] + f * (d.wb - d.wd) : lerp(previous, d.wp, f);
  return {y, f, d, pop};
}

/* ---- Schriftgrößen: genau drei Stufen ---- */
const FS = {l: 44, m: 26, s: 18};
function calcFS(){
  FS.l = clamp(Math.min(innerWidth * .034, innerHeight * .062), 26, 54);
  FS.m = FS.l * .58;
  FS.s = FS.l * .4;
  const root = document.documentElement.style;
  root.setProperty('--fs-l', FS.l + 'px');
  root.setProperty('--fs-m', FS.m + 'px');
  root.setProperty('--fs-s', FS.s + 'px');
}
function applyColorVars(){
  for (const key in COLORS) document.documentElement.style.setProperty('--c-' + key, COLORS[key]);
}

/* ---- Zeichenfläche (virtuelles Koordinatensystem, mindestens 1280 × 720) ---- */
const cv = $('c'), ctx = cv.getContext('2d');
let W = 1280, H = 720, SC = 1, HB = 100, DPR = 1;
function resize(){
  calcFS();
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  const width = cv.clientWidth, height = cv.clientHeight;
  if (!width || !height) return;
  SC = Math.min(width / 1280, height / 720);
  W = width / SC;
  H = height / SC;
  cv.width = width * DPR;
  cv.height = height * DPR;
  ctx.setTransform(DPR * SC, 0, 0, DPR * SC, 0, 0);
  HB = (28 + 2.5 * FS.m + 16) / SC;                  // Platz oben für die angedockte Frage
}
addEventListener('resize', resize);
resize();
applyColorVars();

/* ---- Zeitplaner: läuft nur, solange nicht pausiert ---- */
let vt = 0, paused = false;                          // vt: Animationszeit in ms
const timers = [], ticks = [];
function later(ms, fn){
  const timer = {at: vt + ms, fn};
  timers.push(timer);
  return timer;
}
function runTimers(){
  for (;;){
    let next = -1;
    for (let i = 0; i < timers.length; i++) if (timers[i].at <= vt && (next < 0 || timers[i].at < timers[next].at)) next = i;
    if (next < 0) break;
    timers.splice(next, 1)[0].fn();
  }
  for (let i = ticks.length - 1; i >= 0; i--) if (ticks[i]() === true) ticks.splice(i, 1);
}
const sleep = ms => new Promise(resolve => later(ms, resolve));
function cancelSeq(){ timers.length = 0; ticks.length = 0; }
