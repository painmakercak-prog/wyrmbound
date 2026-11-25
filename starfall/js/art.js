const OL = '#0b1620';

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function mk(w, h, S, fn) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * S); c.height = Math.ceil(h * S);
  const x = c.getContext('2d');
  x.scale(S, S); x.lineJoin = 'round'; x.lineCap = 'round';
  fn(x, w, h);
  c.unitW = w; c.unitH = h;
  return c;
}

function poly(x, pts) { x.beginPath(); x.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.closePath(); }
function ell(x, cx, cy, rx, ry) { x.beginPath(); x.ellipse(cx, cy, Math.max(.1, rx), Math.max(.1, ry), 0, 0, Math.PI * 2); }
function rr(x, X, Y, w, h, r) { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, h, r) : x.rect(X, Y, w, h); }
function lg(x, x0, y0, x1, y1, stops) { const g = x.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(s[0] ?? i / (stops.length - 1), s[1] ?? s)); return g; }
function rg(x, cx, cy, r, stops) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
function fillStroke(x, fill, lw = 2, stroke = OL) { x.fillStyle = fill; x.fill(); if (lw) { x.lineWidth = lw; x.strokeStyle = stroke; x.stroke(); } }
function glow(x, cx, cy, r, color, a = .5) { x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = rg(x, cx, cy, r, [[0, hexA(color, a)], [1, hexA(color, 0)]]); x.fillRect(cx - r, cy - r, r * 2, r * 2); x.restore(); }
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join(''); }

function shard(x, bx, by, w, h, lean, cTop, cBot, alpha = .92) {
  const tipX = bx + lean, tipY = by - h;
  const pts = [bx - w / 2, by, bx - w * .62 + lean * .3, by - h * .38, tipX, tipY, bx + w * .62 + lean * .35, by - h * .42, bx + w / 2, by];
  x.save(); x.globalAlpha = alpha;
  poly(x, pts); fillStroke(x, lg(x, bx, by, tipX, tipY, [[0, cBot], [1, cTop]]), 1.6);
  x.globalAlpha = alpha * .45;
  poly(x, [bx - w / 2, by, bx - w * .62 + lean * .3, by - h * .38, tipX, tipY, bx + lean * .2, by - h * .3]); x.fillStyle = shade(cBot, -.35); x.fill();
  x.globalAlpha = .55; x.beginPath(); x.moveTo(bx + w * .2, by - h * .12); x.lineTo(tipX + w * .05, tipY + h * .12); x.lineWidth = 1.2; x.strokeStyle = '#ffffff'; x.stroke();
  x.restore();
}

function eye(x, cx, cy, r, iris = '#0b1620', look = 0) {
  ell(x, cx, cy, r * .82, r); x.fillStyle = '#ffffff'; x.fill(); x.lineWidth = 1.2; x.strokeStyle = OL; x.stroke();
  ell(x, cx + look, cy + r * .12, r * .55, r * .7); x.fillStyle = iris; x.fill();
  ell(x, cx + look - r * .22, cy - r * .3, r * .22, r * .26); x.fillStyle = '#ffffff'; x.fill();
}

const SKIN = { light: '#f6d2b3', tan: '#d9a27c', deep: '#8a5638', dark: '#6b412b' };

export function drawChar(x, o) {
  const cx = 32;
  x.save();
  if (o.back) o.back(x, cx);
  if (o.hairBack) o.hairBack(x, cx);
  const coat = o.coat, trim = o.trim;
  ell(x, cx - 14, 47, 5, 7); fillStroke(x, shade(coat, -.15), 1.8);
  ell(x, cx + 14, 47, 5, 7); fillStroke(x, shade(coat, -.15), 1.8);
  rr(x, cx - 13, 38, 26, o.long ? 27 : 22, 9); fillStroke(x, lg(x, cx, 38, cx, 62, [[0, shade(coat, .12)], [1, shade(coat, -.25)]]), 2);
  if (o.chest) o.chest(x, cx);
  x.beginPath(); x.moveTo(cx - 13, 52); x.lineTo(cx + 13, 52); x.lineWidth = 3; x.strokeStyle = trim; x.stroke();
  ell(x, cx - 14, 51, 3.4, 3.4); fillStroke(x, o.skin, 1.4);
  ell(x, cx + 14, 51, 3.4, 3.4); fillStroke(x, o.skin, 1.4);
  ell(x, cx, 24, 17, 16.5); fillStroke(x, lg(x, cx, 10, cx, 40, [[0, shade(o.skin, .08)], [1, shade(o.skin, -.12)]]), 2);
  ell(x, cx - 9.5, 30, 3, 1.8); x.fillStyle = 'rgba(255,120,120,.28)'; x.fill();
  ell(x, cx + 9.5, 30, 3, 1.8); x.fill();
  eye(x, cx - 6, 25.5, 3.6, o.iris || '#22324a');
  eye(x, cx + 6, 25.5, 3.6, o.iris || '#22324a');
  x.beginPath(); x.moveTo(cx - 2, 32); x.quadraticCurveTo(cx, 33.6, cx + 2, 32); x.lineWidth = 1.3; x.strokeStyle = OL; x.stroke();
  if (o.hair) o.hair(x, cx);
  if (o.front) o.front(x, cx);
  x.restore();
}

