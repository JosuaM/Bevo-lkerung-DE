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

/* Klang der Ereignisse auf Animation 2: erscheint ein Ereignis, läuft einer dieser Töne (ebenfalls synthetisch).
   noise = Rauschen mit gleitendem Filter (Wisch), tones = Folge von Tönen {wave, from, to, at, length, volume}. */
const EVENT_SOUNDS = {
  whoosh:  {label: 'Wisch (weich)',   noise: {from: 400,  to: 3600, length: .45, volume: .22, q: 1.2}},
  swipe:   {label: 'Wisch (schnell)', noise: {from: 1200, to: 6000, length: .2,  volume: .2,  q: 2}},
  plop:    {label: 'Plop (Videospiel)', tones: [{wave: 'sine', from: 280, to: 760, at: 0, length: .14, volume: .3}]},
  bubble:  {label: 'Blubb',           tones: [{wave: 'sine', from: 380, to: 1100, at: 0, length: .09, volume: .26}, {wave: 'sine', from: 520, to: 1500, at: .08, length: .1, volume: .2}]},
  sparkle: {label: 'Glitzern',        noise: {from: 600, to: 3000, length: .3, volume: .1, q: 1}, tones: [{wave: 'triangle', from: 1320, to: 1320, at: .12, length: .18, volume: .12}, {wave: 'triangle', from: 1760, to: 1760, at: .2, length: .25, volume: .1}]},
  off:     {label: 'Aus'},
};
let eventSoundName = DEFAULTS.evsound in EVENT_SOUNDS ? DEFAULTS.evsound : 'whoosh';

function playEventSound(){
  const sound = EVENT_SOUNDS[eventSoundName];
  if (!sound.noise && !sound.tones) return;
  try{
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const start = audioContext.currentTime;
    const {noise} = sound;
    if (noise){
      const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * noise.length), audioContext.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      const source = audioContext.createBufferSource(), filter = audioContext.createBiquadFilter(), gain = audioContext.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.Q.value = noise.q;
      filter.frequency.setValueAtTime(noise.from, start);
      filter.frequency.exponentialRampToValueAtTime(noise.to, start + noise.length);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(noise.volume, start + noise.length * .35);
      gain.gain.exponentialRampToValueAtTime(.0001, start + noise.length);
      source.connect(filter).connect(gain).connect(audioContext.destination);
      source.start(start);
    }
    for (const tone of sound.tones || []){
      const now = start + tone.at, oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = tone.wave;
      oscillator.frequency.setValueAtTime(tone.from, now);
      oscillator.frequency.exponentialRampToValueAtTime(tone.to, now + tone.length * .8);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(tone.volume, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + tone.length);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + tone.length + .01);
    }
  }catch{}
}
