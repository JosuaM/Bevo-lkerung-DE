/* Animation 1 und 2: Zeitablauf, Punktströme und Kreis mit Bevölkerungsstand. */

/* ---- Tempo (Jahre pro Sekunde) ---- */
const EVENT_SPEED = .36;               // Höchsttempo in Ereignisjahren
const MAX_COUNT_RATE = 200000;         // Zahlen sollen in Ereignisjahren nicht schneller als etwa so viele Menschen pro Sekunde zählen
const MIN_EVENT_SPEED = .2;
let ypsCur = 1;                        // Animation 2: gleitendes Tempo, in Ereignisjahren deutlich langsamer
const narrativeSpeed = () => 2 * timelineSpeed;
function nearEvent(){                  // Variante 2: schon in der zweiten Hälfte des Vorjahrs ruhiger werden
  const year = Math.floor(t);
  return !!EVENTS[year] || (animVariant === 2 && !!EVENTS[year + 1] && t - year > .5);
}
function eventSpeed(){                 // große Sprünge (z. B. 2015) laufen langsamer, damit auch die Zahlen ruhig zählen
  if (animVariant !== 2) return EVENT_SPEED;
  const year = clamp(Math.floor(t), FIRST, LAST), now = byYear[year], next = byYear[Math.min(year + 1, LAST)];
  const change = Math.max(...['zu', 'fort', 'wb', 'wd', 'wp'].map(key => Math.abs(next[key] - now[key])));
  return clamp(MAX_COUNT_RATE / Math.max(change, 1), MIN_EVENT_SPEED, EVENT_SPEED);
}
function yps(){
  if (scene !== 3) return narrativeSpeed();
  return nearEvent() ? Math.min(ypsCur, eventSpeed()) : ypsCur;
}

/* ---- Layout: statisch, nur der Kreisradius ändert sich ---- */
let R_MAX = 190, CX = 640, CY = 360;
function layout(){
  const free = H - HB - 112 / SC;
  R_MAX = clamp(free / 2 - 34, 90, 200);
  CX = W / 2;
  CY = HB + free / 2;
}
const BAND = () => R_MAX * .6;         // beide Strahlen gleich breit

/* ---- Punkte ---- */
const particles = [], acc = {up: 0, down: 0}, MAX_PARTICLES = 16000;
let waitingForArrival = false;         // Einlauf: Auswanderung startet erst, wenn die ersten Punkte den Kreis erreichen
let drainingParticles = false;         // Ende: Strahlen laufen leer, bevor die nächste Folie kommt

function beginEntrance(){
  particles.length = 0;
  acc.up = acc.down = 0;
  waitingForArrival = true;
}
function particlePosition(p){
  const q = clamp(p.age / p.life, 0, 1);
  const x = p.inflow ? lerp(-14, CX, q) : lerp(CX, W + 20, q);
  const dist = Math.abs(x - CX) / Math.max(CX, 1);
  const envelope = BAND() * (.8 + .45 * dist + .12 * Math.sin(dist * 7 + 1.3));
  const y = CY + p.u * envelope + Math.sin(q * p.wf + p.wob) * p.wa / SC * (.3 + dist);
  return {x, y};
}
function spawn(inflow, ck, randomAge, maxLife = Infinity){
  if (particles.length > MAX_PARTICLES) return;
  const length = inflow ? CX + 14 : W - CX + 20;
  const speed = .65 + Math.random() * .7;                                   // jedes Teilchen hat sein eigenes Tempo
  if (length / (SPEED * speed) > maxLife) return;                           // Ausklang: nur Punkte, die noch vor dem Ende verschwinden
  const center = (Math.random() + Math.random() + Math.random()) / 1.5 - 1; // eher mittig, aber breit gestreut
  const p = {
    inflow, ck,
    u: Math.random() < .35 ? Math.random() * 2 - 1 : center,
    wob: Math.random() * 6.28, wf: 4 + Math.random() * 7, wa: 2 + Math.random() * 12,
    r: Math.pow(Math.random(), 1.7),                                        // viele kleine, wenige große
    alpha: .55 + Math.random() * .45,
    life: Math.max(.6, length / (SPEED * speed)), age: 0,
  };
  if (randomAge) p.age = Math.random() * p.life;
  particles.push(p);
}
function emit(dt, key, rate, inflow, ck, maxLife){
  acc[key] += rate * dt;
  while (acc[key] >= 1){ acc[key] -= 1; spawn(inflow, ck, false, maxLife); }
}
function stepParticles(dt){
  for (let i = particles.length - 1; i >= 0; i--){
    particles[i].age += dt;
    if (particles[i].age >= particles[i].life) particles.splice(i, 1);
  }
}
function prefill(){                    // Strahlen sofort gefüllt darstellen (z. B. nach dem Springen im Zeitstrahl)
  waitingForArrival = drainingParticles = endScheduled = false;
  particles.length = 0;
  acc.up = acc.down = 0;
  if (phase > 1 || isDash()) return;
  const P = PHASES[phase], d = byYear[clamp(Math.floor(t), FIRST, LAST)];
  for (const [key, ck, inflow] of [[P.up.key, P.up.ck, true], [P.down.key, P.down.ck, false]]){
    const length = inflow ? CX + 14 : W - CX + 20, n = d[key] / DOT * (length / SPEED);
    for (let i = 0; i < n; i++) spawn(inflow, ck, true);
  }
}
function restart(){ t = FIRST; prefill(); }
function setPhase(i){ phase = i; restart(); }