export const LOOKS = {
  vanguard: {
    skin: SKIN.tan, coat: '#2f4a6b', trim: '#ffcf5a', iris: '#1d3b5a',
    chest: (x, cx) => { rr(x, cx - 10, 39, 20, 13, 5); fillStroke(x, lg(x, cx, 39, cx, 52, [[0, '#ffc56a'], [1, '#b8692a']]), 1.6); ell(x, cx, 45, 2.8, 2.8); fillStroke(x, '#5ff2ff', 1.2); glow(x, cx, 45, 7, '#5ff2ff', .7);
      ell(x, cx - 13, 40, 6, 4.5); fillStroke(x, '#e8a650', 1.6); ell(x, cx + 13, 40, 6, 4.5); fillStroke(x, '#e8a650', 1.6); },
    hair: (x, cx) => { x.beginPath(); x.ellipse(cx, 19, 18, 14, 0, Math.PI, 0); x.closePath(); fillStroke(x, lg(x, cx, 5, cx, 20, [[0, '#ffd27a'], [1, '#b8742c']]), 2);
      rr(x, cx - 15, 17, 30, 5, 2.5); fillStroke(x, '#5ff2ff', 1.4); glow(x, cx, 19, 16, '#5ff2ff', .35);
      poly(x, [cx - 3, 6, cx, -2, cx + 3, 6]); fillStroke(x, '#ff7a4a', 1.4); }
  },
  railwarden: {
    skin: SKIN.light, coat: '#1f6a6a', trim: '#d9c47a', iris: '#3a2a1a', long: true,
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 12, 39); x.quadraticCurveTo(cx, 46, cx + 12, 39); x.lineTo(cx + 9, 44); x.quadraticCurveTo(cx, 50, cx - 9, 44); x.closePath(); fillStroke(x, '#7a8a4a', 1.6);
      x.beginPath(); x.moveTo(cx - 9, 44); x.lineTo(cx + 11, 60); x.lineWidth = 3; x.strokeStyle = '#4a3420'; x.stroke(); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 18, 26); x.quadraticCurveTo(cx - 20, 4, cx, 4); x.quadraticCurveTo(cx + 20, 4, cx + 18, 26); x.quadraticCurveTo(cx + 12, 13, cx, 13); x.quadraticCurveTo(cx - 12, 13, cx - 18, 26); x.closePath(); fillStroke(x, lg(x, cx, 4, cx, 26, [[0, '#8ea05a'], [1, '#56602e']]), 2);
      ell(x, cx - 6, 14, 4.6, 4); fillStroke(x, '#ffb648', 1.6); ell(x, cx + 6, 14, 4.6, 4); fillStroke(x, '#ffb648', 1.6);
      ell(x, cx - 7, 13, 1.4, 1.2); x.fillStyle = '#fff6d0'; x.fill(); ell(x, cx + 5, 13, 1.4, 1.2); x.fill(); }
  },
  psion: {
    skin: SKIN.light, coat: '#e9e4f5', trim: '#b46bff', iris: '#7a3cff', long: true,
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx, 39); x.lineTo(cx, 63); x.lineWidth = 2.4; x.strokeStyle = '#b46bff'; x.stroke(); glow(x, cx, 50, 10, '#c58bff', .45);
      x.beginPath(); x.moveTo(cx - 5, 46); x.lineTo(cx, 42); x.lineTo(cx + 5, 46); x.lineTo(cx, 50); x.closePath(); x.fillStyle = '#e7d0ff'; x.fill(); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 19, 34); x.quadraticCurveTo(cx - 22, 2, cx, 2); x.quadraticCurveTo(cx + 22, 2, cx + 19, 34); x.quadraticCurveTo(cx + 15, 14, cx, 14); x.quadraticCurveTo(cx - 15, 14, cx - 19, 34); x.closePath(); fillStroke(x, lg(x, cx, 2, cx, 34, [[0, '#ffffff'], [1, '#c9bfe6']]), 2);
      x.beginPath(); x.moveTo(cx - 13, 16); x.quadraticCurveTo(cx, 11, cx + 13, 16); x.lineWidth = 2; x.strokeStyle = '#b46bff'; x.stroke();
      poly(x, [cx, 11, cx + 3, 15, cx, 19, cx - 3, 15]); fillStroke(x, '#d9a8ff', 1.2); glow(x, cx, 15, 9, '#c58bff', .8); }
  },
  marr: {
    skin: SKIN.tan, coat: '#203a5c', trim: '#ffcf5a', iris: '#3a4a5a',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 12, 40); x.lineTo(cx + 12, 56); x.lineWidth = 4; x.strokeStyle = '#ffcf5a'; x.stroke();
      ell(x, cx - 13, 40, 6.5, 4.8); fillStroke(x, '#d99a4a', 1.6); ell(x, cx + 13, 40, 6.5, 4.8); fillStroke(x, '#d99a4a', 1.6); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 24); x.quadraticCurveTo(cx - 19, 6, cx, 6); x.quadraticCurveTo(cx + 19, 6, cx + 17, 22); x.lineTo(cx + 9, 14); x.lineTo(cx + 2, 17); x.lineTo(cx - 6, 13); x.lineTo(cx - 13, 18); x.closePath(); fillStroke(x, lg(x, cx, 6, cx, 24, [[0, '#ffffff'], [1, '#aab4c2']]), 2);
      x.beginPath(); x.moveTo(cx + 3.5, 20); x.lineTo(cx + 8.5, 23); x.lineWidth = 1.2; x.strokeStyle = '#b06a50'; x.stroke(); }
  },
  sparks: {
    skin: SKIN.light, coat: '#6b4a2e', trim: '#ffcf5a', iris: '#2a6a3a',
    chest: (x, cx) => { rr(x, cx - 8, 41, 16, 15, 3); fillStroke(x, '#8a5a34', 1.4); x.beginPath(); x.moveTo(cx - 13, 41); x.lineTo(cx + 13, 41); x.lineWidth = 2.2; x.strokeStyle = '#d9a45a'; x.stroke(); },
    hairBack: (x, cx) => { ell(x, cx + 4, 6, 8, 7); fillStroke(x, '#ff7a3a', 2); x.beginPath(); x.moveTo(cx + 2, 3); x.lineTo(cx + 12, -2); x.lineWidth = 2; x.strokeStyle = '#ffd24a'; x.stroke(); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 18, 26); x.quadraticCurveTo(cx - 19, 6, cx, 7); x.quadraticCurveTo(cx + 19, 6, cx + 18, 26); x.quadraticCurveTo(cx + 13, 15, cx + 4, 16); x.lineTo(cx - 3, 13); x.quadraticCurveTo(cx - 12, 16, cx - 18, 26); x.closePath(); fillStroke(x, lg(x, cx, 6, cx, 26, [[0, '#ff9a4a'], [1, '#d9502a']]), 2);
      rr(x, cx - 14, 9, 28, 5, 2.5); fillStroke(x, '#5a4030', 1.4); ell(x, cx - 6, 11.5, 4.2, 3.6); fillStroke(x, '#8af0ff', 1.4); ell(x, cx + 6, 11.5, 4.2, 3.6); fillStroke(x, '#8af0ff', 1.4);
      ell(x, cx + 9, 30, 2.2, 1.2); x.fillStyle = 'rgba(40,30,25,.55)'; x.fill(); }
  },
  okafor: {
    skin: SKIN.deep, coat: '#eef3f5', trim: '#2fbfb0', iris: '#2a1a10',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx, 38); x.lineTo(cx, 62); x.lineWidth = 1.6; x.strokeStyle = '#9fb6bf'; x.stroke(); rr(x, cx + 3, 43, 6, 5, 1.5); fillStroke(x, '#2fbfb0', 1); },
    hairBack: (x, cx) => { for (const [a, b] of [[-15, -21], [-11, -19], [11, 19], [15, 21]]) { x.beginPath(); x.moveTo(cx + a, 18); x.quadraticCurveTo(cx + b, 32, cx + b * .9, 44); x.lineWidth = 5; x.strokeStyle = OL; x.stroke(); x.lineWidth = 3.2; x.strokeStyle = '#2a1c18'; x.stroke(); } },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 22); x.quadraticCurveTo(cx - 18, 5, cx, 5); x.quadraticCurveTo(cx + 18, 5, cx + 17, 22); x.quadraticCurveTo(cx + 9, 11, cx, 12); x.quadraticCurveTo(cx - 9, 11, cx - 17, 22); x.closePath(); fillStroke(x, '#2a1c18', 2);
      rr(x, cx - 12, 22.5, 24, 6, 3); x.fillStyle = 'rgba(95,242,208,.35)'; x.fill(); x.lineWidth = 1.4; x.strokeStyle = '#2fbfb0'; x.stroke(); }
  }
};

function charCanvas(S, look) { return mk(64, 68, S, x => drawChar(x, look)); }
export function portraitCanvas(look, size = 128) {
  const k = size / 44;
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const x = c.getContext('2d');
  x.fillStyle = rg(x, size / 2, size * .45, size * .7, [[0, '#18384a'], [1, '#0a1622']]); x.fillRect(0, 0, size, size);
  x.save(); x.translate(size / 2 - 32 * k, -2 * k); x.scale(k, k); x.lineJoin = 'round'; x.lineCap = 'round'; drawChar(x, look); x.restore();
  return c;
}

