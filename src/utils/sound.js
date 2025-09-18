// small helper that keeps a single AudioContext
let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq = 440, duration = 0.12, type = "sine", vol = 0.06) {
  const ctx = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  setTimeout(() => {
    o.stop();
  }, duration * 1000);
}

// exported functions
export function playCorrect() {
  // two quick ascending tones
  playTone(880, 0.12, "sine", 0.08);
  setTimeout(() => playTone(1320, 0.09, "sine", 0.07), 120);
}
export function playWrong() {
  // low buzzy note
  playTone(180, 0.35, "sawtooth", 0.12);
}
