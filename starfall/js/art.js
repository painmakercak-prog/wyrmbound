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
  const cx = 32, bw = o.bw || 13;
  x.save();
  if (o.back) o.back(x, cx);
  if (o.hairBack) o.hairBack(x, cx);
  const coat = o.coat, trim = o.trim;
  ell(x, cx - bw - 1, 47, 5, 7); fillStroke(x, shade(coat, -.15), 1.8);
  ell(x, cx + bw + 1, 47, 5, 7); fillStroke(x, shade(coat, -.15), 1.8);
  rr(x, cx - bw, 38, bw * 2, o.long ? 27 : 22, 9); fillStroke(x, lg(x, cx, 38, cx, 62, [[0, shade(coat, .12)], [1, shade(coat, -.25)]]), 2);
  if (o.chest) o.chest(x, cx);
  x.beginPath(); x.moveTo(cx - bw, 52); x.lineTo(cx + bw, 52); x.lineWidth = 3; x.strokeStyle = trim; x.stroke();
  ell(x, cx - bw - 1, 51, 3.4, 3.4); fillStroke(x, o.skin, 1.4);
  ell(x, cx + bw + 1, 51, 3.4, 3.4); fillStroke(x, o.skin, 1.4);
  ell(x, cx, 24, 17, 16.5); fillStroke(x, lg(x, cx, 10, cx, 40, [[0, shade(o.skin, .08)], [1, shade(o.skin, -.12)]]), 2);
  ell(x, cx - 9.5, 30, 3, 1.8); x.fillStyle = 'rgba(255,120,120,.28)'; x.fill();
  ell(x, cx + 9.5, 30, 3, 1.8); x.fill();
  drawFace(x, cx, o);
  if (o.hair) o.hair(x, cx);
  if (o.front) o.front(x, cx);
  x.restore();
}