/* Variante 2, Ausklang: Zeitstrahl und Punkte behalten ihr Tempo. Gegen Ende kommen nur noch Punkte nach, die vor 2025 wieder
   verschwinden; dadurch werden es zum Schluss weniger, und beim Erreichen von 2025 ist keiner mehr zu sehen. In diesem Moment
   stehen auch alle Zahlen auf dem Endwert. */
const FINAL_HOLD = 2000;               // ms Pause auf dem Endstand, bevor die nächste Folie ausgeblendet wird
let startHold = 0;                     // Animationszeit (vt), vor der noch nichts startet: Folie ist noch nicht sichtbar
let endScheduled = false;              // Wechsel zur nächsten Folie ist bereits angesetzt
const animationEnd = () => animVariant === 2 ? LAST : END;
const secondsLeft = () => (animationEnd() - t) / narrativeSpeed();    // in Partikelzeit: ein Partikel altert so, wie die Zeit mit Normaltempo läuft
function visibleTimeLeft(){            // Sekunden, bis der letzte Punkt am Kreisrand bzw. rechten Bildrand verschwunden ist
  const radius = R_MAX * Math.sqrt(Math.max(state(t).pop, 1) / REF_POP);
  const entryEnd = (CX - radius + 14) / (CX + 14);
  let left = 0;
  for (const p of particles) left = Math.max(left, ((p.inflow ? entryEnd : 1) - p.age / p.life) * p.life);
  return left;
}

/* Ein Bild lang weiterlaufen: Zeit, Tempo und Punkte (auch bei Pause laufen die Punkte mit den Werten des gewählten Jahres weiter). */
function advanceAnimation(dt){
  if (vt < startHold) return;
  if (scene === 3) ypsCur += ((nearEvent() ? eventSpeed() : narrativeSpeed()) - ypsCur) * Math.min(1, dt * 3);
  const animationDt = paused ? 0 : dt * yps();
  if (!paused && !waitingForArrival && !drainingParticles){
    t += animationDt;
    if (t >= animationEnd()){
      t = animationEnd();
      drainingParticles = true;
      acc.up = acc.down = 0;
    }
  }
  const P = PHASES[phase], d = state(t).d;
  const particleDt = scene === 3 ? animationDt / narrativeSpeed() : (paused ? 0 : dt);
  if (!drainingParticles){
    const maxLife = animVariant === 2 ? Math.max(secondsLeft(), 0) : Infinity;
    emit(particleDt, 'up', d[P.up.key] / DOT, true, P.up.ck, maxLife);
    if (!waitingForArrival) emit(particleDt, 'down', d[P.down.key] / DOT, false, P.down.ck, maxLife);
  }
  stepParticles(particleDt);
  const drained = animVariant === 2 ? visibleTimeLeft() <= 0 : particles.length === 0;
  if (drainingParticles && !paused && drained && !endScheduled){
    endScheduled = true;
    later(animVariant === 2 ? FINAL_HOLD : 0, () => {
      endScheduled = false;
      if (drainingParticles) goScene(scene === 1 ? 2 : 4);
    });
  }
  if (waitingForArrival && !paused){
    const radius = R_MAX * Math.sqrt(Math.max(state(t).pop, 1) / REF_POP);
    waitingForArrival = !particles.some(p => {
      if (!p.inflow) return false;
      const {x, y} = particlePosition(p);
      return Math.hypot(x - CX, y - CY) <= radius;
    });
  }
}

