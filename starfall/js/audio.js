let ctx = null, master = null, musicGain = null, on = { sound: true, music: true };
const MUSIC_LEVEL = .75, XF = 2.5;
const TRACKS = {
  theme: { src: 'music/theme.mp3', loop: [37.384, 116.796] },
  verge: { src: 'music/verge.mp3', loop: [23.452, 129.033] },
  dunes: { src: 'music/dunes.mp3', loop: [7.059, 67.361] },
  lattice: { src: 'music/lattice.mp3', loop: [25.751, 117.029] },
  boss: { src: 'music/boss.mp3', loop: [17.183, 103.747] }
};
const bytes = {}, decoded = {}, lead = {};
let want = null, cur = null, timer = null;

export function audioInit(settings) {
  on = settings;
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
    setMusic(on.music);
    if (want) { const w = want; want = null; playTrack(w); }
  } catch (e) { ctx = null; }
}
export function audioResume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
export function audioSuspend() { if (ctx && ctx.state === 'running') ctx.suspend(); }
let ducked = false;
const level = () => (on.music && !ducked ? MUSIC_LEVEL : 0);
export function duck(v) { ducked = v; if (musicGain) musicGain.gain.setTargetAtTime(level(), ctx.currentTime, .8); }
export function setMusic(v) { on.music = v; if (musicGain) musicGain.gain.setTargetAtTime(level(), ctx.currentTime, .6); }

function fetchBytes(name) {
  if (!bytes[name]) bytes[name] = fetch(TRACKS[name].src).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).catch(e => { delete bytes[name]; throw e; });
  return bytes[name];
}
export function musicState() { return { want, cur: cur && cur.name, t0: cur && cur.t0, off: cur && cur.off, now: ctx && ctx.currentTime, gain: musicGain && musicGain.gain.value, decoded: Object.keys(decoded) }; }
export function prefetchTrack(name) { if (TRACKS[name]) fetchBytes(name).catch(() => {}); }
function decode(name) {
  if (!decoded[name]) decoded[name] = fetchBytes(name).then(ab => new Promise((res, rej) => ctx.decodeAudioData(ab.slice(0), res, rej))).then(buf => {
    const d = buf.getChannelData(0); let i = 0; const n = Math.min(d.length, 8192);
    while (i < n && Math.abs(d[i]) < 1e-4) i++;
    lead[name] = i < n ? i / buf.sampleRate : 0;
    return buf;
  }).catch(e => { delete decoded[name]; throw e; });
  return decoded[name];
}
function evict(keep) { for (const k of Object.keys(decoded)) if (!keep.includes(k)) delete decoded[k]; }
function curve(up) { const n = 32, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1); c[i] = up ? Math.sin(x * Math.PI / 2) : Math.cos(x * Math.PI / 2); } return c; }
function voice(buf, name, when, offset, fade) {
  const src = ctx.createBufferSource(), g = ctx.createGain();
  src.buffer = buf; src.connect(g); g.connect(musicGain);
  if (fade) { g.gain.setValueAtTime(0, when); g.gain.setValueCurveAtTime(curve(true), when, fade); } else g.gain.value = 1;
  src.start(when, offset + lead[name]);
  return { src, g };
}
function release(v, when, fade) {
  try { v.g.gain.cancelScheduledValues(when); v.g.gain.setValueAtTime(1, when); v.g.gain.setValueCurveAtTime(curve(false), when, fade); v.src.stop(when + fade + .05); } catch (e) { try { v.src.stop(); } catch (e2) {} }
}
function tick() {
  if (!cur || !ctx) return;
  const T = TRACKS[cur.name], [S, E] = T.loop, t = ctx.currentTime;
  const boundary = cur.t0 + (E - cur.off);
  if (boundary - t < 1.5) {
    const nv = voice(cur.buf, cur.name, boundary, S, XF);
    release(cur.v, boundary, XF);
    cur = { name: cur.name, buf: cur.buf, v: nv, t0: boundary, off: S };
  }
}
export function playTrack(name) {
  if (!TRACKS[name]) return;
  if (!ctx) { want = name; return; }
  if (want === name) return;
  want = name;
  decode(name).then(buf => {
    if (want !== name || (cur && cur.name === name)) return;
    const t = ctx.currentTime + .05;
    if (cur) release(cur.v, t, 1.6);
    const prev = cur ? cur.name : null;
    cur = { name, buf, v: voice(buf, name, t, 0, prev ? 2 : .4), t0: t, off: 0 };
    evict([name, prev]);
    if (!timer) timer = setInterval(tick, 250);
  }).catch(() => { if (want === name) want = null; });
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
    case 'pistol': tone('square', 900, 180, .07, .05); noise(.05, .12, 3200); break;
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
