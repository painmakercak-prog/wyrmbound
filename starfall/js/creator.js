import { CALLINGS, NAMES } from './data.js?v=7';
import { composeLook, drawChar, DEFAULT_LOOKS, SKINS, HAIR_COLORS, LOOK_NAMES } from './art.js?v=7';
import { sfx } from './audio.js?v=7';

const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
export const cleanName = s => String(s || '').replace(/[^A-Za-z0-9 '\-.]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);

export function creator(root, { cls, look, name, mode = 'new', onDone, onCancel }) {
  const L = Object.assign({}, DEFAULT_LOOKS[cls], look || {}); L.gear = L.gear !== false;
  let nm = name && name !== 'Hunter' ? name : '';
  root.innerHTML = '';
  const wrap = el('div', 'cre');
  wrap.appendChild(el('div', 'h1', mode === 'edit' ? 'Appearance' : 'Create your hunter'));
  wrap.appendChild(el('div', 'cre-sub', `${CALLINGS[cls].name} · ${CALLINGS[cls].role}`));
  const cv = document.createElement('canvas'); cv.className = 'cre-prev';
  const pw = 200, ph = 176, dpr = Math.min(3, window.devicePixelRatio || 1);
  cv.width = pw * dpr; cv.height = ph * dpr; cv.style.width = pw + 'px'; cv.style.height = ph + 'px';
  wrap.appendChild(cv);
  const draw = () => {
    const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
    const g = x.createRadialGradient(cv.width / 2, cv.height * .55, 0, cv.width / 2, cv.height * .55, cv.width * .6); g.addColorStop(0, 'rgba(95,242,255,.22)'); g.addColorStop(1, 'rgba(95,242,255,0)'); x.fillStyle = g; x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(cv.width / 2, cv.height * .93, 46 * dpr, 9 * dpr, 0, 0, Math.PI * 2); x.fill();
    const k = 2.45 * dpr; x.translate(cv.width / 2 - 32 * k, cv.height - 70 * k); x.scale(k, k); x.lineJoin = 'round'; x.lineCap = 'round';
    drawChar(x, composeLook(cls, L));
  };
  const rows = el('div', 'cre-rows');
  const seg = (label, key, opts, after) => {
    const r = el('div', 'cre-row', `<span>${label}</span>`); const g = el('div', 'seg');
    opts.forEach((o, i) => { const b = el('button', L[key] === o.v ? 'on' : '', o.t); b.onclick = () => { L[key] = o.v; for (const c of g.children) c.classList.toggle('on', c === b); sfx('ui'); if (after) after(); draw(); }; g.appendChild(b); });
    r.appendChild(g); rows.appendChild(r); return g;
  };
  const sw = (label, key, cols) => {
    const r = el('div', 'cre-row', `<span>${label}</span>`); const g = el('div', 'swatches');
    cols.forEach((c, i) => { const b = el('button', L[key] === i ? 'on' : ''); b.style.background = c; b.setAttribute('aria-label', label + ' ' + (i + 1)); b.onclick = () => { L[key] = i; for (const d of g.children) d.classList.toggle('on', d === b); sfx('ui'); draw(); }; g.appendChild(b); });
    r.appendChild(g); rows.appendChild(r);
  };
  let headSeg;
  const headOpts = () => LOOK_NAMES.head[L.sex].map((t, i) => ({ t, v: i }));
  const rebuildHead = () => { headSeg.innerHTML = ''; headOpts().forEach((o) => { const b = el('button', L.head === o.v ? 'on' : '', o.t); b.onclick = () => { L.head = o.v; for (const c of headSeg.children) c.classList.toggle('on', c === b); sfx('ui'); draw(); }; headSeg.appendChild(b); }); };
  seg('Body type', 'sex', [{ t: 'Male', v: 'm' }, { t: 'Female', v: 'f' }], () => rebuildHead());
  headSeg = seg('Head', 'head', headOpts());
  seg('Face', 'face', LOOK_NAMES.face.map((t, i) => ({ t, v: i })));
  seg('Body', 'body', LOOK_NAMES.body.map((t, i) => ({ t, v: i })));
  seg('Gear', 'gear', [{ t: 'Show', v: true }, { t: 'Hide', v: false }]);
  sw('Skin', 'skin', SKINS);
  sw('Hair', 'hairc', HAIR_COLORS);
  wrap.appendChild(rows);
  const nr = el('div', 'cre-name');
  const inp = el('input'); inp.type = 'text'; inp.maxLength = 16; inp.placeholder = 'Your name'; inp.value = nm; inp.autocomplete = 'off'; inp.spellcheck = false;
  const dice = el('button', 'btn ghost dice', '🎲'); dice.setAttribute('aria-label', 'Random name');
  dice.onclick = () => { const pool = NAMES[L.sex === 'f' ? 'f' : 'm'].concat(NAMES.n); inp.value = pool[Math.floor(Math.random() * pool.length)]; sfx('ui'); check(); };
  nr.appendChild(inp); nr.appendChild(dice); wrap.appendChild(nr);
  const err = el('div', 'cre-err'); wrap.appendChild(err);
  const btns = el('div', 'row cre-btns');
  const go = el('button', 'btn gold go', mode === 'edit' ? 'Save' : 'Begin');
  const check = () => { const v = cleanName(inp.value); go.disabled = v.length < 2; err.textContent = inp.value && v.length < 2 ? 'Names need at least 2 letters.' : ''; };
  inp.oninput = check;
  go.onclick = () => { const v = cleanName(inp.value); if (v.length < 2) { check(); return; } sfx('quest'); onDone(Object.assign({}, L), v); };
  if (onCancel) { const c = el('button', 'btn ghost', 'Cancel'); c.onclick = () => { sfx('ui'); onCancel(); }; btns.appendChild(c); }
  btns.appendChild(go); wrap.appendChild(btns);
  root.appendChild(wrap);
  draw(); check();
}
