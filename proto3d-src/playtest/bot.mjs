// Journey of Aethra headless playtest bot.
// Boots the BUILT game (build3d.py output) in a Node vm with DOM stubs, picks a class,
// runs autoplay at sped-up time (fixed dt steps, as fast as the CPU allows) and writes a
// JSON report. The 3D layer (g3d.js / WebGL) is not loaded headless; the sim and the 2D
// renderer run for real. FPS is modeled from measured frame CPU cost (see thresholds.json).
// Usage: node bot.mjs [siteDir] [label] [classKey] [minutes]
//   defaults: siteDir=~/workspace/journey-of-aethra/build3d/site label=run class=knight minutes=32
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';

const siteDir = process.argv[2] || path.join(os.homedir(), 'workspace/journey-of-aethra/build3d/site');
const label = process.argv[3] || 'run';
const clsKey = process.argv[4] || 'knight';
const minutes = parseFloat(process.argv[5] || '32');
const TH = JSON.parse(fs.readFileSync(new URL('./thresholds.json', import.meta.url), 'utf8')).checks;

// ---------- seeded RNG (reproducible runs) ----------
let _s = 1337;
const rng = () => { _s |= 0; _s = _s + 0x6D2B79F5 | 0; let t = Math.imul(_s ^ _s >>> 15, 1 | _s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// ---------- DOM stubs ----------
function ctxStub() {
  const base = { canvas: {}, measureText: () => ({ width: 10 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }), getImageData: () => ({ data: [] }) };
  return new Proxy(base, { get: (o, k) => (k in o ? o[k] : () => {}), set: () => true });
}
function elStub() {
  const e = { style: {setProperty(){},removeProperty(){}}, dataset: {}, children: [], classList: { add() {}, remove() {}, toggle() {} },
    innerHTML: '', textContent: '', value: '', width: 300, height: 150,
    addEventListener() {}, removeEventListener() {}, appendChild(c) { return c; }, remove() {},
    setAttribute() {}, getAttribute: () => null, insertAdjacentHTML() {}, insertAdjacentElement() {}, querySelector: () => elStub(), querySelectorAll: () => [],
    getContext: () => ctxStub(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 844 }), focus() {}, click() {} };
  return e;
}
const els = new Map();
const store = new Map();
let vnow = 0;
const errors = [];
const sandbox = {
  console: { log() {}, warn() {}, error: (...a) => { errors.push(a.map(x => String(x && x.message || x)).join(' ').slice(0, 300)); } },
  Math: Object.create(Math, { random: { value: rng } }),
  JSON, Date, Promise, Set, Map, WeakMap, Array, Object, Number, String, Boolean, RegExp, Error, TypeError, Symbol, Reflect, Proxy, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  performance: { now: () => vnow },
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
  Image: class { constructor() { this.complete = true; this.width = 96; this.height = 96; } },
  Audio: class { constructor() { this.volume = 1; } play() { return Promise.resolve(); } pause() {} addEventListener() {} },
  navigator: { userAgent: 'playtest-bot' },
  location: { href: 'http://localhost/', reload() {} },
  addEventListener() {}, removeEventListener() {},
  devicePixelRatio: 2,
  innerWidth: 390, innerHeight: 844,
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
sandbox.document = {
  getElementById: id => { if (!els.has(id)) els.set(id, elStub()); return els.get(id); },
  querySelector: () => elStub(), querySelectorAll: () => [], createElement: () => elStub(),
  addEventListener() {}, body: elStub(), documentElement: elStub(), hidden: false,
};
vm.createContext(sandbox);

// ---------- load the build ----------
const html = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const uiJs = fs.readFileSync(path.join(siteDir, 'ui.js'), 'utf8');
const run = (code, name) => { try { vm.runInContext(code, sandbox, { filename: name }); } catch (e) { errors.push('LOAD ' + name + ': ' + e.message); } };
run(uiJs, 'ui.js');
inline.forEach((c, i) => run(c, 'inline' + i));

// ---------- helpers ----------
const G = sandbox;
const ev = expr => vm.runInContext(expr, sandbox);
let booted = false;
try { ev('boot()'); booted = true; } catch (e) { errors.push('boot: ' + e.message); }
try { ev(`S.cls=${JSON.stringify(clsKey)};if(!S.pets.length){const p=mkPet(0);S.pets.push(p);S.team=[p.id]}S.auto=true;fieldInit()`); } catch (e) { errors.push('start: ' + e.message); }
if (process.env.BOT_DEBUG) console.log('DBG after setCls:', ev('JSON.stringify({B:!!B,auto:S.auto,F:!!F,dlg:!!(F&&F.dlg),q:S.q,lv:S.lv,hp:F?F.h.hp:0,x:F?Math.round(F.h.x):0,y:F?Math.round(F.h.y):0,status:F?F.status:""})'));

// ---------- run ----------
const DT = 1 / 30, totalFrames = Math.floor(minutes * 60 / DT);
const levelAt = {}; let deaths = 0, wasDead = false, goldEarned = 0, goldSpent = 0, prevGold = null;
let lastProgressT = 0, maxDry = 0, prevSig = '';
let bossFight = null, bossFights = [], firstBossAt = null, prevBoss = false, curBossRef = null;
let fpsRun = 0, fpsWorstRun = 0, frameMsSum = 0, framesMeasured = 0;
let bossSeen = 0, minHpPre2 = 1, goldE30 = null, goldS30 = null, deathsPre2 = 0, minHpCtx = '';
let towerEnteredAt = null, towerFailed = false, inTower = false, nanSeen = false;
const t0wall = Date.now();
for (let f = 0; f < totalFrames; f++) {
  vnow = f * DT * 1000;
  const t = f * DT; // game seconds
  const a = process.hrtime.bigint();
  try { ev('step(' + DT + ')'); ev('draw()'); } catch (e) { errors.push('frame ' + f + ': ' + e.message); if (errors.length > 20) break; }
  const ms = Number(process.hrtime.bigint() - a) / 1e6;
  frameMsSum += ms; framesMeasured++;
  const fps = 1000 / Math.max(ms * 4, 0.01);
  if (f % 6 === 0) { const bb = ev('F&&F.boss?F.boss:null');
    if (bb !== curBossRef) { if (bb) bossSeen++; if (curBossRef && bossFight) { bossFights.push({ boss: bossFight.boss, seconds: +(t - bossFight.start).toFixed(1), result: 'won', tries: deaths - bossFight.deathsAtStart + 1 }); bossFight = null; }
      curBossRef = bb; if (bb) bossFight = { start: t, deathsAtStart: deaths, boss: bb.n + (bb.hunt ? ' (hunt)' : ' (quest)') }; } }
  if (fps < TH.fpsMin) { fpsRun++; fpsWorstRun = Math.max(fpsWorstRun, fpsRun); } else fpsRun = 0;
  // sample once per game second
  if (f % 30) continue;
  const st = ev('({lv:S.lv,gold:S.gold,q:S.q,qk:S.qk||0,chest:S.stat.chest,eggs:S.eggs,xp:S.xp,dead:F&&F.h?F.h.dead:0,boss:!!(F&&F.boss),tw:!!(F&&F.tower),wbest:S.wbest||0,wruns:S.wruns||0,bd:F&&F.boss?Math.hypot(F.h.x-F.boss.x,F.h.y-F.boss.y):9999,pw:stats().power,hpr:F&&F.h?(F.h.combatT<3?F.h.hp/Math.max(1,hmax()):1):1})');
  if (!isFinite(st.gold) || !isFinite(st.xp) || !isFinite(st.pw)) nanSeen = true;
  if (bossSeen < 2 && st.hpr < minHpPre2) { minHpPre2 = st.hpr; minHpCtx = 't=' + Math.round(t) + 's lv=' + st.lv + ' q=' + st.q + ' boss=' + st.boss + ' hp=' + Math.round(st.hpr * 100) + '%'; }
  if (t >= 1800 && goldE30 === null) { goldE30 = goldEarned; goldS30 = goldSpent; }
  for (const m of [5, 10, 30]) if (t >= m * 60 && levelAt[m] === undefined) levelAt[m] = st.lv;
  if (prevGold !== null) { const d = st.gold - prevGold; if (d > 0) goldEarned += d; else goldSpent -= d; }
  prevGold = st.gold;
  if (st.dead > 0 && !wasDead) { deaths++; if (bossSeen < 2) deathsPre2++; if (inTower) towerFailed = true; }
  if (st.tw && towerEnteredAt === null) towerEnteredAt = t;
  inTower = st.tw;
  wasDead = st.dead > 0;
  const sig = st.lv + '|' + st.q + '|' + st.qk + '|' + st.chest + '|' + st.eggs + '|' + Math.floor(st.pw);
  if (sig !== prevSig) { maxDry = Math.max(maxDry, t - lastProgressT); lastProgressT = t; prevSig = sig; }
  if (process.env.BOT_TRACE && f % 900 === 0) console.log('TRACE', Math.round(t), ev("JSON.stringify({q:S.q,qk:S.qk||0,qt:Q().t,stage:S.stage,lv:S.lv,st:F.status,x:Math.round(F.h.x),y:Math.round(F.h.y),hp:Math.round(F.h.hp),boss:F.boss?Math.round(F.boss.hp)+'/'+F.boss.mhp+'@'+Math.round(F.boss.x)+','+Math.round(F.boss.y)+(F.boss.tele?':T'+F.boss.tele.kind:'')+(F.boss.hunt?':HUNT':''):null,mobs:F.mobs.filter(m=>!m.dead).length})"));
  if (st.boss && !prevBoss && firstBossAt === null) firstBossAt = t;
  prevBoss = st.boss;
}
if (bossFight) bossFights.push({ boss: bossFight.boss, seconds: +(minutes * 60 - bossFight.start).toFixed(1), result: 'unfinished', tries: deaths - bossFight.deathsAtStart + 1 });
maxDry = Math.max(maxDry, minutes * 60 - lastProgressT);

if (goldE30 === null) { goldE30 = goldEarned; goldS30 = goldSpent; }
const parity = (() => { try { const a = ev("S.cls='knight';S.isle=0;spawnBoss().mhp"); const b = ev("S.cls='gunslinger';S.isle=0;spawnBoss().mhp"); return { knight: a, gunslinger: b, equal: a === b }; } catch (e) { return { error: e.message }; } })();
const first = bossFights[0];
const checks = {
  consoleErrors: errors.length <= TH.consoleErrors,
  fps: fpsWorstRun * DT <= TH.fpsBelowMinMaxSeconds,
  firstBoss: firstBossAt !== null && firstBossAt <= TH.firstBossWithinMinutes * 60,
  bossLength: !!first && first.seconds >= TH.bossFightMinSeconds && first.seconds <= TH.bossFightMaxSeconds,
  firstBossTries: !!first && first.result === 'won' && first.tries <= TH.firstBossMaxTries,
  dryStretch: maxDry <= TH.maxDryStretchMinutes * 60,
  dangerBeforeBoss2: deathsPre2 >= 1 || minHpPre2 < TH.dangerBeforeBoss2Hp,
  goldSpentRatio: goldE30 > 0 && goldS30 >= TH.goldSpentRatioMin * goldE30,
  bossHpParity: !!parity.equal,
  towerReach: minutes < 170 ? true : (towerEnteredAt !== null && towerEnteredAt <= TH.towerReachMinutes * 60),
  towerFails: minutes < 170 ? true : towerFailed,
  finite: !nanSeen,
};
const report = {
  label, cls: clsKey, seed: 1337, builtFrom: siteDir, wallSeconds: +((Date.now() - t0wall) / 1000).toFixed(1),
  booted, minutesSimulated: minutes,
  levelAt: { '5': levelAt[5] ?? null, '10': levelAt[10] ?? null, '30': levelAt[30] ?? null },
  final: ev('({lv:S.lv,isle:S.isle,stage:S.stage,q:S.q,gold:S.gold,power:stats().power})'),
  deaths, bossFights, firstBossAtSeconds: firstBossAt,
  goldEarned, goldSpent, goldEarnedBy30: goldE30, goldSpentBy30: goldS30, goldSpentRatioBy30: goldE30 > 0 ? +(goldS30 / goldE30).toFixed(3) : 0, nanSeen, heapMB: +(process.memoryUsage().heapUsed / 1048576).toFixed(1), tower: { enteredAtSeconds: towerEnteredAt, failed: towerFailed, wbest: ev('S.wbest||0'), wruns: ev('S.wruns||0') }, minHpPreBoss2: +minHpPre2.toFixed(3), minHpContext: minHpCtx+' (in-combat samples only, hp/hmax)', deathsPreBoss2: deathsPre2, bossHpByClass: parity, maxDryStretchSeconds: Math.round(maxDry),
  consoleErrors: errors.slice(0, 10), consoleErrorCount: errors.length,
  fps: { model: 'frame CPU ms x4 throttle', avgFrameMs: +(frameMsSum / Math.max(1, framesMeasured)).toFixed(3), worstRunBelow30Seconds: +(fpsWorstRun * DT).toFixed(2) },
  checks, pass: Object.values(checks).every(Boolean),
};
const out = new URL('./report-' + label + '.json', import.meta.url);
fs.writeFileSync(out, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
