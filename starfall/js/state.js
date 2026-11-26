import { CALLINGS, ECHOES, SLOTS, RARITY, GEAR_NAMES, QUESTS, RANKS, CALLING_PORTRAIT, TREES, TREE_THEMES, TREE_ROW_REQ, ORDERS } from './data.js?v=7.1.1';

const KEY = 'starfall.save.v1';

export function fresh(cls, look, name) {
  return {
    v: 1, cls, name: name || 'Hunter', look: look || null, portrait: 'calling', frame: 'recruit', trees: {}, rankSeen: 1, region: 'verge', lvl: 1, xp: 0, lumen: 0, shards: 0, geodes: 0, q: 0, qp: 0,
    gear: Object.fromEntries(SLOTS.map(s => [s.id, null])),
    echoes: {}, activeEcho: null, codex: {}, kills: {}, bounty: null,
    settings: { sound: true, music: true, autoSkill: true },
    actDone: false, bossKills: 0, tower: { best: 0, from: 'verge' }, lastSeen: Date.now(), created: Date.now()
  };
}

export function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.v === 1 && CALLINGS[s.cls]) { if (!s.region) s.region = 'verge'; if (!s.tower) s.tower = { best: 0, from: 'verge' }; if (!s.trees) s.trees = {}; if (!s.portrait) s.portrait = 'calling'; if (!s.frame) s.frame = 'recruit'; if (!s.rankSeen) s.rankSeen = rankIndex(s.lvl) + 1; for (const k in s.echoes) s.echoes[k].evo = +s.echoes[k].evo || 0; return s; } } catch (e) {}
  return null;
}
let saveLocked = false;
export const lockSaves = () => { saveLocked = true; };
export function save(st) { if (saveLocked) return; try { st.lastSeen = Date.now(); localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
export function wipe() { try { localStorage.removeItem(KEY); } catch (e) {} }

export const dayKey = (d = new Date()) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
export function rollDaily(st) {
  const day = dayKey();
  if (st.daily && st.daily.day === day) return false;
  const avail = ['ult', 'quest'];
  if (Object.values(st.gear).some(Boolean)) avail.push('forge');
  if (Object.values(st.echoes).some(e => e.lvl < 30)) avail.push('echo');
  if (st.q > QUESTS.findIndex(q => q.id === 'boss')) avail.push('tower');
  if (st.bossKills > 0) avail.push('boss');
  let h = 2166136261; for (const ch of day + ':' + (st.created || 0)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const pick = ['kill'];
  while (pick.length < 3 && avail.length) { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; pick.push(avail.splice(h % avail.length, 1)[0]); }
  st.daily = { day, list: pick.map(k => ({ k, n: ORDERS[k].n, p: 0, got: false })), bonus: false };
  return true;
}
export const orderReward = st => ({ lumen: 50 + 30 * st.lvl, shards: 4 + Math.floor(st.lvl / 6) });
export const ORDER_BONUS = { geodes: 1, shards: 8 };
export const ordersClaimable = st => !!st.daily && (st.daily.list.some(o => o.p >= o.n && !o.got) || (!st.daily.bonus && st.daily.list.every(o => o.got)));

export const xpNeed = l => Math.round(24 * Math.pow(l, 1.55) + 26);

export function gearValue(slot, g) {
  if (!g) return 0;
  const m = RARITY[g.rar].mult * (1 + 0.1 * (g.up || 0)) * (1 + 0.15 * (g.star || 0));
  if (slot === 'weapon') return (5 + 2.6 * g.ilvl) * m;
  if (slot === 'armor') return (26 + 13 * g.ilvl) * m;
  if (slot === 'implant') return (0.015 + 0.004 * g.ilvl) * m;
  if (slot === 'charm') return (2.5 + 1.4 * g.ilvl) * m;
  return 0;
}
export function gearLine(slot, g) {
  const v = gearValue(slot, g);
  if (slot === 'weapon') return `+${Math.round(v)} Attack`;
  if (slot === 'armor') return `+${Math.round(v)} Max HP`;
  if (slot === 'implant') return `+${(v * 100).toFixed(1)}% Crit, +${Math.round(v * 120)} Attack`;
  if (slot === 'charm') return `+${Math.round(v)} Defense`;
  return '';
}

export function rankIndex(lvl) { let r = 0; for (let i = 0; i < RANKS.length; i++) if (lvl >= RANKS[i].lvl) r = i; return r; }
export function portraitDef(id) { return id === 'calling' ? CALLING_PORTRAIT : RANKS.find(r => r.id === id) || CALLING_PORTRAIT; }
export function portraitUnlocked(st, id) { if (id === 'calling') return true; const r = RANKS.find(x => x.id === id); return !!r && st.lvl >= r.lvl; }
export function treeOf(st, cls = st.cls) { if (!st.trees) st.trees = {}; return st.trees[cls] || (st.trees[cls] = {}); }
export function treeSpent(st, cls = st.cls) { return Object.values(treeOf(st, cls)).reduce((a, b) => a + b, 0); }
export function treePoints(st) { return Math.max(0, st.lvl - 1 - treeSpent(st)); }
export function branchSpent(st, b) { const t = treeOf(st); let n = 0; for (let r = 0; r < 6; r++) n += t[b + '_' + r] || 0; return n; }
export function nodeDef(cls, b, r) { const B = TREES[cls][b], N = TREE_THEMES[B.theme][r]; return Object.assign({ id: b + '_' + r, branch: B }, N); }
export function canLearn(st, b, r) { const N = nodeDef(st.cls, b, r), have = treeOf(st)[N.id] || 0; return treePoints(st) > 0 && have < N.max && branchSpent(st, b) >= TREE_ROW_REQ[r]; }
export function autoSpend(st, b) {
  const t = treeOf(st), order = [b, (b + 1) % 3, (b + 2) % 3]; let n = 0;
  outer: while (treePoints(st) > 0) {
    for (const bb of order) for (let r = 0; r < 6; r++) if (canLearn(st, bb, r)) { t[bb + '_' + r] = (t[bb + '_' + r] || 0) + 1; n++; continue outer; }
    break;
  }
  return n;
}
export const respecCost = st => st.lvl < 10 ? 0 : st.lvl * 40;
export function mods(st) {
  const m = { atkPct: 0, hpPct: 0, defPct: 0, crit: 0, critDmg: 0, aspd: 0, res: 0, echo: 0, regen: 0, xp: 0, skill: 0, skillDmg: {}, skillCd: {}, keys: {} };
  const add = o => { for (const k in o) m[k] += o[k]; };
  for (const R of RANKS) if (st.lvl >= R.lvl) add(R.perm);
  if (portraitUnlocked(st, st.portrait || 'calling')) add(portraitDef(st.portrait || 'calling').pb);
  const T = TREES[st.cls], t = treeOf(st);
  if (T) for (let b = 0; b < 3; b++) for (let r = 0; r < 6; r++) {
    const n = t[b + '_' + r] || 0; if (!n) continue;
    const N = TREE_THEMES[T[b].theme][r], sid = T[b].skill;
    if (N.k === 'key') m.keys[N.key] = true;
    else if (N.k === 'skillDmg') m.skillDmg[sid] = (m.skillDmg[sid] || 0) + N.v * n;
    else if (N.k === 'skillCd') m.skillCd[sid] = (m.skillCd[sid] || 0) + N.v * n;
    else m[N.k] += N.v * n;
  }
  return m;
}
export function heroStats(st) {
  const C = CALLINGS[st.cls], L = st.lvl - 1, m = mods(st);
  const g = st.gear;
  const atk = (C.base.atk + C.per.atk * L + gearValue('weapon', g.weapon) + gearValue('implant', g.implant) * 120) * (1 + m.atkPct);
  const hpMax = (C.base.hp + C.per.hp * L + gearValue('armor', g.armor)) * (1 + m.hpPct);
  const def = (C.base.def + C.per.def * L + gearValue('charm', g.charm)) * (1 + m.defPct);
  const crit = Math.min(0.7, C.base.crit + gearValue('implant', g.implant) + m.crit);
  return { atk, hpMax: Math.round(hpMax), def, crit, critDmg: 1.6 + m.critDmg, mods: m };
}
export function power(st) { const s = heroStats(st); return Math.round(s.atk * 4 + s.hpMax * 0.6 + s.def * 3 + s.crit * 600 + echoPower(st)); }

export function echoStats(st, id) {
  const e = st.echoes[id]; if (!e) return null;
  const D = ECHOES[id];
  const ev = +e.evo || 0;
  const atk = (D.atk + D.per * (e.lvl - 1)) * [1, 1.5, 2.2][ev];
  return { atk, lvl: e.lvl, evo: ev, cap: [10, 20, 30][ev] };
}
function echoPower(st) { let p = 0; for (const id in st.echoes) { const s = echoStats(st, id); p += s.atk * 3; } return p; }
export const echoLevelCost = lvl => 3 + lvl * 2;
export const EVOLVE_COST = 15;
export const ASCEND_COST = 40;
export const STAR_MAX = 5;
export const refineCost = g => 8 + 6 * (g.star || 0);
export const refineNeed = g => 3 * ((g.star || 0) + 1);

export const upgradeCost = g => g ? Math.round(18 * Math.pow(1.32, g.up || 0) * (1 + g.ilvl * 0.15)) : 0;

export function makeGear(cls, slot, ilvl, rar) {
  const names = GEAR_NAMES[cls][slot];
  return { name: names[Math.min(names.length - 1, rar)], rar, ilvl, up: 0 };
}
export function rollRarity(boss) {
  const r = Math.random();
  if (boss) return r < .25 ? 3 : 2;
  return r < .01 ? 3 : r < .08 ? 2 : r < .30 ? 1 : 0;
}

export function offlineRewards(st) {
  const away = Math.min(8 * 3600, Math.max(0, (Date.now() - (st.lastSeen || Date.now())) / 1000));
  if (away < 120) return null;
  const mins = away / 60;
  const lumen = Math.round(mins * (1.2 + st.lvl * 0.35));
  const xp = Math.round(mins * (2 + st.lvl * 1.4));
  return { secs: away, lumen, xp };
}

export function currentQuest(st) { return QUESTS[st.q] || null; }