const ECHO_DRAW = {
  skein: (x) => {
    glow(x, 26, 22, 26, '#9fdcff', .45);
    const pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([8 + t * 36, 24 + Math.sin(t * Math.PI * 2 + .6) * 7, 7.5 - t * 5.5]); }
    for (let i = pts.length - 1; i >= 0; i--) { const [px, py, r] = pts[i]; ell(x, px, py, r, r); x.fillStyle = lg(x, px, py - r, px, py + r, [[0, '#f2fbff'], [1, '#7fc8ff']]); x.fill(); }
    x.save(); x.globalAlpha = .9; for (let i = 1; i < 12; i += 2) { const [px, py, r] = pts[i]; poly(x, [px - 2, py - r + 1, px, py - r - 3.5, px + 2, py - r + 1]); x.fillStyle = '#ffffff'; x.fill(); } x.restore();
    poly(x, [14, 22, 22, 10, 21, 22]); x.fillStyle = 'rgba(200,240,255,.75)'; x.fill();
    ell(x, 9, 23, 8.5, 7.5); x.fillStyle = lg(x, 9, 15, 9, 31, [[0, '#ffffff'], [1, '#9fd8ff']]); x.fill(); x.lineWidth = 1.2; x.strokeStyle = 'rgba(40,90,140,.6)'; x.stroke();
    ell(x, 6, 22, 2.2, 2.6); x.fillStyle = '#16c8c0'; x.fill(); ell(x, 5.4, 21.2, .8, .9); x.fillStyle = '#fff'; x.fill();
    glow(x, 6, 22, 6, '#5ff2e0', .8);
  },
  glimmerkit: (x) => {
    x.beginPath(); x.moveTo(36, 30); x.quadraticCurveTo(52, 26, 46, 10); x.lineWidth = 9; x.strokeStyle = OL; x.stroke(); x.lineWidth = 6.5; x.strokeStyle = '#f2e6cf'; x.stroke();
    shard(x, 46, 12, 9, 13, 2, '#bffff6', '#2fbfb0'); glow(x, 46, 6, 12, '#5ff2d0', .8);
    ell(x, 26, 30, 13, 9); fillStroke(x, lg(x, 26, 21, 26, 39, [[0, '#fff3dc'], [1, '#d9c3a0']]), 2);
    for (const fx of [17, 22, 30, 35]) { ell(x, fx, 38, 2.6, 2.6); fillStroke(x, '#e9d8b8', 1.4); }
    poly(x, [10, 12, 8, 0, 18, 9]); fillStroke(x, '#f2e6cf', 1.8); poly(x, [22, 9, 27, 0, 26, 13]); fillStroke(x, '#f2e6cf', 1.8);
    poly(x, [11, 10, 9.5, 3.5, 15, 9]); x.fillStyle = '#5ff2d0'; x.fill();
    ell(x, 17, 19, 10, 9); fillStroke(x, lg(x, 17, 10, 17, 28, [[0, '#fff8ea'], [1, '#e2cfae']]), 2);
    ell(x, 11, 23, 4.5, 3); x.fillStyle = '#fffaf2'; x.fill();
    eye(x, 14, 18, 2.8, '#0f6a6a', -.5); eye(x, 21, 18, 2.8, '#0f6a6a', -.5);
    ell(x, 9.5, 22, 1.3, 1); x.fillStyle = OL; x.fill();
  },
  budlet: (x) => {
    ell(x, 18, 30, 12, 11); fillStroke(x, lg(x, 18, 19, 18, 41, [[0, '#c9a46a'], [1, '#7a5a34']]), 2);
    ell(x, 12, 41, 3.5, 2.4); fillStroke(x, '#5a4026', 1.4); ell(x, 24, 41, 3.5, 2.4); fillStroke(x, '#5a4026', 1.4);
    x.beginPath(); x.moveTo(5, 28); x.quadraticCurveTo(4, 10, 18, 9); x.quadraticCurveTo(32, 10, 31, 28); x.quadraticCurveTo(25, 19, 18, 20); x.quadraticCurveTo(11, 19, 5, 28); x.closePath(); fillStroke(x, lg(x, 18, 9, 18, 28, [[0, '#7ff07a'], [1, '#2f9a4a']]), 2);
    x.beginPath(); x.moveTo(18, 10); x.lineTo(18, 20); x.lineWidth = 1.2; x.strokeStyle = '#1f6a32'; x.stroke();
    ell(x, 18, 6, 5, 5); fillStroke(x, '#ff8ab8', 1.6); glow(x, 18, 6, 12, '#ff8ab8', .8);
    eye(x, 13.5, 28, 3, '#3a2010'); eye(x, 22.5, 28, 3, '#3a2010');
  },
  rivet: (x) => {
    x.beginPath(); x.moveTo(20, 8); x.lineTo(20, 3); x.lineWidth = 2; x.strokeStyle = OL; x.stroke();
    ell(x, 14, 3, 6, 1.8); fillStroke(x, '#9fb6bf', 1.2); ell(x, 26, 3, 6, 1.8); fillStroke(x, '#9fb6bf', 1.2);
    ell(x, 20, 19, 14, 12.5); fillStroke(x, lg(x, 20, 6, 20, 32, [[0, '#ffe08a'], [1, '#b8742c']]), 2);
    x.beginPath(); x.moveTo(7, 19); x.lineTo(33, 19); x.lineWidth = 1.2; x.strokeStyle = 'rgba(80,40,10,.55)'; x.stroke();
    for (const [a, b] of [[10, 13], [30, 13], [10, 25], [30, 25]]) { ell(x, a, b, 1.1, 1.1); x.fillStyle = '#ffe9b0'; x.fill(); }
    ell(x, 20, 18, 6.2, 6.2); fillStroke(x, '#13324a', 1.6); ell(x, 20, 18, 4.2, 4.2); x.fillStyle = rg(x, 20, 18, 4.2, [[0, '#d8ffff'], [1, '#1fb6d6']]); x.fill(); glow(x, 20, 18, 10, '#5ff2ff', .7);
    ell(x, 18.6, 16.6, 1.2, 1.2); x.fillStyle = '#fff'; x.fill();
    x.beginPath(); x.moveTo(7, 24); x.lineTo(3, 30); x.moveTo(33, 24); x.lineTo(37, 30); x.lineWidth = 2.2; x.strokeStyle = '#6a7a84'; x.stroke();
  },
  lumi: (x) => {
    glow(x, 18, 20, 20, '#7fc8ff', .5);
    for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(8 + i * 5, 24); x.bezierCurveTo(6 + i * 5, 32, 12 + i * 5, 36, 8 + i * 5, 44); x.lineWidth = 1.8; x.strokeStyle = i % 2 ? 'rgba(197,139,255,.8)' : 'rgba(127,200,255,.8)'; x.stroke(); }
    x.beginPath(); x.moveTo(3, 24); x.bezierCurveTo(2, 4, 34, 4, 33, 24); x.quadraticCurveTo(28, 27, 23, 24); x.quadraticCurveTo(18, 28, 13, 24); x.quadraticCurveTo(8, 27, 3, 24); x.closePath();
    x.fillStyle = lg(x, 18, 6, 18, 26, [[0, 'rgba(210,240,255,.92)'], [1, 'rgba(150,120,255,.75)']]); x.fill(); x.lineWidth = 1.6; x.strokeStyle = 'rgba(20,40,80,.7)'; x.stroke();
    ell(x, 18, 17, 4.5, 4.5); x.fillStyle = rg(x, 18, 17, 4.5, [[0, '#fffbe0'], [1, '#ffcf5a']]); x.fill(); glow(x, 18, 17, 10, '#ffe08a', .9);
    eye(x, 12.5, 13, 2.2, '#2a1a5a'); eye(x, 23.5, 13, 2.2, '#2a1a5a');
  }
};
const ECHO_SIZE = { skein: [54, 40], glimmerkit: [56, 44], budlet: [36, 46], rivet: [40, 36], lumi: [36, 46] };

export function echoCanvas(id, S) { const [w, h] = ECHO_SIZE[id]; return mk(w, h, S, x => ECHO_DRAW[id](x)); }

export function iconCanvas(kind, color, size = 96) {
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const x = c.getContext('2d'); const k = size / 96; x.scale(k, k); x.lineCap = 'round'; x.lineJoin = 'round';
  const col = '#' + color.toString(16).padStart(6, '0');
  x.fillStyle = rg(x, 48, 40, 60, [[0, shade(col, -.55)], [1, '#08121c']]); ell(x, 48, 48, 46, 46); x.fill();
  x.lineWidth = 3; x.strokeStyle = hexA(col, .9); x.stroke();
  x.save(); x.shadowColor = col; x.shadowBlur = 14; x.strokeStyle = '#ffffff'; x.fillStyle = '#ffffff'; x.lineWidth = 6;
  const G = ICON_GLYPH[kind]; if (G) G(x, col);
  x.restore();
  return c;
}

