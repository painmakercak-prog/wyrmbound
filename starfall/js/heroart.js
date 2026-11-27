import { PA, RIG, PV } from './painted.js?v=9';

export const PAINTED_CLS = { railwarden: 'rw', vanguard: 'vg' };
const PHAIR = { rw: { m: [0, 1, 2], f: [1, 2, 0] }, vg: { m: [0, 1, 2], f: [0, 1, 2] } };
export const PHAIR_NAMES = { m: ['Crop', 'Swept', 'Spiky'], f: ['Ponytail', 'Long', 'Bob'] };

export function paintKey(cls, look) {
  const pre = PAINTED_CLS[cls]; if (!pre) return null;
  const sex = look && look.sex === 'f' ? 'f' : 'm', key = pre + '_' + sex, R = RIG[key]; if (!R) return null;
  const hi = PHAIR[pre][sex][((look && +look.head) || 0) % 3], tone = ((look && +look.skin) || 0) % (R.tones || 1);
  return { pre, sex, key, hi, tone, base: key + '_t' + tone, back: R.hair[hi] ? key + '_h' + hi : null, front: R.front && R.front[hi] ? key + '_f' + hi : null };
}

function tinted(hr, hc) {
  const t = document.createElement('canvas'); t.width = hr.width; t.height = hr.height; const y = t.getContext('2d');
  y.drawImage(hr, 0, 0); y.globalCompositeOperation = 'multiply'; y.fillStyle = hc; y.fillRect(0, 0, t.width, t.height);
  y.globalCompositeOperation = 'screen'; y.globalAlpha = .16; y.drawImage(hr, 0, 0);
  y.globalAlpha = 1; y.globalCompositeOperation = 'destination-in'; y.drawImage(hr, 0, 0);
  return t;
}

export function heroCompose(P, b, hb, hf, hc) {
  const R = RIG[P.key];
  const c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const x = c.getContext('2d');
  if (hb) { const [hx, hy] = R.hair[P.hi]; x.drawImage(tinted(hb, hc), Math.round(hx), Math.round(hy)); }
  x.drawImage(b, 0, 0);
  if (hf) { const [fx, fy] = R.front[P.hi]; x.drawImage(tinted(hf, hc), Math.round(fx), Math.round(fy)); }
  c.unitW = PA[P.key][0]; c.unitH = c.unitW * c.height / c.width;
  return c;
}

const IMG = {};
const img = k => k ? IMG[k] || (IMG[k] = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => { delete IMG[k]; rej(new Error(k)); }; i.src = 'art/p/' + k + '.webp?v=' + PV; })) : Promise.resolve(null);

export async function heroPreview(cls, look, colors) {
  const P = paintKey(cls, look); if (!P) return null;
  const [b, hb, hf] = await Promise.all([img(P.base), img(P.back), img(P.front)]);
  const c = heroCompose(P, b, hb, hf, colors[((look && +look.hairc) || 0) % colors.length]);
  return { c, a: PA[P.key], h: RIG[P.key].h };
}
