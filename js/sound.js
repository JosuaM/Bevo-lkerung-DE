/* Klang der Balken auf der Differenz-Folie: kurze, synthetisch erzeugte Töne (keine Audiodateien). */
const SOUNDS = {
  click: {label: 'Klick (weich)', wave: 'triangle', from: 1500, to: 420,  length: .05, volume: .11},
  tick:  {label: 'Tick (hell)',   wave: 'square',   from: 2600, to: 2000, length: .02, volume: .04},
  pop:   {label: 'Pop',           wave: 'sine',     from: 520,  to: 160,  length: .09, volume: .2},
  wood:  {label: 'Holzklopfen',   wave: 'sine',     from: 900,  to: 600,  length: .06, volume: .22},
  off:   {label: 'Aus'},
};
let soundName = DEFAULTS.sound in SOUNDS ? DEFAULTS.sound : 'click';
let audioContext = null;

function playSound(){
  const sound = SOUNDS[soundName];
  if (!sound.wave) return;
  try{
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.type = sound.wave;
    oscillator.frequency.setValueAtTime(sound.from * (1 + Math.random() * .08), now);
    oscillator.frequency.exponentialRampToValueAtTime(sound.to, now + sound.length * .7);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(sound.volume, now + .003);
    gain.gain.exponentialRampToValueAtTime(.0001, now + sound.length);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + sound.length + .01);
  }catch{}
}
