import { CALLINGS, ECHOES, SLOTS, RARITY, GEAR_NAMES, QUESTS } from './data.js?v=4';

const KEY = 'starfall.save.v1';

export function fresh(cls) {
  return {
    v: 1, cls, region: 'verge', lvl: 1, xp: 0, lumen: 0, shards: 0, geodes: 0, q: 0, qp: 0,
    gear: Object.fromEntries(SLOTS.map(s => [s.id, null])),
    echoes: {}, activeEcho: null, codex: {}, kills: {}, bounty: null,
    settings: { sound: true, music: true, autoSkill: true },
    actDone: false, bossKills: 0, tower: { best: 0, from: 'verge' }, lastSeen: Date.now(), created: Date.now()
  };
}

export function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.v === 1 && CALLINGS[s.cls]) { if (!s.region) s.region = 'verge'; if (!s.tower) s.tower = { best: 0, from: 'verge' }; for (const k in s.echoes) s.echoes[k].evo = +s.echoes[k].evo || 0; return s; } } catch (e) {}
  return null;
}
export function save(st) { try { st.lastSeen = Date.now(); localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
export function wipe() { try { localStorage.removeItem(KEY); } catch (e) {} }

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

export function heroStats(st) {
  const C = CALLINGS[st.cls], L = st.lvl - 1;
  const g = st.gear;
  const atk = C.base.atk + C.per.atk * L + gearValue('weapon', g.weapon) + gearValue('implant', g.implant) * 120;
  const hpMax = C.base.hp + C.per.hp * L + gearValue('armor', g.armor);
  const def = C.base.def + C.per.def * L + gearValue('charm', g.charm);
  const crit = Math.min(0.6, C.base.crit + gearValue('implant', g.implant));
  return { atk, hpMax: Math.round(hpMax), def, crit, critDmg: 1.6 };
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
