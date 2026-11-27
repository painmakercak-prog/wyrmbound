import { PA, RIG, PV } from './painted.js?v=8.2';

export const PAINTED_CLS = { railwarden: 'rw' };
export const PHAIR = { m: [0, 1, 2], f: [1, 2, 0] };
export const PHAIR_NAMES = { m: ['Crop', 'Swept', 'Spiky'], f: ['Ponytail', 'Long', 'Bob'] };

export function paintKey(cls, look) {
  const pre = PAINTED_CLS[cls]; if (!pre) return null;
  const sex = look && look.sex === 'f' ? 'f' : 'm';
  return { pre, sex, key: pre + '_' + sex, hi: PHAIR[sex][((look && +look.head) || 0) % 3] };
}

export function heroCompose(b, hr, key, hi, hc) {
  const [hx, hy] = RIG[key].hair[hi];
  const c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const x = c.getContext('2d');
  const t = document.createElement('canvas'); t.width = hr.width; t.height = hr.height; const y = t.getContext('2d');
  y.drawImage(hr, 0, 0); y.globalCompositeOperation = 'multiply'; y.fillStyle = hc; y.fillRect(0, 0, t.width, t.height);
  y.globalCompositeOperation = 'screen'; y.globalAlpha = .16; y.drawImage(hr, 0, 0);
  y.globalAlpha = 1; y.globalCompositeOperation = 'destination-in'; y.drawImage(hr, 0, 0);
  x.drawImage(t, Math.round(hx), Math.round(hy)); x.drawImage(b, 0, 0);
  c.unitW = PA[key][0]; c.unitH = c.unitW * c.height / c.width;
  return c;
}

const IMG = {};
const img = k => IMG[k] || (IMG[k] = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => { delete IMG[k]; rej(new Error(k)); }; i.src = 'art/p/' + k + '.webp?v=' + PV; }));

export async function heroPreview(cls, look, colors) {
  const p = paintKey(cls, look); if (!p) return null;
  const [b, h] = await Promise.all([img(p.key), img(p.key + '_h' + p.hi)]);
  const c = heroCompose(b, h, p.key, p.hi, colors[((look && +look.hairc) || 0) % colors.length]);
  return { c, a: PA[p.key], h: RIG[p.key].h };
}