function drawFace(x, cx, o) {
  const f = o.face || 0, iris = o.iris || '#22324a', brow = o.brow || OL, fem = o.sex === 'f';
  const r = f === 2 ? 4.1 : f === 1 ? 3.3 : 3.6;
  eye(x, cx - 6, 25.5, r, iris); eye(x, cx + 6, 25.5, r, iris);
  if (f === 1) { for (const sg of [-1, 1]) { x.beginPath(); x.moveTo(cx + sg * 2.5, 21.4); x.lineTo(cx + sg * 9.5, 20); x.lineWidth = 1.9; x.strokeStyle = brow; x.stroke(); } }
  if (f === 2) { for (const sg of [-1, 1]) { x.beginPath(); x.moveTo(cx + sg * 3, 20); x.quadraticCurveTo(cx + sg * 6, 18, cx + sg * 9, 19.6); x.lineWidth = 1.5; x.strokeStyle = brow; x.stroke(); } }
  if (fem) for (const sg of [-1, 1]) { const ex = cx + sg * 6, ey = 25.5 - r * .8; x.beginPath(); x.moveTo(ex + sg * r * .5, ey + .6); x.lineTo(ex + sg * (r * .95), ey - 1.4); x.moveTo(ex + sg * r * .15, ey - .1); x.lineTo(ex + sg * r * .4, ey - 2); x.lineWidth = 1.1; x.strokeStyle = OL; x.stroke(); }
  if (f === 1) { x.beginPath(); x.moveTo(cx - 2.6, 32.6); x.lineTo(cx + 2.6, 32.4); x.lineWidth = 1.3; x.strokeStyle = fem ? '#a0485a' : OL; x.stroke(); }
  else if (f === 2) { x.beginPath(); x.moveTo(cx - 3.4, 31.6); x.quadraticCurveTo(cx, 35.6, cx + 3.4, 31.6); x.closePath(); x.fillStyle = '#5a1a24'; x.fill(); x.lineWidth = 1.1; x.strokeStyle = OL; x.stroke(); ell(x, cx, 33.6, 1.6, .8); x.fillStyle = '#e8707a'; x.fill(); }
  else { x.beginPath(); x.moveTo(cx - 2, 32); x.quadraticCurveTo(cx, 33.6, cx + 2, 32); x.lineWidth = 1.3; x.strokeStyle = fem ? '#a0485a' : OL; x.stroke(); }
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
  kestrel: {
    skin: '#c58a5a', coat: '#5a4636', trim: '#5ff2d0', iris: '#12c8bc',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 14, 38); x.quadraticCurveTo(cx, 47, cx + 14, 38); x.lineTo(cx + 11, 45); x.quadraticCurveTo(cx, 52, cx - 11, 45); x.closePath(); fillStroke(x, lg(x, cx, 38, cx, 52, [[0, '#efdcb4'], [1, '#bfa47a']]), 1.6);
      rr(x, cx - 15, 51, 6, 9, 2); fillStroke(x, '#3a4a52', 1.2); rr(x, cx + 9, 51, 6, 9, 2); fillStroke(x, '#3a4a52', 1.2); glow(x, cx - 12, 55, 5, '#5ff2ff', .6); glow(x, cx + 12, 55, 5, '#5ff2ff', .6); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 18, 24); x.lineTo(cx - 20, 14); x.lineTo(cx - 14, 12); x.lineTo(cx - 15, 4); x.lineTo(cx - 6, 8); x.lineTo(cx - 2, 0); x.lineTo(cx + 4, 7); x.lineTo(cx + 12, 2); x.lineTo(cx + 13, 10); x.lineTo(cx + 20, 12); x.lineTo(cx + 18, 24); x.quadraticCurveTo(cx + 12, 15, cx + 3, 16); x.lineTo(cx - 4, 13); x.quadraticCurveTo(cx - 12, 16, cx - 18, 24); x.closePath(); fillStroke(x, lg(x, cx, 0, cx, 24, [[0, '#fff6d8'], [1, '#d9c08a']]), 2);
      glow(x, cx - 6, 25.5, 5, '#5ff2e0', .55); glow(x, cx + 6, 25.5, 5, '#5ff2e0', .55); }
  },
  corvin: {
    skin: SKIN.tan, coat: '#8a2a22', trim: '#ffcf5a', iris: '#3a2a1a',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 12, 39); x.lineTo(cx - 4, 39); x.lineTo(cx, 50); x.lineTo(cx + 4, 39); x.lineTo(cx + 12, 39); x.lineWidth = 2.4; x.strokeStyle = '#2a1410'; x.stroke(); poly(x, [cx - 13, 38, cx - 6, 37, cx - 9, 46]); fillStroke(x, '#a83a2e', 1.4); poly(x, [cx + 13, 38, cx + 6, 37, cx + 9, 46]); fillStroke(x, '#a83a2e', 1.4); ell(x, cx + 13, 52, 2, 2); x.fillStyle = '#ffcf5a'; x.fill(); glow(x, cx + 13, 52, 5, '#ffcf5a', .7); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 22); x.quadraticCurveTo(cx - 18, 5, cx + 1, 5); x.quadraticCurveTo(cx + 18, 5, cx + 17, 20); x.quadraticCurveTo(cx + 10, 10, cx - 2, 13); x.quadraticCurveTo(cx - 10, 14, cx - 17, 22); x.closePath(); fillStroke(x, lg(x, cx, 5, cx, 22, [[0, '#4a3a32'], [1, '#2a201c']]), 2);
      x.beginPath(); x.moveTo(cx + 4, 6); x.quadraticCurveTo(cx + 12, 8, cx + 15, 15); x.lineWidth = 2; x.strokeStyle = '#c8ccd2'; x.stroke(); },
    front: (x, cx) => { x.beginPath(); x.moveTo(cx - 10, 29); x.quadraticCurveTo(cx - 9, 39, cx, 40); x.quadraticCurveTo(cx + 9, 39, cx + 10, 29); x.quadraticCurveTo(cx + 6, 34, cx, 34); x.quadraticCurveTo(cx - 6, 34, cx - 10, 29); x.closePath(); fillStroke(x, lg(x, cx, 29, cx, 40, [[0, '#5a4a40'], [1, '#9a9ca2']]), 1.4);
      x.beginPath(); x.moveTo(cx - 3, 32.5); x.quadraticCurveTo(cx, 34.5, cx + 3, 32.5); x.lineWidth = 1.3; x.strokeStyle = '#f2e6d8'; x.stroke(); }
  },
  hush: {
    skin: '#efd9c8', coat: '#5e626c', trim: '#b9c7d2', iris: '#7a8694', long: true,
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 12, 39); x.quadraticCurveTo(cx, 50, cx + 12, 39); x.lineWidth = 3; x.strokeStyle = '#8a909c'; x.stroke(); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 22); x.quadraticCurveTo(cx - 18, 5, cx, 5); x.quadraticCurveTo(cx + 18, 5, cx + 17, 22); x.quadraticCurveTo(cx + 9, 11, cx, 11); x.quadraticCurveTo(cx - 9, 11, cx - 17, 22); x.closePath(); fillStroke(x, lg(x, cx, 5, cx, 22, [[0, '#e8ecf0'], [1, '#a8b0ba']]), 2);
      x.beginPath(); x.ellipse(cx, 22, 18.5, 14, 0, Math.PI * 1.05, Math.PI * 1.95); x.lineWidth = 3.2; x.strokeStyle = '#d8dee6'; x.stroke(); ell(x, cx - 17.5, 24, 2.6, 4); fillStroke(x, '#c8d0d8', 1.2); ell(x, cx + 17.5, 24, 2.6, 4); fillStroke(x, '#c8d0d8', 1.2); }
  },
  okafor: {
    skin: SKIN.deep, coat: '#eef3f5', trim: '#2fbfb0', iris: '#2a1a10',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx, 38); x.lineTo(cx, 62); x.lineWidth = 1.6; x.strokeStyle = '#9fb6bf'; x.stroke(); rr(x, cx + 3, 43, 6, 5, 1.5); fillStroke(x, '#2fbfb0', 1); },
    hairBack: (x, cx) => { for (const [a, b] of [[-15, -21], [-11, -19], [11, 19], [15, 21]]) { x.beginPath(); x.moveTo(cx + a, 18); x.quadraticCurveTo(cx + b, 32, cx + b * .9, 44); x.lineWidth = 5; x.strokeStyle = OL; x.stroke(); x.lineWidth = 3.2; x.strokeStyle = '#2a1c18'; x.stroke(); } },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 22); x.quadraticCurveTo(cx - 18, 5, cx, 5); x.quadraticCurveTo(cx + 18, 5, cx + 17, 22); x.quadraticCurveTo(cx + 9, 11, cx, 12); x.quadraticCurveTo(cx - 9, 11, cx - 17, 22); x.closePath(); fillStroke(x, '#2a1c18', 2);
      rr(x, cx - 12, 22.5, 24, 6, 3); x.fillStyle = 'rgba(95,242,208,.35)'; x.fill(); x.lineWidth = 1.4; x.strokeStyle = '#2fbfb0'; x.stroke(); }
  },
  shade: {
    skin: SKIN.light, coat: '#2a2433', trim: '#ff5a9a', iris: '#c23a7a',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 12, 39); x.lineTo(cx, 52); x.lineTo(cx + 12, 39); x.lineWidth = 2.4; x.strokeStyle = '#ff5a9a'; x.stroke(); glow(x, cx, 46, 9, '#ff5a9a', .45);
      x.beginPath(); x.moveTo(cx - 13, 56); x.lineTo(cx + 13, 44); x.lineWidth = 3; x.strokeStyle = '#151019'; x.stroke(); },
    hairBack: (x, cx) => { ell(x, cx, 23, 21.5, 21); fillStroke(x, lg(x, cx, 2, cx, 44, [[0, '#3a3046'], [1, '#1a1420']]), 2); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 19, 30); x.quadraticCurveTo(cx - 20, 3, cx, 2); x.quadraticCurveTo(cx + 20, 3, cx + 19, 30); x.quadraticCurveTo(cx + 15, 15, cx, 15); x.quadraticCurveTo(cx - 15, 15, cx - 19, 30); x.closePath(); fillStroke(x, lg(x, cx, 2, cx, 30, [[0, '#463a56'], [1, '#241c2e']]), 2);
      x.beginPath(); x.moveTo(cx - 14, 17); x.quadraticCurveTo(cx, 12, cx + 14, 17); x.lineWidth = 1.6; x.strokeStyle = '#ff5a9a'; x.stroke(); },
    front: (x, cx) => { x.beginPath(); x.moveTo(cx - 13, 28.5); x.quadraticCurveTo(cx, 31, cx + 13, 28.5); x.quadraticCurveTo(cx + 12, 39, cx, 41); x.quadraticCurveTo(cx - 12, 39, cx - 13, 28.5); x.closePath(); fillStroke(x, lg(x, cx, 28, cx, 41, [[0, '#3a3046'], [1, '#18121e']]), 1.6);
      x.beginPath(); x.moveTo(cx - 10, 33); x.lineTo(cx + 10, 33); x.lineWidth = 1.4; x.strokeStyle = '#ff5a9a'; x.stroke(); glow(x, cx, 33, 8, '#ff5a9a', .5); }
  },
  mender: {
    skin: SKIN.tan, coat: '#eef6f4', trim: '#2fd0b8', iris: '#1f6a5a', long: true,
    chest: (x, cx) => { rr(x, cx - 4, 41, 8, 12, 2); fillStroke(x, '#2fd0b8', 1.2); rr(x, cx - 7, 44.5, 14, 5, 2); fillStroke(x, '#2fd0b8', 1.2); glow(x, cx, 47, 9, '#5ff2d0', .45);
      ell(x, cx - 13, 40, 6, 4.4); fillStroke(x, '#b9d8d2', 1.4); ell(x, cx + 13, 40, 6, 4.4); fillStroke(x, '#b9d8d2', 1.4); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 22); x.lineTo(cx - 19, 12); x.lineTo(cx - 12, 11); x.lineTo(cx - 12, 4); x.lineTo(cx - 4, 7); x.lineTo(cx + 1, 1); x.lineTo(cx + 6, 6); x.lineTo(cx + 14, 3); x.lineTo(cx + 14, 11); x.lineTo(cx + 19, 13); x.lineTo(cx + 17, 22); x.quadraticCurveTo(cx + 10, 13, cx + 2, 15); x.lineTo(cx - 5, 12); x.quadraticCurveTo(cx - 12, 15, cx - 17, 22); x.closePath(); fillStroke(x, lg(x, cx, 1, cx, 22, [[0, '#3a3440'], [1, '#18141c']]), 2);
      rr(x, cx + 1, 21.5, 12, 8, 3.5); x.fillStyle = 'rgba(95,242,208,.55)'; x.fill(); x.lineWidth = 1.4; x.strokeStyle = '#2fd0b8'; x.stroke(); glow(x, cx + 7, 25.5, 8, '#5ff2d0', .7);
      ell(x, cx + 17, 25, 3, 4); fillStroke(x, '#b9d8d2', 1.2); }
  },
  duelist: {
    skin: SKIN.tan, coat: '#3a2a22', trim: '#5ff2ff', iris: '#3a5a6a',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 13, 38); x.lineTo(cx - 3, 50); x.lineTo(cx - 3, 63); x.moveTo(cx + 13, 38); x.lineTo(cx + 3, 50); x.lineTo(cx + 3, 63); x.lineWidth = 2.4; x.strokeStyle = '#1e140f'; x.stroke();
      x.beginPath(); x.moveTo(cx - 13, 42); x.lineTo(cx + 13, 58); x.lineWidth = 3.2; x.strokeStyle = '#7a4a2a'; x.stroke(); rr(x, cx + 7, 53, 5, 4, 1); fillStroke(x, '#5ff2ff', 1); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 24); x.quadraticCurveTo(cx - 18, 10, cx, 10); x.quadraticCurveTo(cx + 18, 10, cx + 17, 24); x.quadraticCurveTo(cx + 8, 15, cx, 16); x.quadraticCurveTo(cx - 8, 15, cx - 17, 24); x.closePath(); fillStroke(x, '#4a2e1e', 2);
      ell(x, cx, 13.5, 27, 6.5); fillStroke(x, lg(x, cx, 7, cx, 20, [[0, '#6a4a34'], [1, '#3a281c']]), 2);
      x.beginPath(); x.moveTo(cx - 14, 13); x.quadraticCurveTo(cx - 13, -3, cx, -3); x.quadraticCurveTo(cx + 13, -3, cx + 14, 13); x.closePath(); fillStroke(x, lg(x, cx, -3, cx, 13, [[0, '#6a4a34'], [1, '#4a3424']]), 2);
      rr(x, cx - 14, 8, 28, 4, 1.5); fillStroke(x, '#2a1c14', 1.2); poly(x, [cx, 6, cx + 3, 9.5, cx, 13, cx - 3, 9.5]); fillStroke(x, '#5ff2ff', 1); glow(x, cx, 9.5, 7, '#5ff2ff', .7); },
    front: (x, cx) => { x.beginPath(); x.moveTo(cx - 4, 34.5); x.quadraticCurveTo(cx, 40.5, cx + 4, 34.5); x.quadraticCurveTo(cx, 36.5, cx - 4, 34.5); x.closePath(); fillStroke(x, '#4a2e1e', 1);
      x.beginPath(); x.moveTo(cx - 5, 31.5); x.quadraticCurveTo(cx, 30, cx + 5, 31.5); x.lineWidth = 1.6; x.strokeStyle = '#4a2e1e'; x.stroke(); }
  },
  ilse: {
    skin: '#e8c8b0', coat: '#3a4650', trim: '#7fc8ff', iris: '#4a6a8a',
    chest: (x, cx) => { rr(x, cx - 9, 41, 8, 7, 2); fillStroke(x, '#6a5a4a', 1.2); x.beginPath(); x.moveTo(cx, 38); x.lineTo(cx, 62); x.lineWidth = 2; x.strokeStyle = '#22303a'; x.stroke();
      x.beginPath(); x.moveTo(cx + 6, 44); x.lineTo(cx + 10, 50); x.lineTo(cx + 8, 56); x.lineWidth = 1.2; x.strokeStyle = '#7fc8ff'; x.stroke(); glow(x, cx + 8, 50, 6, '#7fc8ff', .6); },
    hairBack: (x, cx) => { for (const sgn of [-1, 1]) { for (let i = 0; i < 5; i++) { ell(x, cx + sgn * 16, 26 + i * 6, 3.4, 3.6); fillStroke(x, i % 2 ? '#b8bcc4' : '#d0d4dc', 1.3); } } },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 24); x.quadraticCurveTo(cx - 18, 5, cx, 5); x.quadraticCurveTo(cx + 18, 5, cx + 17, 24); x.quadraticCurveTo(cx + 10, 11, cx, 12); x.quadraticCurveTo(cx - 10, 11, cx - 17, 24); x.closePath(); fillStroke(x, lg(x, cx, 5, cx, 24, [[0, '#e8ecf0'], [1, '#a8acb4']]), 2);
      x.beginPath(); x.moveTo(cx - 9, 31); x.lineTo(cx - 12, 36); x.moveTo(cx + 9, 31); x.lineTo(cx + 12, 36); x.lineWidth = 1; x.strokeStyle = 'rgba(127,200,255,.8)'; x.stroke(); }
  },
  bix: {
    skin: '#c88a64', coat: '#1e3a44', trim: '#5ff2d0', iris: '#3a2a1a',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 12, 40); x.lineTo(cx + 12, 40); x.lineWidth = 2.4; x.strokeStyle = '#5ff2d0'; x.stroke(); rr(x, cx - 15, 42, 6, 14, 3); fillStroke(x, '#5a6a72', 1.2); rr(x, cx + 9, 42, 6, 14, 3); fillStroke(x, '#5a6a72', 1.2); },
    hair: (x, cx) => { x.beginPath(); x.ellipse(cx, 21, 17, 15, 0, Math.PI * 1.08, Math.PI * 1.92); x.lineWidth = 1.2; x.strokeStyle = 'rgba(80,50,40,.4)'; x.stroke();
      rr(x, cx - 16, 11, 32, 5, 2.5); fillStroke(x, '#2a3a40', 1.2); ell(x, cx - 7, 12, 5.4, 4.4); fillStroke(x, 'rgba(127,230,255,.7)', 1.6); ell(x, cx + 7, 12, 5.4, 4.4); fillStroke(x, 'rgba(127,230,255,.7)', 1.6);
      x.beginPath(); x.moveTo(cx + 4, 9.5); x.lineTo(cx + 8, 13); x.lineTo(cx + 6, 15); x.lineWidth = 1; x.strokeStyle = '#ffffff'; x.stroke(); glow(x, cx, 12, 10, '#7fe6ff', .35); }
  },
  pell: {
    skin: '#c89070', coat: '#a8865a', trim: '#6a4a2a', iris: '#3a6a5a',
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 13, 40); x.quadraticCurveTo(cx, 48, cx + 13, 40); x.lineWidth = 3; x.strokeStyle = '#8a6a44'; x.stroke(); rr(x, cx + 3, 46, 6, 6, 1); fillStroke(x, '#6a5034', 1); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 18, 24); x.lineTo(cx - 19, 12); x.lineTo(cx - 13, 9); x.lineTo(cx - 10, 3); x.lineTo(cx - 3, 6); x.lineTo(cx + 3, 1); x.lineTo(cx + 9, 6); x.lineTo(cx + 15, 4); x.lineTo(cx + 17, 12); x.lineTo(cx + 19, 22); x.quadraticCurveTo(cx + 11, 13, cx + 2, 16); x.lineTo(cx - 6, 13); x.quadraticCurveTo(cx - 13, 16, cx - 18, 24); x.closePath(); fillStroke(x, lg(x, cx, 1, cx, 24, [[0, '#a86a3a'], [1, '#6a3e1e']]), 2); },
    front: (x, cx) => { ell(x, cx, 52, 11, 10); fillStroke(x, lg(x, cx, 42, cx, 62, [[0, '#e8d8b8'], [1, '#9a8458']]), 1.8); ell(x, cx, 52, 7, 5.6); fillStroke(x, 'rgba(40,60,80,.85)', 1.2); ell(x, cx - 2, 50.5, 2.4, 1.4); x.fillStyle = 'rgba(200,240,255,.7)'; x.fill(); }
  },
  tovin: {
    skin: '#e8d0c0', coat: '#1e2c4a', trim: '#c8a060', iris: '#6a7a8a',
    chest: (x, cx) => { ell(x, cx - 13, 40, 6, 4.4); fillStroke(x, '#c8a060', 1.4); ell(x, cx + 13, 40, 6, 4.4); fillStroke(x, '#c8a060', 1.4); rr(x, cx + 3, 44, 7, 6, 1.5); fillStroke(x, '#3a4a6a', 1); x.beginPath(); x.moveTo(cx - 10, 39); x.quadraticCurveTo(cx, 44, cx + 10, 39); x.lineWidth = 3; x.strokeStyle = '#d8dce4'; x.stroke(); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 22); x.quadraticCurveTo(cx - 18, 6, cx, 6); x.quadraticCurveTo(cx + 18, 6, cx + 17, 22); x.quadraticCurveTo(cx + 9, 13, cx, 14); x.quadraticCurveTo(cx - 9, 13, cx - 17, 22); x.closePath(); fillStroke(x, lg(x, cx, 6, cx, 22, [[0, '#c8ccd4'], [1, '#8a8e98']]), 2);
      rr(x, cx - 14, 13, 28, 4, 2); fillStroke(x, '#5a6a7a', 1.2); ell(x, cx - 6, 15, 4, 2.6); fillStroke(x, 'rgba(160,230,255,.7)', 1); ell(x, cx + 6, 15, 4, 2.6); fillStroke(x, 'rgba(160,230,255,.7)', 1); }
  },
  nessa: {
    skin: SKIN.tan, coat: '#1e1a22', trim: '#d9a45a', iris: '#4a3a2a', long: true,
    chest: (x, cx) => { x.beginPath(); x.moveTo(cx - 12, 39); x.lineTo(cx - 3, 52); x.lineTo(cx - 3, 64); x.moveTo(cx + 12, 39); x.lineTo(cx + 3, 52); x.lineTo(cx + 3, 64); x.lineWidth = 2.2; x.strokeStyle = '#d9a45a'; x.stroke(); },
    hairBack: (x, cx) => { x.beginPath(); x.moveTo(cx + 12, 16); x.quadraticCurveTo(cx + 22, 30, cx + 16, 48); x.lineWidth = 7; x.strokeStyle = OL; x.stroke(); x.lineWidth = 5; x.strokeStyle = '#2a1c18'; x.stroke(); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 24); x.quadraticCurveTo(cx - 19, 5, cx, 5); x.quadraticCurveTo(cx + 19, 5, cx + 17, 24); x.quadraticCurveTo(cx + 6, 12, cx - 6, 15); x.quadraticCurveTo(cx - 13, 17, cx - 17, 24); x.closePath(); fillStroke(x, lg(x, cx, 5, cx, 24, [[0, '#4a2e24'], [1, '#1e1210']]), 2); },
    front: (x, cx) => { ell(x, cx - 15, 51, 4, 4); fillStroke(x, '#1e1a22', 1.4); glow(x, cx - 15, 46, 8, '#5ff2ff', .9); shard(x, cx - 15, 50, 3, 9, 0, '#e8fbff', '#3a9ad8'); }
  },
  captain: {
    skin: '#d8e8f0', coat: '#5a6a7a', trim: '#9ff6ff', iris: '#5ff2ff',
    chest: (x, cx) => { ell(x, cx - 13, 40, 6.5, 4.8); fillStroke(x, '#b8a888', 1.6); ell(x, cx + 13, 40, 6.5, 4.8); fillStroke(x, '#b8a888', 1.6); glow(x, cx, 46, 14, '#5ff2ff', 1); poly(x, [cx, 39, cx + 5, 46, cx, 53, cx - 5, 46]); fillStroke(x, '#c8fbff', 1.4); },
    hair: (x, cx) => { x.beginPath(); x.moveTo(cx - 17, 24); x.quadraticCurveTo(cx - 19, 6, cx, 6); x.quadraticCurveTo(cx + 19, 6, cx + 17, 22); x.lineTo(cx + 9, 14); x.lineTo(cx + 2, 17); x.lineTo(cx - 6, 13); x.quadraticCurveTo(cx - 13, 16, cx - 17, 24); x.closePath(); fillStroke(x, lg(x, cx, 6, cx, 24, [[0, '#f0f4f8'], [1, '#a8b0bc']]), 2); }
  }
};function charCanvas(S, look) { return mk(64, 68, S, x => drawChar(x, look)); }

