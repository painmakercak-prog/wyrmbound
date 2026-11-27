import { CALLINGS, ECHOES, HATCHABLE, SLOTS, RARITY, CODEX, QUESTS, NPCS, BOUNTIES, ACTS, ART, REGIONS, ENEMIES, TOWER_LINES, RANKS, CALLING_PORTRAIT, TREES, TREE_THEMES, TREE_ROW_REQ, ORDERS } from './data.js?v=8.1.1';
import { portraitCanvas, LOOKS, iconCanvas, echoCanvas, lumenCanvas, shardIconCanvas, geodeCanvas, composeLook, RANK_THEMES } from './art.js?v=8.1.1';
import { heroStats, power, xpNeed, gearLine, upgradeCost, echoStats, echoLevelCost, EVOLVE_COST, ASCEND_COST, STAR_MAX, refineCost, refineNeed, save, wipe, rankIndex, portraitDef, portraitUnlocked, treeOf, treePoints, branchSpent, nodeDef, canLearn, respecCost, autoSpend, lockSaves, rollDaily, orderReward, ORDER_BONUS, ordersClaimable } from './state.js?v=8.1.1';
import { sfx, setMusic, audioResume } from './audio.js?v=8.1.1';
import { creator } from './creator.js?v=8.1.1';
import { copyModal, pasteModal } from './transfer.js?v=8.1.1';

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : String(Math.floor(n));
const url = c => c.toDataURL('image/png');
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const mix = (a, b, f) => { const A = hexRgb(a), B = hexRgb(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',')})`; };

const ICONS = {
  hero: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
  echoes: '<svg viewBox="0 0 24 24"><path d="M4 14c2-6 6-9 9-9 4 0 7 3 7 6 0 4-4 5-6 3"/><circle cx="16" cy="9" r="1"/><path d="M4 14c3 2 6 4 9 3"/></svg>',
  forge: '<svg viewBox="0 0 24 24"><path d="M4 15h11l3-4H8z"/><path d="M8 15v5h6v-5"/><path d="M14 4l2 4M18 3l-1 5M10 5l2 3"/></svg>',
  codex: '<svg viewBox="0 0 24 24"><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/></svg>',
  lodge: '<svg viewBox="0 0 24 24"><path d="M12 3c-3 3-3 7 0 10 3-3 3-7 0-10z"/><path d="M7 21h10M12 13v8"/></svg>',
  orders: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 10l1.5 1.5 3-3M8.5 16l1.5 1.5 3-3"/></svg>'
};

export class UI {
  constructor(st) {
    this.st = st; this.w = null; this.img = {};
    this.lumenIcon = url(lumenCanvas(40)); this.shardIcon = url(shardIconCanvas(40)); this.geodeIcon = url(geodeCanvas(3));
    this.buildHud();
    this.t = 0;
  }

  attach(w) { this.w = w; this.buildSkills(); this.stats(); this.quest(); this.echoBtn(); this.regionLabel(); this.mmDraw(); this.dailyCheck(true); }

  dailyCheck(quiet) { this.dailyT = 20; if (rollDaily(this.st) && !quiet) { this.toast('New Daily Orders are on the Lodge board'); save(this.st); } }
  order(k, amt = 1) {
    const d = this.st.daily; if (!d) return;
    const o = d.list.find(o => o.k === k && o.p < o.n); if (!o) return;
    o.p = Math.min(o.n, o.p + amt);
    if (o.p >= o.n) { this.toast(`Order done: <b>${esc(ORDERS[k].name)}</b> · claim it in Orders`, true); sfx('pickup2'); }
  }

  regionLabel() {
    const R = this.w.R, rn = $('#mm .rn');
    rn.innerHTML = R.tower ? `${esc(R.name)}<small>Floor ${this.w.floor || this.st.tower.best + 1}</small>` : `${esc(R.name)}<small>Lv ${esc(R.lvl.replace(' to ', '–'))}</small>`;
  }
  goalPos() {
    const w = this.w; if (!w || !w.hero || w.R.tower) return null;
    const g = w.goalFor(); if (!g) return null;
    if (g.x != null) return { x: g.x, y: g.y - 30, kind: g.travel ? 'travel' : g.npc ? 'npc' : 'place' };
    if (g.boss) { const b = w.boss && !w.boss.dead ? w.boss : null; const a = w.P.arena; return b ? { x: b.x, y: b.y, kind: 'boss' } : a ? { x: a.x, y: a.y, kind: 'boss' } : null; }
    if (g.hunt) { const sp = w.R.spawns.find(s => s.type === g.hunt); if (sp) return { x: sp.x, y: sp.y, kind: 'hunt', r: sp.r }; }
    return null;
  }
  mmDraw() {
    const w = this.w; if (!w || !w.hero) return;
    const c = this.mmC, x = this.mmX, S = c.width, R = w.R, h = w.hero;
    const span = R.tower ? 1300 : 1100, k = S / span, cx = S / 2, cy = S / 2;
    const tx = X => cx + (X - h.x) * k, ty = Y => cy + (Y - h.y) * k;
    const t = performance.now() / 1000;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, S, S);
    x.fillStyle = '#03080c'; x.fillRect(0, 0, S, S);
    x.fillStyle = mix(R.bg, '#ffffff', .16); x.fillRect(tx(0), ty(0), R.w * k, R.h * k);
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = mix(R.bg, '#fff2d8', .5); x.lineWidth = 80 * k;
    for (const p of R.paths || []) { x.beginPath(); p.forEach(([X, Y], i) => i ? x.lineTo(tx(X), ty(Y)) : x.moveTo(tx(X), ty(Y))); x.stroke(); }
    if (R.tower) { x.strokeStyle = 'rgba(255,230,160,.35)'; x.lineWidth = 3; x.beginPath(); x.arc(tx(R.places.arena.x), ty(R.places.arena.y), 420 * k, 0, 7); x.stroke(); }
    if (R.silent) { x.fillStyle = 'rgba(160,170,180,.18)'; x.beginPath(); x.arc(tx(R.silent.x), ty(R.silent.y), R.silent.r * k, 0, 7); x.fill(); }
    const sp = R.places.spire;
    if (sp && !R.tower) { const X = tx(sp.x), Y = ty(sp.y - 20); x.fillStyle = '#5ff2d0'; x.strokeStyle = '#03141a'; x.lineWidth = 2; x.beginPath(); x.moveTo(X, Y - 9); x.lineTo(X + 6, Y); x.lineTo(X, Y + 9); x.lineTo(X - 6, Y); x.closePath(); x.fill(); x.stroke(); }
    const q = QUESTS[this.st.q];
    for (const id in w.npcs) {
      const n = w.npcs[id]; if (!n.c.visible) continue;
      const on = q && q.kind === 'talk' && q.npc === id && (q.region || 'verge') === this.st.region;
      x.fillStyle = on ? '#ffcf5a' : '#e8d9b0'; x.strokeStyle = '#1a1206'; x.lineWidth = 1.5;
      x.beginPath(); x.arc(tx(n.x), ty(n.y), on ? 5 : 3.2, 0, 7); x.fill(); x.stroke();
    }
    for (const e of w.enemies) {
      if (e.dead) continue;
      const X = tx(e.x), Y = ty(e.y); if (X < -8 || Y < -8 || X > S + 8 || Y > S + 8) continue;
      if (e.D.boss) { x.fillStyle = '#ff8ab8'; x.strokeStyle = '#2a0614'; x.lineWidth = 2; x.beginPath(); x.arc(X, Y, 7 + Math.sin(t * 6), 0, 7); x.fill(); x.stroke(); }
      else if (e.D.object) { x.fillStyle = '#9ff6ff'; x.fillRect(X - 3.5, Y - 3.5, 7, 7); }
      else { x.fillStyle = e.aggro ? '#ff5a6e' : '#d8485a'; x.beginPath(); x.arc(X, Y, 2.8, 0, 7); x.fill(); }
    }
    const g = this.goalPos();
    if (g && g.kind !== 'boss') {
      let X = tx(g.x), Y = ty(g.y); const dx = X - cx, dy = Y - cy, d = Math.hypot(dx, dy), lim = S / 2 - 10;
      x.strokeStyle = '#ffcf5a'; x.fillStyle = '#ffcf5a';
      if (d > lim) { const a = Math.atan2(dy, dx); X = cx + Math.cos(a) * lim; Y = cy + Math.sin(a) * lim; x.save(); x.translate(X, Y); x.rotate(a); x.beginPath(); x.moveTo(8, 0); x.lineTo(-5, -6); x.lineTo(-5, 6); x.closePath(); x.fill(); x.restore(); }
      else { x.lineWidth = 2.5; x.globalAlpha = .6 + .4 * Math.sin(t * 5); x.beginPath(); x.arc(X, Y, g.kind === 'hunt' ? Math.max(8, Math.min(30, (g.r || 200) * k * .6)) : 7, 0, 7); x.stroke(); x.globalAlpha = 1; }
    }
    x.save(); x.translate(cx, cy); x.scale(h.facing || 1, 1);
    x.fillStyle = '#5ff2ff'; x.strokeStyle = '#ffffff'; x.lineWidth = 2; x.shadowColor = '#5ff2ff'; x.shadowBlur = 8;
    x.beginPath(); x.moveTo(9, 0); x.lineTo(-6, -6.5); x.lineTo(-3, 0); x.lineTo(-6, 6.5); x.closePath(); x.fill(); x.stroke();
    x.restore();
  }
  goalPtr() {
    const a = $('#goal'), w = this.w;
    const g = (!w || !w.hero || w.hero.dead || this.cur || $('#modal.on')) ? null : this.goalPos();
    if (!g || (g.kind === 'hunt' && Math.hypot(w.hero.x - g.x, w.hero.y - g.y) < (g.r || 200) + 160)) { a.classList.remove('on'); return; }
    const cam = w.cameras.main, wv = cam.worldView, de = document.documentElement, W = de.clientWidth, H = de.clientHeight;
    const sx = (g.x - wv.x) / wv.width * W, sy = (g.y - wv.y) / wv.height * H;
    if (!this.goalBox || this.goalT <= 0) {
      this.goalT = 1;
      const bb = $('#boss.on'), top = Math.max($('#qt').getBoundingClientRect().bottom, $('#mm').getBoundingClientRect().bottom, bb ? bb.getBoundingClientRect().bottom : 0) + 26;
      const bot = Math.min($('#skills').getBoundingClientRect().top, $('#left').getBoundingClientRect().top) - 26;
      this.goalBox = { l: 30, r: W - 30, t: top, b: Math.max(top + 80, bot) };
    }
    const B = this.goalBox;
    if (sx > B.l && sx < B.r && sy > B.t && sy < B.b) { a.classList.remove('on'); return; }
    const cx = (B.l + B.r) / 2, cy = (B.t + B.b) / 2, dx = sx - cx, dy = sy - cy;
    const kx = dx ? ((dx > 0 ? B.r : B.l) - cx) / dx : Infinity, ky = dy ? ((dy > 0 ? B.b : B.t) - cy) / dy : Infinity, kk = Math.min(kx, ky);
    a.style.transform = `translate(${cx + dx * kk}px,${cy + dy * kk}px)`;
    const an = Math.atan2(dy, dx), P = (r, o) => (15 + r * Math.cos(an + o)).toFixed(1) + ' ' + (15 + r * Math.sin(an + o)).toFixed(1);
    $('path', a).setAttribute('d', `M${P(10, 0)} L${P(9, 2.45)} L${P(3, Math.PI)} L${P(9, -2.45)}Z`);
    const m = Math.round(Math.hypot(w.hero.x - g.x, w.hero.y - g.y) / 30);
    $('span', a).textContent = (g.kind === 'travel' ? 'Spire · ' : g.kind === 'boss' ? 'Waker · ' : '') + m + 'm';
    a.classList.add('on');
  }

  buildHud() {
    const hud = el('div'); hud.id = 'hud'; hud.hidden = true;
    hud.innerHTML = `
      <div id="pc"><div class="av"><img alt=""></div><div class="lv">1</div><div class="bars"><div class="nm"></div><div class="bar hp" style="margin-top:4px"><b></b><i></i></div><div class="sub"><span class="hpn"></span><span class="pw">POWER <b>0</b></span></div></div><i class="hpd"></i><i class="shd"></i><i class="godt"></i></div>
      <div id="res"><div class="pill" id="lumen"><img src="${this.lumenIcon}" alt="">0</div><div class="pill" id="shards"><img src="${this.shardIcon}" alt="">0</div></div>
      <button id="mm" aria-label="Map and travel"><div class="disc"><canvas width="184" height="184"></canvas></div><div class="rn"></div></button>
      <div id="goal"><i><svg viewBox="0 0 30 30"><path d="M23 15 10 7.5 13 15 10 22.5z"/></svg></i><span></span></div>
      <div id="xpb"><i></i></div>
      <button id="qt"><div class="k">Main · Act I <span>auto ▸</span></div><div class="t"></div><div class="g"></div></button>
      <div id="boss"><div class="n">The Thornmother</div><div class="bar"><i></i></div></div>
      <div id="skills"><button class="sk" id="sk0"><img alt=""><div class="cd"></div><div class="cdn"></div><div class="lb"></div></button><button class="sk" id="sk1"><img alt=""><div class="cd"></div><div class="cdn"></div><div class="lb"></div></button><button class="sk" id="sk2"><img alt=""><div class="cd"></div><div class="cdn"></div><div class="lb"></div></button><button id="ult"><img alt=""><div class="lb"></div></button></div>
      <div id="left"><button id="echob"><img alt=""><div class="cd sk" style="position:absolute;inset:0;width:auto;height:auto"></div><div class="lb"></div></button><button class="tog on" id="autob">AUTO</button><button class="tog on" id="askb">SKILLS</button></div>
      <nav id="nav">${['hero', 'echoes', 'forge', 'orders', 'codex', 'lodge'].map(k => `<button data-p="${k}">${ICONS[k]}<span>${k[0].toUpperCase() + k.slice(1)}</span><i class="dot"></i></button>`).join('')}</nav>`;
    document.body.appendChild(hud);
    for (const id of ['vignette', 'hurtfx', 'toasts', 'banner', 'sheetbg', 'dlgcatch']) if (!$('#' + id)) { const d = el('div'); d.id = id; document.body.appendChild(d); }
    const joy = el('div', null, '<div class="base"></div><div class="knob"></div>'); joy.id = 'joy'; document.body.appendChild(joy);
    const dlg = el('div', null, '<div class="por"></div><div class="who"></div><div class="ttl"></div><div class="tx"></div><div class="nx">TAP ▸</div>'); dlg.id = 'dlg'; document.body.appendChild(dlg);
    const sheet = el('div', null, '<div class="hd"><h2></h2><button class="x" aria-label="Close">✕</button></div><div class="bd"></div>'); sheet.id = 'sheet'; document.body.appendChild(sheet);
    const modal = el('div'); modal.id = 'modal'; document.body.appendChild(modal);
    this.mmC = $('#mm canvas'); this.mmX = this.mmC.getContext('2d'); this.mmT = 0; this.goalT = 0;
    $('#mm').onclick = () => { if (!this.w || this.w.R.tower) return this.toast('The Spire floor is the only map up here'); this.travelMenu(); };
    $('#qt').onclick = () => { this.st.auto = true; this.w.tapPoint = null; this.w.tapTarget = null; this.w.manualUntil = 0; this.autoBtn(); sfx('ui'); };
    $('#autob').onclick = () => { this.st.auto = this.st.auto === false; this.autoBtn(); sfx('ui'); if (this.st.auto) this.w.manualUntil = 0; };
    $('#askb').onclick = () => { this.st.settings.autoSkill = !this.st.settings.autoSkill; this.autoBtn(); sfx('ui'); };
    for (let i = 0; i < 3; i++) $('#sk' + i).onclick = () => { audioResume(); if (this.w.castSkill(i)) this.w.manualUntil = Math.max(this.w.manualUntil, this.w.now + .5); };
    $('#ult').onclick = () => { if (!this.w.castUlt()) this.toast(this.w.res < 100 ? 'Resonance is still building' : 'No target'); };
    $('#echob').onclick = () => { if (!this.w.castEcho()) this.toast(this.w.echoCd > 0 ? 'Echo skill recharging' : 'Not needed right now'); };
    for (const b of document.querySelectorAll('#nav button')) b.onclick = () => this.open(b.dataset.p);
    $('#sheet .x').onclick = () => this.close();
    $('#sheetbg').onclick = () => this.close();
    for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove']) {
      for (const id of ['hud', 'sheet', 'modal', 'dlg', 'dlgcatch']) document.getElementById(id).addEventListener(ev, e => { if (e.target.closest('#hud > *, #sheet, #modal, #dlg, #dlgcatch')) e.stopPropagation(); }, { passive: true });
    }
    this.autoBtn();
  }

  show() { $('#hud').hidden = false; }
  autoBtn() { $('#autob').classList.toggle('on', this.st.auto !== false); $('#askb').classList.toggle('on', !!this.st.settings.autoSkill); }

  portrait(who) {
    if (who === 'you') return this.portraitImg(portraitUnlocked(this.st, this.st.portrait) ? this.st.portrait : 'calling');
    if (who === 'skein' && this.st.q > QUESTS.findIndex(q => q.id === 'iv_steps') && ART.echoAsc.skein) return ART.echoAsc.skein;
    if (ART.portrait[who]) return ART.portrait[who];
    if (this.img['p_' + who]) return this.img['p_' + who];
    let c;
    if (who === 'you') c = portraitCanvas(LOOKS[this.st.cls], 192);
    else if (who === 'skein') { c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d'); const g = x.createRadialGradient(96, 96, 0, 96, 96, 120); g.addColorStop(0, '#1d4a66'); g.addColorStop(1, '#06121c'); x.fillStyle = g; x.fillRect(0, 0, 192, 192); const e = echoCanvas('skein', 4); x.drawImage(e, 10, 40, 172, 172 * e.height / e.width); }
    else c = portraitCanvas(LOOKS[who], 192);
    return (this.img['p_' + who] = url(c));
  }
  callingImg(k) { return ART.calling[k] || this.img['c_' + k] || (this.img['c_' + k] = url(portraitCanvas(LOOKS[k], 192))); }
  stars(g) { return g && g.star ? ` <span class="stars">${'\u2605'.repeat(g.star)}</span>` : ''; }
  echoImg(id) { if (this.st.echoes[id] && +this.st.echoes[id].evo === 2 && ART.echoAsc[id]) return ART.echoAsc[id]; return ART.echo[id] || this.img['e_' + id] || (this.img['e_' + id] = url(echoCanvas(id, 4))); }
  icon(kind, col) { const k = 'i_' + kind + col; return this.img[k] || (this.img[k] = url(iconCanvas(kind, col, 120))); }

  buildSkills() {
    const C = CALLINGS[this.st.cls];
    C.skills.forEach((s, i) => { $(`#sk${i} img`).src = this.icon(s.id, C.color); $(`#sk${i} .lb`).textContent = s.name; });
    $('#ult img').src = this.icon(C.ult.id, 0xffcf5a); $('#ult .lb').textContent = C.ult.name;
    this.hudId();
  }
  hudId() {
    const st = this.st, fr = RANKS.find(r => r.id === st.frame) || RANKS[0];
    $('#pc .av img').src = this.portrait('you'); $('#pc .nm').textContent = st.name || CALLINGS[st.cls].name;
    $('#pc .nm').style.color = fr.color;
  }
  lookKey() { const l = this.st.look || {}; return this.st.cls + [l.sex, l.head, l.face, l.body, l.skin, l.hairc, l.gear === false ? 0 : 1].join(''); }
  portraitImg(id) {
    const st = this.st, sex = (st.look && st.look.sex) || 'm';
    if (ART.avatar && id !== 'calling' && ART.avatar[id + '_' + sex]) return ART.avatar[id + '_' + sex];
    const artSex = { psion: 'f' }[st.cls] || 'm', ca = sex === artSex && ART.face[st.cls] ? ART.face[st.cls] : ART.faceAlt && ART.faceAlt[st.cls + '_' + sex];
    if (ca) return ca;
    const k = 'pr_' + id + this.lookKey();
    return this.img[k] || (this.img[k] = url(portraitCanvas(composeLook(st.cls, st.look), 192, RANK_THEMES[id] || RANK_THEMES.recruit)));
  }
  echoBtn() {
    const id = this.st.activeEcho, b = $('#echob');
    b.classList.toggle('on', !!id);
    if (id) { $('img', b).src = this.echoImg(id); $('.lb', b).textContent = ECHOES[id].skill.name; }
  }

  stats() {
    if (!this.w) return;
    const h = this.w.hero, st = this.st;
    $('#pc .lv').textContent = st.lvl;
    $('#pc').classList.toggle('god', !!(st.god || st.ohk)); $('#pc .godt').textContent = st.god ? (st.ohk ? 'GOD · 1-HIT' : 'GOD') : '1-HIT';
    const hf = Math.max(0, Math.min(1, h.hp / h.hpMax)), sf = Math.min(1 - hf, (this.w.shield || 0) / h.hpMax);
    $('#pc .hpd').style.width = (61.78 * (1 - hf)) + '%';
    const sd = $('#pc .shd'); sd.style.left = (30.52 + 61.78 * hf) + '%'; sd.style.width = (61.78 * sf) + '%';
    $('#pc .hpn').textContent = `${Math.max(0, Math.ceil(h.hp))} / ${h.hpMax}`;
    $('#xpb i').style.width = (100 * st.xp / xpNeed(st.lvl)) + '%';
    $('#lumen').lastChild.textContent = fmt(st.lumen);
    $('#shards').lastChild.textContent = fmt(st.shards);
    $('#pc .pw b').textContent = fmt(power(st));
    const canForge = Object.values(st.gear).some(g => g && st.lumen >= upgradeCost(g));
    const e = st.activeEcho && st.echoes[st.activeEcho];
    const es = e && echoStats(st, st.activeEcho);
    const canEcho = st.geodes > 0 || (e && ((e.lvl < es.cap && st.shards >= echoLevelCost(e.lvl)) || (es.evo === 0 && e.lvl >= es.cap && st.shards >= EVOLVE_COST) || (es.evo === 1 && e.lvl >= es.cap && st.shards >= ASCEND_COST)));
    if (this.cur !== 'forge') $('#nav button[data-p="forge"]').classList.toggle('new', canForge);
    if (this.cur !== 'echoes') $('#nav button[data-p="echoes"]').classList.toggle('new', !!canEcho);
    if (this.cur !== 'hero') $('#nav button[data-p="hero"]').classList.toggle('new', treePoints(st) > 0);
    if (this.cur !== 'orders') $('#nav button[data-p="orders"]').classList.toggle('new', ordersClaimable(st));
  }
  skills() { this.t = 1; }
  lumenBump() { const p = $('#lumen'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); this.stats(); }

  tick(dt) {
    this.t += dt; if (this.t < .08) return; this.t = 0;
    const w = this.w, C = CALLINGS[this.st.cls];
    for (let i = 0; i < 3; i++) { const cd = w.cds[i], tot = C.skills[i].cd; $(`#sk${i} .cd`).style.setProperty('--p', (cd > 0 ? 100 * cd / tot : 0) + '%'); $(`#sk${i} .cdn`).textContent = cd > 0 ? Math.ceil(cd) : ''; }
    const u = $('#ult'); u.style.setProperty('--r', w.res + '%'); u.classList.toggle('ready', w.res >= 100);
    if (w.echo) { const tot = ECHOES[w.echo.id].skill.cd; $('#echob .cd').style.setProperty('--p', (w.echoCd > 0 ? 100 * w.echoCd / tot : 0) + '%'); }
    this.stats(); this.mmDraw(); this.goalT -= .08; this.goalPtr();
    this.dailyT -= .08; if (this.dailyT <= 0) this.dailyCheck();
  }

  quest() {
    if (!this.w) return;
    const st = this.st, q = QUESTS[st.q], b = $('#qt');
    if (this.w.R.tower) {
      const left = this.w.enemies.filter(e => !e.dead).length;
      $('.k', b).firstChild.textContent = 'Ossivar\u2019s Spire ';
      $('.t', b).textContent = 'Floor ' + (this.w.floor || 1);
      $('.g', b).innerHTML = this.w.towerState === 'fight' ? `Enemies left <b>${left}</b> · Best ${st.tower.best}` : `Best floor <b>${st.tower.best}</b>`;
      this.hintNav(null); this.regionLabel();
    } else if (q) {
      $('.k', b).firstChild.textContent = 'Main · Act ' + ['I', 'II', 'III', 'IV', 'V'][(q.act || 1) - 1] + ' ';
      $('.t', b).textContent = q.title;
      $('.g', b).innerHTML = esc(q.goal) + (q.count ? ` <b>${Math.min(st.qp, q.count)}/${q.count}</b>` : '');
      this.hintNav(q.kind === 'hatch' ? 'echoes' : q.kind === 'forge' ? 'forge' : null);
    } else if (st.bounty) {
      const bo = BOUNTIES.find(x => x.id === st.bounty.id);
      $('.k', b).firstChild.textContent = 'Lodge bounty ';
      $('.t', b).textContent = 'Hunt ' + ENEMIES[bo.enemy].name + 's';
      $('.g', b).innerHTML = `Reward ${bo.lumen} Lumen <b>${st.bounty.prog}/${bo.count}</b>`;
      this.hintNav(null);
    }
  }
  hintNav(p) { for (const b of document.querySelectorAll('#nav button')) b.classList.toggle('hint', b.dataset.p === p); }
  questDone(q, r) {
    const parts = [];
    if (r.xp) parts.push(`+${r.xp} XP`); if (r.lumen) parts.push(`+${r.lumen} Lumen`); if (r.shards) parts.push(`+${r.shards} memory`); if (r.geode) parts.push(`+${r.geode} geode`);
    this.banner('Quest complete', q.title, parts.join('  ·  '));
    const b = $('#qt'); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
  }

  bossIntro(D, key) {
    const src = ART.boss[key]; if (!src) return this.banner('Waker', D.name, 'Guardian of the old roots');
    const b = $('#banner'); b.innerHTML = `<div class="b boss"><img src="${src}" alt=""><div><div class="k">Waker</div><div class="v">${esc(D.name)}</div><div class="s">Guardian of the old roots</div></div></div>`;
    clearTimeout(this.banT); this.banT = setTimeout(() => b.innerHTML = '', 2600);
  }
  bossBar(e) {
    const b = $('#boss');
    if (!e || e.dead) { b.classList.remove('on'); return; }
    if (!b.classList.contains('on')) this.goalT = 0;
    b.classList.add('on'); $('.n', b).textContent = e.D.name + '  ·  Lv ' + e.lvl; $('.bar i', b).style.width = (100 * Math.max(0, e.hp) / e.hpMax) + '%';
  }

  joystick(x, y, dx, dy) {
    const j = $('#joy');
    if (x == null) { j.style.display = 'none'; return; }
    const m = Math.hypot(dx, dy), k = m > 42 ? 42 / m : 1;
    j.style.display = 'block'; j.style.left = x + 'px'; j.style.top = y + 'px';
    $('.knob', j).style.transform = `translate(${dx * k}px,${dy * k}px)`;
  }
  hurt() { const h = $('#hurtfx'); h.classList.add('on'); clearTimeout(this.hurtT); this.hurtT = setTimeout(() => h.classList.remove('on'), 60); }

  toast(s, html) { const t = el('div', 'toast'); if (html) t.innerHTML = s; else t.textContent = s; const box = $('#toasts'); box.appendChild(t); while (box.children.length > 3) box.firstChild.remove(); setTimeout(() => t.remove(), 3000); }
  banner(k, v, s = '') { if (this.cur) return this.toast(`${k}: ${v}${s ? ' · ' + s : ''}`); const b = $('#banner'); b.innerHTML = `<div class="b"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div><div class="s">${esc(s)}</div></div>`; clearTimeout(this.banT); this.banT = setTimeout(() => b.innerHTML = '', 2500); }
  levelUp(l) { this.banner('Level up', 'Level ' + l, 'Fully healed'); }
  ultCast(n) { this.banner('Resonance', n); }
  gearPop(slot, g, equipped, sold) {
    const name = `<span class="r${g.rar}">${esc(RARITY[g.rar].name)} ${esc(g.name)}</span>`;
    this.toast(equipped ? `${name} equipped · ${esc(gearLine(slot, g))}` : `${name} salvaged for ${sold} Lumen`, true);
    if (equipped) this.dotNav('hero');
  }
  newEcho(id) { this.echoBtn(); this.dotNav('echoes'); }
  codexNew(id) { this.toast(`Codex entry found: <b>${esc(CODEX[id].title)}</b>`, true); this.dotNav('codex'); this.st.codexNew = Object.assign(this.st.codexNew || {}, { [id]: true }); }
  dotNav(p) { const b = $(`#nav button[data-p="${p}"]`); if (b && this.cur !== p) b.classList.add('new'); }

  dialogue(lines, done) {
    const d = $('#dlg'), catcher = $('#dlgcatch');
    let i = 0, typing = null;
    const showLine = () => {
      const L = lines[i], who = L.who, N = NPCS[who] || NPCS.you;
      d.style.setProperty('--c', who === 'you' ? '#5ff2ff' : N.color);
      $('.por', d).innerHTML = `<img src="${this.portrait(who)}" alt="">`;
      $('.who', d).textContent = who === 'you' ? (this.st.name || CALLINGS[this.st.cls].name) : N.name;
      $('.ttl', d).textContent = who === 'you' ? CALLINGS[this.st.cls].name + ' · ' + RANKS[rankIndex(this.st.lvl)].name : N.title;
      const tx = $('.tx', d); tx.classList.toggle('skn', who === 'skein'); tx.textContent = '';
      let n = 0; clearInterval(typing);
      typing = setInterval(() => { n += 2; tx.textContent = L.text.slice(0, n); if (n >= L.text.length) { clearInterval(typing); typing = null; } }, 28);
      if (who === 'skein') sfx('echo'); else sfx('ui');
    };
    const next = () => {
      if (typing) { clearInterval(typing); typing = null; $('.tx', d).textContent = lines[i].text; return; }
      i++;
      if (i >= lines.length) { d.classList.remove('on'); catcher.classList.remove('on'); catcher.onclick = null; d.onclick = null; $('#hud').style.visibility = ''; done && done(); return; }
      showLine();
    };
    $('#hud').style.visibility = 'hidden';
    d.classList.add('on'); catcher.classList.add('on');
    d.onclick = next; catcher.onclick = next;
    showLine();
  }

  // ---------- panels ----------
  open(p) {
    if (this.w) { this.w.paused = true; }
    this.cur = p; sfx('ui');
    $(`#nav button[data-p="${p}"]`).classList.remove('new');
    for (const b of document.querySelectorAll('#nav button')) b.classList.toggle('act', b.dataset.p === p);
    $('#sheet h2').textContent = { hero: 'Hero', echoes: 'Echoes', forge: 'Forge', orders: 'Daily Orders', codex: 'Codex', lodge: 'Beacon Lodge' }[p];
    this.render(); $('#sheet .bd').scrollTop = 0;
    $('#sheet').classList.add('on'); $('#sheetbg').classList.add('on'); document.body.classList.add('sheet-open');
  }
  close() {
    $('#sheet').classList.remove('on'); $('#sheetbg').classList.remove('on'); document.body.classList.remove('sheet-open');
    for (const b of document.querySelectorAll('#nav button')) b.classList.remove('act');
    if (this.cur === 'codex') this.st.codexNew = {};
    this.cur = null; if (this.w) { this.w.paused = false; this.w.manualUntil = this.w.now + .4; } save(this.st);
  }
  render() { const bd = $('#sheet .bd'); bd.innerHTML = ''; this['p_' + this.cur](bd); }

  p_hero(bd) {
    const tabs = el('div', 'tabs');
    for (const [k, n] of [['over', 'Overview'], ['tree', 'Talents'], ['look', 'Appearance']]) {
      const b = el('button', (this.heroTab || 'over') === k ? 'on' : '', n + (k === 'tree' && treePoints(this.st) ? ` <i class="badge">${treePoints(this.st)}</i>` : ''));
      b.onclick = () => { this.heroTab = k; sfx('ui'); this.render(); $('#sheet .bd').scrollTop = 0; }; tabs.appendChild(b);
    }
    bd.appendChild(tabs);
    const tab = this.heroTab || 'over';
    if (tab === 'tree') return this.p_tree(bd);
    if (tab === 'look') return this.p_look(bd);
    const st = this.st, C = CALLINGS[st.cls], s = heroStats(st), ri = rankIndex(st.lvl), R = RANKS[ri], nx = RANKS[ri + 1];
    const top = el('div', 'hero-top', `<div class="hp-av" style="border-color:${(RANKS.find(r => r.id === st.frame) || R).color}"><img src="${this.portrait('you')}" alt=""></div><div class="grow"><div class="n">${esc(st.name || C.name)}</div><div class="r">${C.name} · Rank ${R.n} ${R.name}</div><div class="p">Level ${st.lvl} · Power ${fmt(power(st))}</div><div class="bar xp hxp"><i style="width:${100 * st.xp / xpNeed(st.lvl)}%"></i></div><div class="small muted">${fmt(st.xp)} / ${fmt(xpNeed(st.lvl))} XP to level ${st.lvl + 1}</div></div>`);
    const rn = el('button', 'btn ghost small', 'Rename'); rn.onclick = () => this.renameModal(); top.appendChild(rn);
    bd.appendChild(top);
    bd.appendChild(el('div', 'card small rankcard', `<b class="d" style="color:${R.color}">Ascension Rank ${R.n}: ${R.name}</b><div class="muted">${nx ? `Next: <b>${nx.name}</b> at level ${nx.lvl}. Unlocks a portrait, a frame and ${esc(nx.permText.toLowerCase())}.` : 'Highest rank reached.'}</div>`));
    bd.appendChild(el('div', 'stats', `<div class="stat"><div class="k">Attack</div><div class="v">${Math.round(s.atk)}</div></div><div class="stat"><div class="k">Max HP</div><div class="v">${s.hpMax}</div></div><div class="stat"><div class="k">Defense</div><div class="v">${Math.round(s.def)}</div></div><div class="stat"><div class="k">Crit</div><div class="v">${(s.crit * 100).toFixed(1)}% · ${(s.critDmg * 100).toFixed(0)}%</div></div>`));
    bd.appendChild(el('div', 'sec', 'Portraits'));
    bd.appendChild(el('div', 'small muted', 'Every rank unlocks a portrait and a permanent bonus. The portrait you wear adds its own bonus.'));
    const grid = el('div', 'pgrid');
    for (const P of [CALLING_PORTRAIT].concat(RANKS)) {
      const open = portraitUnlocked(st, P.id), on = (st.portrait || 'calling') === P.id;
      const raw = P.id === 'recruit' && !(ART.avatar && ART.avatar['recruit_' + ((st.look && st.look.sex) || 'm')]);
      const c = el('button', 'ptile' + (open ? '' : ' lock') + (on ? ' on' : ''), `<img src="${this.portraitImg(P.id)}"${raw ? ' class="raw"' : ''} alt=""><div class="pn">${P.id === 'calling' ? C.name : P.n + ' ' + P.name}</div><div class="pb">${esc(P.pbText)}</div>${open ? '' : `<div class="pl">Level ${P.lvl}</div>`}`);
      if (open && !on) c.onclick = () => { st.portrait = P.id; this.w.refreshStats(false); this.hudId(); sfx('gear'); save(st); this.render(); this.stats(); };
      grid.appendChild(c);
    }
    bd.appendChild(grid);
    bd.appendChild(el('div', 'sec', 'Frame'));
    const fr = el('div', 'frames');
    for (const R2 of RANKS) {
      const open = st.lvl >= R2.lvl, on = st.frame === R2.id;
      const b = el('button', 'fr' + (open ? '' : ' lock') + (on ? ' on' : ''), `<i style="border-color:${R2.color};box-shadow:0 0 8px ${R2.color}88"></i><span>${R2.name}</span>`);
      if (open) b.onclick = () => { st.frame = R2.id; this.hudId(); sfx('ui'); save(st); this.render(); };
      fr.appendChild(b);
    }
    bd.appendChild(fr);
    bd.appendChild(el('div', 'sec', 'Permanent rank bonuses'));
    bd.appendChild(el('div', 'small', RANKS.slice(1).map(R2 => `<div class="${st.lvl >= R2.lvl ? '' : 'muted'}">${st.lvl >= R2.lvl ? '✓' : '·'} ${R2.n} ${R2.name}: ${esc(R2.permText)}</div>`).join('')));
    bd.appendChild(el('div', 'sec', 'Gear'));
    for (const sl of SLOTS) {
      const g = st.gear[sl.id];
      const col = g ? parseInt(RARITY[g.rar].color.slice(1), 16) : 0x3a5262;
      const r = el('div', 'slot', `<img src="${this.icon(sl.id, col)}" alt=""><div class="grow">${g ? `<div class="n r${g.rar}">${esc(g.name)}${g.up ? ' +' + g.up : ''}${this.stars(g)}</div><div class="s">${RARITY[g.rar].name} · item level ${g.ilvl} · ${esc(gearLine(sl.id, g))}</div>` : `<div class="n muted">${sl.name}</div><div class="s">Empty. Drops from hunts.</div>`}</div>`);
      bd.appendChild(r);
    }
    bd.appendChild(el('div', 'small muted', 'Better gear equips itself when it drops. Weaker drops are salvaged into Lumen.'));
  }

  p_tree(bd) {
    const st = this.st, C = CALLINGS[st.cls], T = TREES[st.cls], t = treeOf(st), pts = treePoints(st);
    const head = el('div', 'tree-head', `<div><b class="d">${pts}</b> point${pts === 1 ? '' : 's'} to spend</div><div class="small muted">1 point per level. Each row opens after 3 more points in its branch.</div>`);
    const cost = respecCost(st), spent = Object.values(t).reduce((a, b) => a + b, 0);
    if (spent) { const rb = el('button', 'btn ghost small', cost ? `Reset · <span class="c"><img src="${this.lumenIcon}" alt="">${cost}</span>` : 'Reset (free)'); rb.disabled = st.lumen < cost; rb.onclick = () => { if (!rb.dataset.c) { rb.dataset.c = 1; rb.textContent = 'Tap again to reset'; return; } st.lumen -= cost; st.trees[st.cls] = {}; this.selNode = null; this.w.refreshStats(false); sfx('ui'); save(st); this.render(); this.stats(); }; head.appendChild(rb); }
    bd.appendChild(head);
    if (pts) {
      const ar = el('div', 'tauto', '<span>Spend for me</span>');
      T.forEach((B, b) => {
        const ab = el('button', 'btn small', esc(B.name));
        ab.onclick = () => {
          if (ab.dataset.c !== '1') { for (const o of ar.querySelectorAll('.btn')) { o.dataset.c = ''; o.textContent = o.dataset.n; o.classList.remove('gold'); } ab.dataset.c = '1'; ab.textContent = `Spend ${pts}?`; ab.classList.add('gold'); sfx('ui'); return; }
          const n = autoSpend(st, b); this.selNode = null; this.w.refreshStats(false); sfx('level'); save(st); this.render(); this.stats(); this.toast(`${n} point${n === 1 ? '' : 's'} spent, ${esc(B.name)} first`);
        };
        ab.dataset.n = B.name; ar.appendChild(ab);
      });
      bd.appendChild(ar);
    }
    const tree = el('div', 'tree');
    T.forEach((B, b) => {
      const col = el('div', 'tcol');
      const bs = branchSpent(st, b);
      col.appendChild(el('div', 'tb', `<div class="tbn">${esc(B.name)}</div><div class="tbd">${esc(B.desc)}</div><div class="tbs">${bs} pts</div>`));
      for (let r = 0; r < 6; r++) {
        const N = nodeDef(st.cls, b, r), have = t[N.id] || 0, open = bs >= TREE_ROW_REQ[r], can = canLearn(st, b, r), sel = this.selNode === N.id;
        const icon = N.icon === 'S' ? B.skill : N.icon;
        const tag = N.k === 'skillDmg' ? ' <b class="bdg">PWR</b>' : N.k === 'skillCd' ? ' <b class="bdg cd">CD</b>' : '';
        const w = el('div', 'tnw' + (open ? '' : ' lock'));
        const n = el('button', 'tn' + (have ? ' has' : '') + (open ? '' : ' lock') + (can ? ' can' : '') + (have >= N.max ? ' max' : '') + (N.k === 'key' ? ' key' : '') + (sel ? ' sel' : ''), `<img src="${this.icon(icon, N.k === 'key' ? 0xffcf5a : C.color)}" alt=""><i>${have}/${N.max}</i>`);
        n.onclick = () => { this.selNode = sel ? null : N.id; sfx('tap'); this.render(); };
        w.appendChild(n); w.appendChild(el('div', 'tl', esc(N.name) + tag));
        col.appendChild(w);
      }
      tree.appendChild(col);
    });
    bd.appendChild(tree);
    const foot = el('div', 'tfoot'), id = this.selNode;
    if (id) {
      const [b, r] = id.split('_').map(Number), N = nodeDef(st.cls, b, r), B = T[b], have = t[id] || 0;
      const sk = C.skills.find(k => k.id === B.skill);
      const name = N.icon === 'S' ? `${N.name} ${sk.name}` : N.name;
      const per = N.k === 'key' ? N.desc : N.k === 'skillDmg' ? `+${Math.round(N.v * 100)}% ${sk.name} power per rank (damage, healing, shields).` : N.k === 'skillCd' ? `${sk.name} cooldown −${Math.round(N.v * 100)}% per rank.` : N.k === 'regen' ? `Regenerate ${(N.v * 100).toFixed(1)}% of max HP per second per rank.` : `+${N.k === 'crit' ? (N.v * 100).toFixed(0) : Math.round(N.v * 100)}% ${N.fmt} per rank.`;
      const lockTxt = branchSpent(st, b) < TREE_ROW_REQ[r] ? `Needs ${TREE_ROW_REQ[r]} points in ${esc(B.name)} (${branchSpent(st, b)} now).` : '';
      foot.innerHTML = `<div class="row"><img src="${this.icon(N.icon === 'S' ? B.skill : N.icon, N.k === 'key' ? 0xffcf5a : C.color)}" style="width:44px;height:44px;flex:none" alt=""><div class="grow"><b class="d">${esc(name)}</b> <span class="tag">${have}/${N.max}</span><div class="small">${esc(per)}</div>${lockTxt ? `<div class="small" style="color:var(--gold)">${lockTxt}</div>` : ''}</div></div>`;
      const row = el('div', 'row tfb');
      const cx = el('button', 'btn ghost', 'Close'); cx.onclick = () => { this.selNode = null; sfx('ui'); this.render(); };
      const lb = el('button', 'btn gold grow', have >= N.max ? 'Maxed' : pts ? 'Learn · 1 point' : 'No points yet');
      lb.disabled = !canLearn(st, b, r);
      lb.onclick = () => { if (!canLearn(st, b, r)) return; t[id] = have + 1; this.w.refreshStats(false); sfx('level'); save(st); this.render(); this.stats(); };
      row.appendChild(cx); row.appendChild(lb); foot.appendChild(row);
      bd.appendChild(foot);
    } else bd.appendChild(el('div', 'small muted', `Tap a talent to see what it does.${pts ? '' : ` Next point at level ${st.lvl + 1}.`}`)).style.marginTop = '12px';
  }

  p_look(bd) {
    const st = this.st, box = el('div');
    bd.appendChild(box);
    creator(box, { cls: st.cls, look: st.look, name: st.name, mode: 'edit', onDone: (look, name) => { st.look = look; st.name = name; save(st); this.img = Object.fromEntries(Object.entries(this.img).filter(([k]) => !k.startsWith('pr_'))); this.hudId(); this.heroTab = 'over'; this.close(); this.w.restyle(); } });
  }
  renameModal() {
    const st = this.st, m = $('#modal');
    m.innerHTML = `<div class="box"><div class="k">Beacon Lodge registry</div><h3>Rename</h3><div class="cre-name"><input type="text" maxlength="16" value="${esc(st.name || '')}" autocomplete="off" spellcheck="false"></div><div class="row" style="justify-content:center;gap:10px;margin-top:12px"><button class="btn ghost">Cancel</button><button class="btn gold">Save</button></div></div>`;
    m.classList.add('on');
    const inp = $('input', m), [cancel, ok] = m.querySelectorAll('.btn');
    cancel.onclick = () => m.classList.remove('on');
    ok.onclick = () => { const v = String(inp.value).replace(/[^A-Za-z0-9 '\-.]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); if (v.length < 2) { inp.focus(); return; } st.name = v; save(st); this.hudId(); m.classList.remove('on'); sfx('quest'); this.render(); };
  }
  rankUp(ri) {
    const R = RANKS[ri], m = $('#modal'), st = this.st;
    m.innerHTML = `<div class="box"><div class="k">Ascension</div><div class="hatch-art asc"><img class="pop" src="${this.portraitImg(R.id)}" alt=""></div><h3 style="color:${R.color}">Rank ${R.n}: ${R.name}</h3><p class="small"><b>Permanent:</b> ${esc(R.permText)}<br><b>New portrait:</b> ${esc(R.pbText)} while equipped<br><b>New frame</b> unlocked</p><div class="row" style="justify-content:center;gap:10px"><button class="btn ghost">Later</button><button class="btn gold">Equip portrait</button></div></div>`;
    m.classList.add('on'); sfx('hatch');
    const [later, eq] = m.querySelectorAll('.btn');
    later.onclick = () => m.classList.remove('on');
    eq.onclick = () => { st.portrait = R.id; st.frame = R.id; this.w.refreshStats(false); this.hudId(); save(st); m.classList.remove('on'); this.stats(); };
  }

  p_echoes(bd) {
    const st = this.st, ids = Object.keys(st.echoes);
    if (!ids.length) { bd.innerHTML = `<div class="card muted">No Echo has bonded with you yet. Keep following the main quest.</div>`; }
    else {
      const id = st.activeEcho, D = ECHOES[id], S = echoStats(st, id), e = st.echoes[id];
      const cap = S.cap, cost = echoLevelCost(e.lvl);
      const card = el('div', 'card', `<div class="echo-big"><div class="art"><img src="${this.echoImg(id)}" alt=""></div><div class="grow"><div class="n">${D.name}</div><div style="margin:4px 0 6px"><span class="tag g">${['Glint', 'Recall', 'Ascendant'][S.evo]}</span><span class="tag">${D.family}</span><span class="tag">Lv ${e.lvl}/${cap}</span></div><div class="small muted">${esc(D.blurb)}</div></div></div>
        <div class="stats"><div class="stat"><div class="k">Echo attack</div><div class="v">${Math.round(S.atk)}</div></div><div class="stat"><div class="k">${esc(D.skill.name)}</div><div class="small">${esc(D.skill.desc)}</div></div></div>
        <div class="row" style="margin-top:12px"></div>`);
      const row = $('.row', card);
      if (e.lvl < cap) { const b = el('button', 'btn grow', `Level up · <span class="c"><img src="${this.shardIcon}" alt="">${cost}</span>`); b.disabled = st.shards < cost; b.onclick = () => { st.shards -= cost; e.lvl++; sfx('level'); this.order('echo'); this.stats(); this.render(); }; row.appendChild(b); }
      else if (S.evo === 0) { const b = el('button', 'btn gold grow', `Evolve to Recall · <span class="c"><img src="${this.shardIcon}" alt="">${EVOLVE_COST}</span>`); b.disabled = st.shards < EVOLVE_COST; b.onclick = () => { st.shards -= EVOLVE_COST; e.evo = 1; sfx('hatch'); this.order('echo'); this.w.setEcho(id); this.evolveModal(id); this.render(); this.stats(); }; row.appendChild(b); }
      else if (S.evo === 1) { const b = el('button', 'btn gold grow', `Ascend · <span class="c"><img src="${this.shardIcon}" alt="">${ASCEND_COST}</span>`); b.disabled = st.shards < ASCEND_COST; b.onclick = () => { st.shards -= ASCEND_COST; e.evo = 2; sfx('hatch'); this.order('echo'); this.w.setEcho(id); this.evolveModal(id, true); this.render(); this.stats(); }; row.appendChild(b); }
      else row.appendChild(el('div', 'muted small', 'Fully remembered, for now.'));
      bd.appendChild(card);
      bd.appendChild(el('div', 'small muted', `Memory shards: <b>${st.shards}</b>. They drop from hunts and quests.`)).style.marginTop = '8px';
      bd.appendChild(el('div', 'sec', 'Your Echoes'));
      const list = el('div', 'echoes-list');
      for (const k of ids) { const b = el('button', k === id ? 'act' : '', `<img src="${this.echoImg(k)}" alt=""><span>${ECHOES[k].name}</span>`); b.onclick = () => { st.activeEcho = k; this.w.setEcho(k); this.echoBtn(); sfx('ui'); this.render(); }; list.appendChild(b); }
      bd.appendChild(list);
    }
    bd.appendChild(el('div', 'sec', 'Lumen geodes'));
    const gc = el('div', 'card row', `<img src="${this.geodeIcon}" style="width:56px;height:48px" alt=""><div class="grow"><b class="d">${st.geodes} geode${st.geodes === 1 ? '' : 's'}</b><div class="small muted">Something is sleeping inside each one.</div></div>`);
    const hb = el('button', 'btn gold', 'Hatch'); hb.disabled = st.geodes < 1; hb.onclick = () => this.hatch(); gc.appendChild(hb);
    bd.appendChild(gc);
    const buy = el('button', 'btn ghost', `Buy a geode · <span class="c"><img src="${this.lumenIcon}" alt="">400</span>`); buy.style.marginTop = '10px'; buy.style.width = '100%';
    buy.disabled = st.lumen < 400; buy.onclick = () => { st.lumen -= 400; st.geodes++; sfx('gear'); this.stats(); this.render(); };
    bd.appendChild(buy);
  }
  hatch() {
    const st = this.st; if (st.geodes < 1) return;
    st.geodes--;
    const owned = new Set(Object.keys(st.echoes));
    const pool = HATCHABLE.filter(k => !owned.has(k));
    const id = (pool.length ? pool : HATCHABLE)[Math.floor(Math.random() * (pool.length || HATCHABLE.length))];
    const dup = owned.has(id);
    const m = $('#modal');
    m.innerHTML = `<div class="box"><div class="k">Lumen geode</div><div class="hatch-art"><img class="shake" src="${this.geodeIcon}" alt=""></div><p class="muted">Something is waking up…</p></div>`;
    m.classList.add('on'); sfx('gear');
    setTimeout(() => {
      sfx('hatch');
      if (dup) { st.shards += 12; } else { st.echoes[id] = { lvl: 1, evo: 0 }; }
      const D = ECHOES[id];
      m.innerHTML = `<div class="box"><div class="k">${dup ? 'Familiar memory' : 'New Echo bonded'}</div><div class="hatch-art"><img class="pop" src="${this.echoImg(id)}" alt=""></div><h3>${D.name}</h3><div><span class="tag">${D.family}</span></div><p>${dup ? 'You already know this one. Its memories become 12 memory shards.' : esc(D.blurb)}</p><div class="row" style="justify-content:center;gap:10px"></div></div>`;
      const row = $('.row', m);
      if (!dup) { const b = el('button', 'btn gold', 'Make active'); b.onclick = () => { st.activeEcho = id; this.w.setEcho(id); this.echoBtn(); m.classList.remove('on'); this.render(); }; row.appendChild(b); }
      const c = el('button', 'btn ghost', 'Close'); c.onclick = () => { m.classList.remove('on'); this.render(); }; row.appendChild(c);
      this.w.onUiEvent('hatch'); this.w.unlockCodex('echoes'); save(st); this.stats();
    }, 1400);
  }
  evolveModal(id, asc) {
    const m = $('#modal'), D = ECHOES[id];
    if (asc) { m.innerHTML = `<div class="box"><div class="k">Ascendant</div><div class="hatch-art asc"><img class="pop" src="${this.echoImg(id)}" alt=""></div><h3>${D.name} ascends</h3><p><i>${esc(D.ascend || '')}</i></p><p class="small muted">It remembers what it was before it fell. Its attack more than doubles and it can grow to level 30.</p><button class="btn gold">Continue</button></div>`; m.classList.add('on'); $('button', m).onclick = () => m.classList.remove('on'); return; }
    m.innerHTML = `<div class="box"><div class="k">Memory recalled</div><div class="hatch-art"><img class="pop" src="${this.echoImg(id)}" alt=""></div><h3>${D.name} remembers</h3><p>${id === 'skein' ? '<i>a sky full of us. a light that would not go out. a voice, calling, calling.</i>' : 'A whole memory surfaces: a world it once lived on. It fights harder now, and glows brighter.'}</p><button class="btn gold">Continue</button></div>`;
    m.classList.add('on'); $('button', m).onclick = () => m.classList.remove('on');
  }

  p_forge(bd) {
    const st = this.st;
    bd.appendChild(el('div', 'card row', `<img src="${this.portrait('sparks')}" style="width:56px;height:56px;border-radius:12px" alt=""><div class="grow small">“Lumen in, better gear out. Every upgrade adds 10% to that piece. I’d explain the math but it’s mostly vibes and welding.”</div>`));
    bd.appendChild(el('div', 'sec', 'Upgrade'));
    for (const sl of SLOTS) {
      const g = st.gear[sl.id];
      const col = g ? parseInt(RARITY[g.rar].color.slice(1), 16) : 0x3a5262;
      const r = el('div', 'slot', `<img src="${this.icon(sl.id, col)}" alt="">`);
      const info = el('div', 'grow');
      if (g) {
        const nx = Object.assign({}, g, { up: (g.up || 0) + 1 }), cost = upgradeCost(g);
        info.innerHTML = `<div class="n r${g.rar}">${esc(g.name)}${g.up ? ' +' + g.up : ''}</div><div class="s">${esc(gearLine(sl.id, g))} → <b style="color:var(--green)">${esc(gearLine(sl.id, nx))}</b></div>`;
        r.appendChild(info);
        const b = el('button', 'btn', `<span class="c"><img src="${this.lumenIcon}" alt="">${cost}</span>`); b.disabled = st.lumen < cost;
        b.onclick = () => { st.lumen -= cost; g.up = (g.up || 0) + 1; this.w.refreshStats(false); sfx('gear'); this.w.onUiEvent('forge'); this.order('forge'); this.render(); this.stats(); };
        r.appendChild(b);
      } else { info.innerHTML = `<div class="n muted">${sl.name}</div><div class="s">Nothing to upgrade yet.</div>`; r.appendChild(info); }
      bd.appendChild(r);
    }
    bd.appendChild(el('div', 'sec', 'Refine'));
    bd.appendChild(el('div', 'small muted', 'Each star adds 15% to a piece, on top of upgrades. Stars carry over when better gear replaces it.'));
    for (const sl of SLOTS) {
      const g = st.gear[sl.id]; if (!g) continue;
      const star = g.star || 0, col = parseInt(RARITY[g.rar].color.slice(1), 16);
      const r = el('div', 'slot', `<img src="${this.icon(sl.id, col)}" alt="">`);
      const info = el('div', 'grow'), need = refineNeed(g), cost = refineCost(g), maxed = star >= STAR_MAX, ready = (g.up || 0) >= need;
      info.innerHTML = `<div class="n r${g.rar}">${esc(g.name)}${this.stars(g) || ' <span class="muted small">no stars</span>'}</div><div class="s">${maxed ? 'Fully refined' : ready ? `Star ${star + 1}: ${esc(gearLine(sl.id, Object.assign({}, g, { star: star + 1 })))}` : `Needs +${need} upgrades first`}</div>`;
      r.appendChild(info);
      if (!maxed) { const b = el('button', 'btn', `<span class="c"><img src="${this.shardIcon}" alt="">${cost}</span>`); b.disabled = !ready || st.shards < cost; b.onclick = () => { st.shards -= cost; g.star = star + 1; this.w.refreshStats(false); sfx('hatch'); this.render(); this.stats(); }; r.appendChild(b); }
      bd.appendChild(r);
    }
  }

  p_orders(bd) {
    const st = this.st; rollDaily(st);
    const d = st.daily, rw = orderReward(st), now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const mins = Math.max(1, Math.round((mid - now) / 60000)), left = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
    bd.appendChild(el('div', 'card row', `<img src="${this.portrait('marr')}" style="width:52px;height:52px;border-radius:12px;object-fit:cover;flex:none" alt=""><div class="grow"><b class="d">Lodge board</b><div class="small muted">Three jobs a day from Captain Marr. New orders in <b>${left}</b>.</div></div>`));
    const lum = n => `<span class="c"><img src="${this.lumenIcon}" alt="">${fmt(n)}</span>`, sh = n => `<span class="c"><img src="${this.shardIcon}" alt="">${n}</span>`;
    for (const o of d.list) {
      const O = ORDERS[o.k], done = o.p >= o.n;
      const c = el('div', 'card ord' + (o.got ? ' got' : done ? ' ready' : ''), `<div class="row"><img class="oi" src="${this.icon(O.icon, o.got ? 0x5d7480 : done ? 0xffcf5a : 0x5ff2ff)}" alt=""><div class="grow"><b class="d">${esc(O.name)}</b><div class="small muted">${esc(O.goal.replace('{n}', o.n))}</div><div class="orw small">${lum(rw.lumen)} ${sh(rw.shards)}</div></div></div><div class="prog"><i style="width:${100 * o.p / o.n}%"></i></div><div class="opn small">${o.p} / ${o.n}</div>`);
      const b = el('button', 'btn' + (done && !o.got ? ' gold' : ' ghost'), o.got ? 'Claimed' : done ? 'Claim' : 'In progress');
      b.disabled = o.got || !done;
      b.onclick = () => { if (o.got || o.p < o.n) return; o.got = true; st.lumen += rw.lumen; st.shards += rw.shards; sfx('quest'); this.lumenBump(); save(st); this.render(); };
      $('.row', c).appendChild(b); bd.appendChild(c);
    }
    const all = d.list.every(o => o.got);
    const bc = el('div', 'card row ord bonus' + (d.bonus ? ' got' : all ? ' ready' : ''), `<img src="${this.geodeIcon}" style="width:52px;height:44px;flex:none" alt=""><div class="grow"><b class="d">All three</b><div class="small muted">Claim every order today for a bonus.</div><div class="orw small"><span class="c"><img src="${this.geodeIcon}" alt="">${ORDER_BONUS.geodes} geode</span> ${sh(ORDER_BONUS.shards)}</div></div>`);
    const bb = el('button', 'btn' + (all && !d.bonus ? ' gold' : ' ghost'), d.bonus ? 'Claimed' : `${d.list.filter(o => o.got).length}/3`);
    bb.disabled = d.bonus || !all;
    bb.onclick = () => { if (d.bonus || !d.list.every(o => o.got)) return; d.bonus = true; st.geodes += ORDER_BONUS.geodes; st.shards += ORDER_BONUS.shards; sfx('hatch'); this.dotNav('echoes'); save(st); this.stats(); this.render(); this.toast('A Lumen geode from the Lodge. Hatch it in Echoes.'); };
    bc.appendChild(bb); bd.appendChild(bc);
  }

  p_codex(bd) {
    const st = this.st, keys = Object.keys(CODEX), have = keys.filter(k => st.codex[k]).length;
    bd.appendChild(el('div', 'small muted', `${have} of ${keys.length} entries found. Hunt, explore and follow the story to find more.`));
    for (const k of keys) {
      const c = CODEX[k], open = st.codex[k];
      const it = el('div', 'codex-item' + (open ? '' : ' lock') + (open && st.codexNew && st.codexNew[k] ? ' new' : ''));
      it.innerHTML = open ? `${ART.codex[k] ? `<img class="cx" src="${ART.codex[k]}" alt="">` : ''}<div class="t">${esc(c.title)}</div><div class="src">${esc(c.src)}</div><div class="tx">${esc(c.text)}</div>` : `<div class="t">??? <small>LOCKED</small></div>`;
      bd.appendChild(it);
    }
  }

  p_lodge(bd) {
    const st = this.st, C = CALLINGS[st.cls];
    bd.appendChild(el('div', 'sec', 'Bounty board'));
    if (!st.bounty || QUESTS[st.q]) bd.appendChild(el('div', 'card small muted', st.actDone ? 'Bounties open again once the main story is caught up. Follow the quest tracker for now.' : 'Captain Marr posts bounties once you finish Act I.'));
    else {
      const b = BOUNTIES.find(x => x.id === st.bounty.id);
      const name = ENEMIES[b.enemy].name + 's';
      bd.appendChild(el('div', 'card', `<b class="d">Hunt ${b.count} ${name}</b><div class="small muted">Reward: ${b.lumen} Lumen and ${b.shards} memory shards</div><div class="prog"><i style="width:${100 * st.bounty.prog / b.count}%"></i></div>`));
    }
    bd.appendChild(el('div', 'sec', 'Callings'));
    const canSwitch = st.q > QUESTS.findIndex(q => q.id === 'boss');
    bd.appendChild(el('div', 'small muted', canSwitch ? 'Switch Calling any time. Level, gear, Echoes and story stay with you. Gear is reforged to suit the new Calling.' : 'Captain Marr lets you change Callings after the Thornmother falls.'));
    for (const [k, K] of Object.entries(CALLINGS)) {
      const mine = k === st.cls;
      const c = el('div', 'card row', `<img src="${this.callingImg(k)}" style="width:64px;height:64px;border-radius:12px;flex:none;object-fit:cover" alt=""><div class="grow"><b class="d">${K.name}</b> ${mine ? '<span class="tag g">Yours</span>' : `<span class="tag">${esc(K.role)}</span>`}<div class="small muted" style="margin-top:4px">${esc(K.blurb)}</div></div>`);
      c.style.marginTop = '8px';
      if (!mine && canSwitch) { const b = el('button', 'btn', 'Switch'); b.onclick = () => { if (b.dataset.c) { this.close(); this.w.switchCalling(k); } else { b.dataset.c = 1; b.textContent = 'Confirm'; b.classList.add('gold'); } }; c.appendChild(b); }
      bd.appendChild(c);
    }
    bd.appendChild(el('div', 'sec', 'Settings'));
    const sw = (label, get, set) => { const r = el('div', 'set', `<span>${label}</span>`); const b = el('button', 'sw' + (get() ? ' on' : '')); b.setAttribute('aria-label', label); b.onclick = () => { set(!get()); b.classList.toggle('on', get()); sfx('ui'); }; r.appendChild(b); bd.appendChild(r); };
    sw('Sound effects', () => st.settings.sound, v => st.settings.sound = v);
    sw('Music', () => st.settings.music, v => { st.settings.music = v; setMusic(v); });
    sw('Auto skills', () => st.settings.autoSkill, v => { st.settings.autoSkill = v; this.autoBtn(); });
    bd.appendChild(el('div', 'sec', 'Test mode'));
    bd.appendChild(el('div', 'small muted', 'For the test phase. God mode: you take no damage, health stays full, skills recharge in 0.4s and Resonance refills on its own.'));
    sw('God mode', () => !!st.god, v => { st.god = v; this.stats(); save(st); });
    sw('One-hit kills', () => !!st.ohk, v => { st.ohk = v; this.stats(); save(st); });
    const tg = el('div', 'tgrid');
    for (const [label, fn] of [['+100K Lumen', () => { st.lumen += 100000; this.lumenBump(); }], ['+1K Memory', () => { st.shards += 1000; }], ['+10 Geodes', () => { st.geodes += 10; }], ['+5 Levels', () => this.w.addLevels(5)], ['Skip quest', () => { this.close(); this.w.completeQuest(); }], ['Full heal', () => { this.w.heal(this.w.hero.hpMax, '', true); }]]) {
      const b = el('button', 'btn ghost', label); b.onclick = () => { sfx('ui'); fn(); this.stats(); save(st); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }; tg.appendChild(b);
    }
    bd.appendChild(tg);
    bd.appendChild(el('div', 'sec', 'Move your save'));
    bd.appendChild(el('div', 'small muted', 'Safari and the Home Screen app keep separate saves. Copy a code here, then load it in the other one.'));
    const tr = el('div', 'row'); tr.style.gap = '10px'; tr.style.marginTop = '10px';
    const cpb = el('button', 'btn grow', 'Copy save code'); cpb.onclick = () => { save(st); sfx('ui'); copyModal($('#modal'), st, sfx); };
    const ldb = el('button', 'btn ghost grow', 'Load a save code'); ldb.onclick = () => { sfx('ui'); pasteModal($('#modal'), () => { lockSaves(); location.reload(); }); };
    tr.appendChild(cpb); tr.appendChild(ldb); bd.appendChild(tr);
    const rs = el('button', 'btn ghost', 'Start over'); rs.style.marginTop = '16px'; rs.style.width = '100%';
    rs.onclick = () => { if (rs.dataset.c) { wipe(); location.reload(); } else { rs.dataset.c = 1; rs.textContent = 'Tap again to erase your save'; rs.style.color = 'var(--red)'; } };
    bd.appendChild(rs);
    bd.appendChild(el('div', 'small muted', 'Wyrmbound: Starfall · build 8.1.1. Engine: Phaser (MIT). Font: Chakra Petch (OFL). Art: Grok, drawn in code, and the Sci Fi Game UI collection by SunGraphica (GameDev Market). Music: made with Suno.')).style.marginTop = '14px';
  }

  actEnd(n = 1) {
    const m = $('#modal'), A = ACTS[n] || ACTS[1];
    m.innerHTML = `<div class="box"><div class="k">${esc(A.sub)}</div><h3>${esc(A.title)}</h3><p>${esc(A.text)}</p><p class="small muted">${esc(A.next)}</p><button class="btn gold">${QUESTS[this.st.q] ? 'Continue' : 'Keep hunting'}</button></div>`;
    m.classList.add('on'); $('button', m).onclick = () => { m.classList.remove('on'); this.quest(); };
    sfx('level');
  }
  travelMenu() {
    const st = this.st, m = $('#modal'), towerAt = QUESTS.findIndex(q => q.id === 'boss');
    const box = el('div', 'box', `<div class="k">Spire sync</div><h3>Travel</h3><p class="small muted">Every Spire on Aurelis is grown from the same spine. Step in and step out somewhere else.</p>`);
    for (const [id, R] of Object.entries(REGIONS)) {
      const locked = (R.unlock && st.q < QUESTS.findIndex(q => q.id === R.unlock)) || (R.tower && st.q <= towerAt), here = id === st.region;
      const sub = R.tower ? (locked ? 'Opens after the Thornmother' : (st.tower.best ? `Endless floors · best floor ${st.tower.best}` : 'Endless floors · not climbed yet')) : `${esc(R.hub)} · levels ${esc(R.lvl)}`;
      const c = el('div', 'tcard' + (locked ? ' lock' : ''), `<img src="${ART.region[id] || this.icon('tower', 0xffcf5a)}" alt=""><div class="grow"><b class="d">${esc(R.name)}</b><div class="small muted">${sub}</div></div>`);
      const b = el('button', 'btn' + (here ? ' ghost' : ''), here ? 'Here' : locked ? 'Locked' : 'Sync');
      b.disabled = here || locked; b.onclick = () => { m.classList.remove('on'); this.w.travel(id); };
      c.appendChild(b); box.appendChild(c);
    }
    const x = el('button', 'btn ghost', 'Close'); x.style.marginTop = '12px'; x.onclick = () => { m.classList.remove('on'); if (this.w) this.w.paused = false; }; box.appendChild(x);
    m.innerHTML = ''; m.appendChild(box); m.classList.add('on'); if (this.w) this.w.paused = true; sfx('ui');
  }
  towerResult(reached, best, done) {
    const m = $('#modal');
    m.innerHTML = `<div class="box"><div class="k">Ossivar\u2019s Spire</div><h3>Link lost on floor ${reached + 1}</h3><p class="muted">${reached ? `You cleared ${reached} floor${reached === 1 ? '' : 's'}.` : 'The Spire held this time.'} Best floor: <b class="d">${best}</b>. The next climb starts from floor ${best + 1}.</p><p class="small"><i>${esc(TOWER_LINES[Math.floor(Math.random() * TOWER_LINES.length)])}</i></p><button class="btn gold">Return</button></div>`;
    m.classList.add('on'); sfx('ui'); $('button', m).onclick = () => { m.classList.remove('on'); done(); };
  }
  offline(r, claim) {
    const m = $('#modal'); const h = Math.floor(r.secs / 3600), mi = Math.round((r.secs % 3600) / 60);
    m.innerHTML = `<div class="box"><div class="k">While you were away</div><h3>${h ? h + 'h ' : ''}${mi}m of hunting</h3><p class="muted">Your Echo kept the link warm and the Lodge kept you on the roster.</p><div class="rw"><div class="pill"><img src="${this.lumenIcon}" alt="">+${fmt(r.lumen)}</div><div class="pill">+${fmt(r.xp)} XP</div></div><button class="btn gold">Claim</button></div>`;
    m.classList.add('on'); $('button', m).onclick = () => { m.classList.remove('on'); claim(); };
  }
}
