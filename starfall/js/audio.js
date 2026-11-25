let ctx = null, master = null, musicGain = null, on = { sound: true, music: true }, musicNodes = null;

export function audioInit(settings) {
  on = settings;
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
    startMusic();
    setMusic(on.music);
  } catch (e) { ctx = null; }
}
export function audioResume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
export function setMusic(v) { on.music = v; if (musicGain) musicGain.gain.setTargetAtTime(v ? .16 : 0, ctx.currentTime, .6); }

function startMusic() {
  const notes = [146.83, 174.61, 220, 261.63, 196, 220];
  const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 900; filt.Q.value = 2; filt.connect(musicGain);
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .05; lg.gain.value = 500; lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
  const pads = [0, 1, 2].map(i => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = i === 2 ? 'triangle' : 'sawtooth'; o.detune.value = (i - 1) * 7; g.gain.value = i === 2 ? .5 : .18; o.connect(g); g.connect(filt); o.start(); return o; });
  let step = 0;
  const tick = () => {
    if (!ctx) return;
    const f = notes[step % notes.length]; const t = ctx.currentTime;
    pads[0].frequency.setTargetAtTime(f, t, 1.2); pads[1].frequency.setTargetAtTime(f * 1.5, t, 1.2); pads[2].frequency.setTargetAtTime(f / 2, t, 1.2);
    if (on.music && step % 2 === 0) bell([f * 2, f * 3, f * 4][step % 3], .05, 2.4, musicGain);
    step++; setTimeout(tick, 4200);
  };
  tick();
  musicNodes = pads;
}

function bell(f, vol, dur, dest = master) {
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .05);
}
function tone(type, f0, f1, dur, vol = .2, delay = 0) {
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, vol = .2, freq = 2000, delay = 0) {
  const t = ctx.currentTime + delay, n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .8; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(master); s.start(t);
}
const last = {};
export function sfx(name) {
  if (!ctx || !on.sound) return;
  const now = performance.now(); if (last[name] && now - last[name] < 45) return; last[name] = now;
  switch (name) {
    case 'hit': noise(.06, .12, 1800); break;
    case 'crit': noise(.09, .2, 2600); tone('square', 880, 440, .08, .05); break;
    case 'slash': noise(.12, .1, 4200); break;
    case 'rail': tone('sawtooth', 1400, 200, .14, .07); noise(.05, .08, 5000); break;
    case 'orb': tone('sine', 520, 980, .16, .08); break;
    case 'skill': tone('triangle', 330, 660, .18, .1); break;
    case 'ult': tone('sawtooth', 110, 880, .5, .12); bell(660, .12, 1.2); bell(990, .08, 1.4); break;
    case 'echo': bell(1046, .08, .5); bell(1568, .05, .6); break;
    case 'die': tone('triangle', 600, 120, .2, .08); break;
    case 'bossdie': tone('sawtooth', 220, 40, 1.2, .15); noise(.8, .2, 400); break;
    case 'boss': tone('sawtooth', 70, 50, 1.2, .15); noise(.6, .12, 300); break;
    case 'pickup': bell(1318 + Math.random() * 200, .05, .18); break;
    case 'pickup2': bell(880, .07, .4); bell(1320, .05, .5); break;
    case 'level': [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, .25, .1, i * .08)); break;
    case 'quest': [784, 988, 1175].forEach((f, i) => tone('sine', f, f, .3, .09, i * .09)); break;
    case 'gear': bell(740, .08, .6); bell(1110, .06, .8); break;
    case 'down': tone('sine', 440, 110, .9, .12); break;
    case 'sync': tone('sine', 220, 880, .5, .1); break;
    case 'spike': noise(.18, .2, 900); break;
    case 'tap': tone('sine', 900, 1200, .05, .05); break;
    case 'ui': tone('sine', 700, 900, .05, .05); break;
    case 'hatch': [523, 784, 1046, 1568].forEach((f, i) => bell(f, .08, 1, master)); break;
  }
}
