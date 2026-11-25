import { CALLINGS, LOCKED_CALLINGS, ART } from './data.js?v=2.1';
import { fresh, load, save, offlineRewards } from './state.js?v=2.1';
import { UI } from './ui.js?v=2.1';
import { WorldScene } from './world.js?v=2.1';
import { audioInit, audioResume, audioSuspend, sfx, playTrack, prefetchTrack } from './audio.js?v=2.1';

const $ = s => document.querySelector(s);
let game = null, ui = null, st = null;

function view() {
  const W = window.innerWidth, H = window.innerHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const Z = Math.max(.85, Math.min(1.5, W / 400));
  const TS = Math.min(3, Math.ceil(dpr * Z));
  return { W, H, dpr, Z, TS };
}

function stars() {
  const c = document.createElement('canvas'); c.className = 'stars'; $('#title').prepend(c);
  const x = c.getContext('2d'); let w, h; const S = [];
  const size = () => { w = c.width = innerWidth * Math.min(2, devicePixelRatio || 1); h = c.height = innerHeight * Math.min(2, devicePixelRatio || 1); };
  size(); addEventListener('resize', size);
  for (let i = 0; i < 160; i++) S.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .3, t: Math.random() * 6, s: Math.random() * .6 + .2 });
  let fall = { x: .7, y: -.1, t: 0 };
  const loop = (ms) => {
    if (!c.isConnected) return;
    x.clearRect(0, 0, w, h);
    for (const s of S) { const a = .35 + .65 * Math.abs(Math.sin(ms / 1000 * s.s + s.t)); x.fillStyle = `rgba(200,240,255,${a})`; x.beginPath(); x.arc(s.x * w, s.y * h, s.r * (w / 800 + .5), 0, 7); x.fill(); }
    fall.t += .004; const fx = (fall.x - fall.t * .5) * w, fy = (fall.y + fall.t) * h;
    const g = x.createLinearGradient(fx, fy, fx + w * .12, fy - h * .24); g.addColorStop(0, 'rgba(159,246,255,.9)'); g.addColorStop(1, 'rgba(159,246,255,0)');
    x.strokeStyle = g; x.lineWidth = 3 * (w / 800 + .5); x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + w * .12, fy - h * .24); x.stroke();
    if (fall.t > 1.4) fall = { x: .4 + Math.random() * .6, y: -.1, t: 0 };
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function titleScreen() {
  const t = $('#title');
  const saved = load();
  t.innerHTML = `<div class="home"><div><div class="logo">WYRMBOUND</div><div class="sub">STARFALL</div></div><div><div class="tag2">Bond an Echo. Hunt the bones of fallen stars.</div><button class="btn go">${saved ? 'Continue' : 'Begin'}</button></div></div><div class="foot">Build 2.1 · Act II: The Singing Dark · now with music</div>`;
  stars();
  $('#title .go').onclick = () => {
    audioInit((saved || { settings: { sound: true, music: true } }).settings); audioResume(); sfx('quest'); playTrack('theme'); prefetchTrack(saved && saved.region === 'dunes' ? 'dunes' : 'verge');
    if (saved) { st = saved; start(true); } else intro();
  };
}

function intro() {
  $('#title').classList.add('deep'); $('#title .home').remove();
  const t = document.createElement('div'); t.className = 'in'; $('#title').appendChild(t);
  t.innerHTML = `<div class="intro"><p>Twelve thousand years ago, nine living starships fell out of the sky onto the planet Aurelis, and died there.</p><p style="animation-delay:1.2s">Three hundred years ago, the colony ark <b>Meridian</b> came down beside their bones. Its people built a city in the hull and lit it with <b style="color:var(--teal)">Lumen</b>, the crystal the dead ships left behind.</p><p style="animation-delay:2.4s">You are the newest hunter of the Beacon Lodge. Your Lumen-link went in this morning. Out in the Glasswood Verge, something has been waiting for you.</p></div><button class="btn go" style="margin-top:12px;opacity:0;animation:fadein .6s forwards 3.2s">Choose your Calling</button>`;
  $('#title .go').onclick = () => { sfx('ui'); pick(); };
}

function pick() {
  const t = $('#title .in'); let sel = 'vanguard';
  t.innerHTML = `<div class="h1">Choose your Calling</div><div class="cls"></div><button class="btn gold go" style="margin-top:16px">Begin as Vanguard</button>`;
  const box = $('.cls', t);
  for (const [k, C] of Object.entries(CALLINGS)) {
    const c = document.createElement('button'); c.className = 'clsc' + (k === sel ? ' sel' : ''); c.dataset.k = k;
    c.innerHTML = `<img src="${ART.calling[k]}" alt=""><div class="grow"><div class="n">${C.name}</div><div class="r">${C.role}</div><div class="b">${C.blurb}</div></div>`;
    c.onclick = () => { sel = k; for (const e of box.children) e.classList.toggle('sel', e.dataset.k === k); $('#title .go').textContent = 'Begin as ' + C.name; sfx('ui'); };
    box.appendChild(c);
  }
  for (const L of LOCKED_CALLINGS) { const c = document.createElement('div'); c.className = 'clsc lock'; c.innerHTML = `${L.art ? `<img src="${ART.calling[L.art]}" alt="">` : ''}<div class="grow"><div class="n">${L.name}</div><div class="r">${L.role} · unlocks in Act II</div><div class="b">${L.blurb}</div></div>`; box.appendChild(c); }
  $('#title .go').onclick = () => { st = fresh(sel); save(st); start(false); };
}

function start(returning) {
  const v = view();
  ui = new UI(st);
  const t = $('#title'); t.style.transition = 'opacity .6s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 650);
  game = new Phaser.Game({
    type: Phaser.AUTO, parent: 'game', width: Math.round(v.W * v.dpr), height: Math.round(v.H * v.dpr), backgroundColor: '#0b2226', banner: false,
    scale: { mode: Phaser.Scale.NONE }, render: { antialias: true, powerPreference: 'high-performance' }, input: { activePointers: 2 }, fps: { target: 60 }
  });
  const fit = () => { const c = game.canvas; if (c) { c.style.width = v.W + 'px'; c.style.height = v.H + 'px'; } };
  game.events.once('ready', () => {
    fit();
    let readyOnce = false;
    const onReady = w => {
      window.__W = w; if (readyOnce) return; readyOnce = true;
      if (returning) { const r = offlineRewards(st); if (r) ui.offline(r, () => { st.lumen += r.lumen; w.gainXp(r.xp); ui.lumenBump(); save(st); }); }
      else { ui.banner('Landfall', 'Act I', 'Glasswood Verge'); }
    };
    ui.show();
    game.scene.add('world', WorldScene, true, { ui, state: st, TS: v.TS, Z: v.Z, dpr: v.dpr, onReady });
  });
  addEventListener('resize', () => {
    const n = view(); v.W = n.W; v.H = n.H;
    game.scale.resize(Math.round(n.W * v.dpr), Math.round(n.H * v.dpr)); fit();
    const w = game.scene.getScene('world'); if (w && w.cameras) w.setZoom(n.Z, v.dpr);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { save(st); audioSuspend(); } else audioResume(); });
  addEventListener('pagehide', () => save(st));
  document.addEventListener('pointerdown', audioResume, { passive: true });
}

(async () => {
  try { await Promise.race([Promise.all(['500', '600', '700'].map(w => document.fonts.load(`${w} 16px "Chakra Petch"`))), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  titleScreen();
})();
