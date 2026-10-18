/* Klang der Balken auf der Differenz-Folie: kurzer, hoher Tick, synthetisch erzeugt (keine Audiodatei). */
const SOUND = {wave: 'square', from: 3600, to: 3000, length: .015, volume: .03};
let audioContext = null;

function playSound(){
  const sound = SOUND;
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

/* Mausklick-Geräusch (Neustart für Aufnahme): kurzer gefilterter Rauschimpuls */
function playClick(){
  try{
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime, length = .03;
    const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * length), audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    const source = audioContext.createBufferSource(), filter = audioContext.createBiquadFilter(), gain = audioContext.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    gain.gain.value = .5;
    source.connect(filter).connect(gain).connect(audioContext.destination);
    source.start(now);
  }catch{}
}