const ICON_GLYPH = {
  cleave: x => { x.beginPath(); x.arc(48, 56, 30, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); x.beginPath(); x.moveTo(30, 66); x.lineTo(66, 30); x.lineWidth = 5; x.stroke(); },
  bulwark: x => { x.beginPath(); x.moveTo(48, 20); x.lineTo(72, 30); x.quadraticCurveTo(72, 62, 48, 78); x.quadraticCurveTo(24, 62, 24, 30); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(48, 32); x.lineTo(48, 64); x.stroke(); },
  slam: x => { x.beginPath(); x.moveTo(48, 20); x.lineTo(48, 50); x.stroke(); for (const a of [-2.6, -1.9, -1.2, -.5]) { x.beginPath(); x.moveTo(48 + Math.cos(a + Math.PI) * 8, 66); x.lineTo(48 + Math.cos(a + Math.PI) * 30, 66 + Math.sin(a) * 8); x.stroke(); } x.beginPath(); x.moveTo(20, 70); x.lineTo(76, 70); x.stroke(); },
  starbreaker: x => star(x, 48, 48, 30, 12, 8),
  pierce: x => { x.beginPath(); x.moveTo(20, 76); x.lineTo(76, 20); x.stroke(); x.beginPath(); x.moveTo(56, 20); x.lineTo(76, 20); x.lineTo(76, 40); x.stroke(); },
  volley: x => { for (const a of [-.45, 0, .45]) { x.beginPath(); x.moveTo(26, 70); x.lineTo(26 + Math.cos(-.8 + a) * 50, 70 + Math.sin(-.8 + a) * 50); x.stroke(); } },
  drone: x => { x.beginPath(); x.arc(48, 52, 14, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(26, 30); x.lineTo(70, 30); x.moveTo(48, 30); x.lineTo(48, 38); x.stroke(); x.beginPath(); x.arc(48, 52, 4, 0, Math.PI * 2); x.fill(); },
  lance: x => { x.beginPath(); x.moveTo(48, 14); x.lineTo(48, 62); x.lineWidth = 10; x.stroke(); x.lineWidth = 5; x.beginPath(); x.ellipse(48, 70, 24, 7, 0, 0, Math.PI * 2); x.stroke(); },
  pulse: x => { for (const r of [10, 22, 34]) { x.beginPath(); x.arc(48, 48, r, 0, Math.PI * 2); x.lineWidth = r === 34 ? 4 : 5; x.stroke(); } },
  llance: x => { x.beginPath(); x.moveTo(22, 74); x.lineTo(70, 26); x.stroke(); poly(x, [70, 18, 78, 26, 66, 34, 62, 30]); x.fill(); },
  hush: x => { x.setLineDash([6, 8]); x.beginPath(); x.arc(48, 48, 28, 0, Math.PI * 2); x.stroke(); x.setLineDash([]); x.beginPath(); x.arc(48, 48, 6, 0, Math.PI * 2); x.fill(); },
  requiem: x => { x.beginPath(); for (let i = 0; i <= 60; i++) { const px = 18 + i, py = 56 + Math.sin(i / 6) * 10; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); star(x, 48, 30, 14, 6, 5); },
  echo: x => { x.beginPath(); x.arc(48, 48, 20, 0, Math.PI * 2); x.stroke(); },
  weapon: x => { x.beginPath(); x.moveTo(30, 66); x.lineTo(68, 28); x.stroke(); x.beginPath(); x.moveTo(26, 56); x.lineTo(40, 70); x.stroke(); },
  armor: x => { poly(x, [30, 26, 40, 22, 48, 28, 56, 22, 66, 26, 70, 46, 62, 48, 62, 74, 34, 74, 34, 48, 26, 46]); x.lineWidth = 5; x.stroke(); },
  implant: x => { x.strokeRect(32, 32, 32, 32); for (const p of [38, 48, 58]) { x.beginPath(); x.moveTo(p, 24); x.lineTo(p, 32); x.moveTo(p, 64); x.lineTo(p, 72); x.moveTo(24, p); x.lineTo(32, p); x.moveTo(64, p); x.lineTo(72, p); x.lineWidth = 3; x.stroke(); } },
  charm: x => { x.beginPath(); x.moveTo(30, 22); x.quadraticCurveTo(48, 44, 66, 22); x.lineWidth = 3; x.stroke(); x.lineWidth = 5; poly(x, [48, 44, 60, 58, 48, 76, 36, 58]); x.stroke(); }
};
function star(x, cx, cy, R, r, n) { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - Math.PI / 2, rad = i % 2 ? r : R; i ? x.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad) : x.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } x.closePath(); x.fill(); }

export function lumenCanvas(size = 32) { return mk(16, 16, size / 16, x => { glow(x, 8, 8, 8, '#5ff2d0', .6); poly(x, [8, 1, 13, 8, 8, 15, 3, 8]); fillStroke(x, lg(x, 8, 1, 8, 15, [[0, '#e6fffb'], [1, '#2fbfb0']]), 1.2); poly(x, [8, 1, 13, 8, 8, 8]); x.fillStyle = 'rgba(255,255,255,.5)'; x.fill(); }); }
export function shardIconCanvas(size = 32) { return mk(16, 16, size / 16, x => { glow(x, 8, 8, 8, '#c58bff', .6); poly(x, [8, 1, 14, 5, 14, 11, 8, 15, 2, 11, 2, 5]); fillStroke(x, lg(x, 8, 1, 8, 15, [[0, '#f2e6ff'], [1, '#8a4adf']]), 1.2); }); }
export function geodeCanvas(S) {
  return mk(46, 40, S, x => {
    glow(x, 23, 22, 22, '#5ff2d0', .5);
    poly(x, [4, 30, 8, 12, 20, 4, 34, 6, 43, 18, 41, 32, 26, 37, 12, 36]); fillStroke(x, lg(x, 23, 4, 23, 37, [[0, '#5a6e7a'], [1, '#26343e']]), 2);
    poly(x, [14, 28, 18, 14, 25, 9, 31, 15, 33, 27, 24, 32]); x.fillStyle = rg(x, 24, 21, 13, [[0, '#f0fffb'], [.5, '#5ff2d0'], [1, '#1f8a8a']]); x.fill();
    for (const [a, b, c] of [[18, 26, 6], [24, 24, 9], [29, 25, 7]]) shard(x, a, b, 3.4, c, 0, '#f0fffb', '#2fbfb0', 1);
  });
}

