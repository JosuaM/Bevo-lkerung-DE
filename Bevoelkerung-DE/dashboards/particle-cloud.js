/* Partikelwolke im Dashboard: zeigt den Überschuss bzw. das Verhältnis der Größen als bewegte Punkte.
   Klick: kurze Ausdehnung · Doppelklick: Drehung · Maus: Punkte weichen aus. */
function createParticleCloud(canvas, getZoom){
  const ctx = canvas.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const PARTICLES = 240, BALANCE_PARTICLES = 180;
  const pointer = {active: false, x: 0, y: 0};
  const clickPulses = [];
  let spinStart = -Infinity, spinOffset = 0;
  let lastTime = 0, motionTime = 0;

  const hash = (i, salt) => { const n = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453; return n - Math.floor(n); };
  const particles = Array.from({length: PARTICLES}, (_, i) => ({
    angle: hash(i, 1) * Math.PI * 2,
    radius: Math.sqrt(hash(i, 2)) * .82,
    size: 1.1 + Math.pow(hash(i, 3), 1.8) * 3.2,
    phase: hash(i, 4) * Math.PI * 2,
    speed: .35 + hash(i, 5) * .35,
    opacity: .42 + hash(i, 6) * .48,
    alpha: 0, offsetX: 0, offsetY: 0,
  }));

  canvas.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); e.stopPropagation(); canvas.click(); }
  });
  canvas.addEventListener('click', e => {
    if (!reducedMotion.matches && e.detail < 2) clickPulses.push(performance.now() / 1000);
  });
  canvas.addEventListener('dblclick', e => {
    e.preventDefault();
    const now = performance.now() / 1000;
    if (reducedMotion.matches || now - spinStart < 6) return;
    spinStart = now;
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const box = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - box.left) / getZoom();
    pointer.y = (e.clientY - box.top) / getZoom();
    pointer.active = true;
  });
  const release = () => { pointer.active = false; };
  canvas.addEventListener('pointerleave', release);
  canvas.addEventListener('pointercancel', release);
  addEventListener('blur', release);

  const clamp01 = x => Math.max(0, Math.min(1, x));
  const smoothstep5 = p => p ** 3 * (10 - 15 * p + 6 * p ** 2);

  /* mode: 'surplus' (nur Überschuss), 'balance' (Salden) oder 'detail' (vier Einzelgrößen) */
  function draw({mode, d, surplus, colors}){
    const balance = mode !== 'surplus', detail = mode === 'detail';
    const natural = Math.abs(d.wb - d.wd), migration = Math.abs(d.zu - d.fort);
    const weights = [d.wb, d.wd, d.zu, d.fort];
    const total = weights.reduce((sum, n) => sum + n, 0);
    const categoryColors = [colors.birth, colors.death, colors.in, colors.out];
    const magnitude = detail ? total : natural + migration;
    const count = balance ? (magnitude ? BALANCE_PARTICLES : 0) : Math.min(PARTICLES, Math.round(surplus / 50000));
    const blueCount = balance && magnitude ? Math.round(count * migration / magnitude) : 0;

    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min((devicePixelRatio || 1) * getZoom(), 4);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)){
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const now = performance.now() / 1000, dt = lastTime ? Math.min(.06, now - lastTime) : 1 / 60;
    if (!lastTime || now - lastTime > .5){ motionTime = 0; pointer.active = false; }
    else if (!reducedMotion.matches) motionTime += dt;
    lastTime = now;
    const time = reducedMotion.matches ? 0 : now;

    // Kurze Bewegungsphasen mit ruhigen Pausen und weichem Ein-/Ausblenden.
    const beat = motionTime % 29;
    const progress = beat >= 5 && beat < 9 ? (beat - 5) / 4 : beat >= 19 && beat < 24 ? (beat - 19) / 5 : 0;
    const breathing = reducedMotion.matches ? 0 : Math.sin(Math.PI * progress) ** 2;
    // Weitere Klicks überlagern den laufenden Impuls, statt die Wolke zurückzusetzen.
    while (clickPulses.length && now - clickPulses[0] >= 2.2) clickPulses.shift();
    const clickExpansion = reducedMotion.matches ? 0 : 1 - clickPulses.reduce((rest, start) => {
      const p = clamp01((now - start) / 2.2);
      return rest * (1 - Math.sin(Math.PI * p) ** 2);
    }, 1);
    const spinDuration = 6, spinArc = Math.PI * 2 * spinDuration / 32;
    const spinProgress = clamp01((now - spinStart) / spinDuration);
    const spinning = !reducedMotion.matches && spinProgress < 1;
    if (Number.isFinite(spinStart) && (spinProgress >= 1 || reducedMotion.matches)){
      spinOffset = (spinOffset + spinArc * smoothstep5(spinProgress)) % (Math.PI * 2);
      spinStart = -Infinity;
    }
    const spinAngle = spinOffset + (spinning ? spinArc * smoothstep5(spinProgress) : 0);

    const radius = Math.min(width * .38, height * .42);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      const target = i < count ? 1 : 0;
      p.alpha = reducedMotion.matches ? target : p.alpha + (target - p.alpha) * (1 - Math.exp(-dt * 3));
      if (p.alpha < .005) return;
      const angle = p.angle + Math.sin(time * .13 + p.phase) * .12 + spinAngle;
      const contour = 1 + .13 * Math.sin(angle * 3 + time * .18) + .08 * Math.cos(angle * 5 - time * .14);
      const driftX = Math.sin(time * p.speed + p.phase) * radius * .12;
      const driftY = Math.cos(time * p.speed * .8 + p.phase) * radius * .11;
      const expansion = 1 + breathing * .13 + clickExpansion * .27;
      let x = width / 2 + Math.cos(angle) * p.radius * radius * contour * 1.14 * expansion + driftX;
      let y = height / 2 + Math.sin(angle) * p.radius * radius * contour * .88 * expansion + driftY;
      let pushX = 0, pushY = 0;
      if (pointer.active && !reducedMotion.matches){
        const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy);
        const reach = Math.min(48, radius * .6), force = Math.max(0, 1 - distance / reach) ** 2 * 5;
        const direction = distance > .01 ? Math.atan2(dy, dx) : p.angle;
        pushX = Math.cos(direction) * force;
        pushY = Math.sin(direction) * force;
      }
      const response = 1 - Math.exp(-dt * (pointer.active ? 8 : 5));
      p.offsetX = reducedMotion.matches ? 0 : p.offsetX + (pushX - p.offsetX) * response;
      p.offsetY = reducedMotion.matches ? 0 : p.offsetY + (pushY - p.offsetY) * response;
      x = Math.max(p.size + 1, Math.min(width - p.size - 1, x + p.offsetX));
      y = Math.max(p.size + 1, Math.min(height - p.size - 1, y + p.offsetY));
      if (detail){
        const share = ((i * 73) % BALANCE_PARTICLES + .5) / BALANCE_PARTICLES;
        let cumulative = 0;
        const category = weights.findIndex(weight => { cumulative += weight / total; return share < cumulative; });
        ctx.fillStyle = categoryColors[category < 0 ? 3 : category];
      }else if (balance) ctx.fillStyle = (i * 73) % BALANCE_PARTICLES < blueCount ? colors.in : colors.death;
      else ctx.fillStyle = colors.birth;
      ctx.globalAlpha = p.opacity * p.alpha;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  return {draw};
}
