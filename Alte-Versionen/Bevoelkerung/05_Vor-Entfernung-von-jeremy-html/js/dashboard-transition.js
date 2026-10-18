/* Partikelübergang Ergebnis → Dashboard. */
window.particleTransition = (() => {
  let run = null;
  let landingStart = -Infinity;
  function landingOffset(i, now){
    const seconds = (now - landingStart) / 1000;
    if (seconds <= 0 || seconds > 4) return {x: 0, y: 0};
    // Gemeinsamer Impuls entlang der letzten Flugrichtung (rechts/leicht aufwärts).
    // Erst über das Ziel hinaustragen, dann ohne Richtungswechsel im Schwarm zurückfedern.
    const delay = cloudRandom(i, 81) * .18;
    const age = Math.max(0, seconds - delay);
    const envelope = age * age * Math.exp(-age * 3);
    const strength = .8 + cloudRandom(i, 82) * .4;
    return {x: envelope * 280 * strength,
      y: -envelope * 150 * strength};
  }
  const smooth = p => { p = Math.max(0, Math.min(1, p)); return p * p * (3 - 2 * p); };
  const rgb = color => color.match(/[\da-f]{2}/gi).map(v => parseInt(v, 16));
  function cancel(){
    if (!run) return;
    cancelAnimationFrame(run.frame);
    run.canvas.remove();
    finalCanvas.style.visibility = '';
    document.body.classList.remove('particle-transfer');
    document.getElementById('ex-surplus-particles').style.opacity = '';
    if (scene !== 5) landingStart = -Infinity;
    run = null;
  }
  function start(){
    if (run) return;
    if (!finDone) finishFinal();
    setPaused(true);
    drawFinalClouds();
    const source = finalParticleSnapshot.filter(p => p.alpha > .005).map(p => ({...p, rgb: rgb(p.color), nx: p.x / innerWidth, ny: p.y / innerHeight}));
    const sourceClock = vt / 1000, sourceWidth = innerWidth, sourceHeight = innerHeight;
    const {def, net} = finValues(), cy = innerHeight * .54;
    const radius = Math.max(36, Math.min(innerWidth * .21, cy - Math.max(innerHeight * .1, 76) - 115, innerHeight * .26));
    const survivorRadius = radius * Math.sqrt((1000 - Math.round(Math.abs(def) / net * 1000)) / 1000);
    source.forEach(p => { p.origin = cloudPoint(p.i + 9001, survivorRadius, sourceClock); });
    // Zielgeometrie schon vor dem Ausblenden messen, damit der Flug sofort beginnen kann.
    const explorer = document.getElementById('explorer');
    explorer.style.visibility = 'hidden';
    explorer.style.display = 'block';
    populationExplorer.prepareParticleArrival();
    populationExplorer.render({...dashboardApi, year: LAST, d: byYear[LAST]});
    const initialTargets = populationExplorer.particleSnapshot();
    explorer.style.display = '';
    explorer.style.visibility = '';
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-transfer';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    finalCanvas.style.visibility = 'hidden';
    document.body.classList.add('particle-transfer');
    const context = canvas.getContext('2d');
    const targetCanvas = document.getElementById('ex-surplus-particles');
    targetCanvas.style.opacity = '0';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 450 : 5200, blackAt = reduced ? 150 : 1150;
    const dashboardRevealAt = reduced ? blackAt : 2500;
    const started = performance.now();
    landingStart = reduced ? -Infinity : started + duration - 900;
    run = {canvas, frame: 0};
    let entered = false;
    function tick(now){
      if (!run) return;
      const elapsed = now - started, progress = Math.min(1, elapsed / duration);
      if (!entered && elapsed >= blackAt){
        entered = true;
        populationExplorer.prepareParticleArrival();
        goScene(5, {throughBlack: true, revealDelay: Math.max(0, dashboardRevealAt - elapsed)});
        drawDash();
      }
      const w = innerWidth, h = innerHeight, ratio = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * ratio) || canvas.height !== Math.round(h * ratio)){
        canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, w, h);
      // Ergebnistext ausblenden und Partikel gleichzeitig weiterfliegen lassen.
      const dashboardReveal = smooth((elapsed - dashboardRevealAt) / (reduced ? 200 : 1400));
      const darkness = smooth(elapsed / blackAt) * (1 - dashboardReveal);
      context.fillStyle = `rgba(0,0,0,${darkness})`;
      context.fillRect(0, 0, w, h);
      const targets = entered ? populationExplorer.particleSnapshot() : initialTargets;
      const travel = Math.max(0, Math.min(1, elapsed / (duration - 500)));
      const handoff = smooth((elapsed - duration + 900) / 900);
      targetCanvas.style.opacity = String(handoff);
      const green = rgb(COLORS.birth);
      source.forEach((p, i) => {
        const target = targets[i];
        const fallback = targets.length ? targets[i % targets.length] : null;
        const destination = target || fallback;
        // Vorhut und Nachzügler folgen derselben Kurve mit eigenen Flugzeiten.
        const delay = cloudRandom(p.i, 71) * .23;
        const move = reduced ? (entered ? 1 : 0) : smooth((travel - delay) / (1 - delay));
        const drift = reduced ? p.origin : cloudPoint(p.i + 9001, survivorRadius, sourceClock + elapsed / 1000);
        const sx = p.nx * w + (drift.x - p.origin.x) * w / sourceWidth;
        const sy = p.ny * h + (drift.y - p.origin.y) * h / sourceHeight;
        const tx = destination?.x ?? sx, ty = destination?.y ?? sy;
        const lane = cloudRandom(p.i, 72) - .5;
        // Kubischer Bogen: erst abwärts, dann nach rechts und sanft ins Ziel hinauf.
        const c1x = sx + w * (.06 + lane * .05), c1y = Math.min(h * .82, sy + h * .22);
        const c2x = tx - w * (.14 + lane * .06), c2y = Math.min(h * .84, ty + h * .12);
        const u = move, v = 1 - u;
        let x = v ** 3 * sx + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u ** 3 * tx;
        let y = v ** 3 * sy + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u ** 3 * ty;
        const dx = 3 * v * v * (c1x - sx) + 6 * v * u * (c2x - c1x) + 3 * u * u * (tx - c2x);
        const dy = 3 * v * v * (c1y - sy) + 6 * v * u * (c2y - c1y) + 3 * u * u * (ty - c2y);
        const length = Math.hypot(dx, dy) || 1;
        const flutter = Math.sin(elapsed / 1000 * 1.8 + cloudRandom(p.i, 73) * Math.PI * 2) * 7;
        const spread = reduced ? 0 : Math.sin(Math.PI * u) * (lane * Math.min(w * .085, h * .14) + flutter);
        x -= dy / length * spread;
        y += dx / length * spread;
        // Überschüssige Punkte lösen sich während der Reise auf.
        const retained = target ? 1 : 1 - smooth((move - .12) / .76);
        const alpha = (p.alpha + ((target?.alpha ?? p.alpha) - p.alpha) * move) * retained * (1 - handoff);
        if (alpha < .003) return;
        const color = p.rgb.map((v, k) => Math.round(v + (green[k] - v) * move));
        context.fillStyle = `rgba(${color.join(',')},${alpha})`;
        context.beginPath();
        context.arc(x, y, Math.max(.1, p.size + ((destination?.size ?? p.size) - p.size) * move), 0, Math.PI * 2);
        context.fill();
      });
      if (progress >= 1){ cancel(); return; }
      run.frame = requestAnimationFrame(tick);
    }
    run.frame = requestAnimationFrame(tick);
  }
  return {start, cancel, landingOffset};
})();