export const SKINS = [SKIN.light, SKIN.tan, SKIN.deep, SKIN.dark];
export const HAIR_COLORS = ['#2a201c', '#6a3e1e', '#d9b060', '#b8502a', '#d8dce4'];
export const BODY_W = [11, 13, 15.5];
export const LOOK_NAMES = { head: { m: ['Crop', 'Swept', 'Spiky'], f: ['Ponytail', 'Long', 'Bun'] }, face: ['Steady', 'Fierce', 'Bright'], body: ['Lean', 'Standard', 'Heavy'] };
const hairFill = (x, col, y0, y1) => lg(x, 0, y0, 0, y1, [[0, shade(col, .18)], [1, shade(col, -.22)]]);
const HAIRS = {
  m: [
    { hair: (x, cx, c) => { x.beginPath(); x.moveTo(cx - 17, 23); x.quadraticCurveTo(cx - 18, 6, cx, 6); x.quadraticCurveTo(cx + 18, 6, cx + 17, 23); x.quadraticCurveTo(cx + 13, 14, cx + 5, 15); x.lineTo(cx, 13); x.lineTo(cx - 5, 15); x.quadraticCurveTo(cx - 13, 14, cx - 17, 23); x.closePath(); fillStroke(x, hairFill(x, c, 6, 23), 2); } },
    { hair: (x, cx, c) => { x.beginPath(); x.moveTo(cx - 17, 24); x.quadraticCurveTo(cx - 19, 5, cx + 1, 5); x.quadraticCurveTo(cx + 19, 5, cx + 17, 21); x.quadraticCurveTo(cx + 8, 11, cx - 4, 17); x.quadraticCurveTo(cx - 11, 19, cx - 17, 24); x.closePath(); fillStroke(x, hairFill(x, c, 5, 24), 2);
      x.beginPath(); x.moveTo(cx + 2, 8); x.quadraticCurveTo(cx + 12, 9, cx + 15, 17); x.lineWidth = 1.4; x.strokeStyle = shade(c, .4); x.stroke(); } },
    { hair: (x, cx, c) => { x.beginPath(); x.moveTo(cx - 18, 24); x.lineTo(cx - 20, 13); x.lineTo(cx - 14, 11); x.lineTo(cx - 14, 3); x.lineTo(cx - 6, 7); x.lineTo(cx - 1, -1); x.lineTo(cx + 5, 6); x.lineTo(cx + 13, 1); x.lineTo(cx + 14, 10); x.lineTo(cx + 20, 13); x.lineTo(cx + 18, 24); x.quadraticCurveTo(cx + 12, 15, cx + 3, 16); x.lineTo(cx - 4, 13); x.quadraticCurveTo(cx - 12, 16, cx - 18, 24); x.closePath(); fillStroke(x, hairFill(x, c, 0, 24), 2); } }
  ],
  f: [
    { hairBack: (x, cx, c) => { x.beginPath(); x.moveTo(cx + 9, 12); x.quadraticCurveTo(cx + 27, 16, cx + 22, 42); x.lineWidth = 8; x.strokeStyle = OL; x.stroke(); x.lineWidth = 5.6; x.strokeStyle = shade(c, -.05); x.stroke(); ell(x, cx + 12, 10, 3, 3); fillStroke(x, '#5ff2d0', 1); },
      hair: (x, cx, c) => { x.beginPath(); x.moveTo(cx - 17, 24); x.quadraticCurveTo(cx - 18, 5, cx, 5); x.quadraticCurveTo(cx + 18, 5, cx + 17, 22); x.quadraticCurveTo(cx + 8, 11, cx - 3, 14); x.quadraticCurveTo(cx - 12, 16, cx - 17, 24); x.closePath(); fillStroke(x, hairFill(x, c, 5, 24), 2); } },
    { hairBack: (x, cx, c) => { x.beginPath(); x.moveTo(cx - 19, 18); x.quadraticCurveTo(cx - 23, 40, cx - 17, 50); x.lineTo(cx + 17, 50); x.quadraticCurveTo(cx + 23, 40, cx + 19, 18); x.closePath(); fillStroke(x, hairFill(x, c, 18, 50), 2); },
      hair: (x, cx, c) => { x.beginPath(); x.moveTo(cx - 19, 33); x.quadraticCurveTo(cx - 22, 3, cx, 3); x.quadraticCurveTo(cx + 22, 3, cx + 19, 33); x.quadraticCurveTo(cx + 15, 14, cx + 2, 14); x.quadraticCurveTo(cx - 13, 14, cx - 19, 33); x.closePath(); fillStroke(x, hairFill(x, c, 3, 33), 2); } },
    { hairBack: (x, cx, c) => { ell(x, cx, 3, 9, 7.5); fillStroke(x, hairFill(x, c, -4, 11), 2); },
      hair: (x, cx, c) => { x.beginPath(); x.moveTo(cx - 18, 27); x.quadraticCurveTo(cx - 19, 5, cx, 6); x.quadraticCurveTo(cx + 19, 5, cx + 18, 27); x.quadraticCurveTo(cx + 14, 15, cx + 5, 15); x.quadraticCurveTo(cx, 12, cx - 5, 15); x.quadraticCurveTo(cx - 14, 15, cx - 18, 27); x.closePath(); fillStroke(x, hairFill(x, c, 5, 27), 2); } }
  ]
};
const GEAR = {
  vanguard: { head: (x, cx) => { rr(x, cx - 15, 16, 30, 5, 2.5); fillStroke(x, '#5ff2ff', 1.4); glow(x, cx, 18, 16, '#5ff2ff', .35); poly(x, [cx - 3, 7, cx, 0, cx + 3, 7]); fillStroke(x, '#ff7a4a', 1.4); } },
  railwarden: { head: (x, cx) => { ell(x, cx - 6, 13, 4.6, 4); fillStroke(x, '#ffb648', 1.6); ell(x, cx + 6, 13, 4.6, 4); fillStroke(x, '#ffb648', 1.6); ell(x, cx - 7, 12, 1.4, 1.2); x.fillStyle = '#fff6d0'; x.fill(); ell(x, cx + 5, 12, 1.4, 1.2); x.fill(); } },
  psion: { head: (x, cx) => { x.beginPath(); x.moveTo(cx - 13, 16); x.quadraticCurveTo(cx, 11, cx + 13, 16); x.lineWidth = 2; x.strokeStyle = '#b46bff'; x.stroke(); poly(x, [cx, 11, cx + 3, 15, cx, 19, cx - 3, 15]); fillStroke(x, '#d9a8ff', 1.2); glow(x, cx, 15, 9, '#c58bff', .8); } },
  shade: {
    back: (x, cx) => { x.beginPath(); x.moveTo(cx - 22, 40); x.quadraticCurveTo(cx - 25, 8, cx - 8, 6); x.quadraticCurveTo(cx, 4, cx + 8, 6); x.quadraticCurveTo(cx + 25, 8, cx + 22, 40); x.closePath(); fillStroke(x, lg(x, cx, 4, cx, 40, [[0, '#3a3046'], [1, '#1a1420']]), 2);
      x.beginPath(); x.moveTo(cx - 19, 30); x.quadraticCurveTo(cx - 22, 10, cx - 6, 8); x.moveTo(cx + 19, 30); x.quadraticCurveTo(cx + 22, 10, cx + 6, 8); x.lineWidth = 1.6; x.strokeStyle = '#ff5a9a'; x.stroke(); },
    front: (x, cx) => { x.beginPath(); x.moveTo(cx - 13, 28.5); x.quadraticCurveTo(cx, 31, cx + 13, 28.5); x.quadraticCurveTo(cx + 12, 39, cx, 41); x.quadraticCurveTo(cx - 12, 39, cx - 13, 28.5); x.closePath(); fillStroke(x, lg(x, cx, 28, cx, 41, [[0, '#3a3046'], [1, '#18121e']]), 1.6);
      x.beginPath(); x.moveTo(cx - 10, 33); x.lineTo(cx + 10, 33); x.lineWidth = 1.4; x.strokeStyle = '#ff5a9a'; x.stroke(); glow(x, cx, 33, 8, '#ff5a9a', .5); }
  },
  mender: { head: (x, cx) => { rr(x, cx + 1, 21.5, 12, 8, 3.5); x.fillStyle = 'rgba(95,242,208,.55)'; x.fill(); x.lineWidth = 1.4; x.strokeStyle = '#2fd0b8'; x.stroke(); glow(x, cx + 7, 25.5, 8, '#5ff2d0', .7); ell(x, cx + 17, 25, 3, 4); fillStroke(x, '#b9d8d2', 1.2); } },
  duelist: { head: (x, cx) => { ell(x, cx, 12.5, 27, 6.5); fillStroke(x, lg(x, cx, 6, cx, 19, [[0, '#6a4a34'], [1, '#3a281c']]), 2);
    x.beginPath(); x.moveTo(cx - 14, 12); x.quadraticCurveTo(cx - 13, -4, cx, -4); x.quadraticCurveTo(cx + 13, -4, cx + 14, 12); x.closePath(); fillStroke(x, lg(x, cx, -4, cx, 12, [[0, '#6a4a34'], [1, '#4a3424']]), 2);
    rr(x, cx - 14, 7, 28, 4, 1.5); fillStroke(x, '#2a1c14', 1.2); poly(x, [cx, 5, cx + 3, 8.5, cx, 12, cx - 3, 8.5]); fillStroke(x, '#5ff2ff', 1); glow(x, cx, 8.5, 7, '#5ff2ff', .7); } }
};
export const DEFAULT_LOOKS = {
  vanguard: { sex: 'm', head: 0, face: 0, body: 1, skin: 1, hairc: 2 },
  railwarden: { sex: 'm', head: 1, face: 1, body: 0, skin: 0, hairc: 1 },
  psion: { sex: 'f', head: 1, face: 2, body: 0, skin: 2, hairc: 4 },
  shade: { sex: 'm', head: 1, face: 1, body: 0, skin: 0, hairc: 0 },
  mender: { sex: 'm', head: 2, face: 0, body: 1, skin: 1, hairc: 0 },
  duelist: { sex: 'm', head: 0, face: 2, body: 1, skin: 1, hairc: 1 }
};
export function composeLook(cls, look) {
  const L = LOOKS[cls], lk = Object.assign({}, DEFAULT_LOOKS[cls] || DEFAULT_LOOKS.vanguard, look || {});
  const H = HAIRS[lk.sex === 'f' ? 'f' : 'm'][lk.head % 3], G = lk.gear === false ? {} : (GEAR[cls] || {}), hc = HAIR_COLORS[lk.hairc % HAIR_COLORS.length];
  return {
    skin: SKINS[lk.skin % SKINS.length], coat: L.coat, trim: L.trim, iris: L.iris, long: L.long, chest: L.chest, bw: BODY_W[lk.body % 3], face: lk.face % 3, sex: lk.sex, brow: shade(hc, -.35),
    back: G.back,
    hairBack: H.hairBack ? (x, cx) => H.hairBack(x, cx, hc) : null,
    hair: (x, cx) => { H.hair(x, cx, hc); if (G.head) G.head(x, cx); },
    front: G.front
  };
}
export function heroCanvas(S, cls, look) { return charCanvas(S, composeLook(cls, look)); }
export const RANK_THEMES = {
  recruit: { bg: ['#18384a', '#0a1622'] },
  hunter: { bg: ['#1a4a40', '#081a16'], deco: (x, s) => { x.fillStyle = 'rgba(95,242,208,.12)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(s * (.15 + i * .14), s * .88, s * .05, 0, Math.PI * 2); x.fill(); } } },
  veteran: { bg: ['#4a3418', '#160e06'], deco: (x, s) => { x.lineWidth = s * .03; x.strokeStyle = 'rgba(217,164,90,.55)'; x.beginPath(); x.arc(s / 2, s * .55, s * .46, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } },
  warden: { bg: ['#122a5a', '#060a1a'], deco: (x, s) => { glow(x, s / 2, s * .95, s * .4, '#5ff2ff', .35); } },
  ascendant: { bg: ['#2a1a4a', '#08060e'], deco: (x, s) => { x.lineWidth = s * .025; x.strokeStyle = 'rgba(255,207,90,.8)'; x.beginPath(); x.ellipse(s / 2, s * .16, s * .26, s * .07, 0, 0, Math.PI * 2); x.stroke(); glow(x, s / 2, s * .3, s * .45, '#5ff2ff', .25); } },
  starborn: { bg: ['#0a0a2a', '#000004'], deco: (x, s) => { const R = rng(9); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,240,200,${.3 + R() * .6})`; x.fillRect(R() * s, R() * s * .7, 1.6, 1.6); } for (let i = 0; i < 5; i++) { const a = Math.PI * (1.15 + i * .175); star(x, s / 2 + Math.cos(a) * s * .3, s * .42 + Math.sin(a) * s * .3, s * .035, s * .014, 4); } } }
};
export function portraitCanvas(look, size = 128, theme) {
  const k = size / 44, T = theme || { bg: ['#18384a', '#0a1622'] };
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const x = c.getContext('2d');
  x.fillStyle = rg(x, size / 2, size * .45, size * .7, [[0, T.bg[0]], [1, T.bg[1]]]); x.fillRect(0, 0, size, size);
  if (T.deco) { x.save(); x.fillStyle = '#ffffff'; T.deco(x, size); x.restore(); }
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
  blink: x => { x.setLineDash([4, 7]); x.beginPath(); x.moveTo(18, 66); x.quadraticCurveTo(40, 20, 66, 34); x.stroke(); x.setLineDash([]); poly(x, [62, 24, 76, 36, 60, 42]); x.fill(); },
  fan: x => { for (const a of [-1.1, -.55, 0, .55, 1.1]) { x.save(); x.translate(48, 72); x.rotate(a); poly(x, [0, -50, 5, -30, 0, -24, -5, -30]); x.fill(); x.restore(); } },
  veil: x => { x.beginPath(); x.moveTo(24, 70); x.quadraticCurveTo(22, 22, 48, 18); x.quadraticCurveTo(74, 22, 72, 70); x.quadraticCurveTo(60, 60, 48, 70); x.quadraticCurveTo(36, 60, 24, 70); x.stroke(); x.beginPath(); x.moveTo(36, 44); x.lineTo(60, 44); x.lineWidth = 4; x.stroke(); },
  eclipse: x => { x.beginPath(); x.arc(48, 48, 26, 0, Math.PI * 2); x.fill(); x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(58, 42, 22, 0, Math.PI * 2); x.fill(); x.restore(); },
  mend: x => { x.lineWidth = 10; x.beginPath(); x.moveTo(48, 26); x.lineTo(48, 70); x.moveTo(26, 48); x.lineTo(70, 48); x.stroke(); x.lineWidth = 3; x.beginPath(); x.arc(48, 48, 34, 0, Math.PI * 2); x.stroke(); },
  medrone: x => { x.beginPath(); x.arc(48, 54, 14, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(26, 32); x.lineTo(70, 32); x.moveTo(48, 32); x.lineTo(48, 40); x.stroke(); x.lineWidth = 4; x.beginPath(); x.moveTo(48, 48); x.lineTo(48, 60); x.moveTo(42, 54); x.lineTo(54, 54); x.stroke(); },
  stasis: x => { x.beginPath(); x.ellipse(48, 56, 32, 14, 0, 0, Math.PI * 2); x.stroke(); for (const p of [32, 48, 64]) { x.beginPath(); x.moveTo(p, 52); x.lineTo(p, 26); x.lineWidth = 3; x.stroke(); } },
  lifeline: x => { x.beginPath(); x.moveTo(16, 52); x.lineTo(34, 52); x.lineTo(40, 34); x.lineTo(50, 70); x.lineTo(58, 44); x.lineTo(64, 52); x.lineTo(80, 52); x.stroke(); },
  quickdraw: x => { for (const o of [0, 12, 24]) { x.beginPath(); x.moveTo(18 + o, 64 - o); x.lineTo(40 + o, 64 - o); x.lineWidth = 4; x.stroke(); } x.beginPath(); x.arc(70, 34, 8, 0, Math.PI * 2); x.fill(); },
  ricochet: x => { x.beginPath(); x.moveTo(16, 70); x.lineTo(36, 28); x.lineTo(56, 66); x.lineTo(78, 24); x.stroke(); for (const [a, b] of [[36, 28], [56, 66]]) { x.beginPath(); x.arc(a, b, 5, 0, Math.PI * 2); x.fill(); } },
  roll: x => { x.beginPath(); x.arc(48, 48, 22, Math.PI * .2, Math.PI * 1.7); x.stroke(); poly(x, [64, 18, 74, 34, 56, 34]); x.fill(); for (const p of [20, 30]) { x.beginPath(); x.moveTo(p - 8, 76); x.lineTo(p + 6, 76); x.lineWidth = 3; x.stroke(); } },
  deadeye: x => { x.beginPath(); x.arc(48, 48, 26, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(48, 48, 12, 0, Math.PI * 2); x.lineWidth = 4; x.stroke(); x.beginPath(); x.moveTo(48, 14); x.lineTo(48, 30); x.moveTo(48, 66); x.lineTo(48, 82); x.moveTo(14, 48); x.lineTo(30, 48); x.moveTo(66, 48); x.lineTo(82, 48); x.stroke(); },
  tower: x => { for (let i = 0; i < 5; i++) { rr(x, 36 + i * 2, 70 - i * 12, 24 - i * 4, 9, 3); x.lineWidth = 4; x.stroke(); } star(x, 48, 14, 7, 3, 4); },
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

  A.towerfloor = mk(256, 256, Math.min(S, 2), (x, w, h) => {
    x.fillStyle = '#0c0a16'; x.fillRect(0, 0, w, h);
    const R = rng(31);
    for (let gy = 0; gy < 4; gy++) for (let gx = 0; gx < 4; gx++) { const X = gx * 64 + (gy % 2) * 32, Y = gy * 64; for (const dx of [0, -w]) { rr(x, X + dx + 2, Y + 2, 60, 60, 6); x.fillStyle = `rgba(${40 + R() * 20},${30 + R() * 16},${70 + R() * 30},.55)`; x.fill(); x.lineWidth = 1.2; x.strokeStyle = 'rgba(255,207,90,.08)'; x.stroke(); } }
    for (let i = 0; i < 6; i++) { let px = R() * w, py = R() * h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (R() - .5) * 40; py += R() * 26; x.lineTo(px, py); } x.lineWidth = 1.4; x.strokeStyle = 'rgba(255,207,90,.18)'; x.stroke(); }
    for (let i = 0; i < 70; i++) { const px = R() * w, py = R() * h, r = R() * 1.2 + .3; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fillStyle = R() < .3 ? 'rgba(159,246,255,.6)' : 'rgba(255,240,200,.45)'; x.fill(); }
  });
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
  for (const k of ['vanguard', 'railwarden', 'psion', 'shade', 'mender', 'duelist', 'marr', 'sparks', 'okafor', 'kestrel', 'corvin', 'hush', 'ilse', 'bix', 'pell', 'tovin', 'nessa']) A['ch_' + k] = charCanvas(S, LOOKS[k]);
  A.w_knife = mk(12, 32, S, x => { poly(x, [6, 1, 10, 8, 9, 22, 3, 22, 2, 8]); fillStroke(x, lg(x, 0, 0, 12, 0, [[0, '#ffd8ea'], [.5, '#ffffff'], [1, '#ff5a9a']]), 1.4); glow(x, 6, 12, 10, '#ff5a9a', .7); rr(x, 1, 22, 10, 3, 1.5); fillStroke(x, '#3a3046', 1.2); rr(x, 4, 25, 4, 6, 2); fillStroke(x, '#1a1420', 1); });
  A.w_staff = mk(18, 74, S, x => { rr(x, 7, 14, 4, 58, 2); fillStroke(x, lg(x, 7, 0, 11, 0, [[0, '#dfe8e6'], [1, '#8aa8a2']]), 1.4); for (const p of [30, 50]) { rr(x, 5.5, p, 7, 4, 1.5); fillStroke(x, '#2fd0b8', 1); }
    glow(x, 9, 9, 10, '#5ff2d0', .9); ell(x, 9, 9, 6, 6); x.fillStyle = rg(x, 8, 8, 6, [[0, '#ffffff'], [.5, '#c8fff2'], [1, '#2fd0b8']]); x.fill(); x.lineWidth = 1.4; x.strokeStyle = OL; x.stroke(); });
  A.w_pistol = mk(34, 18, S, x => { rr(x, 2, 8, 8, 9, 2.5); fillStroke(x, '#6a4030', 1.4); rr(x, 6, 4, 26, 6, 2); fillStroke(x, '#4a5a62', 1.4); ell(x, 12, 9, 4.5, 4); fillStroke(x, '#6a7a82', 1.2); rr(x, 14, 5, 16, 2, 1); x.fillStyle = '#5ff2ff'; x.fill(); glow(x, 22, 6, 8, '#5ff2ff', .5); });
  A.knife = mk(10, 28, S, x => { poly(x, [5, 1, 9, 9, 7, 26, 3, 26, 1, 9]); fillStroke(x, lg(x, 0, 0, 10, 0, [[0, '#ffd8ea'], [1, '#ff5a9a']]), 1.2); glow(x, 5, 12, 9, '#ff5a9a', .8); });
  A.medrone = mk(30, 22, S, x => { ell(x, 15, 13, 9, 7); fillStroke(x, lg(x, 15, 6, 15, 20, [[0, '#ffffff'], [1, '#b9d8d2']]), 1.6); rr(x, 1, 3, 28, 3, 1.5); fillStroke(x, '#8aa8a2', 1); rr(x, 13, 9, 4, 8, 1); x.fillStyle = '#2fd0b8'; x.fill(); rr(x, 11, 11, 8, 4, 1); x.fill(); glow(x, 15, 13, 10, '#5ff2d0', .5); });
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
  buildDunes(A, S);
  buildLattice(A, S);
  buildHeartstrand(A, S);
  return A;
}

function buildDunes(A, S) {
  A.sand = mk(256, 256, Math.min(S, 2), (x, w, h) => {
    x.fillStyle = '#b8743e'; x.fillRect(0, 0, w, h);
    const R = rng(21);
    const wrap = (fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) fn(dx, dy); };
    for (let i = 0; i < 12; i++) { const cx = R() * w, cy = R() * h, r = 40 + R() * 70, light = R() > .45; wrap((dx, dy) => { x.fillStyle = rg(x, cx + dx, cy + dy, r, [[0, light ? 'rgba(240,180,110,.22)' : 'rgba(110,50,20,.2)'], [1, 'rgba(0,0,0,0)']]); x.fillRect(cx + dx - r, cy + dy - r, r * 2, r * 2); }); }
    for (let k = 0; k < 11; k++) {
      const y0 = k * 23.3 + R() * 6, amp = 3 + R() * 3, ph = R() * 6.28, f = 1 + Math.floor(R() * 2);
      for (const [off, col, lw] of [[0, 'rgba(110,52,20,.28)', 1.6], [2, 'rgba(255,224,170,.2)', 1.2]]) {
        x.beginPath(); for (let px = 0; px <= w; px += 4) { const py = y0 + off + Math.sin(px / w * Math.PI * 2 * f + ph) * amp; px ? x.lineTo(px, py) : x.moveTo(px, py); } x.lineWidth = lw; x.strokeStyle = col; x.stroke();
      }
    }
    for (let i = 0; i < 700; i++) { x.fillStyle = R() > .5 ? 'rgba(255,230,190,.12)' : 'rgba(80,30,10,.14)'; x.fillRect(R() * w, R() * h, 1.4, 1.4); }
    for (let i = 0; i < 14; i++) { const px = R() * w, py = R() * h; wrap((dx, dy) => { ell(x, px + dx, py + dy, 2.2, 1.6); x.fillStyle = 'rgba(90,40,20,.45)'; x.fill(); }); }
  });
  A.sandpath = mk(120, 70, S > 2 ? 2 : S, x => { x.save(); x.scale(1, 70 / 120); x.fillStyle = rg(x, 60, 60, 60, [[0, 'rgba(236,190,130,.5)'], [.6, 'rgba(226,176,116,.3)'], [1, 'rgba(220,170,110,0)']]); x.fillRect(0, 0, 120, 120); x.restore(); });
  A.dune = mk(260, 90, S, x => {
    x.beginPath(); x.moveTo(4, 86); x.bezierCurveTo(40, 40, 90, 18, 140, 14); x.bezierCurveTo(190, 12, 230, 50, 256, 86); x.closePath();
    x.fillStyle = lg(x, 0, 14, 0, 86, [[0, '#e9b072'], [1, 'rgba(176,106,54,.0)']]); x.fill();
    x.beginPath(); x.moveTo(140, 14); x.bezierCurveTo(190, 12, 230, 50, 256, 86); x.lineTo(150, 86); x.bezierCurveTo(160, 60, 150, 30, 140, 14); x.closePath(); x.fillStyle = 'rgba(110,52,22,.28)'; x.fill();
    x.beginPath(); x.moveTo(30, 66); x.bezierCurveTo(60, 36, 100, 18, 140, 14); x.lineWidth = 1.6; x.strokeStyle = 'rgba(255,236,200,.55)'; x.stroke();
  });
  A.mesa = mk(120, 100, S, x => {
    poly(x, [6, 96, 14, 40, 30, 22, 70, 14, 100, 24, 112, 50, 116, 96]); fillStroke(x, lg(x, 0, 14, 0, 96, [[0, '#c0643a'], [1, '#6a2a18']]), 2.2);
    x.save(); poly(x, [6, 96, 14, 40, 30, 22, 70, 14, 100, 24, 112, 50, 116, 96]); x.clip();
    for (const [y, c] of [[38, 'rgba(255,190,130,.25)'], [56, 'rgba(60,20,10,.25)'], [74, 'rgba(255,190,130,.18)']]) { x.fillStyle = c; x.fillRect(0, y, 120, 7); }
    poly(x, [70, 14, 100, 24, 112, 50, 116, 96, 84, 96, 80, 40]); x.fillStyle = 'rgba(50,15,8,.3)'; x.fill(); x.restore();
  });
  A.vein = mk(44, 40, S, x => { glow(x, 22, 26, 20, '#ffb84a', .4); for (const [a, b, h, l, c] of [[14, 36, 18, -5, 0], [22, 37, 26, 1, 1], [31, 36, 16, 6, 0]]) shard(x, a, b, 7, h, l, c ? '#d8fff8' : '#ffe6b0', c ? '#1f8a8a' : '#c86a1a', .95); });
  A.wreck = mk(200, 120, S, x => {
    ell(x, 100, 112, 96, 10); x.fillStyle = 'rgba(70,30,12,.35)'; x.fill();
    x.save(); x.translate(96, 70); x.rotate(-.18);
    rr(x, -70, -40, 140, 64, 10); fillStroke(x, lg(x, 0, -40, 0, 24, [[0, '#a8643a'], [1, '#5a2e1a']]), 2.4);
    x.beginPath(); x.moveTo(-70, -12); x.lineTo(70, -12); x.lineWidth = 2; x.strokeStyle = 'rgba(30,12,6,.5)'; x.stroke();
    x.beginPath(); x.moveTo(-66, -40); x.quadraticCurveTo(-20, -70, 30, -40); x.lineWidth = 3; x.strokeStyle = OL; x.stroke(); x.lineWidth = 1.8; x.strokeStyle = '#2fbfb0'; x.stroke();
    x.restore();
    for (const [cx, cy, r] of [[46, 98, 16], [150, 82, 15]]) { ell(x, cx, cy, r, r); fillStroke(x, '#3a2a20', 2.4); ell(x, cx, cy, r * .35, r * .35); x.fillStyle = '#d99a4a'; x.fill(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r * .9, cy + Math.sin(a) * r * .9); x.lineWidth = 1.6; x.strokeStyle = '#d99a4a'; x.stroke(); } }
    for (const [cx, cy, rot] of [[176, 104, .3], [20, 108, -.4]]) { x.save(); x.translate(cx, cy); x.rotate(rot); rr(x, -12, -10, 24, 18, 3); fillStroke(x, '#8a5a34', 1.8); x.beginPath(); x.moveTo(-12, -10); x.lineTo(-4, -18); x.lineWidth = 2; x.strokeStyle = '#8a5a34'; x.stroke(); x.restore(); }
  });
  A.tentd = mk(140, 96, S, x => {
    x.beginPath(); x.moveTo(8, 92); x.quadraticCurveTo(14, 10, 70, 8); x.quadraticCurveTo(126, 10, 132, 92); x.closePath(); fillStroke(x, lg(x, 0, 8, 0, 92, [[0, '#f4e2bc'], [1, '#b8946a']]), 2.4);
    x.save(); x.clip(); for (const [y, c] of [[30, '#e87a3a'], [42, '#2fbfb0'], [70, '#e87a3a']]) { x.fillStyle = c; x.fillRect(0, y, 140, 6); } x.restore();
    x.beginPath(); x.moveTo(56, 92); x.quadraticCurveTo(70, 44, 84, 92); x.closePath(); fillStroke(x, '#3a2418', 2);
    x.beginPath(); x.moveTo(70, 8); x.lineTo(70, -2); x.lineWidth = 2.4; x.strokeStyle = '#6a4a2a'; x.stroke(); poly(x, [70, -2, 84, 2, 70, 6]); x.fillStyle = '#2fbfb0'; x.fill();
  });
  A.fire = mk(60, 50, S, x => { glow(x, 30, 26, 30, '#ffa040', .7); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; ell(x, 30 + Math.cos(a) * 16, 40 + Math.sin(a) * 6, 5, 3.6); fillStroke(x, '#6a5a52', 1.4); } x.beginPath(); x.moveTo(20, 40); x.quadraticCurveTo(18, 22, 30, 6); x.quadraticCurveTo(42, 22, 40, 40); x.closePath(); x.fillStyle = lg(x, 30, 6, 30, 40, [[0, '#fff2a0'], [.5, '#ff9a2a'], [1, '#d9401a']]); x.fill(); x.beginPath(); x.moveTo(25, 40); x.quadraticCurveTo(25, 28, 30, 20); x.quadraticCurveTo(35, 28, 35, 40); x.closePath(); x.fillStyle = '#fffbe0'; x.fill(); });
  A.rig = mk(220, 300, S, x => {
    glow(x, 150, 236, 60, '#5ff2d0', .45);
    x.lineWidth = 7; x.strokeStyle = OL; x.beginPath(); x.moveTo(40, 290); x.lineTo(96, 30); x.lineTo(152, 290); x.stroke();
    x.lineWidth = 4.5; x.strokeStyle = '#9a3a24'; x.beginPath(); x.moveTo(40, 290); x.lineTo(96, 30); x.lineTo(152, 290); x.stroke();
    x.lineWidth = 2.2; x.strokeStyle = '#c0583a'; for (let i = 0; i < 6; i++) { const y1 = 60 + i * 38, y2 = y1 + 38, f = y => (y - 30) / 260 * 56; x.beginPath(); x.moveTo(96 - f(y1), y1); x.lineTo(96 + f(y2), y2); x.moveTo(96 + f(y1), y1); x.lineTo(96 - f(y2), y2); x.stroke(); }
    rr(x, 78, 16, 36, 18, 4); fillStroke(x, '#ffcf5a', 2); ell(x, 96, 25, 5, 5); x.fillStyle = '#7a3a20'; x.fill();
    x.beginPath(); x.moveTo(96, 34); x.lineTo(96, 270); x.lineWidth = 2; x.strokeStyle = '#3a2a24'; x.stroke();
    rr(x, 122, 196, 56, 92, 14); fillStroke(x, lg(x, 0, 196, 0, 288, [[0, 'rgba(200,255,250,.9)'], [1, 'rgba(47,191,176,.85)']]), 2.4);
    x.save(); rr(x, 122, 196, 56, 92, 14); x.clip(); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(130, 196, 8, 92); for (let i = 0; i < 6; i++) { ell(x, 136 + i * 7, 280 - i * 13, 2.4, 2.4); x.fillStyle = '#ffffff'; x.fill(); } x.restore();
    rr(x, 118, 190, 64, 10, 3); fillStroke(x, '#8a3324', 1.8); rr(x, 118, 284, 64, 10, 3); fillStroke(x, '#8a3324', 1.8);
    x.beginPath(); x.moveTo(122, 240); x.lineTo(104, 240); x.lineTo(104, 286); x.lineWidth = 6; x.strokeStyle = OL; x.stroke(); x.lineWidth = 4; x.strokeStyle = '#6a7a84'; x.stroke();
    poly(x, [12, 300, 30, 272, 166, 272, 196, 300]); fillStroke(x, '#5a2e1e', 2);
    for (let i = 0; i < 7; i++) { poly(x, [24 + i * 24, 300, 34 + i * 24, 280, 44 + i * 24, 280, 34 + i * 24, 300]); x.fillStyle = i % 2 ? '#1a1a1a' : '#ffcf5a'; x.fill(); }
  });
  A.fence = mk(96, 50, S, x => { for (const px of [8, 86]) { rr(x, px - 3, 6, 6, 42, 2); fillStroke(x, '#5a5e64', 1.4); } rr(x, 6, 16, 84, 9, 2); fillStroke(x, '#ffcf5a', 1.6); x.save(); rr(x, 6, 16, 84, 9, 2); x.clip(); for (let i = 0; i < 12; i++) { poly(x, [i * 10, 25, i * 10 + 5, 16, i * 10 + 10, 16, i * 10 + 5, 25]); x.fillStyle = '#1a1a1a'; x.fill(); } x.restore(); ell(x, 8, 6, 3, 3); x.fillStyle = '#ff3a3a'; x.fill(); glow(x, 8, 6, 7, '#ff3a3a', .8); });
  A.scrap = mk(96, 56, S, x => { const R = rng(77); for (let i = 0; i < 9; i++) { const a = 10 + R() * 70, b = 20 + R() * 28, w = 14 + R() * 18, h = 8 + R() * 10; x.save(); x.translate(a, b); x.rotate((R() - .5) * 1.2); rr(x, -w / 2, -h / 2, w, h, 2); fillStroke(x, R() > .5 ? '#9a4a2a' : '#6a6e74', 1.6); x.restore(); } x.beginPath(); x.arc(64, 22, 10, 0, 6.28); x.lineWidth = 4; x.strokeStyle = OL; x.stroke(); x.lineWidth = 2.6; x.strokeStyle = '#b8742c'; x.stroke(); });
  A.redshot = mk(18, 18, S, x => { glow(x, 9, 9, 9, '#ff4a3a', .95); ell(x, 9, 9, 3.6, 3.6); x.fillStyle = '#ffe0d8'; x.fill(); });
  A.sandpuff = mk(40, 24, S, x => { x.save(); x.scale(1, .6); x.fillStyle = rg(x, 20, 20, 20, [[0, 'rgba(240,200,150,.8)'], [1, 'rgba(240,200,150,0)']]); x.fillRect(0, 0, 40, 40); x.restore(); });

  A.skimmer = mk(76, 46, S, x => {
    x.beginPath(); x.moveTo(38, 20); x.bezierCurveTo(26, 4, 8, 4, 2, 16); x.bezierCurveTo(10, 22, 22, 28, 34, 30); x.closePath();
    fillStroke(x, lg(x, 2, 4, 36, 30, [[0, '#f6ead2'], [1, '#c88a52']]), 1.8);
    x.beginPath(); x.moveTo(40, 20); x.bezierCurveTo(52, 4, 70, 4, 74, 16); x.bezierCurveTo(66, 22, 54, 28, 42, 30); x.closePath();
    fillStroke(x, lg(x, 74, 4, 40, 30, [[0, '#f6ead2'], [1, '#c88a52']]), 1.8);
    x.beginPath(); x.moveTo(52, 30); x.quadraticCurveTo(66, 36, 74, 44); x.lineWidth = 2; x.strokeStyle = OL; x.stroke(); x.lineWidth = 1.2; x.strokeStyle = '#efe2c8'; x.stroke();
    ell(x, 38, 26, 13, 9); fillStroke(x, lg(x, 38, 17, 38, 35, [[0, '#fff6e6'], [1, '#d8b088']]), 2);
    rr(x, 31, 18, 14, 6, 3); fillStroke(x, '#b8642e', 1.2);
    ell(x, 30, 27, 2.4, 2.4); x.fillStyle = '#5ff2e0'; x.fill(); ell(x, 46, 27, 2.4, 2.4); x.fill(); glow(x, 30, 27, 6, '#5ff2e0', .8); glow(x, 46, 27, 6, '#5ff2e0', .8);
  });
  A.hound = mk(72, 52, S, x => {
    x.lineWidth = 3.4; x.strokeStyle = OL;
    for (const [a, b] of [[22, 2], [30, -2], [48, 2], [56, -2]]) { x.beginPath(); x.moveTo(a, 32); x.lineTo(a + b, 42); x.lineTo(a + b - 2, 50); x.stroke(); }
    x.lineWidth = 2.2; x.strokeStyle = '#7a3a20'; for (const [a, b] of [[22, 2], [30, -2], [48, 2], [56, -2]]) { x.beginPath(); x.moveTo(a, 32); x.lineTo(a + b, 42); x.lineTo(a + b - 2, 50); x.stroke(); }
    rr(x, 18, 16, 44, 20, 8); fillStroke(x, lg(x, 0, 16, 0, 36, [[0, '#c8683a'], [1, '#7a3420']]), 2);
    for (const px of [28, 40, 52]) { x.beginPath(); x.moveTo(px, 16); x.lineTo(px, 36); x.lineWidth = 1.2; x.strokeStyle = 'rgba(40,12,6,.5)'; x.stroke(); }
    x.beginPath(); x.moveTo(62, 20); x.lineTo(70, 12); x.lineWidth = 2; x.strokeStyle = '#5a5e64'; x.stroke();
    rr(x, 2, 12, 22, 16, 5); fillStroke(x, lg(x, 0, 12, 0, 28, [[0, '#d07440'], [1, '#8a3a20']]), 2);
    rr(x, 0, 22, 12, 8, 2); fillStroke(x, '#6a2e1a', 1.4); for (let i = 0; i < 3; i++) { poly(x, [1 + i * 3.6, 29, 2.8 + i * 3.6, 33, 4.6 + i * 3.6, 29]); x.fillStyle = '#f2e6d8'; x.fill(); }
    ell(x, 10, 18, 3.4, 3.4); x.fillStyle = '#ff2a2a'; x.fill(); ell(x, 9.2, 17.2, 1.1, 1.1); x.fillStyle = '#fff'; x.fill(); glow(x, 10, 18, 9, '#ff3a3a', .9);
    x.beginPath(); x.moveTo(18, 12); x.lineTo(16, 2); x.lineWidth = 1.6; x.strokeStyle = '#5a5e64'; x.stroke(); ell(x, 16, 2, 1.6, 1.6); x.fillStyle = '#ff6a3a'; x.fill();
  });
  A.sdrone = mk(52, 50, S, x => {
    glow(x, 26, 44, 12, '#ff7a3a', .7);
    poly(x, [4, 20, 14, 16, 14, 28]); fillStroke(x, '#5a2a1e', 1.4); poly(x, [48, 20, 38, 16, 38, 28]); fillStroke(x, '#5a2a1e', 1.4);
    ell(x, 26, 22, 15, 13); fillStroke(x, lg(x, 26, 9, 26, 35, [[0, '#c0503a'], [1, '#6a2418']]), 2);
    x.beginPath(); x.ellipse(26, 22, 15, 4, 0, 0, Math.PI); x.lineWidth = 2.6; x.strokeStyle = '#ffcf5a'; x.stroke();
    ell(x, 26, 18, 5.4, 5.4); fillStroke(x, '#1a0a08', 1.4); ell(x, 26, 18, 3.4, 3.4); x.fillStyle = '#ff3a2a'; x.fill(); glow(x, 26, 18, 10, '#ff3a2a', .9);
    rr(x, 23, 33, 6, 10, 2); fillStroke(x, '#4a4e54', 1.4);
  });
  A.marrowking = mk(270, 240, S, x => {
    ell(x, 150, 222, 112, 20); x.fillStyle = 'rgba(90,40,14,.45)'; x.fill();
    const seg = [[176, 206, 44, 26], [168, 180, 46, 26], [154, 154, 46, 26], [138, 130, 44, 25], [122, 108, 42, 24], [108, 88, 40, 23]];
    for (const [cx, cy, rx, ry] of seg) {
      ell(x, cx, cy, rx, ry); fillStroke(x, lg(x, cx, cy - ry, cx, cy + ry, [[0, '#f2c084'], [.6, '#c8803e'], [1, '#8a4a22']]), 2.4);
      x.beginPath(); x.ellipse(cx, cy, rx * .92, ry * .5, 0, .1, Math.PI - .1); x.lineWidth = 2.2; x.strokeStyle = 'rgba(95,242,208,.8)'; x.stroke();
      poly(x, [cx + rx * .4, cy - ry + 4, cx + rx * .6, cy - ry - 18, cx + rx * .8, cy - ry + 8]); fillStroke(x, lg(x, 0, cy - ry - 18, 0, cy - ry + 8, [[0, '#ffffff'], [1, '#d9ccad']]), 1.6);
    }
    glow(x, 82, 70, 60, '#5ff2d0', .25);
    ell(x, 86, 64, 56, 48); fillStroke(x, lg(x, 86, 16, 86, 112, [[0, '#f8cc90'], [.55, '#d08a48'], [1, '#8a4a22']]), 3);
    for (const [a, b, l] of [[62, 22, -10], [86, 16, 0], [110, 22, 10], [128, 40, 18]]) { poly(x, [a - 7, b + 4, a + l, b - 22, a + 7, b + 4]); fillStroke(x, lg(x, 0, b - 22, 0, b + 4, [[0, '#ffffff'], [1, '#d9ccad']]), 1.8); }
    ell(x, 74, 76, 34, 30); x.fillStyle = '#3a0c18'; x.fill(); x.lineWidth = 3; x.strokeStyle = OL; x.stroke();
    ell(x, 74, 76, 24, 21); x.fillStyle = rg(x, 74, 76, 24, [[0, '#d8fff8'], [.35, '#5ff2d0'], [.6, '#8a1a3a'], [1, '#c8304a']]); x.fill();
    glow(x, 74, 76, 30, '#5ff2d0', .9);
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, r1 = 32, r2 = 22; poly(x, [74 + Math.cos(a - .14) * r1, 76 + Math.sin(a - .14) * r1 * .9, 74 + Math.cos(a) * r2, 76 + Math.sin(a) * r2 * .9, 74 + Math.cos(a + .14) * r1, 76 + Math.sin(a + .14) * r1 * .9]); x.fillStyle = '#fff6e6'; x.fill(); }
    ell(x, 120, 50, 4.6, 4.6); x.fillStyle = '#5ff2e0'; x.fill(); glow(x, 120, 50, 10, '#5ff2e0', .9);
    for (let i = 0; i < 9; i++) { const a = 40 + i * 24, b = 214 + (i % 2) * 6; ell(x, a, b, 10, 5); x.fillStyle = 'rgba(232,180,120,.9)'; x.fill(); }
  });
}

export const ANCHORS = {
  tree0: [.5, .93], tree1: [.5, .93], tree2: [.5, .93], tree3: [.5, .93], rock: [.5, .9], moss: [.5, .7], bulb: [.5, .95], rib: [.17, .95], spire: [.5, .97],
  dune: [.5, .9], mesa: [.5, .95], vein: [.5, .9], wreck: [.5, .92], tentd: [.5, .96], fire: [.5, .8], rig: [.45, .98], fence: [.5, .95], scrap: [.5, .85],
  hull: [.5, .98], lamp: [.5, .96], crate: [.5, .95], forge: [.5, .97], tent: [.5, .96], stall: [.5, .96], banner: [.5, .98], door: [.5, .95], geode: [.5, .9], root: [.5, .5], crystal: [.5, .92], coral: [.5, .95], kelp: [.5, .96], pool: [.5, .5], cage: [.5, .97], bigheart: [.5, .86], cone: [.5, .9], drift: [.5, .8], vaultdoor: [.5, .95], mill: [.5, .95], marker: [.5, .97]
};

function buildLattice(A, S) {
  A.reef = mk(256, 256, Math.min(S, 2), (x, w, h) => {
    x.fillStyle = '#0d3442'; x.fillRect(0, 0, w, h);
    const R = rng(43);
    const wrap = (fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) fn(dx, dy); };
    for (let i = 0; i < 12; i++) { const cx = R() * w, cy = R() * h, r = 40 + R() * 70, light = R() > .5; wrap((dx, dy) => { x.fillStyle = rg(x, cx + dx, cy + dy, r, [[0, light ? 'rgba(90,170,190,.2)' : 'rgba(4,20,30,.3)'], [1, 'rgba(0,0,0,0)']]); x.fillRect(cx + dx - r, cy + dy - r, r * 2, r * 2); }); }
    for (let i = 0; i < 12; i++) { const cx = R() * w, cy = R() * h, r = 2 + R() * 4; wrap((dx, dy) => { poly(x, [cx + dx, cy + dy - r * 1.6, cx + dx + r * .7, cy + dy, cx + dx, cy + dy + r * .5, cx + dx - r * .7, cy + dy]); x.fillStyle = R() < .5 ? 'rgba(127,200,255,.55)' : 'rgba(95,242,208,.4)'; x.fill(); }); }
    for (let i = 0; i < 90; i++) { const cx = R() * w, cy = R() * h; x.fillStyle = `rgba(200,230,240,${.08 + R() * .12})`; x.fillRect(cx, cy, 1.6, 1.6); }
  });
  A.caustic = mk(256, 256, Math.min(S, 2), (x, w, h) => {
    const R = rng(57);
    x.lineCap = 'round';
    for (let i = 0; i < 26; i++) { let px = R() * w, py = R() * h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { const nx = px + (R() - .5) * 70, ny = py + (R() - .5) * 70; x.quadraticCurveTo((px + nx) / 2 + (R() - .5) * 30, (py + ny) / 2 + (R() - .5) * 30, nx, ny); px = nx; py = ny; } x.lineWidth = 1.5 + R() * 2.5; x.strokeStyle = 'rgba(160,230,255,.55)'; x.stroke(); }
  });
  A.reefpath = mk(120, 70, S > 2 ? 2 : S, x => { x.save(); x.scale(1, 70 / 120); x.fillStyle = rg(x, 60, 60, 60, [[0, 'rgba(150,200,210,.42)'], [.6, 'rgba(120,180,190,.25)'], [1, 'rgba(100,160,170,0)']]); x.fillRect(0, 0, 120, 120); x.restore(); });
  A.pool = mk(220, 130, Math.min(S, 2), x => {
    ell(x, 110, 65, 108, 62); x.fillStyle = rg(x, 110, 65, 108, [[0, 'rgba(40,140,190,.55)'], [.7, 'rgba(30,110,160,.45)'], [1, 'rgba(20,80,120,0)']]); x.fill();
    for (const [a, b, r] of [[80, 50, 26], [140, 74, 34], [104, 86, 18]]) { x.beginPath(); x.ellipse(a, b, r, r * .35, 0, 0, Math.PI * 2); x.lineWidth = 1.6; x.strokeStyle = 'rgba(190,240,255,.35)'; x.stroke(); }
  });
  A.crystal = mk(60, 70, S, x => {
    glow(x, 30, 50, 30, '#7fc8ff', .45);
    shard(x, 30, 66, 13, 58, 0, '#e8fbff', '#3a8ac8'); shard(x, 16, 66, 9, 36, -.35, '#d8f4ff', '#2a6aa8'); shard(x, 44, 66, 9, 42, .3, '#d8f4ff', '#2a6aa8'); shard(x, 38, 66, 6, 22, .7, '#c8fff2', '#2a9a8a');
  });
  A.coral = mk(70, 64, S, x => {
    x.lineCap = 'round';
    const br = (x0, y0, a, l, d) => { if (d > 3 || l < 6) return; const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.lineWidth = 9 - d * 2; x.strokeStyle = OL; x.stroke(); x.lineWidth = 6.4 - d * 1.6; x.strokeStyle = '#e8ddd0'; x.stroke(); if (d === 3) { glow(x, x1, y1, 6, '#5ff2d0', .9); } br(x1, y1, a - .45, l * .72, d + 1); br(x1, y1, a + .4, l * .7, d + 1); };
    br(35, 62, -Math.PI / 2, 20, 0); br(35, 62, -Math.PI / 2 - .7, 14, 1); br(35, 62, -Math.PI / 2 + .6, 15, 1);
  });
  A.kelp = mk(40, 80, S, x => {
    x.lineCap = 'round';
    for (const [b, c, ph] of [[14, '#2fa88a', 0], [22, '#3ac8a0', 1.4], [30, '#2a9080', 2.2]]) { x.beginPath(); x.moveTo(b, 78); for (let y = 78; y > 8; y -= 6) x.lineTo(b + Math.sin(y / 9 + ph) * 5, y); x.lineWidth = 6; x.strokeStyle = OL; x.stroke(); x.lineWidth = 3.6; x.strokeStyle = c; x.stroke(); glow(x, b + Math.sin(8 / 9 + ph) * 5, 10, 6, '#7fffe0', .8); }
  });
  A.cage = mk(150, 120, S, x => {
    rr(x, 30, 40, 90, 70, 8); fillStroke(x, lg(x, 0, 40, 0, 110, [[0, '#5a6a72'], [1, '#2a343a']]), 2.4);
    for (const p of [46, 66, 86, 106]) { rr(x, p - 3, 44, 6, 62, 2); fillStroke(x, '#7a8a92', 1.2); }
    rr(x, 20, 30, 110, 14, 4); fillStroke(x, '#3a4a52', 2); rr(x, 64, 6, 22, 26, 4); fillStroke(x, '#4a5a62', 2); ell(x, 75, 14, 6, 6); fillStroke(x, '#7fc8ff', 1.2); glow(x, 75, 14, 14, '#7fc8ff', .8);
    x.beginPath(); x.moveTo(120, 96); x.quadraticCurveTo(140, 100, 148, 114); x.lineWidth = 6; x.strokeStyle = OL; x.stroke(); x.lineWidth = 4; x.strokeStyle = '#4a5a62'; x.stroke();
  });
  A.skitter = mk(70, 50, S, x => {
    x.lineCap = 'round';
    for (const [a, b] of [[16, -8], [22, -4], [48, 4], [54, 8]]) { x.beginPath(); x.moveTo(a, 30); x.quadraticCurveTo(a + b, 36, a + b * 1.4, 48); x.lineWidth = 4.4; x.strokeStyle = OL; x.stroke(); x.lineWidth = 2.6; x.strokeStyle = '#e8ddd0'; x.stroke(); }
    for (const sg of [-1, 1]) { const bx = 35 + sg * 26; x.beginPath(); x.moveTo(35 + sg * 12, 26); x.lineTo(bx, 18); x.lineWidth = 4; x.strokeStyle = OL; x.stroke(); x.lineWidth = 2.4; x.strokeStyle = '#e8ddd0'; x.stroke(); poly(x, [bx - 6, 20, bx, 4, bx + 6, 20, bx, 16]); fillStroke(x, lg(x, 0, 4, 0, 20, [[0, '#e8fbff'], [1, '#4a9ad8']]), 1.6); }
    ell(x, 35, 28, 18, 11); fillStroke(x, lg(x, 35, 17, 35, 39, [[0, '#e8ddd0'], [1, '#8a8478']]), 2);
    shard(x, 28, 24, 6, 16, -.3, '#e8fbff', '#3a8ac8'); shard(x, 36, 23, 7, 20, 0, '#e8fbff', '#3a8ac8'); shard(x, 44, 24, 6, 15, .3, '#e8fbff', '#3a8ac8');
    ell(x, 29, 31, 2.6, 2.6); x.fillStyle = '#7fe6ff'; x.fill(); ell(x, 41, 31, 2.6, 2.6); x.fill(); glow(x, 29, 31, 6, '#7fe6ff', .9); glow(x, 41, 31, 6, '#7fe6ff', .9);
  });
  A.husker = mk(56, 78, S, x => {
    for (const sg of [-1, 1]) { rr(x, 28 + sg * 9 - 6, 50, 12, 26, 5); fillStroke(x, lg(x, 0, 50, 0, 76, [[0, '#4a5662'], [1, '#2a323a']]), 2); }
    rr(x, 10, 26, 36, 30, 10); fillStroke(x, lg(x, 0, 26, 0, 56, [[0, '#5a6874'], [1, '#2e3842']]), 2.2);
    for (const sg of [-1, 1]) { rr(x, 28 + sg * 21 - 5, 30, 10, 24, 5); fillStroke(x, '#3e4a54', 1.8); }
    rr(x, 22, 34, 12, 10, 3); fillStroke(x, '#1e262e', 1.2); ell(x, 28, 39, 3, 3); x.fillStyle = '#7fe6ff'; x.fill(); glow(x, 28, 39, 7, '#7fe6ff', .8);
    ell(x, 28, 18, 15, 14); fillStroke(x, lg(x, 28, 4, 28, 32, [[0, '#6a7884'], [1, '#3a4652']]), 2.2);
    ell(x, 28, 19, 10.5, 9); x.fillStyle = rg(x, 26, 16, 12, [[0, '#d8faff'], [.4, '#4ab8ff'], [1, '#0a3a6a']]); x.fill(); x.lineWidth = 1.6; x.strokeStyle = OL; x.stroke(); glow(x, 28, 19, 16, '#4ab8ff', .7);
    for (const [a, b] of [[18, 56], [38, 58], [26, 62]]) { x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + 1, b + 6, a, b + 10); x.lineWidth = 2; x.strokeStyle = 'rgba(127,220,255,.8)'; x.stroke(); }
    shard(x, 44, 30, 4, 10, .5, '#e8d8ff', '#8a6ac8'); shard(x, 12, 52, 3, 8, -.5, '#e8d8ff', '#8a6ac8');
  });
  A.leech = mk(96, 44, S, x => {
    x.lineCap = 'round';
    const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([8 + t * 80, 22 + Math.sin(t * Math.PI * 2.2) * 9]); }
    const stroke = (w, c) => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.lineWidth = w; x.strokeStyle = c; x.stroke(); };
    stroke(16, OL); stroke(13, '#d8d0c4'); stroke(7, 'rgba(90,170,230,.9)');
    for (let i = 3; i < 22; i += 3) { const [a, b] = pts[i]; glow(x, a, b, 5, '#ffe8a0', .7); }
    for (let i = 2; i < 23; i += 2) { const [a, b] = pts[i]; poly(x, [a - 2, b - 6, a, b - 11, a + 2, b - 6]); x.fillStyle = '#e8e0d4'; x.fill(); }
    const [hx, hy] = pts[24]; poly(x, [hx - 6, hy - 7, hx + 8, hy - 2, hx + 9, hy + 3, hx - 6, hy + 7]); fillStroke(x, '#e8e0d4', 1.8); ell(x, hx, hy - 2, 2, 2); x.fillStyle = '#7fe6ff'; x.fill(); glow(x, hx, hy - 2, 6, '#7fe6ff', .9);
  });
  A.blueshot = mk(20, 20, S, x => { glow(x, 10, 10, 10, '#7fc8ff', 1); ell(x, 10, 10, 4, 4); x.fillStyle = '#e8fbff'; x.fill(); });
  A.choir = mk(250, 260, S, x => {
    ell(x, 125, 244, 110, 16); x.fillStyle = 'rgba(40,140,200,.45)'; x.fill();
    glow(x, 120, 150, 120, '#4ab8ff', .3);
    x.beginPath(); x.moveTo(52, 248); x.bezierCurveTo(20, 170, 40, 40, 150, 16); x.bezierCurveTo(210, 6, 238, 40, 226, 70); x.bezierCurveTo(208, 50, 170, 46, 140, 64); x.bezierCurveTo(98, 92, 96, 190, 124, 248); x.closePath();
    fillStroke(x, lg(x, 40, 20, 160, 248, [[0, '#d8ccb8'], [.5, '#a8987e'], [1, '#6a5a48']]), 3);
    x.beginPath(); x.moveTo(70, 236); x.bezierCurveTo(46, 170, 60, 70, 150, 34); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.25)'; x.stroke();
    const faces = [[78, 210, 1], [70, 170, .95], [74, 128, .9], [92, 88, .85], [122, 58, .8], [158, 40, .72], [102, 150, .8], [100, 196, .85]];
    for (const [fx, fy, k] of faces) {
      ell(x, fx, fy, 13 * k, 16 * k); fillStroke(x, lg(x, fx, fy - 16 * k, fx, fy + 16 * k, [[0, '#e8d8c8'], [1, '#a8907a']]), 1.6);
      for (const sg of [-1, 1]) { x.beginPath(); x.moveTo(fx + sg * 6 * k - 3 * k, fy - 4 * k); x.quadraticCurveTo(fx + sg * 6 * k, fy - 1 * k, fx + sg * 6 * k + 3 * k, fy - 4 * k); x.lineWidth = 1.3; x.strokeStyle = OL; x.stroke(); }
      ell(x, fx, fy + 7 * k, 3.4 * k, 4.4 * k); x.fillStyle = '#1a0a14'; x.fill(); glow(x, fx, fy + 7 * k, 8 * k, '#7fc8ff', .7);
      x.beginPath(); x.moveTo(fx - 4 * k, fy + 14 * k); x.quadraticCurveTo(fx - 3 * k, fy + 24 * k, fx - 5 * k, fy + 30 * k); x.lineWidth = 1.6; x.strokeStyle = 'rgba(127,220,255,.75)'; x.stroke();
    }
    for (let i = 0; i < 10; i++) shard(x, 60 + i * 16, 252, 4 + (i % 3), 14 + (i % 4) * 6, (i % 2 ? .3 : -.3), '#e8fbff', '#3a8ac8');
  });
}

function buildHeartstrand(A, S) {
  A.shore = mk(256, 256, Math.min(S, 2), (x, w, h) => {
    x.fillStyle = '#3e4248'; x.fillRect(0, 0, w, h);
    const R = rng(61);
    const wrap = fn => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) fn(dx, dy); };
    for (let i = 0; i < 14; i++) { const cx = R() * w, cy = R() * h, r = 40 + R() * 80, light = R() > .5; wrap((dx, dy) => { x.fillStyle = rg(x, cx + dx, cy + dy, r, [[0, light ? 'rgba(150,156,164,.22)' : 'rgba(20,22,28,.28)'], [1, 'rgba(0,0,0,0)']]); x.fillRect(cx + dx - r, cy + dy - r, r * 2, r * 2); }); }
    for (let i = 0; i < 160; i++) { const cx = R() * w, cy = R() * h; x.fillStyle = R() < .5 ? `rgba(220,224,230,${.1 + R() * .15})` : `rgba(10,12,16,${.15 + R() * .2})`; x.fillRect(cx, cy, 1.6, 1.6); }
    for (let i = 0; i < 6; i++) { const cx = R() * w, cy = R() * h; wrap((dx, dy) => { x.beginPath(); x.ellipse(cx + dx, cy + dy, 22 + R() * 20, 3, 0, 0, Math.PI * 2); x.strokeStyle = 'rgba(200,210,220,.08)'; x.lineWidth = 1.4; x.stroke(); }); }
    for (let i = 0; i < 8; i++) { const cx = R() * w, cy = R() * h; wrap((dx, dy) => { x.fillStyle = 'rgba(95,242,255,.35)'; x.fillRect(cx + dx, cy + dy, 2, 2); }); }
  });
  A.shorepath = mk(120, 70, S > 2 ? 2 : S, x => { x.save(); x.scale(1, 70 / 120); x.fillStyle = rg(x, 60, 60, 60, [[0, 'rgba(176,180,186,.38)'], [.6, 'rgba(150,154,160,.22)'], [1, 'rgba(120,124,130,0)']]); x.fillRect(0, 0, 120, 120); x.restore(); });
  A.bigheart = mk(320, 260, S, x => {
    glow(x, 160, 140, 170, '#4ab8ff', .35);
    ell(x, 160, 236, 150, 22); x.fillStyle = 'rgba(0,0,0,.35)'; x.fill();
    x.beginPath(); x.moveTo(160, 236); x.bezierCurveTo(40, 220, 10, 120, 70, 70); x.bezierCurveTo(110, 36, 150, 56, 160, 84); x.bezierCurveTo(176, 40, 240, 26, 270, 74); x.bezierCurveTo(312, 140, 270, 222, 160, 236); x.closePath();
    fillStroke(x, lg(x, 60, 40, 240, 236, [[0, '#c86a5e'], [.5, '#8a3a36'], [1, '#4a1c1e']]), 3);
    for (const [ax, ay, bx, by, cx2, cy2] of [[120, 40, 112, 6, 132, 0], [190, 30, 196, 4, 214, 2], [230, 50, 256, 18, 276, 20]]) { x.beginPath(); x.moveTo(ax, ay); x.quadraticCurveTo(bx, by, cx2, cy2); x.lineWidth = 18; x.strokeStyle = OL; x.stroke(); x.lineWidth = 14; x.strokeStyle = '#a8524a'; x.stroke(); }
    x.lineCap = 'round';
    for (const pts of [[[90, 110], [120, 140], [112, 180], [140, 210]], [[200, 90], [190, 130], [220, 160], [210, 200]], [[150, 120], [160, 160], [150, 200]], [[240, 120], [262, 150]]]) { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.lineWidth = 5; x.strokeStyle = 'rgba(95,242,255,.9)'; x.stroke(); x.lineWidth = 12; x.strokeStyle = 'rgba(95,242,255,.18)'; x.stroke(); }
    x.beginPath(); x.ellipse(130, 96, 36, 18, -.5, 0, Math.PI * 2); x.fillStyle = 'rgba(255,220,210,.18)'; x.fill();
    for (let i = 0; i < 7; i++) shard(x, 50 + i * 36, 246, 5, 14 + (i % 3) * 6, (i % 2 ? .3 : -.3), '#e8fbff', '#3a8ac8');
  });
  A.heartglow = mk(160, 160, Math.min(S, 2), x => { x.fillStyle = rg(x, 80, 80, 80, [[0, 'rgba(95,242,255,.7)'], [.4, 'rgba(74,184,255,.25)'], [1, 'rgba(74,184,255,0)']]); x.fillRect(0, 0, 160, 160); });
  A.cone = mk(170, 120, S, x => {
    ell(x, 86, 108, 78, 12); x.fillStyle = 'rgba(0,0,0,.3)'; x.fill();
    x.beginPath(); x.moveTo(10, 104); x.quadraticCurveTo(40, 30, 150, 20); x.quadraticCurveTo(168, 50, 160, 104); x.closePath(); fillStroke(x, lg(x, 0, 20, 0, 104, [[0, '#c8b8a0'], [.5, '#8a7a66'], [1, '#4a4038']]), 2.6);
    for (const p of [50, 86, 122]) { x.beginPath(); x.moveTo(p, 104); x.quadraticCurveTo(p + 6, 60, p + 18, 30); x.lineWidth = 1.6; x.strokeStyle = 'rgba(40,30,24,.55)'; x.stroke(); }
    rr(x, 96, 46, 26, 10, 3); x.fillStyle = 'rgba(95,242,255,.7)'; x.fill(); glow(x, 109, 51, 14, '#5ff2ff', .7);
    x.beginPath(); x.ellipse(86, 104, 82, 10, 0, 0, Math.PI); x.fillStyle = '#4a4e54'; x.fill();
  });
  A.drift = mk(110, 40, S, x => { x.lineCap = 'round'; x.beginPath(); x.moveTo(8, 28); x.quadraticCurveTo(50, 18, 100, 24); x.lineWidth = 13; x.strokeStyle = OL; x.stroke(); x.lineWidth = 10; x.strokeStyle = '#a89a88'; x.stroke(); x.beginPath(); x.moveTo(62, 22); x.lineTo(80, 6); x.lineWidth = 6; x.strokeStyle = OL; x.stroke(); x.lineWidth = 4; x.strokeStyle = '#a89a88'; x.stroke(); });
  A.vaultdoor = mk(150, 130, S, x => {
    x.beginPath(); x.moveTo(4, 128); x.quadraticCurveTo(10, 20, 75, 8); x.quadraticCurveTo(140, 20, 146, 128); x.closePath(); fillStroke(x, lg(x, 0, 8, 0, 128, [[0, '#6a6e76'], [1, '#2e3036']]), 2.6);
    rr(x, 40, 50, 70, 78, 8); fillStroke(x, lg(x, 0, 50, 0, 128, [[0, '#4a5462'], [1, '#262c36']]), 2.4);
    ell(x, 75, 88, 22, 22); fillStroke(x, '#3a4452', 2); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; x.beginPath(); x.moveTo(75, 88); x.lineTo(75 + Math.cos(a) * 20, 88 + Math.sin(a) * 20); x.lineWidth = 2; x.strokeStyle = '#7a8492'; x.stroke(); }
    ell(x, 75, 88, 6, 6); x.fillStyle = '#5ff2ff'; x.fill(); glow(x, 75, 88, 16, '#5ff2ff', .8);
  });
  A.mill = mk(140, 150, S, x => {
    rr(x, 30, 70, 80, 76, 6); fillStroke(x, lg(x, 0, 70, 0, 146, [[0, '#6a5a48'], [1, '#3a2e24']]), 2.4);
    for (const p of [44, 70, 96]) { rr(x, p - 3, 74, 6, 70, 2); x.fillStyle = 'rgba(0,0,0,.25)'; x.fill(); }
    ell(x, 70, 56, 44, 44); x.lineWidth = 6; x.strokeStyle = OL; x.stroke(); x.lineWidth = 4; x.strokeStyle = '#8a7a66'; x.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; x.beginPath(); x.moveTo(70, 56); x.lineTo(70 + Math.cos(a) * 44, 56 + Math.sin(a) * 44); x.lineWidth = 3; x.strokeStyle = '#6a5a48'; x.stroke(); shard(x, 70 + Math.cos(a) * 44, 56 + Math.sin(a) * 44 + 6, 4, 10, 0, '#e8fbff', '#3a8ac8'); }
    ell(x, 70, 56, 8, 8); fillStroke(x, '#5ff2ff', 1.6); glow(x, 70, 56, 18, '#5ff2ff', .7);
  });
  A.marker = mk(50, 110, S, x => { rr(x, 21, 20, 8, 90, 3); fillStroke(x, '#5a4a3a', 1.8); poly(x, [25, 2, 46, 16, 25, 30]); fillStroke(x, '#d8dce4', 1.6); poly(x, [25, 2, 25, 30, 6, 16]); fillStroke(x, '#ffcf5a', 1.6); rr(x, 14, 44, 22, 12, 2); x.fillStyle = '#ffcf5a'; x.fill(); glow(x, 25, 50, 14, '#ffcf5a', .6); });
  A.mauler = mk(96, 70, S, x => {
    for (const [a, b] of [[22, 52], [36, 56], [62, 56], [76, 52]]) { rr(x, a - 6, b - 8, 13, 22, 6); fillStroke(x, '#4a3a2e', 1.8); }
    x.beginPath(); x.moveTo(12, 46); x.bezierCurveTo(8, 20, 40, 10, 66, 16); x.bezierCurveTo(84, 18, 92, 34, 90, 46); x.bezierCurveTo(70, 56, 30, 58, 12, 46); x.closePath(); fillStroke(x, lg(x, 0, 12, 0, 56, [[0, '#8a7058'], [1, '#4a3a2e']]), 2.2);
    for (const [a, b, l, r2] of [[30, 18, 16, -.3], [42, 13, 22, -.1], [54, 13, 20, .1], [66, 16, 15, .3], [24, 24, 10, -.5]]) shard(x, a, b + 4, 5, l, r2, '#e8fbff', '#3a9ad8');
    ell(x, 82, 34, 15, 13); fillStroke(x, lg(x, 82, 22, 82, 46, [[0, '#9a7e64'], [1, '#5a4636']]), 2);
    ell(x, 86, 32, 2.8, 2.8); x.fillStyle = '#5ff2ff'; x.fill(); glow(x, 86, 32, 7, '#5ff2ff', .9);
    x.beginPath(); x.moveTo(84, 40); x.lineTo(94, 40); x.lineWidth = 2; x.strokeStyle = OL; x.stroke(); for (const p of [86, 90]) { poly(x, [p, 40, p + 1.5, 44, p + 3, 40]); x.fillStyle = '#f0e8d8'; x.fill(); }
  });
  A.archivist = mk(60, 90, S, x => {
    for (let i = 0; i < 9; i++) { const y = 18 + i * 7.4, w = 26 - Math.abs(i - 3.5) * 3; poly(x, [30 - w, y, 30, y - 4, 30 + w, y, 30, y + 5]); fillStroke(x, lg(x, 0, y - 4, 0, y + 5, [[0, '#e8fbff'], [1, '#6ab8e8']]), 1.2); }
    rr(x, 28, 10, 4, 74, 2); fillStroke(x, '#8a6a4a', 1.2);
    for (const sg of [-1, 1]) { ell(x, 30 + sg * 20, 30, 6, 4); fillStroke(x, '#6a5a48', 1.4); glow(x, 30 + sg * 20, 34, 6, '#5ff2ff', .8); }
    ell(x, 30, 10, 9, 8); fillStroke(x, '#6a5a48', 1.8); ell(x, 30, 10, 4.5, 4.5); x.fillStyle = '#5ff2ff'; x.fill(); glow(x, 30, 10, 12, '#5ff2ff', .9);
  });
  A.dredger = mk(84, 96, S, x => {
    x.lineCap = 'round';
    const limb = (pts, w, c) => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.lineWidth = w + 3; x.strokeStyle = OL; x.stroke(); x.lineWidth = w; x.strokeStyle = c; x.stroke(); };
    ell(x, 64, 84, 18, 10); x.fillStyle = 'rgba(40,60,70,.6)'; x.fill(); for (let i = 0; i < 6; i++) shard(x, 52 + i * 5, 88, 3, 8 + (i % 3) * 3, 0, '#e8fbff', '#3a9ad8'); glow(x, 64, 82, 16, '#5ff2ff', .5);
    x.beginPath(); for (let i = 0; i < 4; i++) { x.moveTo(44, 46 + i * 2); x.quadraticCurveTo(54, 70, 50 + i * 8, 82); } x.lineWidth = 1; x.strokeStyle = 'rgba(200,190,170,.7)'; x.stroke();
    limb([[30, 60], [26, 76], [22, 92]], 4, '#7a8a70'); limb([[36, 60], [40, 76], [42, 92]], 4, '#6a7a62');
    ell(x, 33, 46, 9, 17); fillStroke(x, lg(x, 33, 30, 33, 62, [[0, '#8a9a7e'], [1, '#5a6a50']]), 2);
    limb([[28, 38], [16, 56], [12, 80]], 3.4, '#7a8a70'); limb([[38, 38], [46, 50], [44, 48]], 3.4, '#7a8a70');
    x.beginPath(); x.moveTo(33, 30); x.quadraticCurveTo(30, 14, 40, 8); x.lineWidth = 7; x.strokeStyle = OL; x.stroke(); x.lineWidth = 4.6; x.strokeStyle = '#8a9a7e'; x.stroke();
    ell(x, 44, 8, 9, 5); fillStroke(x, '#8a9a7e', 1.6); ell(x, 47, 7, 1.8, 1.8); x.fillStyle = '#5ff2ff'; x.fill(); glow(x, 47, 7, 5, '#5ff2ff', .9);
  });
  A.captain = mk(64, 68, S, x => drawChar(x, LOOKS.captain));
  A.c_rifle = mk(70, 18, S, x => { rr(x, 2, 6, 66, 6, 2); fillStroke(x, '#b8a888', 1.4); rr(x, 6, 9, 16, 8, 2); fillStroke(x, '#8a7a66', 1.2); rr(x, 34, 2, 18, 5, 2); fillStroke(x, '#5a6a7a', 1); rr(x, 50, 7, 16, 3, 1); x.fillStyle = '#9ff6ff'; x.fill(); glow(x, 60, 8, 8, '#9ff6ff', .7); });
  A.beacon = mk(36, 64, S, x => { ell(x, 18, 60, 14, 4); x.fillStyle = 'rgba(0,0,0,.35)'; x.fill(); poly(x, [6, 60, 12, 20, 24, 20, 30, 60]); fillStroke(x, lg(x, 0, 20, 0, 60, [[0, '#b8a888'], [1, '#5a5048']]), 2); rr(x, 11, 8, 14, 14, 4); fillStroke(x, '#3a4452', 1.6); ell(x, 18, 15, 5, 5); x.fillStyle = '#ff5a4a'; x.fill(); glow(x, 18, 15, 14, '#ff5a4a', .9); });
  A.pageshot = mk(22, 22, S, x => { glow(x, 11, 11, 10, '#5ff2ff', .9); poly(x, [11, 3, 17, 11, 11, 19, 5, 11]); fillStroke(x, '#e8fbff', 1); });
}
