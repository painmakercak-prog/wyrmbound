import { CALLINGS } from './data.js?v=8';

const KEY = 'starfall.save.v1';
const enc = s => { let r = ''; for (const b of new TextEncoder().encode(s)) r += String.fromCharCode(b); return btoa(r); };
const dec = s => new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const saveCode = st => 'SF1.' + enc(JSON.stringify(st));

export function readCode(code) {
  const c = String(code || '').replace(/\s+/g, '');
  if (!c.startsWith('SF1.')) return null;
  try {
    const s = JSON.parse(dec(c.slice(4)));
    return s && typeof s === 'object' && s.v === 1 && CALLINGS[s.cls] && Number.isFinite(s.lvl) && s.lvl >= 1 ? s : null;
  } catch (e) { return null; }
}

export function copyModal(m, st, sfx) {
  const code = saveCode(st);
  m.innerHTML = `<div class="box"><div class="k">Save transfer</div><h3>Your save code</h3><p class="small">Copy this, open the game where you want to play (for example the Home Screen app), and choose <b>Load a save code</b>.</p><textarea class="code" rows="4" readonly>${esc(code)}</textarea><div class="cre-err"></div><div class="row" style="justify-content:center;gap:10px;margin-top:10px"><button class="btn ghost">Done</button><button class="btn gold">Copy code</button></div></div>`;
  m.classList.add('on');
  const ta = m.querySelector('textarea'), msg = m.querySelector('.cre-err'), [done, cp] = m.querySelectorAll('.btn');
  done.onclick = () => m.classList.remove('on');
  cp.onclick = async () => {
    try { await navigator.clipboard.writeText(code); cp.textContent = 'Copied'; msg.textContent = ''; if (sfx) sfx('quest'); }
    catch (e) { ta.focus(); ta.select(); ta.setSelectionRange(0, code.length); msg.textContent = 'Copy did not work here. The code is selected: use Copy from the menu.'; }
  };
}

export function pasteModal(m, onLoad) {
  m.innerHTML = `<div class="box"><div class="k">Save transfer</div><h3>Load a save code</h3><p class="small">Paste the code you copied from your other game. This replaces the progress on this device.</p><textarea class="code" rows="4" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="SF1."></textarea><div class="cre-err"></div><div class="row" style="justify-content:center;gap:10px;margin-top:10px"><button class="btn ghost">Cancel</button><button class="btn gold">Load</button></div></div>`;
  m.classList.add('on');
  const ta = m.querySelector('textarea'), err = m.querySelector('.cre-err'), [cancel, ok] = m.querySelectorAll('.btn');
  ta.oninput = () => { delete ok.dataset.c; ok.textContent = 'Load'; err.textContent = ''; };
  cancel.onclick = () => { ta.blur(); m.classList.remove('on'); };
  ok.onclick = () => {
    const s = readCode(ta.value);
    if (!s) { err.textContent = 'That code did not work. Copy the whole code again and paste it here.'; return; }
    if (!ok.dataset.c) { ok.dataset.c = 1; ok.textContent = `Load ${esc(s.name || 'Hunter')}, Lv ${s.lvl}?`; return; }
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { err.textContent = 'This device would not store the save.'; return; }
    ta.blur(); onLoad(s);
  };
}