/* ---- Zeichnen ---- */
function drawParticles(radius){
  const fadeStart = radius - 16 / SC, fadeLength = 46 / SC;
  for (const p of particles){
    const {x, y} = particlePosition(p);
    const size = lerp(SZMIN, SZMAX, p.r) / SC, distance = Math.hypot(x - CX, y - CY);
    let alpha;
    if (animVariant === 1){
      alpha = clamp((distance - fadeStart) / fadeLength, 0, 1);
      alpha = alpha * alpha * (3 - 2 * alpha);                         // Variante 1: weicher Übergang in den Kreis
    }else alpha = distance - size >= radius ? 1 : 0;                   // Variante 2: harter Schnitt am Kreisrand
    alpha *= clamp((H - 104 / SC - y) / 30, 0, 1);
    if (alpha <= .01) continue;
    ctx.globalAlpha = alpha * p.alpha;
    ctx.fillStyle = COLORS[p.ck];
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 6.2832);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function text(str, x, y, size, color, weight, align){
  ctx.font = `${weight || 400} ${size / SC}px ${FONT}`;
  ctx.fillStyle = color || '#f2f4f8';
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}
function drawAnim(s){
  const P = PHASES[phase], u = 1 / SC;
  const radius = R_MAX * Math.sqrt(Math.max(s.pop, 1) / REF_POP);
  ctx.lineWidth = 2 * u;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.arc(CX, CY, radius, 0, 6.2832);
  ctx.stroke();
  drawParticles(radius);

  // Kreis-Beschriftung (fest, nur der Kreis wächst/schrumpft)
  text('Bevölkerungsstand', CX, CY - (FS.l * .78 + FS.m * .75) * u, FS.m * 1.1, '#a4adbd', 400);
  const labelTime = scene === 3 && !paused ? Math.floor(t * 30) / 30 : t;
  text(fmt(state(labelTime).pop), CX, CY, FS.l, '#fff', 500);
  text(P.label, CX, CY + (FS.l * .78 + FS.s) * u, FS.s * 1.1, '#7d879b', 400);

  // Jahreswerte links / rechts, gleiche Höhe, mittig zwischen Kreis und Rand
  const numberY = CY - BAND() - (18 + FS.l * .5) * u, labelY = numberY - (FS.l * .5 + FS.m * .8 + 6) * u;
  const leftX = (CX - R_MAX) / 2, rightX = (CX + R_MAX + W) / 2;
  // Variante 2: Zahlen laufen linear von Jahr zu Jahr; beim Erreichen eines Jahres steht exakt dessen Wert da.
  const year = clamp(Math.floor(t), FIRST, LAST), nextYear = byYear[Math.min(year + 1, LAST)], fraction = clamp(t - year, 0, 1);
  const shown = key => animVariant === 1 ? s.d[key] : lerp(byYear[year][key], nextYear[key], fraction);
  text(P.up.name, leftX, labelY, FS.m, '#a4adbd', 400);
  text(fmt(shown(P.up.key)), leftX, numberY, FS.l, COLORS[P.up.ck], 300);
  text(P.down.name, rightX, labelY, FS.m, '#a4adbd', 400);
  text(fmt(shown(P.down.key)), rightX, numberY, FS.l, COLORS[P.down.ck], 300);
}
