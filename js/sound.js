/* Klang der Balken auf der Differenz-Folie: kurze, synthetisch erzeugte Töne (keine Audiodateien). */
const SOUNDS = {
  tick:       {label: 'Tick (hell)',        wave: 'square',   from: 2600, to: 2000, length: .02,  volume: .04},
  tickHigh:   {label: 'Tick (sehr hell)',   wave: 'square',   from: 3600, to: 3000, length: .015, volume: .03},
  tickSoft:   {label: 'Tick (weich)',       wave: 'triangle', from: 2200, to: 1500, length: .025, volume: .08},
  tickDeep:   {label: 'Tick (tief)',        wave: 'square',   from: 1400, to: 900,  length: .03,  volume: .05},
  tickSharp:  {label: 'Tick (scharf)',      wave: 'sawtooth', from: 3000, to: 1800, length: .012, volume: .03},
  tickDouble: {label: 'Tick (doppelt)',     wave: 'square',   from: 2600, to: 2000, length: .02,  volume: .035, repeat: [0, .04]},
  clock:      {label: 'Uhr (Tack)',         wave: 'triangle', from: 1800, to: 1000, length: .035, volume: .1},
  click:      {label: 'Klick (weich)',      wave: 'triangle', from: 1500, to: 420,  length: .05,  volume: .11},
  pop:        {label: 'Pop',                wave: 'sine',     from: 520,  to: 160,  length: .09,  volume: .2},
  wood:       {label: 'Holzklopfen',        wave: 'sine',     from: 900,  to: 600,  length: .06,  volume: .22},
  off:        {label: 'Aus'},
};
let soundName = DEFAULTS.sound in SOUNDS ? DEFAULTS.sound : 'tick';
let audioContext = null;

function playSound(){
  const sound = SOUNDS[soundName];
  if (!sound.wave) return;
  try{
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    for (const offset of sound.repeat || [0]){
      const now = audioContext.currentTime + offset;
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
    }
  }catch{}
}
