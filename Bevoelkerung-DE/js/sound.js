/* Klang der Balken auf der Differenz-Folie und beim Zählen auf der Ergebnis-Folie: kurzer, hoher Tick, synthetisch erzeugt (keine Audiodatei). */
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

/* Mausklick-Geräusch: wird mit „Neustart für Aufnahme“ aktiv und bleibt über den Neustart hinweg, bis die Seite manuell neu geladen wird. */
const CLICK_FLAG = 'clickSound';
const CLICK_FILE = 'sounds/click.mp3';
let clickSoundOn = false;
try{
  const nav = performance.getEntriesByType('navigation')[0];
  if (nav && nav.type === 'reload') sessionStorage.removeItem(CLICK_FLAG);
  clickSoundOn = sessionStorage.getItem(CLICK_FLAG) === '1';
}catch{}
function playClick(){
  try{ if (clickVolume <= 0) return; const a = new Audio(CLICK_FILE); a.volume = clickVolume / 100; a.play().catch(() => {}); }catch{}
}
function enableClickSound(){
  clickSoundOn = true;
  try{ sessionStorage.setItem(CLICK_FLAG, '1'); }catch{}
}
document.addEventListener('pointerdown', () => { if (clickSoundOn) playClick(); }, true);