export function buildArt(S) {
  const A = {};
  A.soft = mk(64, 64, 1, x => { x.fillStyle = rg(x, 32, 32, 32, [[0, 'rgba(255,255,255,1)'], [.35, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]); x.fillRect(0, 0, 64, 64); });
  A.dot = mk(12, 12, S, x => { x.fillStyle = rg(x, 6, 6, 6, [[0, '#fff'], [.5, 'rgba(255,255,255,.8)'], [1, 'rgba(255,255,255,0)']]); x.fillRect(0, 0, 12, 12); });
  A.spark = mk(24, 6, S, x => { x.fillStyle = lg(x, 0, 3, 24, 3, [[0, 'rgba(255,255,255,0)'], [.7, 'rgba(255,255,255,.9)'], [1, '#fff']]); ell(x, 12, 3, 12, 2.4); x.fill(); });
  A.shadow = mk(48, 16, S, x => { x.save(); x.scale(1, 1 / 3); x.fillStyle = rg(x, 24, 24, 24, [[0, 'rgba(0,10,15,.55)'], [.6, 'rgba(0,10,15,.3)'], [1, 'rgba(0,10,15,0)']]); x.fillRect(0, 0, 48, 48); x.restore(); });
  A.ring = mk(128, 128, S, x => { x.beginPath(); x.arc(64, 64, 58, 0, Math.PI * 2); x.lineWidth = 5; x.strokeStyle = '#fff'; x.stroke(); x.lineWidth = 12; x.strokeStyle = 'rgba(255,255,255,.25)'; x.stroke(); });
  A.slash = mk(90, 90, S, x => {
    x.beginPath(); x.arc(45, 45, 40, -1.15, 1.15); x.arc(38, 45, 28, 1.05, -1.05, true); x.closePath();
    x.fillStyle = lg(x, 45, 5, 45, 85, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]); x.fill();
  });
  A.bolt = mk(34, 8, S, x => { x.fillStyle = lg(x, 0, 4, 34, 4, [[0, 'rgba(95,242,255,0)'], [.6, 'rgba(95,242,255,.9)'], [1, '#ffffff']]); ell(x, 17, 4, 17, 3); x.fill(); ell(x, 28, 4, 6, 1.6); x.fillStyle = '#fff'; x.fill(); });
  A.orb = mk(22, 22, S, x => { glow(x, 11, 11, 11, '#c58bff', .9); ell(x, 11, 11, 5, 5); x.fillStyle = rg(x, 10, 10, 5, [[0, '#ffffff'], [1, '#c58bff']]); x.fill(); });
  A.spore = mk(16, 16, S, x => { glow(x, 8, 8, 8, '#ff6ab0', .9); ell(x, 8, 8, 3.5, 3.5); x.fillStyle = '#ffd0e8'; x.fill(); });
  A.lumen = lumenCanvas(16 * S);
  A.shardbit = mk(8, 8, S, x => { poly(x, [4, 0, 7, 4, 4, 8, 1, 4]); x.fillStyle = '#ffffff'; x.fill(); });
  A.geode = geodeCanvas(S);

  A.ground = mk(256, 256, Math.min(S, 2), (x, w, h) => {
    x.fillStyle = '#0f2b2e'; x.fillRect(0, 0, w, h);
    const R = rng(7);
    const wrap = (fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) fn(dx, dy); };
    for (let i = 0; i < 14; i++) { const cx = R() * w, cy = R() * h, r = 30 + R() * 60, light = R() > .5; wrap((dx, dy) => { x.fillStyle = rg(x, cx + dx, cy + dy, r, [[0, light ? 'rgba(60,120,110,.16)' : 'rgba(0,10,12,.22)'], [1, 'rgba(0,0,0,0)']]); x.fillRect(cx + dx - r, cy + dy - r, r * 2, r * 2); }); }
    for (let i = 0; i < 900; i++) { const px = R() * w, py = R() * h; x.fillStyle = R() > .5 ? 'rgba(120,200,190,.07)' : 'rgba(0,0,0,.12)'; x.fillRect(px, py, 1.5, 1.5); }
    for (let i = 0; i < 70; i++) { const px = R() * w, py = R() * h, c = R() > .85 ? 'rgba(255,138,184,.35)' : 'rgba(80,170,150,.32)'; wrap((dx, dy) => { for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(px + dx + k * 2, py + dy); x.lineTo(px + dx + k * 3.2, py + dy - 5 - R() * 3); x.lineWidth = 1; x.strokeStyle = c; x.stroke(); } }); }
    for (let i = 0; i < 18; i++) { const px = R() * w, py = R() * h; wrap((dx, dy) => { ell(x, px + dx, py + dy, 1.4, 1.4); x.fillStyle = 'rgba(160,255,240,.25)'; x.fill(); }); }
  });
  A.path = mk(120, 70, S > 2 ? 2 : S, x => { x.save(); x.scale(1, 70 / 120); x.fillStyle = rg(x, 60, 60, 60, [[0, 'rgba(78,104,92,.55)'], [.6, 'rgba(70,96,86,.35)'], [1, 'rgba(60,90,80,0)']]); x.fillRect(0, 0, 120, 120); x.restore(); });
  A.plaza = mk(120, 70, S > 2 ? 2 : S, x => { x.save(); x.scale(1, 70 / 120); x.fillStyle = rg(x, 60, 60, 60, [[0, 'rgba(120,96,70,.5)'], [.6, 'rgba(110,86,62,.3)'], [1, 'rgba(90,70,50,0)']]); x.fillRect(0, 0, 120, 120); x.restore(); });

  for (let v = 0; v < 4; v++) {
    A['tree' + v] = mk(120, 200, S, (x) => {
      const R = rng(100 + v * 13);
      glow(x, 60, 110, 70, v === 3 ? '#c58bff' : '#5ff2d0', .22);
      const n = 5 + (v % 2) * 2;
      const shards = [];
      for (let i = 0; i < n; i++) { const t = i / (n - 1) - .5; shards.push({ bx: 60 + t * 34 + (R() - .5) * 6, w: 14 + R() * 8, h: 90 + R() * 80 - Math.abs(t) * 50, lean: t * 40 + (R() - .5) * 14 }); }
      shards.sort((a, b) => a.h - b.h);
      const top = v === 3 ? '#f2dcff' : '#d8fff8', bot = v === 3 ? '#5a2f8a' : '#14707a';
      for (const s of shards) shard(x, s.bx, 182, s.w, s.h, s.lean, top, bot, .88);
      for (let i = 0; i < 7; i++) { const a = 30 + R() * 60, b = 168 + R() * 18; ell(x, a, b, 3 + R() * 2, 3 + R() * 2); x.fillStyle = 'rgba(255,255,255,.7)'; x.fill(); }
      x.beginPath(); x.moveTo(18, 186); x.quadraticCurveTo(24, 166, 44, 170); x.quadraticCurveTo(60, 158, 76, 170); x.quadraticCurveTo(98, 166, 102, 186); x.quadraticCurveTo(60, 196, 18, 186); x.closePath();
      fillStroke(x, lg(x, 60, 160, 60, 192, [[0, '#ff9ac4'], [1, '#a33a6e']]), 2);
      for (let i = 0; i < 9; i++) { ell(x, 26 + R() * 68, 172 + R() * 10, 2.2, 1.6); x.fillStyle = 'rgba(255,220,236,.85)'; x.fill(); }
    });
  }
  A.rock = mk(64, 44, S, x => {
    poly(x, [4, 40, 8, 20, 22, 8, 40, 6, 56, 16, 60, 38, 34, 42]); fillStroke(x, lg(x, 32, 6, 32, 42, [[0, '#4d6a76'], [1, '#22343e']]), 2);
    poly(x, [22, 8, 40, 6, 56, 16, 34, 18]); x.fillStyle = 'rgba(255,255,255,.12)'; x.fill();
    shard(x, 46, 18, 6, 14, 3, '#d8fff8', '#1f8a8a'); shard(x, 52, 20, 4.5, 9, 4, '#d8fff8', '#1f8a8a'); glow(x, 48, 10, 12, '#5ff2d0', .35);
  });
  A.moss = mk(96, 44, S, x => { const R = rng(55); for (let i = 0; i < 9; i++) { const a = 14 + R() * 68, b = 18 + R() * 14, r = 6 + R() * 10; ell(x, a, b, r, r * .65); fillStroke(x, lg(x, a, b - r, a, b + r, [[0, '#ff9ac4'], [1, '#b8467e']]), 1.4); } for (let i = 0; i < 10; i++) { ell(x, 10 + R() * 76, 12 + R() * 22, 1.3, 1.3); x.fillStyle = '#ffe6f2'; x.fill(); } });
  A.bulb = mk(28, 40, S, x => { x.beginPath(); x.moveTo(14, 38); x.quadraticCurveTo(10, 26, 14, 18); x.lineWidth = 3; x.strokeStyle = OL; x.stroke(); x.lineWidth = 1.8; x.strokeStyle = '#2f9a7a'; x.stroke(); glow(x, 14, 12, 14, '#7fffe0', .7); ell(x, 14, 12, 6, 7); fillStroke(x, rg(x, 13, 10, 7, [[0, '#ffffff'], [1, '#5ff2d0']]), 1.6); });
  A.rib = mk(320, 250, S, x => {
    const bone = (o) => { x.beginPath(); x.moveTo(40, 236); x.bezierCurveTo(10, 120, 120, 10 + o, 230, 40 + o); x.bezierCurveTo(270, 52 + o, 300, 90 + o, 296, 140 + o); x.lineTo(278, 138 + o); x.bezierCurveTo(278, 100 + o, 252, 72 + o, 226, 66 + o); x.bezierCurveTo(130, 48 + o, 52, 128, 70, 236); x.closePath(); };
    glow(x, 160, 120, 140, '#5ff2d0', .1);
    bone(0); fillStroke(x, lg(x, 0, 0, 0, 240, [[0, '#fbf3df'], [.6, '#d9ccad'], [1, '#9c8f74']]), 2.6);
    x.save(); bone(0); x.clip(); x.lineWidth = 1.4; x.strokeStyle = 'rgba(90,70,40,.35)';
    for (const [a, b, c, d] of [[56, 150, 76, 146], [92, 76, 108, 86], [160, 44, 168, 60], [226, 52, 232, 70]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(50, 230); x.bezierCurveTo(26, 130, 120, 22, 226, 48); x.lineTo(226, 54); x.bezierCurveTo(124, 34, 38, 130, 60, 230); x.closePath(); x.fill(); x.restore();
    shard(x, 120, 62, 10, 26, -4, '#d8fff8', '#1f8a8a'); shard(x, 132, 56, 7, 16, 3, '#d8fff8', '#1f8a8a'); glow(x, 124, 46, 20, '#5ff2d0', .45);
    ell(x, 54, 238, 34, 10); x.fillStyle = 'rgba(8,20,22,.85)'; x.fill(); ell(x, 288, 142, 18, 7); x.fill();
  });
  A.spire = mk(150, 340, S, x => {
    glow(x, 75, 60, 80, '#9ff6ff', .55); glow(x, 75, 210, 90, '#5ff2d0', .18);
    poly(x, [30, 330, 120, 330, 108, 314, 42, 314]); fillStroke(x, '#2b3f4a', 2);
    poly(x, [42, 314, 108, 314, 96, 300, 54, 300]); fillStroke(x, '#3a5562', 2);
    poly(x, [58, 300, 92, 300, 86, 120, 75, 40, 64, 120]); fillStroke(x, lg(x, 75, 40, 75, 300, [[0, '#ffffff'], [.4, '#9ff6ff'], [1, '#1f8a9a']]), 2.2);
    poly(x, [75, 40, 86, 120, 92, 300, 75, 300]); x.fillStyle = 'rgba(10,60,80,.28)'; x.fill();
    x.beginPath(); x.moveTo(70, 70); x.lineTo(66, 280); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.7)'; x.stroke();
    for (const [y, r] of [[150, 42], [210, 34]]) { x.beginPath(); x.ellipse(75, y, r, r * .28, 0, 0, Math.PI * 2); x.lineWidth = 3; x.strokeStyle = 'rgba(159,246,255,.85)'; x.stroke(); x.lineWidth = 8; x.strokeStyle = 'rgba(159,246,255,.18)'; x.stroke(); }
    shard(x, 52, 300, 10, 40, -10, '#d8fff8', '#1f8a8a'); shard(x, 98, 300, 9, 34, 9, '#d8fff8', '#1f8a8a');
    ell(x, 75, 36, 9, 9); x.fillStyle = '#ffffff'; x.fill(); glow(x, 75, 36, 30, '#ffffff', .9);
  });
  A.hull = mk(520, 230, S, x => {
    x.beginPath(); x.moveTo(6, 226); x.lineTo(14, 90); x.quadraticCurveTo(30, 24, 120, 16); x.lineTo(400, 16); x.quadraticCurveTo(490, 24, 506, 90); x.lineTo(514, 226); x.closePath();
    fillStroke(x, lg(x, 0, 16, 0, 226, [[0, '#8a5a3e'], [.5, '#6b4030'], [1, '#3b241a']]), 3);
    x.save(); x.clip();
    x.lineWidth = 1.6; x.strokeStyle = 'rgba(20,10,6,.45)';
    for (let y = 56; y < 226; y += 40) { x.beginPath(); x.moveTo(0, y); x.lineTo(520, y); x.stroke(); }
    for (let i = 0; i < 9; i++) { const px = 40 + i * 56; x.beginPath(); x.moveTo(px, 16); x.lineTo(px + 6, 226); x.stroke(); }
    x.fillStyle = '#e0aa5e'; for (let y = 60; y < 226; y += 40) for (let px = 24; px < 520; px += 28) { ell(x, px, y - 4, 1.6, 1.6); x.fill(); }
    x.fillStyle = 'rgba(47,191,176,.16)'; for (const [a, b, c] of [[80, 200, 50], [300, 210, 70], [460, 190, 40]]) { ell(x, a, b, c, 18); x.fill(); }
    rr(x, 0, 30, 520, 12, 0); x.fillStyle = 'rgba(255,207,90,.55)'; x.fill();
    x.restore();
    for (const px of [130, 260, 390]) { ell(x, px, 104, 26, 26); fillStroke(x, '#3a2a20', 3); ell(x, px, 104, 18, 18); x.fillStyle = rg(x, px, 100, 18, [[0, '#fff2c0'], [1, '#ff9a3a']]); x.fill(); glow(x, px, 104, 46, '#ffb85a', .45); }
    rr(x, 226, 150, 68, 76, 6); fillStroke(x, '#24160f', 2.4); rr(x, 232, 156, 56, 70, 4); x.fillStyle = lg(x, 0, 156, 0, 226, [[0, '#ffcf7a'], [1, '#c2632a']]); x.fill(); glow(x, 260, 200, 50, '#ffb85a', .4);
    x.font = '600 13px sans-serif'; x.textAlign = 'center'; x.fillStyle = 'rgba(255,220,160,.55)'; x.fillText('M E R I D I A N', 260, 66);
  });
  A.lamp = mk(32, 100, S, x => { glow(x, 16, 18, 34, '#ffc46a', .55); rr(x, 14, 24, 4, 72, 2); fillStroke(x, '#b8742c', 1.6); poly(x, [6, 96, 26, 96, 22, 90, 10, 90]); fillStroke(x, '#6b4030', 1.6); poly(x, [8, 26, 24, 26, 22, 10, 10, 10]); fillStroke(x, '#5a3a24', 1.6); ell(x, 16, 18, 5.5, 6); x.fillStyle = rg(x, 16, 17, 6, [[0, '#fffbe0'], [1, '#ffb84a']]); x.fill(); });
  A.crate = mk(46, 42, S, x => { rr(x, 3, 8, 40, 32, 4); fillStroke(x, lg(x, 0, 8, 0, 40, [[0, '#9a6a3e'], [1, '#5a3a22']]), 2); x.lineWidth = 1.6; x.strokeStyle = 'rgba(20,10,6,.5)'; x.beginPath(); x.moveTo(3, 24); x.lineTo(43, 24); x.moveTo(8, 8); x.lineTo(38, 40); x.stroke(); rr(x, 3, 4, 40, 7, 3); fillStroke(x, '#d99a4a', 1.6); });
  A.forge = mk(100, 76, S, x => {
    glow(x, 30, 44, 44, '#ff7a2a', .55);
    rr(x, 4, 24, 48, 50, 8); fillStroke(x, lg(x, 0, 24, 0, 74, [[0, '#5a3a2a'], [1, '#2a1a12']]), 2.2);
    rr(x, 14, 38, 28, 22, 10); x.fillStyle = rg(x, 28, 50, 18, [[0, '#fff2a0'], [.5, '#ff9a2a'], [1, '#a33a10']]); x.fill();
    rr(x, 20, 6, 16, 20, 3); fillStroke(x, '#3a2a20', 2);
    poly(x, [58, 46, 96, 46, 92, 54, 80, 56, 80, 70, 88, 74, 62, 74, 70, 70, 70, 56, 62, 54]); fillStroke(x, lg(x, 0, 46, 0, 74, [[0, '#8aa0aa'], [1, '#3a4a52']]), 2);
    for (const [a, b] of [[24, 14], [30, 6], [36, 12]]) { ell(x, a, b, 1.6, 1.6); x.fillStyle = '#ffcf5a'; x.fill(); }
  });
  A.tent = mk(130, 96, S, x => {
    poly(x, [6, 92, 30, 18, 100, 18, 124, 92]); fillStroke(x, lg(x, 0, 18, 0, 92, [[0, '#f4f8fa'], [1, '#b8c6cc']]), 2.4);
    poly(x, [50, 92, 65, 40, 80, 92]); fillStroke(x, '#1a3a44', 2);
    rr(x, 24, 14, 82, 9, 4); fillStroke(x, '#2fbfb0', 2);
    ell(x, 96, 52, 10, 10); fillStroke(x, '#ffffff', 1.6); x.beginPath(); x.moveTo(96, 44); x.quadraticCurveTo(103, 52, 96, 60); x.quadraticCurveTo(89, 52, 96, 44); x.fillStyle = '#2fbfb0'; x.fill();
    glow(x, 65, 70, 30, '#5ff2d0', .3);
  });
  A.stall = mk(120, 90, S, x => {
    rr(x, 12, 44, 96, 42, 4); fillStroke(x, lg(x, 0, 44, 0, 86, [[0, '#7a5034'], [1, '#43281a']]), 2);
    for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(6 + i * 18, 14); x.lineTo(24 + i * 18, 14); x.lineTo(24 + i * 18, 40); x.quadraticCurveTo(15 + i * 18, 46, 6 + i * 18, 40); x.closePath(); fillStroke(x, i % 2 ? '#e9e0c6' : '#2fbfb0', 1.6); }
    for (const [a, c] of [[28, '#5ff2d0'], [48, '#ffcf5a'], [70, '#ff8ab8'], [90, '#7fc8ff']]) { ell(x, a, 56, 7, 6); fillStroke(x, c, 1.4); glow(x, a, 56, 10, c, .35); }
    rr(x, 12, 64, 96, 6, 2); x.fillStyle = '#d99a4a'; x.fill();
  });
  A.banner = mk(40, 100, S, x => { rr(x, 18, 4, 4, 94, 2); fillStroke(x, '#b8742c', 1.4); x.beginPath(); x.moveTo(4, 10); x.lineTo(36, 10); x.lineTo(36, 66); x.lineTo(20, 58); x.lineTo(4, 66); x.closePath(); fillStroke(x, lg(x, 0, 10, 0, 66, [[0, '#24406a'], [1, '#13243c']]), 2); ell(x, 20, 32, 7, 9); fillStroke(x, '#ffcf5a', 1.6); glow(x, 20, 32, 14, '#ffcf5a', .6); rr(x, 16, 20, 8, 4, 1); x.fillStyle = '#ffcf5a'; x.fill(); });
  A.root = mk(160, 60, S, x => { const R = rng(9); for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(4, 30 + (R() - .5) * 20); x.bezierCurveTo(50, R() * 60, 100, R() * 60, 156, 30 + (R() - .5) * 30); x.lineWidth = 14 - i * 3; x.strokeStyle = OL; x.stroke(); x.lineWidth = 10 - i * 3; x.strokeStyle = i ? '#4a2a4a' : '#3a2a34'; x.stroke(); } glow(x, 100, 30, 22, '#ff6ab0', .3); });
  A.door = mk(90, 70, S, x => { poly(x, [6, 66, 10, 14, 80, 8, 86, 62]); fillStroke(x, lg(x, 0, 8, 0, 66, [[0, '#7a8a94'], [1, '#33434c']]), 2.4); rr(x, 24, 22, 42, 34, 4); fillStroke(x, '#22323a', 2); x.font = '700 9px sans-serif'; x.fillStyle = 'rgba(255,207,90,.8)'; x.textAlign = 'center'; x.fillText('MERIDIAN', 45, 18); glow(x, 45, 40, 26, '#5ff2ff', .35); });

  A.foot = mk(12, 8, S, x => { ell(x, 6, 4, 5, 3.2); fillStroke(x, '#24323c', 1.4); });
  for (const k of ['vanguard', 'railwarden', 'psion', 'marr', 'sparks', 'okafor']) A['ch_' + k] = charCanvas(S, LOOKS[k]);
  A.w_blade = mk(16, 56, S, x => { poly(x, [8, 2, 13, 10, 12, 42, 4, 42, 3, 10]); fillStroke(x, lg(x, 0, 0, 16, 0, [[0, '#d8fff8'], [.5, '#ffffff'], [1, '#5ff2ff']]), 1.6); glow(x, 8, 22, 14, '#5ff2ff', .6); rr(x, 1, 42, 14, 4, 2); fillStroke(x, '#ffcf5a', 1.4); rr(x, 6, 46, 4, 9, 2); fillStroke(x, '#6b4030', 1.2); });
  A.w_rifle = mk(64, 18, S, x => { rr(x, 2, 7, 18, 8, 3); fillStroke(x, '#5a3a24', 1.6); rr(x, 16, 5, 44, 7, 2); fillStroke(x, '#3a4a52', 1.6); for (const p of [26, 34, 42]) { rr(x, p, 3, 4, 11, 1.5); fillStroke(x, '#5ff2ff', 1); } glow(x, 34, 8, 16, '#5ff2ff', .5); rr(x, 56, 6, 7, 5, 1); fillStroke(x, '#8aa0aa', 1.2); });
  A.w_orb = mk(26, 26, S, x => { glow(x, 13, 13, 13, '#c58bff', .9); ell(x, 13, 13, 6.5, 6.5); x.fillStyle = rg(x, 11, 11, 7, [[0, '#ffffff'], [.5, '#e2c6ff'], [1, '#9a5aff']]); x.fill(); x.lineWidth = 1.4; x.strokeStyle = 'rgba(60,20,110,.8)'; x.stroke(); });
  A.wrench = mk(14, 30, S, x => { rr(x, 5, 8, 4, 20, 2); fillStroke(x, '#9fb6bf', 1.4); x.beginPath(); x.arc(7, 7, 5, 0.6, Math.PI * 2 - 0.6 + Math.PI); x.lineWidth = 3.4; x.strokeStyle = '#9fb6bf'; x.stroke(); });

  A.shardling = mk(56, 46, S, x => {
    shard(x, 22, 22, 9, 18, -4, '#e8fffb', '#1f9aa0'); shard(x, 31, 20, 11, 24, 2, '#e8fffb', '#1f9aa0'); shard(x, 40, 23, 8, 15, 6, '#e8fffb', '#1f9aa0'); glow(x, 31, 10, 16, '#5ff2e0', .5);
    ell(x, 28, 31, 19, 13); fillStroke(x, lg(x, 28, 18, 28, 44, [[0, '#4ec4cc'], [1, '#1f5f78']]), 2);
    ell(x, 24, 36, 11, 6); x.fillStyle = 'rgba(220,255,250,.35)'; x.fill();
    eye(x, 18, 30, 4.4, '#0b2a3a', -1); eye(x, 28, 30, 4.4, '#0b2a3a', -1);
    ell(x, 16, 43, 4, 2.4); fillStroke(x, '#1f5f78', 1.4); ell(x, 38, 43, 4, 2.4); fillStroke(x, '#1f5f78', 1.4);
  });
  A.moth = mk(32, 36, S, x => {
    x.beginPath(); x.moveTo(12, 9); x.quadraticCurveTo(6, 0, 2, 4); x.moveTo(20, 9); x.quadraticCurveTo(26, 0, 30, 4); x.lineWidth = 1.6; x.strokeStyle = '#e6d0ff'; x.stroke();
    ell(x, 16, 26, 6, 9); fillStroke(x, lg(x, 16, 17, 16, 35, [[0, '#d9b8ff'], [1, '#7a4aaf']]), 1.8);
    for (const y of [24, 28, 32]) { x.beginPath(); x.moveTo(11, y); x.lineTo(21, y); x.lineWidth = 1; x.strokeStyle = 'rgba(60,20,90,.45)'; x.stroke(); }
    ell(x, 16, 14, 8.5, 7.5); fillStroke(x, lg(x, 16, 6, 16, 22, [[0, '#fff0ff'], [1, '#c8a0ef']]), 1.8);
    eye(x, 12.5, 14, 2.8, '#5a0a3a'); eye(x, 19.5, 14, 2.8, '#5a0a3a');
  });
  A.wing = mk(40, 44, S, x => {
    x.beginPath(); x.moveTo(2, 22); x.bezierCurveTo(6, 0, 38, -2, 38, 16); x.bezierCurveTo(38, 26, 20, 26, 2, 22); x.closePath();
    x.fillStyle = lg(x, 2, 0, 38, 26, [[0, 'rgba(255,170,220,.85)'], [1, 'rgba(160,110,255,.7)']]); x.fill(); x.lineWidth = 1.4; x.strokeStyle = 'rgba(40,10,60,.8)'; x.stroke();
    x.beginPath(); x.moveTo(2, 24); x.bezierCurveTo(8, 42, 30, 42, 28, 30); x.bezierCurveTo(26, 26, 12, 25, 2, 24); x.closePath();
    x.fillStyle = 'rgba(200,140,255,.75)'; x.fill(); x.stroke();
    ell(x, 24, 12, 4.5, 4.5); x.fillStyle = '#fffbe0'; x.fill(); glow(x, 24, 12, 9, '#ff8ac8', .9);
  });
  A.crawler = mk(70, 50, S, x => {
    x.lineWidth = 2.6; x.strokeStyle = OL;
    for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(24 + i * 11, 34); x.lineTo(18 + i * 13, 47); x.stroke(); x.beginPath(); x.moveTo(26 + i * 11, 32); x.lineTo(32 + i * 12, 46); x.stroke(); }
    x.beginPath(); x.moveTo(8, 34); x.quadraticCurveTo(12, 10, 38, 8); x.quadraticCurveTo(64, 10, 66, 32); x.quadraticCurveTo(40, 40, 8, 34); x.closePath();
    fillStroke(x, lg(x, 36, 8, 36, 40, [[0, '#6a4a7a'], [.5, '#3a3a3a'], [1, '#1f2a22']]), 2.2);
    x.beginPath(); x.moveTo(38, 9); x.lineTo(38, 36); x.lineWidth = 1.4; x.strokeStyle = 'rgba(0,0,0,.45)'; x.stroke();
    for (const [a, b, h, l] of [[22, 16, 12, -4], [34, 11, 15, -1], [46, 12, 14, 3], [56, 18, 11, 6]]) { poly(x, [a - 3, b + 2, a + l, b - h, a + 3, b + 2]); fillStroke(x, lg(x, a, b, a + l, b - h, [[0, '#3a2a34'], [1, '#ff6ab0']]), 1.4); }
    ell(x, 10, 33, 8, 6); fillStroke(x, '#2a2230', 2);
    ell(x, 7, 31, 1.8, 1.8); x.fillStyle = '#ff4a5a'; x.fill(); ell(x, 12, 30, 1.8, 1.8); x.fill(); glow(x, 9, 31, 7, '#ff4a5a', .8);
    x.beginPath(); x.moveTo(3, 36); x.quadraticCurveTo(-1, 40, 4, 42); x.moveTo(9, 38); x.quadraticCurveTo(6, 43, 11, 44); x.lineWidth = 1.8; x.strokeStyle = '#c9a0b8'; x.stroke();
  });
  A.thornmother = mk(240, 180, S, x => {
    glow(x, 120, 100, 120, '#ff6ab0', .22);
    x.lineWidth = 5; x.strokeStyle = OL;
    for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(80 + i * 26, 120); x.quadraticCurveTo(60 + i * 30, 150, 50 + i * 36, 176); x.stroke(); x.beginPath(); x.moveTo(90 + i * 26, 118); x.quadraticCurveTo(100 + i * 30, 150, 110 + i * 34, 176); x.stroke(); }
    x.lineWidth = 3; x.strokeStyle = '#3a2a34';
    for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(80 + i * 26, 120); x.quadraticCurveTo(60 + i * 30, 150, 50 + i * 36, 176); x.stroke(); }
    x.beginPath(); x.moveTo(26, 120); x.quadraticCurveTo(34, 44, 120, 38); x.quadraticCurveTo(208, 44, 220, 118); x.quadraticCurveTo(120, 146, 26, 120); x.closePath();
    fillStroke(x, lg(x, 120, 38, 120, 140, [[0, '#7a4a8a'], [.45, '#3e3044'], [1, '#1c2a20']]), 3);
    x.save(); x.beginPath(); x.moveTo(26, 120); x.quadraticCurveTo(34, 44, 120, 38); x.quadraticCurveTo(208, 44, 220, 118); x.quadraticCurveTo(120, 146, 26, 120); x.clip();
    x.lineWidth = 2; x.strokeStyle = 'rgba(0,0,0,.4)'; for (const k of [70, 120, 170]) { x.beginPath(); x.moveTo(k, 40); x.quadraticCurveTo(k + (k - 120) * .3, 90, k + (k - 120) * .2, 140); x.stroke(); }
    x.restore();
    const crown = [[70, 52, 30, -10, 1], [92, 42, 44, -6, 0], [116, 36, 58, 0, 1], [142, 40, 48, 6, 0], [164, 50, 34, 10, 1]];
    for (const [a, b, h, l, t] of crown) shard(x, a, b, 16, h, l, t ? '#ffe0f0' : '#d8fff8', t ? '#a33a6e' : '#14707a');
    glow(x, 118, 20, 50, '#ff8ab8', .45);
    for (const [a, b] of [[46, 90], [62, 74], [178, 74], [196, 92], [96, 66], [150, 66]]) { poly(x, [a - 4, b + 3, a + (a - 120) * .06, b - 16, a + 4, b + 3]); fillStroke(x, lg(x, a, b, a, b - 16, [[0, '#3a2a34'], [1, '#ff6ab0']]), 1.6); }
    ell(x, 120, 104, 15, 13); x.fillStyle = rg(x, 120, 102, 15, [[0, '#ffffff'], [.4, '#ff8ac8'], [1, '#8a1a4a']]); x.fill(); glow(x, 120, 104, 34, '#ff6ab0', .8);
    ell(x, 36, 118, 22, 17); fillStroke(x, '#2a2230', 2.6);
    for (const [a, b] of [[26, 112], [36, 108], [46, 112], [31, 120]]) { ell(x, a, b, 2.8, 2.8); x.fillStyle = '#ff4a5a'; x.fill(); } glow(x, 36, 114, 18, '#ff4a5a', .7);
    x.beginPath(); x.moveTo(20, 126); x.quadraticCurveTo(8, 136, 18, 144); x.moveTo(36, 132); x.quadraticCurveTo(30, 146, 42, 148); x.lineWidth = 3.4; x.strokeStyle = '#d9b0c8'; x.stroke();
  });
  for (const id of Object.keys(ECHO_DRAW)) A['echo_' + id] = echoCanvas(id, S);
  return A;
}

export const ANCHORS = {
  tree0: [.5, .93], tree1: [.5, .93], tree2: [.5, .93], tree3: [.5, .93], rock: [.5, .9], moss: [.5, .7], bulb: [.5, .95], rib: [.17, .95], spire: [.5, .97],
  hull: [.5, .98], lamp: [.5, .96], crate: [.5, .95], forge: [.5, .97], tent: [.5, .96], stall: [.5, .96], banner: [.5, .98], door: [.5, .95], geode: [.5, .9], root: [.5, .5]
};
