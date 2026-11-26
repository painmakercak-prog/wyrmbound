import { CALLINGS, ENEMIES, REGIONS, NPCS, ECHOES, QUESTS, SLOTS, RARITY, CODEX, BOUNTIES, TOWER_POOL, TOWER_GUARDS, GEAR_NAMES, IDLE } from './data.js?v=7.3';
import { buildArt, ANCHORS, heroCanvas } from './art.js?v=7.3';
import { heroStats, echoStats, xpNeed, makeGear, rollRarity, gearValue, save, rankIndex } from './state.js?v=7.3';
import { sfx, duck, playTrack } from './audio.js?v=7.3';
import { Lighting } from './lighting.js?v=7.3';

const dist = (a, b, c, d) => Math.hypot(c - a, d - b);
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));

const HIT = { thornmother: [60, 120], marrowking: [110, 210], choir: [110, 240], firstcaptain: [70, 150] };
const hy = e => (HIT[e.type] || [16, 44])[0];
const topY = e => (HIT[e.type] || [16, 44])[1];

function distToPath(paths, x, y) {
  let best = 1e9;
  for (const P of paths) for (let i = 0; i < P.length - 1; i++) {
    const [ax, ay] = P[i], [bx, by] = P[i + 1];
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, dist(x, y, ax + dx * t, ay + dy * t));
  }
  return best;
}

const SHADOWED = /^tree|^rib|^rock|^mesa|^crate|^tent|^stall|^lamp|^forge|^banner|^rig|^cage|^wreck|^mill|^vaultdoor|^marker|^crystal|^coral|^kelp|^scrap|^cone|^fence|^spire/;

export class WorldScene extends Phaser.Scene {
  constructor() { super('world'); }

  init(d) {
    this.initData = d; this.ui = d.ui; this.st = d.state; this.TS = d.TS; this.Z = d.Z; this.dpr = d.dpr; this.onReady = d.onReady;
    if (!REGIONS[this.st.region]) this.st.region = 'verge';
    this.R = REGIONS[this.st.region]; this.P = this.R.places;
  }

  create() {
    this.art = this.game.registry.get('art');
    if (!this.art) { this.art = buildArt(this.TS); this.game.registry.set('art', this.art); }
    for (const [k, c] of Object.entries(this.art)) if (!this.textures.exists(k)) this.textures.addCanvas(k, c);
    this.cameras.main.setBackgroundColor(this.R.bg);
    this.boss = null; this.silentOn = false; document.body.classList.remove('silent'); duck(false);
    this.musicHold = 0; playTrack(this.R.music || 'theme');
    this.paused = false; this.travelling = false; this.towerState = null; this.floor = 0;
    this.now = 0;
    this.fx = this.add.layer(); this.fx.setDepth(5e5);
    this.lit = new Lighting(this, this.R.tower ? 'tower' : this.st.region);
    this.enemies = []; this.projs = []; this.zones = []; this.teles = []; this.drones = []; this.pickups = [];
    this.manualUntil = 0; this.joy = null; this.tapTarget = null; this.tapPoint = null;
    this.res = 0; this.shield = 0; this.shieldT = 0; this.veilT = 0; this.iframeT = 0; this.critShots = 0; this.overT = 0; this.swReady = 0; this.regenUi = 0;
    this.cds = [0, 0, 0]; this.echoCd = 0; this.atkCd = 0;
    this.buildWorld();
    this.makeHero();
    this.refreshStats(true);
    this.makeNpcs();
    this.setEcho(this.st.activeEcho);
    for (const s of this.R.spawns) for (let i = 0; i < s.count; i++) this.spawnEnemy(s);
    if (this.R.tower) this.towerStart();
    this.cameras.main.setBounds(0, 0, this.R.w, this.R.h);
    this.cameras.main.startFollow(this.hero, true, 0.12, 0.12);
    this.setZoom(this.Z, this.dpr);
    this.cameras.main.centerOn(this.hero.x, this.hero.y);
    this.motes = this.add.particles(0, 0, 'dot', {
      x: { min: -400, max: 400 }, y: { min: -500, max: 500 }, lifespan: 6000, speedY: { min: -14, max: -4 }, speedX: { min: -6, max: 6 },
      scale: { start: .5 / this.TS * 2, end: 0 }, alpha: { start: .55, end: 0 }, tint: this.R.motes, frequency: 90, blendMode: 'ADD'
    });
    this.motes.setDepth(4.6e5);
    this.bokeh = this.add.particles(0, 0, 'soft', {
      x: { min: -520, max: 520 }, y: { min: -900, max: 900 }, lifespan: 9000, speedY: { min: -10, max: -2 }, speedX: { min: -5, max: 5 },
      scale: { start: 0, end: 1.1, ease: 'Sine.easeOut' }, alpha: { start: .22, end: 0 }, tint: this.R.motes, frequency: 650, blendMode: 'ADD'
    });
    this.bokeh.setDepth(4.6e5 + 1);
    this.burstE = this.add.particles(0, 0, 'dot', { speed: { min: 60, max: 220 }, lifespan: { min: 250, max: 550 }, scale: { start: .9, end: 0 }, alpha: { start: 1, end: 0 }, blendMode: 'ADD', emitting: false });
    this.burstE.setDepth(5e5 + 2);
    this.shardE = this.add.particles(0, 0, 'shardbit', { speed: { min: 80, max: 200 }, lifespan: { min: 300, max: 650 }, scale: { start: 1 / this.TS * 2, end: 0 }, rotate: { min: 0, max: 360 }, gravityY: 300, emitting: false });
    this.shardE.setDepth(5e5 + 1);
    this.input.on('pointerdown', p => this.onDown(p));
    this.input.on('pointermove', p => this.onMove(p));
    this.input.on('pointerup', p => this.onUp(p));
    this.input.on('pointerupoutside', p => this.onUp(p));
    this.ui.attach(this); this.ui.bossBar(null);
    this.questChanged(true);
    this.time.addEvent({ delay: 8000, loop: true, callback: () => save(this.st) });
    if (this.initData.arrive) { this.cameras.main.fadeIn(500); this.ring(this.hero.x, this.hero.y - 20, 0x9ff6ff, 3); sfx('sync'); this.ui.banner('Spire sync', this.R.name, this.R.hub); this.initData.arrive = false; }
    if (this.onReady) this.onReady(this);
  }

  travel(id, keepFrom) {
    if (this.travelling || !REGIONS[id]) return;
    if (id === this.st.region) { this.ui.toast('You are already here'); return; }
    this.travelling = true; this.paused = true;
    if (REGIONS[id].tower && !keepFrom) this.st.tower.from = this.st.region;
    this.st.region = id; save(this.st);
    this.ui.bossBar(null); this.ui.joystick(null); sfx('sync');
    this.ring(this.hero.x, this.hero.y - 20, 0x9ff6ff, 3);
    this.cameras.main.fadeOut(450, 6, 16, 23);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart(Object.assign(this.initData, { arrive: true })));
  }

  setZoom(Z, dpr) { this.Z = Z; this.dpr = dpr; this.cameras.main.setZoom(Z * dpr); }
  sx(key) { const c = this.art[key]; return c.unitW / c.width; }
  img(x, y, key, ax = .5, ay = .5, s = 1) { return this.add.image(x, y, key).setOrigin(ax, ay).setScale(this.sx(key) * s); }

  buildWorld() {
    const R = this.R, P = this.P, W = R.w, H = R.h;
    const g = this.add.tileSprite(0, 0, W, H, R.ground).setOrigin(0).setTileScale(this.sx(R.ground));
    g.setDepth(-1e6);
    const tint = (x, y, r, col, a, mode = 'ADD') => { const s = this.add.image(x, y, 'soft').setScale(r / 32).setTint(col).setAlpha(a).setBlendMode(mode); s.setDepth(-9e5); if (mode === 'ADD') this.lit.pool(x, y, r, col, a); return s; };
    this.tall = [];
    const placeProp = (key, x, y, s = 1, flip = false) => { const [ax, ay] = ANCHORS[key] || [.5, .9]; const p = this.img(x, y, key, ax, ay, s); if (flip) p.setFlipX(true); p.setDepth(y); if (/^tree|^rib|^spire|^rig|^mesa|^cage|^bigheart|^mill|^vaultdoor/.test(key)) this.tall.push(p); this.lit.prop(key, x, y, s); if (SHADOWED.test(key)) { const c = this.art[key]; const sh = this.img(x + 6 * s, y + 2, 'shadow', .5, .5, Math.min(7, c.unitW * s * .8 / 48)); sh.setDepth(-7.6e5).setAlpha(.85); } return p; };
    for (const PATH of R.paths) for (let i = 0; i < PATH.length - 1; i++) {
      const [ax, ay] = PATH[i], [bx, by] = PATH[i + 1], n = Math.ceil(dist(ax, ay, bx, by) / 24);
      for (let k = 0; k < n; k++) { const t = k / n; const d = this.img(ax + (bx - ax) * t + rnd(-6, 6), ay + (by - ay) * t + rnd(-4, 4), R.path, .5, .5, rnd(1.1, 1.5)); d.setDepth(-8e5); d.setAlpha(i < 2 && R === REGIONS.verge && PATH === R.paths[0] ? 0 : 1); }
    }
    this.spire = placeProp('spire', P.spire.x, P.spire.y, .9);
    this.spireGlow = this.add.image(P.spire.x, P.spire.y - 270, 'soft').setTint(0x9ff6ff).setBlendMode('ADD').setScale(3).setAlpha(.5).setDepth(P.spire.y + 1);
    this.tweens.add({ targets: this.spireGlow, alpha: .9, scale: 3.6, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    tint(P.spire.x, P.spire.y, 180, 0x9ff6ff, .18);
    const R0 = (() => { let a = 1234; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
    this.caustic = null;
    if (this.R.tower) this.buildTower(tint, placeProp, R0); else if (this.st.region === 'dunes') this.buildDunes(tint, placeProp, R0); else if (this.st.region === 'lattice') this.buildLattice(tint, placeProp, R0); else if (this.st.region === 'heartstrand') this.buildHeartstrand(tint, placeProp, R0); else this.buildVerge(tint, placeProp, R0);
  }

  buildVerge(tint, placeProp, R) {
    const P = this.P, PATHS = this.R.paths;
    this.door = null;
    tint(900, 2640, 400, 0xffa04a, .16); tint(900, 2060, 420, 0x5ff2d0, .07); tint(860, 1420, 520, 0x9a5aff, .16); tint(900, 860, 480, 0xff3a6a, .09);
    tint(900, 380, 340, 0xff5aa8, .14); tint(900, 380, 300, 0x000000, .35, 'NORMAL');
    for (let i = 0; i < 70; i++) { const a = rnd(0, Math.PI * 2), r = rnd(0, 240); const d = this.img(900 + Math.cos(a) * r * 1.4, 2640 + Math.sin(a) * r * .6, 'plaza', .5, .5, rnd(1.2, 1.8)); d.setDepth(-8e5); }
    const okSpot = (x, y, pad) => distToPath(PATHS, x, y) > pad && dist(x, y, 900, 2660) > 380 && dist(x, y, P.spire.x, P.spire.y) > 120 && dist(x, y, P.arena.x, P.arena.y) > 260 && dist(x, y, P.geode.x, P.geode.y) > 80;
    for (let i = 0; i < 320 && this.countTrees !== 140; i++) {
      const edge = R() < .55; const x = edge ? (R() < .5 ? rnd(-20, 260) : rnd(1540, 1820)) : rnd(80, 1720); const y = rnd(60, 2560);
      if (!okSpot(x, y, edge ? 60 : 170)) continue;
      const v = y < 1700 && y > 1150 && R() < .6 ? 3 : Math.floor(R() * 3);
      placeProp('tree' + v, x, y, rnd(.85, 1.25), R() < .5); this.countTrees = (this.countTrees || 0) + 1;
    }
    for (let i = 0; i < 160; i++) { const x = rnd(40, 1760), y = rnd(80, 2600); if (!okSpot(x, y, 70)) continue; const r = R(); placeProp(r < .3 ? 'rock' : r < .7 ? 'moss' : 'bulb', x, y, rnd(.8, 1.2), R() < .5); }
    placeProp('rib', 300, 1980, 1.1); placeProp('rib', 1500, 1700, 1, true); placeProp('rib', 260, 1100, 1.2); placeProp('rib', 1560, 820, 1.15, true);
    placeProp('hull', 900, 2998, 1.05);
    for (const [x, y] of [[690, 2540], [1110, 2540], [620, 2700], [1180, 2700], [830, 2470], [970, 2470]]) { placeProp('lamp', x, y, 1); const l = this.add.image(x, y - 80, 'soft').setTint(0xffb85a).setBlendMode('ADD').setScale(2.2).setAlpha(.45).setDepth(y + 1); this.tweens.add({ targets: l, alpha: .6, duration: rnd(900, 1500), yoyo: true, repeat: -1 }); }
    placeProp('banner', 728, 2572, 1); placeProp('forge', 1112, 2582, 1); placeProp('tent', 1090, 2712, .9); placeProp('stall', 700, 2700, .9); placeProp('stall', 560, 2600, .85, true);
    for (const [x, y] of [[600, 2640], [624, 2668], [1180, 2610], [1204, 2640], [1240, 2760]]) placeProp('crate', x, y, rnd(.9, 1.1));
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + rnd(-.1, .1); const rr = rnd(150, 260); const x = P.arena.x + Math.cos(a) * rr, y = P.arena.y + Math.sin(a) * rr * .75; const r = this.img(x, y, 'root', .5, .5, rnd(.8, 1.3)); r.setRotation(a + rnd(-.3, .3)); r.setDepth(-7e5); }
    for (let i = 0; i < 10; i++) { const a = rnd(Math.PI * 1.05, Math.PI * 1.95), rr = rnd(250, 330); placeProp('tree' + (i % 2 ? 3 : 1), P.arena.x + Math.cos(a) * rr, P.arena.y + Math.sin(a) * rr * .7, rnd(1, 1.3)); }
    this.geodeSpr = placeProp('geode', P.geode.x, P.geode.y, 1.1);
    this.geodeGlow = this.add.image(P.geode.x, P.geode.y - 14, 'soft').setTint(0x5ff2d0).setBlendMode('ADD').setScale(1.6).setDepth(P.geode.y + 1);
    this.tweens.add({ targets: this.geodeGlow, scale: 2.2, alpha: .4, duration: 900, yoyo: true, repeat: -1 });
    this.door = placeProp('door', P.roots.x, P.roots.y + 30, 1); this.door.setVisible(false);
    if (this.st.q > QUESTS.findIndex(q => q.id === 'geode')) { this.geodeSpr.setAlpha(0); }
  }

  buildDunes(tint, placeProp, R) {
    const P = this.P, PATHS = this.R.paths, Z = this.R.silent;
    tint(1000, 2600, 380, 0xffb86a, .2); tint(1000, 2020, 420, 0xffd9a0, .1); tint(620, 1560, 360, 0x6a2a10, .22, 'NORMAL'); tint(1210, 1100, 380, 0xff5a3a, .12);
    tint(1000, 430, 340, 0xffcf8a, .12); tint(1000, 430, 300, 0x3a1a08, .3, 'NORMAL');
    const fog = this.add.image(Z.x, Z.y, 'soft').setScale(Z.r / 22, Z.r / 30).setTint(0x2a2a30).setAlpha(.82).setDepth(-8.5e5);
    tint(Z.x, Z.y, Z.r * .9, 0x000000, .3, 'NORMAL');
    const okSpot = (x, y, pad) => distToPath(PATHS, x, y) > pad && dist(x, y, 1000, 2600) > 300 && dist(x, y, P.spire.x, P.spire.y) > 140 && dist(x, y, P.arena.x, P.arena.y) > 280 && dist(x, y, P.dig.x, P.dig.y) > 260 && dist(x, y, P.wreck.x, P.wreck.y) > 140 && dist(x, y, Z.x, Z.y) > Z.r + 40;
    for (let i = 0, n = 0; i < 400 && n < 70; i++) { const x = rnd(-40, 2040), y = rnd(40, 2700); if (!okSpot(x, y, 120)) continue; placeProp('dune', x, y, rnd(.9, 1.6), R() < .5); n++; }
    for (let i = 0, n = 0; i < 300 && n < 34; i++) { const edge = R() < .6; const x = edge ? (R() < .5 ? rnd(-20, 240) : rnd(1760, 2020)) : rnd(80, 1920), y = rnd(80, 2500); if (!okSpot(x, y, edge ? 70 : 160)) continue; placeProp('mesa', x, y, rnd(.8, 1.4), R() < .5); n++; }
    for (let i = 0; i < 120; i++) { const x = rnd(40, 1960), y = rnd(80, 2600); if (!okSpot(x, y, 70)) continue; placeProp(R() < .7 ? 'vein' : 'rock', x, y, rnd(.8, 1.2), R() < .5); }
    for (const [x, y, s, f] of [[250, 2200, 1.3, false], [1780, 2050, 1.2, true], [240, 1500, 1.25, false], [1800, 1400, 1.3, true], [1700, 700, 1.4, true], [300, 420, 1.3, false]]) placeProp('rib', x, y, s, f);
    placeProp('rib', 820, 640, 1.9); placeProp('rib', 1200, 620, 1.9, true);
    for (const [x, y] of [[880, 2690], [1150, 2680], [760, 2560], [1240, 2560]]) placeProp('tentd', x, y, rnd(.85, 1));
    this.campfire = placeProp('fire', 1000, 2620, 1.1);
    const fl = this.add.image(1000, 2600, 'soft').setTint(0xffa040).setBlendMode('ADD').setScale(3).setAlpha(.45).setDepth(2621); this.tweens.add({ targets: fl, alpha: .7, scale: 3.4, duration: 260, yoyo: true, repeat: -1 });
    for (const [x, y] of [[820, 2480], [1180, 2480]]) { placeProp('lamp', x, y, 1); const l = this.add.image(x, y - 80, 'soft').setTint(0xffb85a).setBlendMode('ADD').setScale(2.2).setAlpha(.45).setDepth(y + 1); this.tweens.add({ targets: l, alpha: .6, duration: rnd(900, 1500), yoyo: true, repeat: -1 }); }
    placeProp('stall', 1250, 2700, .9, true); placeProp('crate', 720, 2650, 1); placeProp('crate', 744, 2676, .9);
    placeProp('wreck', P.wreck.x, P.wreck.y, 1.1); placeProp('crate', P.wreck.x - 90, P.wreck.y + 30, .9); placeProp('crate', P.wreck.x + 100, P.wreck.y + 20, .8);
    for (const [x, y] of [[520, 1480], [700, 1640], [560, 1700], [760, 1500]]) placeProp('scrap', x, y, rnd(.9, 1.2), R() < .5);
    this.rig = placeProp('rig', P.dig.x + 30, P.dig.y - 30, 1.15);
    for (const [x, y] of [[1020, 1220], [1110, 1240], [1340, 1220], [1430, 1180], [1460, 1080], [1000, 1120]]) placeProp('fence', x, y, 1);
    tint(P.dig.x + 70, P.dig.y - 80, 70, 0x5ff2d0, .35);
    const ch = this.add.graphics().setDepth(P.dig.y + 4);
    this.chained = this.img(P.dig.x - 60, P.dig.y + 10, 'echo_glimmerkit', .5, 1, 1).setTint(0x9aa8b6).setDepth(P.dig.y + 5);
    ch.lineStyle(2, 0x8a8e94, .9); ch.lineBetween(P.dig.x - 60, P.dig.y - 6, P.dig.x + 4, P.dig.y - 30); ch.lineBetween(P.dig.x - 52, P.dig.y - 2, P.dig.x + 10, P.dig.y - 10);
    this.chainG = ch;
    this.tweens.add({ targets: this.chained, alpha: .35, duration: 420, yoyo: true, repeat: -1, ease: 'Stepped', easeParams: [3] });
    if (this.st.q > QUESTS.findIndex(q => q.id === 'ii_dig')) { this.chained.setVisible(false); ch.setVisible(false); }
    for (let i = 0; i < 12; i++) { const a = rnd(Math.PI * 1.05, Math.PI * 1.95), rr = rnd(260, 340); placeProp('mesa', P.arena.x + Math.cos(a) * rr, P.arena.y + Math.sin(a) * rr * .7, rnd(.9, 1.3), R() < .5); }
    for (let i = 0; i < 10; i++) { const a = rnd(0, Math.PI * 2), rr = rnd(60, Z.r - 20); placeProp('rock', Z.x + Math.cos(a) * rr, Z.y + Math.sin(a) * rr * .8, rnd(.9, 1.3)).setTint(0x8a8e94); }
    this.door = null; this.geodeGlow = null;
  }

  buildHeartstrand(tint, placeProp, R) {
    const P = this.P, PATHS = this.R.paths, W = this.R.w;
    const sea = this.add.graphics().setDepth(-8.6e5);
    for (let i = 0; i < 14; i++) { sea.fillStyle(0x0a1a2a, .95 - i * .06); sea.fillRect(0, 0, W, 300 - i * 6); }
    const foam = this.add.graphics().setDepth(-8.55e5); foam.lineStyle(3, 0xd8e8f0, .45);
    foam.beginPath(); foam.moveTo(0, 230); for (let x = 0; x <= W; x += 40) foam.lineTo(x, 226 + Math.sin(x / 70) * 10); foam.strokePath();
    this.tweens.add({ targets: foam, y: 10, alpha: .5, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    for (const [x, y, sx, sy] of [[380, 1500, 2.2, 1.4], [330, 1250, 1.6, 2.2], [300, 980, 1.6, 2.4], [280, 700, 1.7, 2.4], [300, 430, 2, 2.2]]) { const p = this.img(x, y, 'pool', .5, .5, 1).setScale(this.sx('pool') * sx, this.sx('pool') * sy).setTint(0x8ab8d8).setAlpha(.85).setDepth(-8.6e5); this.tweens.add({ targets: p, alpha: .65, duration: rnd(1800, 2600), yoyo: true, repeat: -1 }); }
    tint(1000, 2600, 300, 0xffb870, .14); tint(1000, 1640, 420, 0x4ab8ff, .16); tint(1000, 420, 420, 0x0a0a1a, .4, 'NORMAL'); tint(1600, 640, 160, 0xffcf5a, .12);
    const heart = placeProp('bigheart', P.core.x, P.core.y + 110, 1.5);
    const hg = this.img(P.core.x, P.core.y - 20, 'heartglow', .5, .5, 3.2).setBlendMode('ADD').setAlpha(.25).setDepth(P.core.y + 111);
    const beat = () => { if (!hg.scene) return; this.tweens.add({ targets: [hg], alpha: .55, duration: 120, yoyo: true, onComplete: () => this.time.delayedCall(140, () => { if (hg.scene) this.tweens.add({ targets: hg, alpha: .45, duration: 120, yoyo: true }); }) }); this.tweens.add({ targets: heart, scaleX: heart.scaleX * 1.02, scaleY: heart.scaleY * 1.025, duration: 120, yoyo: true }); };
    this.time.addEvent({ delay: 1600, loop: true, callback: beat });
    const okSpot = (x, y, pad) => y > 320 && distToPath(PATHS, x, y) > pad && dist(x, y, 1000, 2600) > 280 && dist(x, y, P.core.x, P.core.y) > 300 && dist(x, y, P.arena.x, P.arena.y) > 280 && Object.keys(P).every(k => ['start', 'arrive', 'spire', 'arena', 'core'].includes(k) || dist(x, y, P[k].x, P[k].y) > 110);
    for (let i = 0, n = 0; i < 500 && n < 46; i++) { const x = rnd(-20, 2020), y = rnd(320, 2740); if (!okSpot(x, y, 80)) continue; placeProp(R() < .6 ? 'drift' : 'rock', x, y, rnd(.8, 1.3), R() < .5).setTint(0xb0b4ba); n++; }
    for (let i = 0, n = 0; i < 400 && n < 22; i++) { const x = rnd(20, 1980), y = rnd(320, 2700); if (!okSpot(x, y, 90)) continue; placeProp('crystal', x, y, rnd(.7, 1.1), R() < .5); n++; }
    for (let i = 0, n = 0; i < 300 && n < 18; i++) { const x = rnd(20, 1980), y = rnd(320, 1200); if (!okSpot(x, y, 60)) continue; placeProp('kelp', x, y, rnd(.8, 1.1), R() < .5).setTint(0x8ab8a8); n++; }
    for (let x = 120; x < 2000; x += 260) placeProp('rib', x + rnd(-40, 40), 300 + rnd(-20, 20), rnd(1.6, 2.1), x > 1000).setTint(0x8a8e98);
    for (const [x, y] of [[860, 2690], [1150, 2690], [770, 2600], [1240, 2620]]) placeProp('tent', x, y, rnd(.85, 1)).setTint(0xc8ccd4);
    this.campfire = placeProp('fire', 1000, 2630, 1.1);
    const fl = this.add.image(1000, 2610, 'soft').setTint(0xffa040).setBlendMode('ADD').setScale(3).setAlpha(.45).setDepth(2631); this.tweens.add({ targets: fl, alpha: .7, scale: 3.4, duration: 260, yoyo: true, repeat: -1 });
    for (const [x, y] of [[820, 2490], [1180, 2490], [1560, 1440], [640, 1080], [1000, 1310]]) { placeProp('lamp', x, y, 1); const l = this.add.image(x, y - 80, 'soft').setTint(0xffcf8a).setBlendMode('ADD').setScale(2.2).setAlpha(.4).setDepth(y + 1); this.tweens.add({ targets: l, alpha: .6, duration: rnd(900, 1500), yoyo: true, repeat: -1 }); }
    placeProp('crate', 720, 2660, 1); placeProp('crate', 744, 2684, .9); placeProp('crate', 1290, 2700, .9);
    placeProp('cone', P.nose.x + 40, P.nose.y - 40, 1.2);
    placeProp('vaultdoor', P.vault.x + 30, P.vault.y - 70, 1.1);
    placeProp('mill', P.mill.x - 20, P.mill.y - 60, 1.1);
    placeProp('marker', P.marker.x - 30, P.marker.y - 30, 1.1);
    for (let i = 0; i < 6; i++) placeProp('rock', P.canyon.x - 80 + rnd(-60, 20), P.canyon.y + rnd(-140, 140), rnd(1.4, 2), R() < .5).setTint(0x8a7a6a);
    this.door = null; this.geodeGlow = null;
  }

  buildLattice(tint, placeProp, R) {
    const P = this.P, PATHS = this.R.paths, W = this.R.w, H = this.R.h;
    this.caustic = this.add.tileSprite(0, 0, W, H, 'caustic').setOrigin(0).setTileScale(this.sx('caustic') * 1.6).setBlendMode('ADD').setAlpha(.1).setDepth(-8.7e5);
    const pool = (x, y, sx, sy, a = 1) => { const p = this.img(x, y, 'pool', .5, .5, 1).setScale(this.sx('pool') * sx, this.sx('pool') * sy).setAlpha(a).setDepth(-8.6e5); this.tweens.add({ targets: p, alpha: a * .75, duration: rnd(1800, 2600), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); return p; };
    for (const [x, y, sx, sy] of [[720, 1960, 3.2, 2.6], [460, 2200, 2.2, 1.6], [1460, 1420, 2.6, 2.2], [1700, 1900, 2, 1.8], [620, 1060, 2.4, 1.8], [300, 700, 2.6, 2.4], [1700, 700, 2.6, 2.2], [1000, 380, 5.2, 3.4], [1000, 860, 2.8, 1.6], [240, 1600, 2, 2.6], [1780, 1150, 1.8, 2.6]]) pool(x, y, sx, sy);
    tint(1000, 380, 460, 0x1a5a8a, .35, 'NORMAL'); tint(1000, 380, 380, 0x4ab8ff, .18); tint(1000, 2600, 300, 0xffb870, .14); tint(620, 1060, 200, 0x5ff2d0, .2);
    const okSpot = (x, y, pad) => distToPath(PATHS, x, y) > pad && dist(x, y, 1000, 2600) > 280 && dist(x, y, P.spire.x, P.spire.y) > 140 && dist(x, y, P.arena.x, P.arena.y) > 300 && Object.keys(P).every(k => ['start', 'arrive', 'spire', 'arena'].includes(k) || dist(x, y, P[k].x, P[k].y) > 110);
    for (let i = 0, n = 0; i < 500 && n < 64; i++) { const x = rnd(-30, 2030), y = rnd(60, 2720); if (!okSpot(x, y, 90)) continue; placeProp(R() < .55 ? 'crystal' : 'coral', x, y, rnd(.8, 1.4), R() < .5); n++; }
    for (let i = 0, n = 0; i < 300 && n < 46; i++) { const x = rnd(20, 1980), y = rnd(80, 2700); if (!okSpot(x, y, 60)) continue; placeProp('kelp', x, y, rnd(.8, 1.3), R() < .5); n++; }
    for (let i = 0; i < 60; i++) { const x = rnd(40, 1960), y = rnd(80, 2700); if (!okSpot(x, y, 60)) continue; placeProp('rock', x, y, rnd(.7, 1.1), R() < .5).setTint(0x7aa8b8); }
    for (let y = 2500; y > 300; y -= 300) { placeProp('rib', 150 + rnd(-30, 30), y, rnd(1.3, 1.6), false).setTint(0xc8d8e0); placeProp('rib', 1850 + rnd(-30, 30), y - 150, rnd(1.3, 1.6), true).setTint(0xc8d8e0); }
    placeProp('rib', 820, 700, 2, false).setTint(0xb8d0e0); placeProp('rib', 1180, 690, 2, true).setTint(0xb8d0e0);
    placeProp('rib', 880, 2200, 1.4, false).setTint(0xd8e0e8); placeProp('rib', 1120, 2190, 1.4, true).setTint(0xd8e0e8);
    for (const [x, y] of [[860, 2690], [1150, 2690], [770, 2600], [1240, 2620]]) placeProp('tent', x, y, rnd(.85, 1));
    this.campfire = placeProp('fire', 1000, 2630, 1.1);
    const fl = this.add.image(1000, 2610, 'soft').setTint(0xffa040).setBlendMode('ADD').setScale(3).setAlpha(.45).setDepth(2631); this.tweens.add({ targets: fl, alpha: .7, scale: 3.4, duration: 260, yoyo: true, repeat: -1 });
    for (const [x, y] of [[820, 2490], [1180, 2490], [1540, 1760], [450, 1360], [1000, 720]]) { placeProp('lamp', x, y, 1); const l = this.add.image(x, y - 80, 'soft').setTint(0x7fc8ff).setBlendMode('ADD').setScale(2.2).setAlpha(.45).setDepth(y + 1); this.tweens.add({ targets: l, alpha: .65, duration: rnd(900, 1500), yoyo: true, repeat: -1 }); }
    placeProp('crate', 720, 2660, 1); placeProp('crate', 744, 2684, .9); placeProp('crate', 1290, 2700, .9);
    placeProp('cage', P.pump.x + 60, P.pump.y - 20, 1.1); placeProp('fence', P.pump.x - 70, P.pump.y + 40, 1).setTint(0x9fb8c8);
    placeProp('wreck', 1250, 1900, 1).setTint(0x8ab8d8); placeProp('crate', 1180, 1940, .8).setTint(0x8ab8d8);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; placeProp('rock', P.shrine.x + Math.cos(a) * 70, P.shrine.y + Math.sin(a) * 46, 1.1).setTint(0xb8c8d8); }
    tint(P.shrine.x, P.shrine.y, 110, 0xbfe8ff, .25);
    for (const [x, y] of [[1290, 1050], [1350, 1060], [1410, 1050], [1470, 1030]]) placeProp('fence', x, y, 1).setTint(0x8aa0b0);
    placeProp('cage', P.sluice.x + 40, P.sluice.y - 50, .85);
    for (let i = 0; i < 10; i++) { const a = rnd(Math.PI * 1.05, Math.PI * 1.95), rr = rnd(300, 380); placeProp('crystal', P.arena.x + Math.cos(a) * rr, P.arena.y + Math.sin(a) * rr * .7, rnd(1.2, 1.7), R() < .5); }
    const cur = this.add.graphics().setDepth(-8.5e5); cur.lineStyle(3, 0x5ff2d0, .35);
    const pts = [[880, 1920], [760, 1720], [700, 1580], [560, 1420], [480, 1330], [540, 1180], [620, 1080]]; cur.beginPath(); cur.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) cur.lineTo(x, y); cur.strokePath();
    this.tweens.add({ targets: cur, alpha: .4, duration: 1400, yoyo: true, repeat: -1 });
    this.door = null; this.geodeGlow = null;
  }

  buildTower(tint, placeProp, R) {
    const P = this.P;
    tint(P.arena.x, P.arena.y, 520, 0xffcf5a, .1); tint(P.arena.x, P.arena.y, 420, 0x2a1a4a, .35, 'NORMAL'); tint(600, 1300, 300, 0x9ff6ff, .12);
    const ring = this.add.graphics().setDepth(-7e5);
    ring.lineStyle(3, 0xffcf5a, .35); ring.strokeEllipse(P.arena.x, P.arena.y, 760, 540); ring.lineStyle(1.5, 0x9ff6ff, .3); ring.strokeEllipse(P.arena.x, P.arena.y, 640, 450);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, x = P.arena.x + Math.cos(a) * 470, y = P.arena.y + Math.sin(a) * 360; placeProp('rib', x, y, rnd(.9, 1.2), Math.cos(a) < 0).setTint(0xb8a8d8); }
    for (let i = 0; i < 40; i++) { const x = rnd(40, 1160), y = rnd(80, 1460); if (dist(x, y, P.arena.x, P.arena.y) < 440 || dist(x, y, P.spire.x, P.spire.y) < 160) continue; placeProp('rock', x, y, rnd(.8, 1.2), R() < .5).setTint(0x8a7aa8); }
    this.door = null; this.geodeGlow = null;
  }

  towerStart() {
    const st = this.st; if (!st.tower) st.tower = { best: 0, from: 'verge' };
    this.unlockCodex('ossivar');
    this.floor = st.tower.best + 1; this.towerState = 'wait';
    this.time.delayedCall(1200, () => this.towerFloor());
  }
  towerFloor() {
    if (this.hero.dead || !this.R.tower) return;
    const n = this.floor, P = this.P, L = 3 + n;
    this.towerState = 'fight';
    this.ui.banner('Ossivar’s Spire', 'Floor ' + n, n % 10 === 0 ? 'Guardian floor' : '');
    sfx('boss');
    if (n % 10 === 0) {
      const type = TOWER_GUARDS[(n / 10 - 1) % TOWER_GUARDS.length], Lb = ENEMIES[type].lvl[0];
      const hpMul = 2.2 * Math.max(.6, 1 + .2 * (L - Lb)), atkMul = 1.15 * Math.max(.7, 1 + .13 * (L - Lb));
      this.spawnEnemy({ type, x: P.arena.x, y: P.arena.y, r: 1, count: 0, boss: true, once: true, lvl: L, hpMul, atkMul }, P.arena);
      this.boss.hp = this.boss.hpMax;
    } else {
      const count = Math.min(14, 5 + Math.floor(n / 3)), pool = TOWER_POOL.slice(0, Math.min(TOWER_POOL.length, 2 + Math.floor(n / 4)));
      for (let i = 0; i < count; i++) { const a = rnd(0, Math.PI * 2), r = rnd(80, 280); this.time.delayedCall(i * 120, () => this.spawnEnemy({ type: pool[ri(0, pool.length - 1)], x: P.arena.x + Math.cos(a) * r, y: P.arena.y + Math.sin(a) * r * .7, r: 1, count: 0, once: true, aggro: true, lvl: L })); }
    }
    this.ui.quest();
  }
  towerCheck() {
    if (this.towerState !== 'fight') return;
    this.time.delayedCall(200, () => {
      if (this.towerState !== 'fight' || this.hero.dead || this.enemies.some(e => !e.dead)) { this.ui.quest(); return; }
      const st = this.st, n = this.floor; this.towerState = 'clear';
      const lum = 20 + 12 * n; st.lumen += lum; this.ui.lumenBump();
      let extra = '';
      if (n % 5 === 0) { const sh = 2 + Math.floor(n / 5); st.shards += sh; extra += ` · +${sh} memory`; }
      if (n % 10 === 0) { st.geodes++; extra += ' · +1 geode'; this.towerGear(3 + n); this.unlockCodex('vey' + n); }
      if (n > st.tower.best) { st.tower.best = n; extra += ' · new best'; }
      this.ui.order('tower');
      this.heal(this.hero.hpMax * .25, '', true);
      sfx('quest'); this.ui.banner('Floor ' + n + ' cleared', '+' + lum + ' Lumen', extra.replace(/^ · /, ''));
      save(st); this.floor++; this.ui.quest();
      this.time.delayedCall(3200, () => this.towerFloor());
    });
  }
  towerGear(ilvl) {
    const st = this.st, slot = SLOTS[ri(0, 3)].id, rar = Math.random() < .3 ? 3 : 2;
    const g = makeGear(st.cls, slot, ilvl, rar), cur = st.gear[slot];
    if (!cur || gearValue(slot, g) > gearValue(slot, cur)) { if (cur) { g.up = Math.max(0, (cur.up || 0) - 1); g.star = cur.star || 0; } st.gear[slot] = g; this.refreshStats(false); this.ui.gearPop(slot, g, true); }
    else { const sell = 30 + rar * 20 + ilvl; st.lumen += sell; this.ui.gearPop(slot, g, false, sell); }
    sfx('gear');
  }
  towerEnd() {
    if (this.towerState === 'over') return;
    const st = this.st, reached = this.floor - 1; this.towerState = 'over';
    save(st);
    this.time.delayedCall(1400, () => this.ui.towerResult(reached, st.tower.best, () => { this.travelling = false; this.travel(st.tower.from || 'verge', true); }));
  }
  switchCalling(k) {
    const st = this.st; if (!CALLINGS[k] || k === st.cls) return;
    st.cls = k;
    for (const sl of SLOTS) { const g = st.gear[sl.id]; if (g) { const names = GEAR_NAMES[k][sl.id]; g.name = names[Math.min(names.length - 1, g.rar)]; } }
    save(st); this.paused = true; sfx('sync');
    this.ring(this.hero.x, this.hero.y - 20, CALLINGS[k].color, 3);
    this.cameras.main.fadeOut(450, 6, 16, 23);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart(Object.assign(this.initData, { arrive: false })));
  }

  makeHero() {
    const cls = this.st.cls, C = CALLINGS[cls];
    const at = this.initData.arrive ? this.P.arrive : this.P.start;
    const h = this.add.container(at.x, at.y);
    const shadow = this.img(0, 0, 'shadow', .5, .5, 1.1);
    const fl = this.img(-7, -2, 'foot', .5, .5), fr = this.img(7, -2, 'foot', .5, .5);
    this.heroKey = this.heroTex();
    const body = this.img(0, 0, this.heroKey, .5, .97);
    const wkey = { slash: 'w_blade', rail: 'w_rifle', orb: 'w_orb', knife: 'w_knife', pistol: 'w_pistol', pulse: 'w_staff' }[C.attack];
    const weapon = this.img(0, 0, wkey, .5, { slash: .85, knife: .8, pulse: .85 }[C.attack] || .5);
    h.add([shadow, fl, fr, body, weapon]);
    Object.assign(h, { shadow, fl, fr, body, weapon, facing: 1, walkT: 0, moving: false, vx: 0, vy: 0, kind: C.attack, hp: 1, dead: false, target: null, swing: 0 });
    this.hero = h;
    this.halo = this.img(0, 0, 'ring', .5, .5, .5).setTint(0x5ff2ff).setAlpha(0).setBlendMode('ADD');
  }

  restyle() {
    const h = this.hero; this.heroKey = this.heroTex();
    h.body.setTexture(this.heroKey); h.body.setScale(this.sx(this.heroKey));
    this.ring(h.x, h.y - 20, 0x9ff6ff, 2.2); sfx('sync');
  }
  heroTex() {
    const lk = this.st.look || null, key = 'hero_' + this.st.cls + '_' + (lk ? [lk.sex, lk.head, lk.face, lk.body, lk.skin, lk.hairc, lk.gear === false ? 0 : 1].join('') : 'd');
    if (!this.art[key]) this.art[key] = heroCanvas(this.TS, this.st.cls, lk);
    if (!this.textures.exists(key)) this.textures.addCanvas(key, this.art[key]);
    return key;
  }

  makeNpcs() {
    this.npcs = {};
    for (const id of this.R.npcs) {
      const p = this.P[id];
      const c = this.add.container(p.x, p.y);
      const shadow = this.img(0, 0, 'shadow', .5, .5, 1.1), body = this.img(0, 0, 'ch_' + id, .5, .97);
      c.add([shadow, this.img(-7, -2, 'foot'), this.img(7, -2, 'foot'), body]);
      if (id === 'sparks') { const w = this.img(16, -20, 'wrench', .5, .8); w.setRotation(.5); c.add(w); }
      if (id === 'marr' || id === 'corvin') body.setFlipX(true);
      if (id === 'hush') { c.setAlpha(.85); body.setTint(0xd8dce4); }
      if (id === 'pell') body.setScale(body.scaleX * .84);
      c.setDepth(p.y);
      const name = this.add.text(p.x, p.y + 6, NPCS[id].short, this.txt(11, '#e8f6ff')).setOrigin(.5, 0).setDepth(p.y + 1).setAlpha(.85);
      const mark = this.add.text(p.x, p.y - 82, '!', this.txt(26, '#ffcf5a', 5)).setOrigin(.5).setDepth(4.5e5).setVisible(false);
      this.tweens.add({ targets: mark, y: p.y - 90, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: body, scaleY: body.scaleY * 1.025, duration: 1300 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.npcs[id] = { c, body, mark, name, x: p.x, y: p.y };
    }
  }

  txt(size, color, stroke = 4) { return { fontFamily: '"Chakra Petch", system-ui, sans-serif', fontStyle: '700', fontSize: size + 'px', color, stroke: '#061016', strokeThickness: stroke, resolution: Math.min(4, Math.ceil(this.Z * this.dpr)) }; }

  setEcho(id) {
    if (this.echo) { this.echo.destroy(); this.echo = null; }
    if (!id || !this.st.echoes[id]) return;
    const e = this.add.container(this.hero.x - 30, this.hero.y + 6);
    this.echoColor = ECHOES[id].color;
    const shadow = this.img(0, 0, 'shadow', .5, .5, .7);
    const body = this.img(0, -6, 'echo_' + id, .5, 1);
    const glow = this.add.image(0, -18, 'soft').setTint(ECHOES[id].color).setBlendMode('ADD').setAlpha(.35).setScale(1.2);
    e.add([shadow, glow, body]);
    const hover = ['skein', 'lumi', 'rivet'].includes(id);
    Object.assign(e, { id, body, glow, hover, t: 0, cd: 1, target: null, dash: null });
    const ev = +this.st.echoes[id].evo || 0;
    if (ev) { body.setScale(body.scaleX * (ev > 1 ? 1.45 : 1.25)); glow.setScale(ev > 1 ? 2.4 : 1.8).setAlpha(ev > 1 ? .6 : .5); }
    if (ev > 1) { const halo = this.add.image(0, -18, 'ring').setTint(0xffcf5a).setBlendMode('ADD').setAlpha(.5).setScale(this.sx('ring') * .7); e.addAt(halo, 1); this.tweens.add({ targets: halo, angle: 360, duration: 6000, repeat: -1 }); this.tweens.add({ targets: glow, alpha: .85, duration: 1100, yoyo: true, repeat: -1 }); }
    this.echo = e;
  }

  refreshStats(full) {
    const s = heroStats(this.st);
    const ratio = this.hero.hpMax ? this.hero.hp / this.hero.hpMax : 1;
    Object.assign(this.hero, s);
    this.hero.hp = full ? s.hpMax : Math.max(1, Math.round(s.hpMax * ratio));
    this.ui.stats();
  }

  // ---------- spawning ----------
  spawnEnemy(sp, at) {
    const D = ENEMIES[sp.type];
    let x, y, tries = 0;
    do { const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * sp.r; x = sp.x + Math.cos(a) * r; y = sp.y + Math.sin(a) * r * .8; tries++; }
    while (tries < 12 && this.hero && dist(x, y, this.hero.x, this.hero.y) < 170);
    if (at) { x = at.x; y = at.y; }
    const lvl = sp.lvl || ri(D.lvl[0], D.lvl[1]);
    const c = this.add.container(x, y);
    const shadow = this.img(0, 0, 'shadow', .5, .5, D.boss ? ({ marrowking: 5.2, choir: 5.6, firstcaptain: 2.6 }[sp.type] || 4.4) : D.radius / 16);
    const key = sp.type === 'glowmoth' ? 'moth' : sp.type === 'firstcaptain' ? 'captain' : sp.type;
    const parts = [shadow];
    let wl, wr;
    if (sp.type === 'glowmoth') {
      wl = this.img(-2, -30, 'wing', 1, .5); wl.setFlipX(true); wr = this.img(2, -30, 'wing', 0, .5);
      const gl = this.add.image(0, -28, 'soft').setTint(0xc58bff).setBlendMode('ADD').setAlpha(.4).setScale(1.3);
      parts.push(gl, wl, wr);
    }
    const fly = ['glowmoth', 'sdrone', 'skimmer', 'leech', 'archivist'].includes(sp.type);
    const body = this.img(0, fly ? -14 : 0, key, .5, fly ? .9 : .95);
    if (sp.type === 'marrowking') { body.setOrigin(.56, .93); }
    if (sp.type === 'firstcaptain') { const g = this.add.image(0, -70, 'soft').setTint(0x5ff2ff).setBlendMode('ADD').setAlpha(.35).setScale(5); parts.push(g); }
    parts.push(body);
    if (sp.type === 'firstcaptain') { body.setScale(this.sx('captain') * 2.5).setTint(0xcff6ff); body.keepScale = true; const rf = this.img(26, -60, 'c_rifle', .3, .5, 2).setTint(0xcff6ff); parts.push(rf); }
    c.add(parts);
    const hpMul = sp.hpMul || (D.boss ? 1 : (1 + .2 * (lvl - 1))), atkMul = sp.atkMul || (D.boss ? 1 : (1 + .13 * (lvl - 1)));
    const bar = this.add.graphics().setDepth(4.4e5);
    Object.assign(c, { type: sp.type, D, sp, lvl, hpMax: Math.round(D.hp * hpMul), atk: D.atk * atkMul, body, wl, wr, shadow, bar, state: 'idle', cd: rnd(.5, 1.5), wander: null, wt: rnd(0, 3), t: rnd(0, 10), stun: 0, slow: 0, flash: 0, home: { x, y }, special: 5, broodA: false, broodB: false, dead: false, aggro: false });
    c.hp = c.hpMax;
    if (sp.aggro) { c.aggro = true; c.state = 'chase'; }
    if (D.boss) { c.setScale(1); this.boss = c; this.ui.bossBar(c); sfx('boss'); this.cameras.main.shake(500, .004); this.ui.bossIntro(D, sp.type); if (sp.type === 'choir') { body.scaleY = 0; this.tweens.add({ targets: body, scaleY: this.sx('choir'), duration: 1200, ease: 'Sine.easeOut' }); this.ring(c.x, c.y, 0x7fc8ff, 4); } if (sp.type === 'marrowking') { body.scaleY = 0; this.tweens.add({ targets: body, scaleY: this.sx('marrowking'), duration: 700, ease: 'Back.easeOut' }); this.sandBurst(c.x, c.y, 24); } }
    this.enemies.push(c);
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 400 });
    return c;
  }

  // ---------- input ----------
  onDown(p) {
    if (this.paused) return;
    this.joy = { sx: p.x, sy: p.y, t: this.time.now, moved: false };
  }
  onMove(p) {
    if (!this.joy || !p.isDown) return;
    const dx = p.x - this.joy.sx, dy = p.y - this.joy.sy;
    if (Math.hypot(dx, dy) > 14 * this.dpr) { this.joy.moved = true; this.ui.joystick(this.joy.sx / this.dpr, this.joy.sy / this.dpr, dx / this.dpr, dy / this.dpr); }
    this.joy.dx = dx; this.joy.dy = dy;
  }
  onUp(p) {
    if (!this.joy) return;
    const j = this.joy; this.joy = null; this.ui.joystick(null);
    if (j.moved) { this.manualUntil = this.now + 2.2; return; }
    const wx = p.worldX, wy = p.worldY;
    const e = this.enemies.find(e => !e.dead && dist(wx, wy, e.x, e.y - hy(e)) < (e.D.boss ? 100 : 34));
    if (e) { this.hero.target = e; this.tapTarget = e; this.tapPoint = null; this.manualUntil = this.now + 1; sfx('tap'); return; }
    for (const id in this.npcs) { const n = this.npcs[id]; if (n.c.visible && dist(wx, wy, n.x, n.y - 30) < 40) { this.tapPoint = { x: n.x, y: n.y + 26, npc: id }; this.manualUntil = this.now + 30; return; } }
    if (Math.abs(wx - this.P.spire.x) < 46 && wy > this.P.spire.y - 300 && wy < this.P.spire.y + 20) { sfx('tap'); this.ui.travelMenu(); return; }
    this.tapPoint = { x: wx, y: wy }; this.tapTarget = null; this.manualUntil = this.now + 3;
    const r = this.img(wx, wy, 'ring', .5, .5, .25).setTint(0x5ff2ff).setBlendMode('ADD').setDepth(-6e5);
    this.tweens.add({ targets: r, scale: r.scale * .4, alpha: 0, duration: 450, onComplete: () => r.destroy() });
  }

  // ---------- main loop ----------
  update(time, dms) {
    const dt = Math.min(.05, dms / 1000) * (window.__SPEED || 1);
    this.motes.setPosition(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y);
    this.bokeh.setPosition(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y);
    this.lit.update(this.paused ? 0 : dt);
    if (this.paused) return;
    this.now += dt;
    this.updateHero(dt);
    this.updateEcho(dt);
    this.updateEnemies(dt);
    this.updateProjs(dt);
    this.updateZones(dt);
    this.updateTeles(dt);
    this.updateDrones(dt);
    this.updateMarkers();
    this.frameBoss(dt);
    this.fadeProps(dt);
    this.updateMusic();
    if (this.caustic) { this.caustic.tilePositionX += dt * 7; this.caustic.tilePositionY += dt * 4; }
    this.ui.tick(dt);
  }

  fadeProps(dt) {
    this.fadeT = (this.fadeT || 0) - dt; if (this.fadeT > 0) return; this.fadeT = .12;
    const pts = [this.hero, this.boss].filter(Boolean);
    for (const p of this.tall) {
      const b = p.getBounds(); let hide = false;
      for (const o of pts) if (o.y < p.y - 4 && o.x > b.x + b.width * .12 && o.x < b.right - b.width * .12 && o.y > b.y + 10) hide = true;
      const a = hide ? .38 : 1; if (Math.abs(p.alpha - a) > .01) p.alpha += (a - p.alpha) * .5;
    }
  }

  frameBoss(dt) {
    const b = this.boss && !this.boss.dead ? this.boss : null, h = this.hero;
    let ox = 0, oy = 0;
    if (b && !h.dead && dist(h.x, h.y, b.x, b.y) < 650) { oy = Phaser.Math.Clamp((h.y - (b.y - topY(b) * .8)) / 2 - 40, 0, 300); ox = Phaser.Math.Clamp((h.x - b.x) / 2, -140, 140); }
    const k = Math.min(1, dt * 2.5);
    this.camOX = (this.camOX || 0) + (ox - (this.camOX || 0)) * k; this.camOY = (this.camOY || 0) + (oy - (this.camOY || 0)) * k;
    this.cameras.main.setFollowOffset(this.camOX, this.camOY);
  }

  checkSilent() {
    const Z = this.R.silent; if (!Z) return;
    const inside = dist(this.hero.x, this.hero.y, Z.x, Z.y) < Z.r;
    if (inside !== this.silentOn) {
      this.silentOn = inside; document.body.classList.toggle('silent', inside); duck(inside);
      if (inside) { this.ui.toast('The Choir goes silent. Your Echo will not follow.'); this.unlockCodex('silentzone'); }
    }
  }

  quest() { return QUESTS[this.st.q] || null; }

  goalFor() {
    const q = this.quest(), P = this.P;
    if (this.R.tower) return { tower: true };
    if (!q) { const b = this.bounty(); return { hunt: b && this.R.spawns.some(s => s.type === b.enemy) ? b.enemy : this.bestHunt() }; }
    const qr = q.region || 'verge';
    if (q.kind === 'travel' && qr === this.st.region) return { hunt: this.bestHunt() };
    if (qr !== this.st.region || q.kind === 'travel') return { x: P.spire.x, y: P.spire.y + 46, travel: qr };
    if (q.kind === 'talk') { const n = this.npcs[q.npc]; return { x: n.x, y: n.y + 26, npc: q.npc }; }
    if (q.kind === 'inspect' || q.kind === 'goto') { const p = P[q.place]; return { x: p.x, y: p.y + 30, place: q.place }; }
    if (q.kind === 'hunt') return { hunt: q.enemy };
    if (q.kind === 'boss') return { boss: true };
    return { hunt: this.bestHunt() };
  }
  bestHunt() {
    const l = this.st.lvl;
    if (this.st.region === 'heartstrand') return l >= 38 ? 'dredger' : l >= 36 ? 'archivist' : 'mauler';
    if (this.st.region === 'lattice') return l >= 28 ? 'leech' : l >= 26 ? 'husker' : 'skitter';
    if (this.st.region === 'dunes') return l >= 18 ? 'sdrone' : l >= 16 ? 'hound' : 'skimmer';
    return l >= 9 ? 'crawler' : l >= 5 ? 'glowmoth' : 'shardling';
  }
  bounty() { return this.st.bounty && BOUNTIES.find(b => b.id === this.st.bounty.id); }
  pickBounty() {
    if (this.R.tower) return;
    const reg = this.st.region, l = this.st.lvl;
    const pool = BOUNTIES.filter(b => (b.region || 'verge') === reg && l >= b.minLvl);
    const b = pool.pop() || BOUNTIES.filter(b => (b.region || 'verge') === reg)[0];
    this.st.bounty = { id: b.id, prog: 0 };
  }

  updateHero(dt) {
    const h = this.hero;
    if (h.dead) return;
    const C = CALLINGS[this.st.cls];
    this.atkCd -= dt; for (let i = 0; i < 3; i++) this.cds[i] = Math.max(0, this.cds[i] - dt);
    if (this.shieldT > 0) { this.shieldT -= dt; if (this.shieldT <= 0) this.shield = 0; }
    this.iframeT = Math.max(0, this.iframeT - dt); this.overT = Math.max(0, this.overT - dt);
    const HM = h.mods; if (HM && HM.regen && h.hp < h.hpMax) { h.hp = Math.min(h.hpMax, h.hp + h.hpMax * HM.regen * dt); this.regenUi -= dt; if (this.regenUi <= 0) { this.regenUi = .5; this.ui.stats(); } }
    if (this.veilT > 0) { this.veilT -= dt; h.body.setAlpha(.5 + Math.sin(this.now * 10) * .1); if (this.veilT <= 0) h.body.setAlpha(1); }
    this.halo.setPosition(h.x, h.y - 26).setDepth(h.y + 2).setAlpha(this.shield > 0 ? .55 + Math.sin(this.now * 6) * .15 : 0);
    let mvx = 0, mvy = 0;
    const speed = C.speed;
    const tele = this.teles.find(t => !t.done && !t.friendlyOnly && !t.noDodge && dist(h.x, h.y, t.x, t.y) < t.r + 12);
    if (this.joy && this.joy.moved) {
      const m = Math.hypot(this.joy.dx, this.joy.dy) || 1; mvx = this.joy.dx / m; mvy = this.joy.dy / m;
      this.tapPoint = null; this.tapTarget = null; this.manualUntil = this.now + 2.2;
    } else if (tele) {
      const a = Math.atan2(h.y - tele.y, h.x - tele.x); mvx = Math.cos(a); mvy = Math.sin(a);
    } else {
      let goal = null;
      if (this.tapPoint) { goal = this.tapPoint; if (dist(h.x, h.y, goal.x, goal.y) < 10) { if (goal.npc) this.talkTo(goal.npc); this.tapPoint = null; goal = null; } }
      else if (this.tapTarget && !this.tapTarget.dead) { h.target = this.tapTarget; }
      else if (this.now > this.manualUntil && this.st.auto !== false) {
        const G = this.goalFor();
        if (G.npc || G.place || G.travel) {
          const near = this.nearestEnemy(h.x, h.y, 90, e => e.aggro);
          if (near) h.target = near;
          else { h.target = null; goal = G; if (dist(h.x, h.y, G.x, G.y) < 12) { if (G.npc) this.talkTo(G.npc); else if (G.travel) this.travel(G.travel); else this.arrivePlace(G.place); goal = null; } }
        } else if (G.tower) {
          if (!h.target || h.target.dead) h.target = this.nearestEnemy(h.x, h.y, 3000);
          if (!h.target) goal = { x: this.P.arena.x, y: this.P.arena.y + 160 };
        } else if (G.boss) {
          const b = this.enemies.find(e => e.D.boss && !e.dead), bc = this.enemies.find(e => e.D.object && !e.dead);
          if (bc) h.target = bc; else if (b) h.target = b; else { h.target = this.nearestEnemy(h.x, h.y, 90, e => e.aggro); if (!h.target) goal = { x: this.P.arena.x, y: this.P.arena.y + 120 }; }
        } else if (G.hunt) {
          if (!h.target || h.target.dead || (h.target.type !== G.hunt && !h.target.aggro)) h.target = this.nearestEnemy(h.x, h.y, 2000, e => e.type === G.hunt) || this.nearestEnemy(h.x, h.y, 120, e => e.aggro);
          if (!h.target) { const sp = this.R.spawns.find(s => s.type === G.hunt) || this.R.spawns[0]; goal = { x: sp.x, y: sp.y }; }
        }
      }
      const t = h.target && !h.target.dead ? h.target : null;
      if (t) {
        const reach = C.range + (t.D.boss ? 40 : 0), d = dist(h.x, h.y, t.x, t.y);
        if (d > reach) { const a = Math.atan2(t.y - h.y, t.x - h.x); mvx = Math.cos(a); mvy = Math.sin(a); }
        else { this.faceTo(t.x); this.tryAttack(t, C); if (this.st.settings.autoSkill || this.now <= this.manualUntil) this.autoSkills(t); }
      } else if (goal) {
        const d = dist(h.x, h.y, goal.x, goal.y);
        if (d > 6) { mvx = (goal.x - h.x) / d; mvy = (goal.y - h.y) / d; if (d < 30) { mvx *= d / 30; mvy *= d / 30; } }
      }
      if (this.st.settings.autoSkill && this.res >= 100 && this.ultReady()) this.castUlt();
    }
    h.x = Phaser.Math.Clamp(h.x + mvx * speed * dt, 20, this.R.w - 20);
    h.y = Phaser.Math.Clamp(h.y + mvy * speed * dt, 40, this.R.h - 30);
    this.checkSilent();
    h.moving = Math.abs(mvx) + Math.abs(mvy) > .05;
    if (h.moving && Math.abs(mvx) > .2) this.face(Math.sign(mvx));
    this.animHero(dt);
    h.setDepth(h.y);
  }

  face(s) { const h = this.hero; if (s && s !== h.facing) { h.facing = s; h.setScale(s, 1); } }
  faceTo(x) { this.face(Math.sign(x - this.hero.x) || this.hero.facing); }

  animHero(dt) {
    const h = this.hero; const k = this.sx(this.heroKey);
    h.walkT += dt * (h.moving ? 11 : 2.6);
    if (h.moving) {
      const b = Math.abs(Math.sin(h.walkT)) * 3.2;
      h.body.y = -b; h.body.setScale(k * (1 + b * .008), k * (1 - b * .006)); h.body.rotation = Math.sin(h.walkT) * .05;
      h.fl.x = -7 + Math.sin(h.walkT) * 4; h.fr.x = 7 - Math.sin(h.walkT) * 4; h.fl.y = -2 - Math.max(0, Math.sin(h.walkT)) * 3; h.fr.y = -2 - Math.max(0, -Math.sin(h.walkT)) * 3;
      if (Math.random() < dt * 6) { const p = this.img(h.x + rnd(-6, 6), h.y, 'dot', .5, .5, rnd(.6, 1)).setTint(0x9fd8c8).setAlpha(.35).setDepth(h.y - 1); this.tweens.add({ targets: p, y: p.y - 8, alpha: 0, duration: 400, onComplete: () => p.destroy() }); }
    } else {
      h.body.y = 0; h.body.rotation = 0; h.body.setScale(k, k * (1 + Math.sin(h.walkT) * .018)); h.fl.x = -7; h.fr.x = 7; h.fl.y = h.fr.y = -2;
    }
    const w = h.weapon, wk = this.sx(w.texture.key);
    h.swing = Math.max(0, h.swing - dt * 4);
    if (h.kind === 'slash') { w.setPosition(13, -20 + h.body.y); w.rotation = .55 - Math.sin(h.swing * Math.PI) * 2.3 + (h.swing > 0 ? 1.2 * h.swing : 0); }
    else if (h.kind === 'rail') { w.setPosition(8 - h.swing * 6, -22 + h.body.y); w.rotation = -h.swing * .2; }
    else if (h.kind === 'knife') { w.setPosition(12 + h.swing * 9, -20 + h.body.y); w.rotation = 1.25 - h.swing * 1.1; }
    else if (h.kind === 'pistol') { w.setPosition(13 - h.swing * 5, -24 + h.body.y); w.rotation = -h.swing * .4; }
    else if (h.kind === 'pulse') { w.setPosition(15, -14 + h.body.y); w.rotation = .14 - h.swing * .35; }
    else { w.setPosition(20, -40 + Math.sin(this.now * 3) * 4 + h.body.y); w.setScale(wk * (1 + h.swing * .5)); }
  }

  nearestEnemy(x, y, r, f) { let best = null, bd = r; for (const e of this.enemies) { if (e.dead || (f && !f(e))) continue; const d = dist(x, y, e.x, e.y); if (d < bd) { bd = d; best = e; } } return best; }
  enemiesIn(x, y, r) { return this.enemies.filter(e => !e.dead && dist(x, y, e.x, e.y) < r + (e.D.boss ? 40 : 0)); }

  tryAttack(t, C) {
    if (this.atkCd > 0) return;
    const M = this.hero.mods || {}; this.atkCd = C.atkCd / (1 + (M.aspd || 0)) * (this.overT > 0 ? .7 : 1); this.hero.swing = 1;
    const h = this.hero;
    if (C.attack === 'slash') {
      const a = Math.atan2(t.y - 14 - (h.y - 22), t.x - h.x);
      const s = this.img(h.x + Math.cos(a) * 20, h.y - 22 + Math.sin(a) * 12, 'slash', .5, .5, .9).setRotation(a).setTint(0x9ff6ff).setBlendMode('ADD').setDepth(h.y + 5);
      this.tweens.add({ targets: s, alpha: 0, scale: s.scale * 1.3, duration: 220, onComplete: () => s.destroy() });
      sfx('slash');
      this.hit(t, 1, 'basic');
    } else if (C.attack === 'rail') {
      this.beam(h.x + h.facing * 26, h.y - 24, t.x, t.y - hy(t), 0x5ff2ff, 3, 140); sfx('rail');
      this.hit(t, 1, 'basic');
    } else if (C.attack === 'knife') {
      const a = Math.atan2(t.y - 14 - (h.y - 22), t.x - h.x);
      for (const [d, rot] of [[0, -.5], [95, .5]]) this.time.delayedCall(d, () => {
        if (t.dead) return;
        const s = this.img(h.x + Math.cos(a) * 18, h.y - 22 + Math.sin(a) * 10, 'slash', .5, .5, .65).setRotation(a + rot).setTint(0xff7ab4).setBlendMode('ADD').setDepth(h.y + 5);
        this.tweens.add({ targets: s, alpha: 0, scale: s.scale * 1.3, duration: 180, onComplete: () => s.destroy() });
        sfx('slash'); this.hit(t, .56, 'basic');
      });
    } else if (C.attack === 'pistol') {
      const crit = this.critShots > 0; if (crit) this.critShots--;
      this.beam(h.x + h.facing * 24, h.y - 26, t.x, t.y - hy(t), crit ? 0xffffff : 0xffcf5a, crit ? 3 : 2, 100); sfx('pistol');
      this.hit(t, 1, 'basic', { crit });
    } else if (C.attack === 'pulse') {
      this.proj({ x: h.x + h.facing * 18, y: h.y - 52, tgt: t, key: 'orb', spd: 360, mult: 1, splash: 30, tint: 0x5ff2d0, heal: .012 });
      sfx('orb');
    } else {
      this.proj({ x: h.x + h.facing * 20, y: h.y - 40, tgt: t, key: 'orb', spd: 380, mult: 1, splash: 46, tint: 0xc58bff });
      sfx('orb');
    }
  }

  autoSkills(t) {
    const C = CALLINGS[this.st.cls];
    for (let i = 0; i < 3; i++) {
      if (this.cds[i] > 0) continue;
      const id = C.skills[i].id;
      if (id === 'bulwark' && this.hero.hp > this.hero.hpMax * .75 && !(t.D.boss)) continue;
      if ((id === 'slam' || id === 'pulse') && this.enemiesIn(this.hero.x, this.hero.y, 120).length < (t.D.boss ? 1 : 2) && Math.random() < .9) continue;
      const hpf = this.hero.hp / this.hero.hpMax, crowd = this.enemiesIn(this.hero.x, this.hero.y, 130).length;
      if (id === 'veil' && hpf > .8 && !t.D.boss && crowd < 3) continue;
      if (id === 'mend' && hpf > .7 && crowd < 2) continue;
      if (id === 'medrone' && hpf > .85 && !t.D.boss) continue;
      if (id === 'stasis' && !t.D.boss && this.enemiesIn(t.x, t.y, 95).length < 2) continue;
      if (id === 'roll' && hpf > .7 && !t.D.boss && crowd < 3 && !this.teles.some(z => !z.done && !z.friendlyOnly && dist(this.hero.x, this.hero.y, z.x, z.y) < z.r + 30)) continue;
      this.castSkill(i); break;
    }
    if (this.echo && this.echoCd <= 0 && this.st.settings.autoSkill) this.castEcho();
  }

  // ---------- damage ----------
  hit(e, mult, kind, opts = {}) {
    if (!e || e.dead) return;
    const h = this.hero;
    const crit = !!opts.crit || Math.random() < h.crit + (this.veilT > 0 ? .25 : 0);
    let dmg = h.atk * mult * rnd(.92, 1.08) * (crit ? h.critDmg : 1);
    if (e.D.boss) dmg *= .9;
    const M = h.mods; if (M && M.keys.execute && e.hp < e.hpMax * .3) dmg *= 1.3;
    if (this.overT > 0) dmg *= 1.2;
    dmg = Math.max(1, Math.round(dmg));
    this.damageEnemy(e, dmg, crit, opts.color);
    this.gainRes(kind === 'basic' ? 3.5 : 6);
  }
  damageEnemy(e, dmg, crit, color) {
    e.hp -= dmg; e.flash = .08; if (!this.hero.dead) { e.aggro = true; if (e.state === 'idle' || e.state === 'return') e.state = 'chase'; }
    this.num(e.x + rnd(-8, 8), e.y - topY(e), crit ? dmg + '!' : '' + dmg, crit ? '#ffcf5a' : (color || '#ffffff'), crit ? 22 : 16, crit);
    this.burstE.setParticleTint(crit ? 0xffcf5a : 0x9ff6ff); this.burstE.explode(crit ? 10 : 5, e.x, e.y - hy(e));
    if (crit) this.cameras.main.shake(90, .0025);
    if (!e.D.boss && !e.D.object) { const a = Math.atan2(e.y - this.hero.y, e.x - this.hero.x); e.x += Math.cos(a) * 4; e.y += Math.sin(a) * 3; }
    sfx(crit ? 'crit' : 'hit');
    if (e.hp <= 0) this.kill(e);
    else if (e.D.boss) this.ui.bossBar(e);
  }
  num(x, y, s, color, size, pop) {
    const t = this.add.text(x, y, s, this.txt(size, color, 4)).setOrigin(.5).setDepth(5e5 + 5);
    if (pop) { t.setScale(.4); this.tweens.add({ targets: t, scale: 1.15, duration: 120, yoyo: true, hold: 60, ease: 'Back.easeOut' }); }
    this.tweens.add({ targets: t, y: y - 34, alpha: { from: 1, to: 0 }, duration: 750, delay: 120, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  }
  gainRes(n) { this.res = Math.min(100, this.res + n * (1 + (this.hero.mods ? this.hero.mods.res : 0))); }

  hurtHero(amount, src) {
    const h = this.hero; if (h.dead || this.iframeT > 0) return;
    if (this.veilT > 0) amount *= .4;
    let dmg = Math.max(1, Math.round(amount * (60 / (60 + h.def)) * rnd(.9, 1.1)));
    if (this.shield <= 0 && h.hp - dmg <= 0 && h.mods && h.mods.keys.secondWind && this.now >= this.swReady) {
      this.swReady = this.now + 90; h.hp = Math.round(h.hpMax * .3); this.iframeT = .8;
      this.ring(h.x, h.y - 20, 0x7fffb0, 2.4); this.num(h.x, h.y - 90, 'Second Wind', '#7fffb0', 16, true); sfx('sync'); this.ui.stats(); return;
    }
    if (this.shield > 0) { const a = Math.min(this.shield, dmg); this.shield -= a; dmg -= a; if (a) this.num(h.x, h.y - 70, 'absorb ' + a, '#9ff6ff', 12); }
    if (dmg <= 0) return;
    h.hp -= dmg; this.gainRes(1.5);
    this.num(h.x + rnd(-6, 6), h.y - 76, '-' + dmg, '#ff6a7a', 15);
    h.body.setTintFill(0xff8a8a); this.time.delayedCall(70, () => h.body.clearTint());
    this.ui.hurt();
    if (h.hp <= 0) this.heroDown();
    this.ui.stats();
  }
  heal(n, label = '', quiet = false) {
    const h = this.hero; if (h.dead) return; n = Math.round(n); h.hp = Math.min(h.hpMax, h.hp + n);
    if (!quiet) this.num(h.x, h.y - 76, '+' + n + label, '#7fffb0', 15); this.ui.stats();
  }

  heroDown() {
    const h = this.hero; h.dead = true; h.hp = 0;
    if (this.R.tower) { this.tweens.add({ targets: h, alpha: 0, duration: 600 }); sfx('down'); this.towerEnd(); return; }
    this.tweens.add({ targets: h, alpha: 0, duration: 600 });
    this.ui.toast('Link lost. Resyncing at the Spire…');
    sfx('down');
    for (const e of this.enemies) { e.aggro = false; if (!e.D.boss) e.state = 'return'; }
    this.time.delayedCall(2600, () => {
      h.x = this.P.spire.x; h.y = this.P.spire.y + 50; h.alpha = 1; h.dead = false; h.hp = h.hpMax; h.target = null; this.tapPoint = null; this.tapTarget = null;
      this.ring(h.x, h.y - 20, 0x9ff6ff, 2.4); sfx('sync'); this.ui.stats();
      if (this.boss && !this.boss.dead) { this.boss.hp = Math.min(this.boss.hpMax, this.boss.hp + this.boss.hpMax * .2); this.ui.bossBar(this.boss); }
    });
  }

  kill(e) {
    if (e.D.object) { e.dead = true; e.bar.destroy(); if (e.tele) e.tele.cancel = true; this.ring(e.x, e.y - 20, 0x9ff6ff, 1.6); this.num(e.x, e.y - 70, 'Beacon destroyed', '#9ff6ff', 14); sfx('pickup2'); this.tweens.add({ targets: e, alpha: 0, duration: 200, onComplete: () => e.destroy() }); this.enemies = this.enemies.filter(x => x !== e); return; }
    e.dead = true; e.bar.destroy();
    this.shardE.setParticleTint({ glowmoth: 0xd9a8ff, crawler: 0xff8ab8, skimmer: 0xfff0d8, hound: 0xff8a4a, sdrone: 0xff5a3a, marrowking: 0xffcf8a, thornmother: 0xff8ab8, skitter: 0x7fc8ff, husker: 0x9fd8ff, leech: 0xbfe8ff, choir: 0x7fc8ff, mauler: 0x9ff6ff, archivist: 0xe8fbff, dredger: 0x5ff2ff, firstcaptain: 0x9ff6ff }[e.type] || 0x9ff6ff);
    this.shardE.explode(e.D.boss ? 40 : 10, e.x, e.y - 16);
    e.body.setTintFill(0xffffff);
    this.tweens.add({ targets: e, alpha: 0, scaleX: e.scaleX * 1.25, scaleY: e.scaleY * .6, duration: 260, onComplete: () => e.destroy() });
    this.enemies = this.enemies.filter(x => x !== e);
    sfx(e.D.boss ? 'bossdie' : 'die');
    const st = this.st;
    st.kills[e.type] = (st.kills[e.type] || 0) + 1;
    this.ui.order('kill'); if (e.D.boss) this.ui.order('boss');
    const xp = Math.round(e.D.xp * (1 + .15 * (e.lvl - 1)) * (e.lvl < st.lvl - 4 ? .4 : 1));
    this.gainXp(xp);
    const lum = ri(e.D.lumen[0], e.D.lumen[1]) + Math.floor(e.lvl / 2);
    this.dropLumen(e.x, e.y - 10, lum, e.D.boss ? 16 : Math.min(4, 1 + Math.floor(lum / 3)));
    if (Math.random() < (e.D.boss ? 1 : .14)) this.dropShards(e.x, e.y - 10, e.D.boss ? 10 : 1);
    if (Math.random() < (e.D.boss ? 1 : .08)) this.dropGear(e);
    this.unlockCodex(e.type);
    const q = this.quest();
    if (q && (q.kind === 'hunt' || q.kind === 'boss') && q.enemy === e.type) { st.qp++; this.ui.quest(); if (st.qp >= q.count) this.time.delayedCall(450, () => this.completeQuest()); }
    if (!q && st.bounty) { const b = this.bounty(); if (b && b.enemy === e.type) { st.bounty.prog++; this.ui.quest(); if (st.bounty.prog >= b.count) this.completeBounty(b); } }
    if (this.R.tower) this.towerCheck();
    if (e.D.boss) {
      this.boss = null; this.ui.bossBar(null); st.bossKills++; this.bossCd = this.now + 240; this.musicHold = this.now + 4; this.cameras.main.shake(700, .008); this.cameras.main.flash(300, 255, 200, 240);
    } else {
      const sp = e.sp; if (sp && !sp.once) this.time.delayedCall(rnd(4500, 7000), () => { if (!sp.boss) this.spawnEnemy(sp); });
    }
    if (this.hero.target === e) this.hero.target = null;
    if (this.tapTarget === e) this.tapTarget = null;
  }

  dropLumen(x, y, total, n) {
    const each = Math.max(1, Math.floor(total / n)); let left = total;
    for (let i = 0; i < n; i++) {
      const v = i === n - 1 ? left : each; left -= v;
      const o = this.img(x, y, 'lumen', .5, .5, 1.1).setDepth(5e5);
      const tx = x + rnd(-30, 30), ty = y + rnd(-10, 24);
      this.tweens.add({ targets: o, x: tx, y: ty - 18, duration: 220, ease: 'Quad.easeOut', yoyo: false, onComplete: () => this.tweens.add({ targets: o, y: ty, duration: 180, ease: 'Bounce.easeOut' }) });
      this.pickups.push({ o, v, kind: 'lumen', t: -.45 - i * .05 });
    }
  }
  dropShards(x, y, n) {
    const o = this.add.image(x, y, 'soft').setTint(0xc58bff).setBlendMode('ADD').setScale(.5).setDepth(5e5);
    this.pickups.push({ o, v: n, kind: 'shards', t: -.5 });
  }
  dropGear(e) {
    const st = this.st, slot = SLOTS[ri(0, 3)].id, rar = rollRarity(e.D.boss);
    const g = makeGear(st.cls, slot, Math.max(1, e.lvl), rar);
    const beam = this.add.image(e.x, e.y - 40, 'soft').setTint(Phaser.Display.Color.HexStringToColor(RARITY[rar].color).color).setBlendMode('ADD').setScale(.6, 3).setDepth(5e5);
    this.tweens.add({ targets: beam, alpha: 0, duration: 1200, delay: 500, onComplete: () => beam.destroy() });
    const cur = st.gear[slot];
    if (!cur || gearValue(slot, g) > gearValue(slot, cur)) {
      if (cur) { g.up = Math.max(0, (cur.up || 0) - 1); g.star = cur.star || 0; }
      st.gear[slot] = g; this.refreshStats(false);
      this.ui.gearPop(slot, g, true);
    } else {
      const sell = 5 + rar * 8 + e.lvl; st.lumen += sell; this.ui.gearPop(slot, g, false, sell);
    }
    sfx('gear');
  }
  updatePickups(dt) {
    const h = this.hero;
    for (const p of this.pickups) {
      p.t += dt; if (p.t < 0) continue;
      const k = Math.min(1, p.t * 2.2); const tx = h.x, ty = h.y - 30;
      p.o.x += (tx - p.o.x) * k * .35; p.o.y += (ty - p.o.y) * k * .35;
      if (dist(p.o.x, p.o.y, tx, ty) < 14) {
        p.done = true; p.o.destroy();
        if (p.kind === 'lumen') { this.st.lumen += p.v; this.ui.lumenBump(); sfx('pickup'); }
        else { this.st.shards += p.v; this.num(h.x, h.y - 80, '+' + p.v + ' memory', '#d9a8ff', 13); sfx('pickup2'); }
      }
    }
    this.pickups = this.pickups.filter(p => !p.done);
  }

  gainXp(n) {
    const st = this.st; st.xp += Math.round(n * (1 + (this.hero.mods ? this.hero.mods.xp : 0)));
    let up = false;
    while (st.xp >= xpNeed(st.lvl)) { st.xp -= xpNeed(st.lvl); st.lvl++; up = true; }
    if (up) {
      this.refreshStats(true);
      this.ring(this.hero.x, this.hero.y - 30, 0xffcf5a, 3); this.burstE.setParticleTint(0xffcf5a); this.burstE.explode(30, this.hero.x, this.hero.y - 30);
      this.ui.levelUp(st.lvl); sfx('level');
      const ri = rankIndex(st.lvl);
      if (ri + 1 > (st.rankSeen || 1)) { st.rankSeen = ri + 1; this.time.delayedCall(900, () => this.ui.rankUp(ri)); }
      this.ui.dotNav('hero');
    }
    this.ui.stats();
  }

  ring(x, y, tint, s = 2) {
    this.lit.flash(x, y, 70 * s, tint, .5, .9);
    const r = this.img(x, y, 'ring', .5, .5, .2).setTint(tint).setBlendMode('ADD').setDepth(5e5);
    this.tweens.add({ targets: r, scale: this.sx('ring') * s, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => r.destroy() });
  }
  beam(x1, y1, x2, y2, col, w = 3, dur = 160) {
    const g = this.add.graphics().setBlendMode('ADD').setDepth(5e5 + 1);
    this.lit.flash((x1 + x2) / 2, (y1 + y2) / 2, Math.min(300, 60 + dist(x1, y1, x2, y2) * .3), col, Math.max(.2, dur / 1000), .7); this.lit.flash(x2, y2, 70 + w * 4, col, .3, .9);
    g.lineStyle(w * 3, col, .25); g.lineBetween(x1, y1, x2, y2); g.lineStyle(w, col, 1); g.lineBetween(x1, y1, x2, y2); g.lineStyle(Math.max(1, w * .4), 0xffffff, 1); g.lineBetween(x1, y1, x2, y2);
    this.tweens.add({ targets: g, alpha: 0, duration: dur, onComplete: () => g.destroy() });
  }

  // ---------- projectiles ----------
  proj(o) {
    const s = this.img(o.x, o.y, o.key, .5, .5, o.scale || 1).setBlendMode('ADD').setDepth(5e5);
    if (o.tint) s.setTint(o.tint);
    this.projs.push(Object.assign({ s, x: o.x, y: o.y, life: 2 }, o));
  }
  updateProjs(dt) {
    for (const p of this.projs) {
      p.life -= dt;
      let tx, ty;
      if (p.tgt) { if (p.tgt.dead) { p.tgt = null; } else { tx = p.tgt.x; ty = p.tgt.y - hy(p.tgt); } }
      if (p.toHero) { tx = this.hero.x; ty = this.hero.y - 26; }
      if (tx === undefined) { p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt; }
      else { const a = Math.atan2(ty - p.y, tx - p.x); p.vx = Math.cos(a) * p.spd; p.vy = Math.sin(a) * p.spd; p.x += p.vx * dt; p.y += p.vy * dt; }
      p.s.setPosition(p.x, p.y); p.s.rotation = Math.atan2(p.vy || 0, p.vx || 1);
      if (Math.random() < .5) { const tr = this.add.image(p.x, p.y, 'dot').setScale(this.sx('dot') * .8).setTint(p.tint || 0xffffff).setBlendMode('ADD').setDepth(5e5 - 1).setAlpha(.6); this.tweens.add({ targets: tr, alpha: 0, scale: 0, duration: 260, onComplete: () => tr.destroy() }); }
      if (p.toHero) { if (dist(p.x, p.y, tx, ty) < 14) { p.done = true; this.hurtHero(p.dmg); if (p.drain) this.res = Math.max(0, this.res - p.drain); this.burstE.setParticleTint(0xff6ab0); this.burstE.explode(6, p.x, p.y); } }
      else if (p.pierce) { for (const e of this.enemies) if (!e.dead && !p.hitSet.has(e) && dist(p.x, p.y, e.x, e.y - hy(e)) < 26 + (e.D.boss ? 40 : 0)) { p.hitSet.add(e); this.hit(e, p.mult, 'skill'); } }
      else { const e = p.tgt || this.enemies.find(e => !e.dead && dist(p.x, p.y, e.x, e.y - 16) < 22); if (e && dist(p.x, p.y, e.x, e.y - hy(e)) < 20 + (e.D.boss ? 40 : 0)) { p.done = true; this.hit(e, p.mult, 'basic'); if (p.heal) this.heal(this.hero.hpMax * p.heal, '', true); if (p.splash) for (const o of this.enemiesIn(e.x, e.y, p.splash)) if (o !== e) this.hit(o, p.mult * .5, 'basic'); this.burstE.setParticleTint(p.tint || 0xffffff); this.burstE.explode(6, p.x, p.y); } }
      if (p.life <= 0) p.done = true;
      if (p.done) p.s.destroy();
    }
    this.projs = this.projs.filter(p => !p.done);
    this.updatePickups(dt);
  }

  // ---------- skills ----------
  castSkill(i) {
    if (this.hero.dead || this.paused || this.cds[i] > 0) return false;
    const C = CALLINGS[this.st.cls], S = C.skills[i], h = this.hero;
    const t = (h.target && !h.target.dead) ? h.target : this.nearestEnemy(h.x, h.y, C.range + 60);
    const needsTarget = !['bulwark', 'pulse', 'slam', 'veil', 'mend', 'medrone', 'stasis', 'roll'].includes(S.id);
    if (needsTarget && !t) { this.ui.toast('No target in range'); return false; }
    const M = h.mods || { skillDmg: {}, skillCd: {}, skill: 0 }, P = 1 + (M.skillDmg[S.id] || 0) + (M.skill || 0);
    this.cds[i] = S.cd * (1 - (M.skillCd[S.id] || 0)); h.swing = 1; sfx('skill');
    if (t) this.faceTo(t.x);
    const ax = h.x, ay = h.y - 20;
    switch (S.id) {
      case 'cleave': {
        const a = Math.atan2(t.y - h.y, t.x - h.x);
        const s = this.img(h.x + Math.cos(a) * 26, h.y - 22 + Math.sin(a) * 14, 'slash', .5, .5, 1.8).setRotation(a).setTint(0xffcf5a).setBlendMode('ADD').setDepth(h.y + 5);
        this.tweens.add({ targets: s, alpha: 0, scale: s.scale * 1.4, duration: 300, onComplete: () => s.destroy() });
        for (const e of this.enemiesIn(h.x, h.y, 95)) { const d = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(e.y - h.y, e.x - h.x) - a)); if (d < 1.3) this.hit(e, 1.9 * P, 'skill'); }
        break;
      }
      case 'bulwark': this.shield = Math.round(h.hpMax * .3 * P); this.shieldT = 6; this.ring(h.x, h.y - 26, 0x5ff2ff, 1.4); this.num(h.x, h.y - 84, 'Bulwark', '#9ff6ff', 14); break;
      case 'slam': this.ring(h.x, h.y - 4, 0xffcf5a, 2.2); this.cameras.main.shake(180, .005); for (const e of this.enemiesIn(h.x, h.y, 100)) { this.hit(e, 1.5 * P, 'skill'); e.stun = 1.2; } break;
      case 'pierce': {
        const a = Math.atan2(t.y - h.y, t.x - h.x);
        this.beam(ax, ay, ax + Math.cos(a) * 340, ay + Math.sin(a) * 340, 0x9ff6ff, 7, 260); this.cameras.main.shake(100, .003);
        for (const e of this.enemies) { if (e.dead) continue; const dx = e.x - h.x, dy = e.y - h.y; const along = dx * Math.cos(a) + dy * Math.sin(a), perp = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)); if (along > 0 && along < 340 && perp < 26 + (e.D.boss ? 40 : 0)) this.hit(e, 2.3 * P, 'skill'); }
        break;
      }
      case 'volley': { const a = Math.atan2(t.y - h.y, t.x - h.x); for (const d of [-.25, 0, .25]) this.proj({ x: ax, y: ay, vx: Math.cos(a + d) * 520, vy: Math.sin(a + d) * 520, key: 'bolt', spd: 520, mult: 1.1 * P, pierce: true, hitSet: new Set(), tint: 0x5ff2ff, life: .7 }); break; }
      case 'drone': { const d = this.img(h.x - 30, h.y - 60, 'echo_rivet', .5, .5, .8).setTint(0x9ff6ff).setDepth(5e5); this.drones.push({ s: d, t: 8, cd: 0, mult: .6 * P }); break; }
      case 'pulse': { this.ring(h.x, h.y - 20, 0xc58bff, 2.6); for (const e of this.enemiesIn(h.x, h.y, 125)) this.hit(e, 1.7 * P, 'skill'); break; }
      case 'llance': this.proj({ x: ax, y: ay - 20, tgt: t, key: 'orb', scale: 2, spd: 640, mult: 3.2 * P, tint: 0xe2c6ff }); break;
      case 'hush': this.zone(t.x, t.y, 90, 5, .45 * P, 0xc58bff); break;
      case 'blink': {
        const side = Math.sign(t.x - h.x) || 1, off = t.D.boss ? 70 : 34;
        this.ring(h.x, h.y - 20, 0xff5a9a, 1.2);
        h.x = Phaser.Math.Clamp(t.x + side * off, 20, this.R.w - 20); h.y = Phaser.Math.Clamp(t.y + 4, 40, this.R.h - 30);
        this.face(-side); this.ring(h.x, h.y - 20, 0xff5a9a, 1.6);
        const s = this.img(t.x, t.y - hy(t), 'slash', .5, .5, 1.4).setRotation(side > 0 ? Math.PI : 0).setTint(0xff5a9a).setBlendMode('ADD').setDepth(5e5);
        this.tweens.add({ targets: s, alpha: 0, scale: s.scale * 1.3, duration: 240, onComplete: () => s.destroy() });
        this.hit(t, 2.4 * P, 'skill', { crit: true });
        break;
      }
      case 'fan': { const a = Math.atan2(t.y - h.y, t.x - h.x); for (const d of [-.5, -.25, 0, .25, .5]) this.proj({ x: ax, y: ay, vx: Math.cos(a + d) * 560, vy: Math.sin(a + d) * 560, key: 'knife', spd: 560, mult: .9 * P, pierce: true, hitSet: new Set(), tint: 0xff5a9a, life: .6 }); break; }
      case 'veil': this.veilT = 5 * P; this.ring(h.x, h.y - 24, 0xff5a9a, 1.6); this.num(h.x, h.y - 84, 'Shadow Veil', '#ff9ac4', 14); break;
      case 'mend': this.heal(h.hpMax * .22 * P); this.ring(h.x, h.y - 20, 0x5ff2d0, 2.4); for (const e of this.enemiesIn(h.x, h.y, 120)) this.hit(e, 1.3 * P, 'skill'); break;
      case 'medrone': { const d = this.img(h.x - 30, h.y - 60, 'medrone', .5, .5, 1).setDepth(5e5); this.drones.push({ s: d, t: 8, cd: 0, heal: true, ht: 1, col: 0x5ff2d0, mult: .55 * P, healAmt: .03 * P }); break; }
      case 'stasis': { const z = t || h; this.zone(z.x, z.y, 95, 5, .45 * P, 0x5ff2d0); break; }
      case 'quickdraw': for (let k = 0; k < 4; k++) this.time.delayedCall(k * 90, () => { if (t.dead || h.dead) return; this.beam(h.x + h.facing * 24, h.y - 26, t.x + rnd(-6, 6), t.y - hy(t) + rnd(-6, 6), 0xffcf5a, 2, 90); sfx('pistol'); this.hit(t, .85 * P, 'skill'); }); break;
      case 'ricochet': {
        const seen = new Set(); let from = { x: h.x + h.facing * 24, y: h.y - 26 };
        const bounce = (e, n) => { if (!e || e.dead || n >= 5) return; seen.add(e); const to = { x: e.x, y: e.y - hy(e) }; this.beam(from.x, from.y, to.x, to.y, 0xffe08a, 3, 140); this.hit(e, 1.5 * P, 'skill'); from = to; const nx = this.nearestEnemy(e.x, e.y, 230, o => !seen.has(o)); this.time.delayedCall(110, () => bounce(nx, n + 1)); };
        sfx('pistol'); bounce(t, 0); break;
      }
      case 'roll': {
        const a = t ? Math.atan2(h.y - t.y, h.x - t.x) : (h.facing > 0 ? Math.PI : 0);
        this.iframeT = .45; this.critShots = 3 + Math.floor((M.skillDmg.roll || 0) / .12 + .01);
        this.tweens.add({ targets: h, x: Phaser.Math.Clamp(h.x + Math.cos(a) * 110, 20, this.R.w - 20), y: Phaser.Math.Clamp(h.y + Math.sin(a) * 80, 40, this.R.h - 30), duration: 240, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: h.body, rotation: Math.PI * 2 * (Math.cos(a) > 0 ? 1 : -1), duration: 240, onComplete: () => h.body.rotation = 0 });
        this.num(h.x, h.y - 84, 'Next 3 shots crit', '#ffcf5a', 13); break;
      }
    }
    this.ui.skills();
    return true;
  }
  ultReady() { const h = this.hero; if (h.dead) return false; if (CALLINGS[this.st.cls].ult.id === 'lifeline' && h.hp < h.hpMax * .4) return true; return (h.target && !h.target.dead) && (this.enemiesIn(h.x, h.y, 220).length >= 3 || h.target.D.boss); }
  castUlt() {
    if (this.res < 100 || this.hero.dead || this.paused) return false;
    const C = CALLINGS[this.st.cls], h = this.hero;
    const t = (h.target && !h.target.dead) ? h.target : this.nearestEnemy(h.x, h.y, 400);
    this.res = 0; sfx('ult'); this.ui.ultCast(C.ult.name); this.ui.order('ult');
    if (h.mods && h.mods.keys.overdrive) { this.overT = 6; this.num(h.x, h.y - 96, 'Overdrive', '#ffcf5a', 15, true); }
    if (C.ult.id === 'starbreaker') {
      this.tweens.add({ targets: h.body, y: -60, duration: 220, yoyo: true, ease: 'Quad.easeOut', onComplete: () => {
        this.ring(h.x, h.y, 0xffcf5a, 4); this.ring(h.x, h.y, 0xffffff, 2.6); this.cameras.main.shake(350, .01);
        for (const e of this.enemiesIn(h.x, h.y, 150)) this.hit(e, 5.2, 'ult');
      } });
    } else if (C.ult.id === 'lance') {
      const x = t ? t.x : h.x, y = t ? t.y : h.y;
      this.addTele(x, y, 120, .55, 0x5ff2ff, true);
      this.time.delayedCall(550, () => { this.beam(x, y - 900, x, y, 0x9ff6ff, 22, 400); this.ring(x, y, 0x9ff6ff, 3.4); this.cameras.main.shake(300, .01); for (const e of this.enemiesIn(x, y, 125)) this.hit(e, 6.2, 'ult'); });
    } else if (C.ult.id === 'eclipse') {
      const list = this.enemies.filter(e => !e.dead && dist(h.x, h.y, e.x, e.y) < 280).sort((a, b) => dist(h.x, h.y, a.x, a.y) - dist(h.x, h.y, b.x, b.y)).slice(0, 6);
      this.veilT = Math.max(this.veilT, .9); this.cameras.main.flash(200, 255, 90, 154);
      list.forEach((e, i) => this.time.delayedCall(i * 120, () => {
        if (e.dead || h.dead) return;
        const side = Math.sign(e.x - h.x) || 1; this.beam(h.x, h.y - 20, e.x + side * 26, e.y - 20, 0xff5a9a, 6, 200);
        h.x = Phaser.Math.Clamp(e.x + side * (e.D.boss ? 60 : 26), 20, this.R.w - 20); h.y = Phaser.Math.Clamp(e.y + 2, 40, this.R.h - 30); this.face(-side);
        const s = this.img(e.x, e.y - hy(e), 'slash', .5, .5, 1.6).setRotation(rnd(0, Math.PI)).setTint(0xff5a9a).setBlendMode('ADD').setDepth(5e5);
        this.tweens.add({ targets: s, alpha: 0, scale: s.scale * 1.4, duration: 260, onComplete: () => s.destroy() });
        sfx('slash'); this.hit(e, 3.2, 'ult');
      }));
    } else if (C.ult.id === 'lifeline') {
      this.heal(h.hpMax); this.shield = Math.round(h.hpMax * .4); this.shieldT = 8;
      this.ring(h.x, h.y - 20, 0x5ff2d0, 3.4); this.ring(h.x, h.y - 20, 0xffffff, 2); this.cameras.main.flash(220, 95, 242, 208);
      for (const e of this.enemiesIn(h.x, h.y, 150)) this.hit(e, 3.2, 'ult');
    } else if (C.ult.id === 'deadeye') {
      const v = this.cameras.main.worldView;
      const list = this.enemies.filter(e => !e.dead && v.contains(e.x, e.y)).sort((a, b) => b.hp - a.hp).slice(0, 5);
      const marks = list.map(e => { const m = this.img(e.x, e.y - hy(e), 'ring', .5, .5, .9).setTint(0xffcf5a).setBlendMode('ADD').setDepth(5e5); this.tweens.add({ targets: m, scale: m.scale * .5, duration: 500 }); return m; });
      this.time.delayedCall(520, () => { marks.forEach(m => m.destroy()); list.forEach((e, i) => this.time.delayedCall(i * 70, () => { if (e.dead || h.dead) return; this.beam(h.x + h.facing * 24, h.y - 26, e.x, e.y - hy(e), 0xffffff, 4, 200); sfx('pistol'); this.hit(e, 4.6, 'ult'); })); this.cameras.main.shake(200, .006); });
    } else {
      this.cameras.main.flash(260, 197, 139, 255);
      const v = this.cameras.main.worldView;
      for (const e of this.enemies.filter(e => !e.dead && v.contains(e.x, e.y))) this.time.delayedCall(rnd(0, 250), () => { this.ring(e.x, e.y - 16, 0xc58bff, 1.2); this.hit(e, 3.8, 'ult'); });
    }
    return true;
  }
  castEcho() {
    const e = this.echo; if (!e || this.echoCd > 0 || this.hero.dead || this.silentOn) return false;
    const D = ECHOES[e.id], S = echoStats(this.st, e.id), h = this.hero;
    const t = (h.target && !h.target.dead) ? h.target : this.nearestEnemy(e.x, e.y, 260);
    const eatk = (S.atk + h.atk * .3) * (1 + (h.mods ? h.mods.echo : 0));
    const id = e.id;
    if ((id === 'skein' || id === 'glimmerkit' || id === 'lumi') && !t) return false;
    if (id === 'budlet' && h.hp > h.hpMax * .8) return false;
    if (id === 'rivet' && this.shield > 0) return false;
    this.echoCd = D.skill.cd; sfx('echo');
    if (id === 'skein') { this.beam(e.x, e.y - 22, t.x, t.y - hy(t), 0xbfe8ff, 6, 360); this.ring(t.x, t.y - hy(t), 0xbfe8ff, 1.2); this.damageEnemy(t, Math.round(eatk * 2.6 * rnd(.92, 1.08)), false, '#bfe8ff'); }
    if (id === 'glimmerkit') { e.dash = { x: t.x, y: t.y, t: .25, tgt: t, dmg: Math.round(eatk * 2.1) }; }
    if (id === 'budlet') { this.heal(h.hpMax * .14); this.ring(h.x, h.y - 20, 0x7fffb0, 1.6); }
    if (id === 'rivet') { this.shield = Math.max(this.shield, Math.round(h.hpMax * .16)); this.shieldT = 6; this.ring(h.x, h.y - 26, 0xffcf5a, 1.4); }
    if (id === 'lumi') { this.ring(e.x, e.y - 20, 0x7fc8ff, 2.4); for (const o of this.enemiesIn(e.x, e.y, 120)) this.damageEnemy(o, Math.round(eatk * 1.5), false, '#7fc8ff'); }
    this.num(e.x, e.y - 50, D.skill.name, '#' + D.color.toString(16), 12);
    this.ui.skills();
    return true;
  }

  updateEcho(dt) {
    const e = this.echo; if (!e) return;
    this.echoCd = Math.max(0, this.echoCd - dt);
    e.t += dt; const h = this.hero;
    if (e.dash) {
      e.dash.t -= dt; e.x += (e.dash.x - e.x) * .35; e.y += (e.dash.y - e.y) * .35;
      if (e.dash.t <= 0) { if (!e.dash.tgt.dead) this.damageEnemy(e.dash.tgt, e.dash.dmg, false, '#5ff2d0'); e.dash = null; }
    } else {
      let tx = h.x - h.facing * 34, ty = h.y + 8;
      const Z = this.R.silent;
      if (Z && dist(tx, ty, Z.x, Z.y) < Z.r + 30) { const a = Math.atan2(ty - Z.y, tx - Z.x); tx = Z.x + Math.cos(a) * (Z.r + 34); ty = Z.y + Math.sin(a) * (Z.r + 34); }
      const d = dist(e.x, e.y, tx, ty);
      const k = d > 260 ? 1 : Math.min(1, dt * 4.5); e.x += (tx - e.x) * k; e.y += (ty - e.y) * k;
      if (Math.abs(tx - e.x) > 2) e.body.setFlipX(tx < e.x);
    }
    e.cd -= dt;
    const t = h.target && !h.target.dead ? h.target : null;
    if (t && e.cd <= 0 && !this.silentOn && dist(e.x, e.y, t.x, t.y) < 200) {
      e.cd = 1.5; const S = echoStats(this.st, e.id);
      this.proj({ x: e.x, y: e.y - 22, tgt: t, key: 'dot', scale: 1.4, spd: 420, mult: (S.atk + h.atk * .3) / h.atk * .9 * (1 + (h.mods ? h.mods.echo : 0)), tint: ECHOES[e.id].color });
    }
    const k = this.sx('echo_' + e.id) * [1, 1.25, 1.45][+(this.st.echoes[e.id]?.evo) || 0];
    if (e.hover) { e.body.y = -10 + Math.sin(e.t * 3) * 4; e.body.rotation = Math.sin(e.t * 2) * .06; }
    else { const b = Math.abs(Math.sin(e.t * 7)) * (dist(e.x, e.y, h.x - h.facing * 34, h.y + 8) > 6 ? 4 : 1); e.body.y = -6 - b; e.body.setScale(k * (1 + b * .01), k * (1 - b * .01)); }
    e.glow.y = e.body.y - 12;
    e.setDepth(e.y);
  }

  updateDrones(dt) {
    const h = this.hero;
    for (const d of this.drones) {
      d.t -= dt; d.cd -= dt;
      d.s.x += (h.x - 26 - d.s.x) * dt * 3; d.s.y += (h.y - 64 + Math.sin(this.now * 4) * 4 - d.s.y) * dt * 3;
      if (d.cd <= 0) { const t = this.nearestEnemy(d.s.x, d.s.y, 230); if (t) { d.cd = d.heal ? .6 : .5; this.beam(d.s.x, d.s.y, t.x, t.y - 16, d.col || 0x5ff2ff, 2, 100); this.hit(t, d.mult || .6, 'skill'); } }
      if (d.heal) { d.ht -= dt; if (d.ht <= 0) { d.ht = 1; this.heal(h.hpMax * (d.healAmt || .03), '', true); this.beam(d.s.x, d.s.y, h.x, h.y - 30, 0x7fffb0, 2, 160); } }
      if (d.t <= 0) { d.done = true; this.tweens.add({ targets: d.s, alpha: 0, duration: 300, onComplete: () => d.s.destroy() }); }
    }
    this.drones = this.drones.filter(d => !d.done);
  }

  zone(x, y, r, dur, mult, col) {
    const g = this.add.image(x, y, 'soft').setTint(col).setBlendMode('ADD').setScale(r / 26, r / 40).setAlpha(.45).setDepth(-5e5);
    const ring = this.img(x, y, 'ring', .5, .5, r / 58).setTint(col).setBlendMode('ADD').setAlpha(.7).setDepth(-5e5); ring.scaleY *= .7;
    this.zones.push({ x, y, r, t: dur, tick: 0, mult, g, ring });
  }
  updateZones(dt) {
    for (const z of this.zones) {
      z.t -= dt; z.tick -= dt; z.ring.rotation += dt * .6;
      for (const e of this.enemiesIn(z.x, z.y, z.r)) e.slow = .3;
      if (z.tick <= 0) { z.tick = .5; for (const e of this.enemiesIn(z.x, z.y, z.r)) this.hit(e, z.mult, 'skill'); }
      if (z.t <= 0) { z.done = true; this.tweens.add({ targets: [z.g, z.ring], alpha: 0, duration: 300, onComplete: () => { z.g.destroy(); z.ring.destroy(); } }); }
    }
    this.zones = this.zones.filter(z => !z.done);
  }

  addTele(x, y, r, time, col = 0xff3a5a, friendly = false) {
    const g = this.add.graphics().setDepth(-4e5);
    const t = { x, y, r, t: time, max: time, g, col, done: false, friendly };
    if (!friendly) this.teles.push(t); else this.teles.push(Object.assign(t, { friendlyOnly: true }));
    return t;
  }
  updateTeles(dt) {
    for (const t of this.teles) {
      if (t.cancel) { t.done = true; t.g.destroy(); continue; }
      t.t -= dt; const k = 1 - Math.max(0, t.t) / t.max;
      t.g.clear(); t.g.fillStyle(t.col, .16 + k * .14); t.g.fillEllipse(t.x, t.y, t.r * 2, t.r * 1.5); t.g.lineStyle(2, t.col, .9); t.g.strokeEllipse(t.x, t.y, t.r * 2, t.r * 1.5);
      t.g.fillStyle(t.col, .35); t.g.fillEllipse(t.x, t.y, t.r * 2 * k, t.r * 1.5 * k);
      if (t.t <= 0 && !t.done) {
        t.done = true; t.g.destroy();
        if (!t.friendlyOnly) { if (t.onHit) t.onHit(t); }
      }
    }
    this.teles = this.teles.filter(t => !t.done);
  }

  // ---------- enemies ----------
  updateEnemies(dt) {
    const h = this.hero;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.t += dt; e.cd -= dt; e.flash -= dt; e.stun = Math.max(0, e.stun - dt); e.slow = Math.max(0, e.slow - dt);
      if (e.D.object) { this.updateBeacon(e, dt); continue; }
      if (e.flash > 0) { if (e.D.boss) e.body.setTint(0xffc8c8); else e.body.setTintFill(0xffffff); } else if (e.type === 'firstcaptain') e.body.setTint(0xcff6ff); else if (!e.keepTint && !e.chargeT) e.body.clearTint();
      const D = e.D, sp = D.spd * (e.slow > 0 ? .5 : 1) * (D.boss && e.hp < e.hpMax * .25 ? 1.3 : 1);
      const dh = dist(e.x, e.y, h.x, h.y);
      let mvx = 0, mvy = 0;
      if (!h.dead && !e.aggro && dh < D.aggro && (D.boss || Math.random() < dt * 2)) { e.aggro = true; e.state = 'chase'; }
      if (e.stun > 0 || e.burrowed) {}
      else if (e.state === 'chase' && !h.dead) {
        const leash = D.boss ? 420 : 380;
        if (dist(e.x, e.y, e.home.x, e.home.y) > leash) { e.state = 'return'; e.aggro = false; }
        else if (dh > D.range + (D.boss ? 30 : 0)) { mvx = (h.x - e.x) / dh; mvy = (h.y - e.y) / dh; }
        else if (e.cd <= 0) this.enemyAttack(e);
        if (D.boss) this.bossLogic(e, dt);
      } else if (e.state === 'return' || (h.dead && e.aggro)) {
        const d = dist(e.x, e.y, e.home.x, e.home.y);
        if (d > 8) { mvx = (e.home.x - e.x) / d; mvy = (e.home.y - e.y) / d; } else { e.state = 'idle'; if (!D.boss) e.hp = e.hpMax; }
        if (!D.boss) e.hp = Math.min(e.hpMax, e.hp + e.hpMax * dt * .2);
      } else {
        e.wt -= dt;
        if (e.wt <= 0) { e.wt = rnd(2, 5); const a = rnd(0, Math.PI * 2); e.wander = { x: e.home.x + Math.cos(a) * rnd(10, 70), y: e.home.y + Math.sin(a) * rnd(10, 50) }; }
        if (e.wander) { const d = dist(e.x, e.y, e.wander.x, e.wander.y); if (d > 4) { mvx = (e.wander.x - e.x) / d * .4; mvy = (e.wander.y - e.y) / d * .4; } else e.wander = null; }
      }
      if (D.charge && e.state === 'chase' && !h.dead && !e.stun) {
        e.chargeCd = (e.chargeCd ?? rnd(1, 3)) - dt;
        if (e.chargeT > 0) {
          e.chargeT -= dt;
          if (e.chargeT > .38) { mvx = 0; mvy = 0; e.body.setTint(0xffd0a0); e.body.x = Math.sin(e.t * 60) * 1.5; }
          else { if (!e.dashDir) { const d = dist(e.x, e.y, h.x, h.y) || 1; e.dashDir = { x: (h.x - e.x) / d, y: (h.y - e.y) / d }; e.body.clearTint(); } mvx = e.dashDir.x * 5; mvy = e.dashDir.y * 5; if (!e.hitDone && dist(e.x, e.y, h.x, h.y) < 44) { e.hitDone = true; this.hurtHero(e.atk * 1.4); this.cameras.main.shake(120, .004); } }
          if (e.chargeT <= 0) { e.chargeT = 0; e.dashDir = null; e.hitDone = false; e.chargeCd = rnd(4, 6); e.body.x = 0; }
        } else if (e.chargeCd <= 0 && dh > 70 && dh < 240) { e.chargeT = 1; this.num(e.x, e.y - 70, '!', '#ffb070', 18); }
      }
      if (!D.boss) for (const o of this.enemies) { if (o === e || o.dead) continue; const d = dist(e.x, e.y, o.x, o.y); if (d < 26 && d > 0) { mvx += (e.x - o.x) / d * .5; mvy += (e.y - o.y) / d * .5; } }
      e.x += mvx * sp * dt; e.y += mvy * sp * dt;
      this.animEnemy(e, dt, Math.abs(mvx) + Math.abs(mvy) > .05, mvx);
      e.setDepth(e.y);
      e.bar.clear();
      if (!D.boss && e.hp < e.hpMax) {
        const w = 34, y = e.y - ({ glowmoth: 66, skimmer: 52, sdrone: 66, hound: 56, husker: 82, leech: 64, skitter: 52, mauler: 70, archivist: 104, dredger: 100 }[e.type] || 50);
        e.bar.fillStyle(0x061016, .85); e.bar.fillRoundedRect(e.x - w / 2 - 1, y - 1, w + 2, 6, 3);
        e.bar.fillStyle(0xff5a6e, 1); e.bar.fillRoundedRect(e.x - w / 2, y, Math.max(2, w * e.hp / e.hpMax), 4, 2);
      }
      if (h.target === e) { e.bar.lineStyle(1.5, 0xffcf5a, .9); e.bar.strokeEllipse(e.x, e.y, D.boss ? 190 : 46, D.boss ? 70 : 16); }
    }
  }

  animEnemy(e, dt, moving, mvx) {
    const k = this.sx(e.body.texture.key);
    if (mvx) e.body.setFlipX(mvx > 0);
    if (e.type === 'shardling') { const hop = moving ? Math.abs(Math.sin(e.t * 8)) : Math.abs(Math.sin(e.t * 2)) * .2; e.body.y = -hop * 9; e.body.setScale(k * (1 + (1 - hop) * .08), k * (1 - (1 - hop) * .08 + hop * .06)); e.shadow.setScale(this.sx('shadow') * (1 - hop * .3)); }
    else if (e.type === 'glowmoth') { const f = Math.sin(e.t * 18); e.wl.scaleX = -this.sx('wing') * (.55 + .45 * Math.abs(f)); e.wr.scaleX = this.sx('wing') * (.55 + .45 * Math.abs(f)); const y = -14 + Math.sin(e.t * 3) * 5; e.body.y = y; e.wl.y = e.wr.y = y - 16; e.list[1].y = y - 14; }
    else if (e.type === 'crawler' || e.type === 'hound') { e.body.rotation = moving ? Math.sin(e.t * 20) * .05 : 0; e.body.y = moving ? -Math.abs(Math.sin(e.t * 20)) * 1.5 : 0; }
    else if (e.type === 'skimmer') { const f = Math.sin(e.t * 9); e.body.setScale(k * (1 + f * .04), k * (1 - Math.abs(f) * .22)); e.body.y = -16 + Math.sin(e.t * 2.4) * 4; e.body.rotation = (mvx || 0) * .12; }
    else if (e.type === 'sdrone') { e.body.y = -18 + Math.sin(e.t * 3.2) * 5; e.body.rotation = Math.sin(e.t * 1.7) * .08; }
    else if (e.type === 'skitter') { e.body.rotation = moving ? Math.sin(e.t * 26) * .07 : 0; e.body.x = moving ? Math.sin(e.t * 13) * 2 : 0; e.body.y = moving ? -Math.abs(Math.sin(e.t * 26)) * 1.2 : 0; }
    else if (e.type === 'husker') { e.body.rotation = moving ? Math.sin(e.t * 4) * .06 : Math.sin(e.t * 1.2) * .02; e.body.y = moving ? -Math.abs(Math.sin(e.t * 4)) * 2 : 0; }
    else if (e.type === 'leech') { e.body.y = -18 + Math.sin(e.t * 2.6) * 6; e.body.rotation = Math.sin(e.t * 3) * .12; e.body.scaleX = k * (1 + Math.sin(e.t * 6) * .05) * (e.body.flipX ? 1 : 1); }
    else if (e.type === 'mauler') { e.body.y = moving ? -Math.abs(Math.sin(e.t * 7)) * 2.4 : Math.sin(e.t * 1.6) * .6; e.body.rotation = moving ? Math.sin(e.t * 7) * .04 : 0; }
    else if (e.type === 'archivist') { e.body.y = -20 + Math.sin(e.t * 2.2) * 5; e.body.rotation = Math.sin(e.t * 1.4) * .08; }
    else if (e.type === 'dredger') { e.body.rotation = moving ? Math.sin(e.t * 5) * .08 : Math.sin(e.t * 1.2) * .03; e.body.y = moving ? -Math.abs(Math.sin(e.t * 5)) * 2 : 0; }
    else if (e.type === 'firstcaptain') { e.body.y = moving ? -Math.abs(Math.sin(e.t * 6)) * 3 : Math.sin(e.t * 1.4) * 1.2; e.body.alpha = .82 + Math.sin(e.t * 3) * .1; const rf = e.list.find(o => o.texture && o.texture.key === 'c_rifle'); if (rf) { const fx = e.body.flipX; rf.setFlipX(fx); rf.x = fx ? -26 : 26; rf.setOrigin(fx ? .7 : .3, .5); rf.y = -60 + e.body.y; } }
    else if (e.type === 'choir') { e.body.rotation = Math.sin(e.t * .9) * .03; if (e.body.scaleY > 0) e.body.scaleX = k * (1 + Math.sin(e.t * 1.6) * .015); }
    else if (e.type === 'marrowking') { if (!e.burrowed) { e.body.rotation = Math.sin(e.t * 1.4) * .05; e.body.scaleX = k * (1 + Math.sin(e.t * 2) * .02); } }
    else { e.body.setScale(k * (1 + Math.sin(e.t * 2) * .015), k * (1 + Math.sin(e.t * 2 + 1) * .02)); }
  }

  enemyAttack(e) {
    const D = e.D, h = this.hero; e.cd = D.atkCd * rnd(.9, 1.15);
    if (D.ranged) {
      if (D.shot === 'page' || D.shot === 'rifle') {
        const rifle = D.shot === 'rifle';
        e.body.setTintFill(rifle ? 0xffffff : 0x9ff6ff); this.time.delayedCall(90, () => e.body && (rifle ? e.body.setTint(0xcff6ff) : e.body.clearTint()));
        this.time.delayedCall(rifle ? 180 : 250, () => { if (!e.dead) this.proj({ x: e.x + (rifle ? (e.body.flipX ? 40 : -40) : 0), y: e.y - (rifle ? 70 : 44), toHero: true, key: 'pageshot', spd: rifle ? 420 : 300, dmg: e.atk * (rifle ? .7 : 1), tint: rifle ? 0xcff6ff : 0x5ff2ff, life: 2.2, scale: rifle ? 1.4 : 1 }); });
        return;
      }
      const red = D.shot === 'red', blue = D.shot === 'blue';
      e.body.setTintFill(red ? 0xff6a4a : blue ? 0x9fe0ff : 0xff8ac8); this.time.delayedCall(90, () => e.body && e.body.clearTint());
      this.time.delayedCall(250, () => { if (!e.dead) this.proj({ x: e.x, y: e.y - (red ? 30 : 40), toHero: true, key: red ? 'redshot' : blue ? 'blueshot' : 'spore', spd: red ? 300 : blue ? 260 : 230, dmg: e.atk, tint: red ? 0xff4a3a : blue ? 0x7fc8ff : 0xff6ab0, life: 2, drain: blue ? 8 : 0 }); });
      return;
    }
    const lunge = Math.atan2(h.y - e.y, h.x - e.x);
    this.tweens.add({ targets: e.body, x: Math.cos(lunge) * (D.boss ? 16 : 8), duration: 110, yoyo: true });
    this.time.delayedCall(110, () => { if (!e.dead && !h.dead && dist(e.x, e.y, h.x, h.y) < D.range + 30 + (D.boss ? 40 : 0)) { this.hurtHero(e.atk); if (D.boss) this.cameras.main.shake(140, .004); if (D.steal && (this.shield > 0 || this.veilT > 0 || this.overT > 0 || this.critShots > 0)) { this.shield = 0; this.shieldT = 0; this.veilT = 0; h.body.setAlpha(1); this.overT = 0; this.critShots = 0; this.num(h.x, h.y - 96, 'Buffs stolen', '#5ff2ff', 14); } } });
  }

  bossLogic(e, dt) {
    if (e.type === 'marrowking') return this.marrowLogic(e, dt);
    if (e.type === 'choir') return this.choirLogic(e, dt);
    if (e.type === 'firstcaptain') return this.captainLogic(e, dt);
    e.special -= dt;
    const h = this.hero, frac = e.hp / e.hpMax;
    if (!e.broodA && frac < .6) { e.broodA = true; this.brood(e); }
    if (!e.broodB && frac < .3) { e.broodB = true; this.brood(e); }
    if (e.special <= 0) {
      e.special = frac < .25 ? 4.2 : 6;
      this.num(e.x, e.y - 160, 'Root Burst', '#ff8ab8', 15);
      e.body.setTintFill(0xff6ab0); this.time.delayedCall(140, () => e.body && e.body.clearTint());
      const pts = [[h.x, h.y], [h.x + rnd(-110, 110), h.y + rnd(-70, 70)], [h.x + rnd(-110, 110), h.y + rnd(-70, 70)]];
      if (frac < .25) pts.push([h.x + rnd(-130, 130), h.y + rnd(-80, 80)]);
      for (const [x, y] of pts) {
        const t = this.addTele(x, y, 54, 1.25);
        t.onHit = tt => {
          this.shardE.setParticleTint(0xff8ab8); this.shardE.explode(16, tt.x, tt.y);
          for (let i = 0; i < 4; i++) { const s = this.img(tt.x + rnd(-24, 24), tt.y + rnd(-10, 10), 'tree3', .5, .93, .22).setDepth(tt.y + 10); s.scaleY = 0; this.tweens.add({ targets: s, scaleY: this.sx('tree3') * .3, duration: 120, yoyo: true, hold: 250, onComplete: () => s.destroy() }); }
          sfx('spike');
          if (!h.dead && dist(h.x, h.y, tt.x, tt.y) < tt.r + 8) { this.hurtHero(e.atk * 1.5); this.cameras.main.shake(160, .006); }
        };
      }
    }
  }
  brood(e, type = 'shardling', mul = 3, label = 'Brood Call') {
    this.num(e.x, e.y - topY(e) - 30, label, '#ff8ab8', 16);
    const D0 = ENEMIES[type];
    for (let i = 0; i < 3; i++) {
      const a = rnd(0, Math.PI * 2); const m = this.spawnEnemy({ type, x: e.x, y: e.y, r: 10, count: 0, boss: true }, { x: e.x + Math.cos(a) * 110, y: e.y + Math.sin(a) * 70 });
      m.hpMax = m.hp = Math.round(D0.hp * mul * (type === 'shardling' ? 1 : 3)); m.atk = D0.atk * (type === 'shardling' ? 2.2 : 3) * Math.min(1, mul); m.aggro = true; m.state = 'chase'; m.sp = null; m.body.setTint(type === 'shardling' ? 0xffa0d0 : 0xffd0a0);
    }
  }

  sandBurst(x, y, n = 12) {
    for (let i = 0; i < n; i++) { const p = this.img(x + rnd(-40, 40), y + rnd(-10, 10), 'sandpuff', .5, .5, rnd(1, 2)).setDepth(y + 20); this.tweens.add({ targets: p, x: p.x + rnd(-60, 60), y: p.y - rnd(10, 50), alpha: 0, scale: p.scale * 1.8, duration: rnd(500, 900), onComplete: () => p.destroy() }); }
  }

  captainLogic(e, dt) {
    e.special -= dt;
    const h = this.hero, frac = e.hp / e.hpMax;
    if (!e.broodA && frac < .5) { e.broodA = true; this.brood(e, 'archivist', .5, 'Old orders wake'); }
    if (e.beacon && e.beacon.dead) e.beacon = null;
    if (e.special > 0 || h.dead) return;
    e.special = frac < .3 ? 3.8 : 4.8;
    e.alt = ((e.alt || 0) + 1) % 3;
    if (e.alt === 1) {
      this.num(e.x, e.y - 190, 'Chest pulses', '#9ff6ff', 16);
      for (const d of [0, 480]) this.time.delayedCall(d, () => { if (!e.dead) { this.ring(e.x, e.y - 70, 0x9ff6ff, 1.8); sfx('spike'); } });
      const t = this.addTele(e.x, e.y, 210, 1.4, 0x9ff6ff);
      t.onHit = tt => { this.ring(tt.x, tt.y - 30, 0xffffff, 4.4); this.num(tt.x, tt.y - 200, 'FORM UP!', '#ffffff', 18, true); this.cameras.main.shake(260, .007); sfx('boss'); if (!h.dead && dist(h.x, h.y, tt.x, tt.y) < tt.r + 6) this.hurtHero(e.atk * 1.8); };
    } else if (e.alt === 2) {
      this.num(e.x, e.y - 190, 'Takes aim', '#ff9a7a', 16);
      const a = Math.atan2(h.y - e.y, h.x - e.x), ox = e.x, oy = e.y; let hit = false;
      for (let k = 1; k <= 11; k++) { const t = this.addTele(ox + Math.cos(a) * k * 56, oy + Math.sin(a) * k * 56, 34, 1.15, 0xff9a7a); t.onHit = tt => { if (k === 1) { this.beam(ox, oy - 60, ox + Math.cos(a) * 660, oy + Math.sin(a) * 660, 0xffd0c0, 7, 260); sfx('rail'); this.cameras.main.shake(120, .004); } if (!hit && !h.dead && dist(h.x, h.y, tt.x, tt.y) < tt.r + 8) { hit = true; this.hurtHero(e.atk * 2.1); } }; }
    } else {
      if (e.beacon) { e.special = .8; return; }
      this.num(e.x, e.y - 190, 'Plants a beacon', '#ff7a6a', 16); sfx('skill');
      const bx = Phaser.Math.Clamp(h.x + rnd(-110, 110), 60, this.R.w - 60), by = Phaser.Math.Clamp(h.y + rnd(-70, 70), 360, this.R.h - 60);
      const b = this.spawnEnemy({ type: 'beacon', x: bx, y: by, r: 1, count: 0, boss: true, once: true }, { x: bx, y: by });
      b.hpMax = b.hp = Math.round(e.hpMax * .035); b.fuse = 6; b.owner = e; b.aggro = true; e.beacon = b; b.lastSec = 7;
      b.tele = this.addTele(bx, by, 220, 6, 0xff5a4a); b.tele.noDodge = true;
      b.tele.onHit = tt => { if (b.dead) return; this.ring(bx, by - 20, 0xff5a4a, 5); this.cameras.main.shake(320, .009); sfx('bossdie'); if (!h.dead && dist(h.x, h.y, bx, by) < 226) this.hurtHero(e.atk * 2.8); if (!e.dead) { e.hp = Math.min(e.hpMax, e.hp + e.hpMax * .05); this.num(e.x, e.y - 210, 'Recalled', '#9ff6ff', 14); } b.dead = true; b.bar.destroy(); this.tweens.add({ targets: b, alpha: 0, duration: 200, onComplete: () => b.destroy() }); this.enemies = this.enemies.filter(x => x !== b); };
    }
  }
  updateBeacon(e, dt) {
    e.t += dt; e.fuse -= dt; e.flash -= dt;
    e.body.setTint(e.flash > 0 ? 0xffffff : 0xffb0a0); e.body.y = Math.sin(e.t * 8) * 1.5;
    const sec = Math.ceil(e.fuse); if (sec < e.lastSec && sec > 0) { e.lastSec = sec; this.num(e.x, e.y - 74, String(sec), '#ff7a6a', 18, true); sfx('tap'); }
    e.setDepth(e.y); e.bar.clear();
    const w = 40, y = e.y - 70; e.bar.fillStyle(0x061016, .85); e.bar.fillRoundedRect(e.x - w / 2 - 1, y - 1, w + 2, 6, 3); e.bar.fillStyle(0xff5a4a, 1); e.bar.fillRoundedRect(e.x - w / 2, y, Math.max(2, w * e.hp / e.hpMax), 4, 2);
    if (this.hero.target === e) { e.bar.lineStyle(1.5, 0xffcf5a, .9); e.bar.strokeEllipse(e.x, e.y, 46, 16); }
  }

  choirLogic(e, dt) {
    e.special -= dt;
    const h = this.hero, frac = e.hp / e.hpMax;
    e.volley = (e.volley ?? 1.5) - dt;
    if (e.volley <= 0 && !h.dead && dist(h.x, h.y, e.x, e.y) > e.D.range + 30) {
      e.volley = frac < .3 ? 1.7 : 2.3;
      for (let k = 0; k < 2; k++) this.time.delayedCall(k * 160, () => { if (!e.dead) this.proj({ x: e.x + rnd(-60, 30), y: e.y - rnd(80, 200), toHero: true, key: 'blueshot', spd: 280, dmg: e.atk * .32, tint: 0x7fc8ff, life: 2.4, drain: 5 }); });
    }
    if (!e.broodA && frac < .66) { e.broodA = true; this.brood(e, 'husker', .6, 'The drowned rise'); }
    if (!e.broodB && frac < .33) { e.broodB = true; this.brood(e, 'husker', .6, 'The drowned rise'); }
    if (e.special > 0) return;
    e.special = frac < .3 ? 4.6 : 6.2;
    e.alt = ((e.alt || 0) + 1) % 3;
    e.body.setTint(0x9fe0ff); this.time.delayedCall(200, () => e.body && e.body.clearTint());
    if (e.alt === 1 || e.alt === 0 && frac < .5) {
      this.num(e.x, e.y - 270, 'Flood Wave', '#7fc8ff', 16); sfx('boss');
      const cols = [-240, -120, 0, 120, 240], gap = ri(0, 4), rows = frac < .3 ? 5 : 4;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols.length; c++) {
        if (c === gap || (frac < .3 && c === (gap + 2) % 5 && r % 2)) continue;
        const t = this.addTele(e.x + cols[c], e.y + 90 + r * 78, 56, 1.1 + r * .35, 0x4ab8ff);
        t.onHit = tt => { this.splash(tt.x, tt.y); if (!h.dead && dist(h.x, h.y, tt.x, tt.y) < tt.r + 8) this.hurtHero(e.atk * 1.15); };
      }
    } else if (e.alt === 2) {
      this.num(e.x, e.y - 270, 'Stolen Song', '#bfe8ff', 16);
      this.ring(e.x, e.y - 120, 0xbfe8ff, 3);
      const t = this.addTele(e.x, e.y + 40, 190, 1.6, 0x9fb8ff);
      t.onHit = tt => { this.ring(tt.x, tt.y, 0x7fc8ff, 5); this.cameras.main.shake(260, .007); sfx('spike'); if (!h.dead && dist(h.x, h.y, tt.x, tt.y) < tt.r + 6) { this.hurtHero(e.atk * 1.6); this.res = Math.max(0, this.res - 20); } };
    } else {
      this.num(e.x, e.y - 270, 'Undertow', '#7fc8ff', 16);
      for (let k = 0; k < 3; k++) { const t = this.addTele(h.x + rnd(-90, 90), h.y + rnd(-60, 60), 62, 1.2 + k * .3, 0x4ab8ff); t.onHit = tt => { this.splash(tt.x, tt.y); if (!h.dead && dist(h.x, h.y, tt.x, tt.y) < tt.r + 8) this.hurtHero(e.atk * 1.3); }; }
    }
  }
  splash(x, y) {
    this.burstE.setParticleTint(0x7fc8ff); this.burstE.explode(14, x, y - 10);
    const r = this.img(x, y, 'ring', .5, .5, .3).setTint(0x7fc8ff).setBlendMode('ADD').setDepth(5e5); r.scaleY *= .6;
    this.tweens.add({ targets: r, scaleX: r.scaleX * 4, scaleY: r.scaleY * 4, alpha: 0, duration: 420, onComplete: () => r.destroy() });
  }

  marrowLogic(e, dt) {
    if (e.burrowed) return;
    e.special -= dt;
    const h = this.hero, frac = e.hp / e.hpMax;
    if (!e.broodA && frac < .6) { e.broodA = true; this.brood(e, 'skimmer', 1, 'Skimmers swarm'); }
    if (!e.broodB && frac < .3) { e.broodB = true; this.brood(e, 'skimmer', 1, 'Skimmers swarm'); }
    if (e.special > 0) return;
    e.special = frac < .25 ? 4.2 : 6;
    e.alt = !e.alt;
    if (e.alt) {
      this.num(e.x, e.y - 240, 'Burrow', '#ffcf8a', 16);
      e.burrowed = true; e.aggro = true; this.sandBurst(e.x, e.y, 18); sfx('spike');
      this.tweens.add({ targets: e.body, scaleY: 0, alpha: .2, duration: 380, ease: 'Quad.easeIn' });
      const t = this.addTele(h.x, h.y, 78, 1.5, 0xffa040);
      t.onHit = tt => {
        e.x = tt.x; e.y = tt.y; e.home = { x: this.P.arena.x, y: this.P.arena.y };
        this.sandBurst(tt.x, tt.y, 26); this.cameras.main.shake(260, .009); sfx('boss');
        this.tweens.add({ targets: e.body, scaleY: this.sx('marrowking'), alpha: 1, duration: 340, ease: 'Back.easeOut', onComplete: () => { e.burrowed = false; } });
        if (!h.dead && dist(h.x, h.y, tt.x, tt.y) < tt.r + 10) this.hurtHero(e.atk * 1.6);
      };
    } else {
      this.num(e.x, e.y - 240, 'Sand Gale', '#ffcf8a', 16);
      e.body.setTintFill(0xffd08a); this.time.delayedCall(140, () => e.body && e.body.clearTint());
      const a = Math.atan2(h.y - e.y, h.x - e.x);
      for (const d of [80, 160, 240, 320]) {
        const t = this.addTele(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d * .8, 58, 1.15 + d / 1000, 0xffa040);
        t.onHit = tt => { this.sandBurst(tt.x, tt.y, 8); if (!h.dead && dist(h.x, h.y, tt.x, tt.y) < tt.r + 8) this.hurtHero(e.atk * 1.1); };
      }
    }
  }

  // ---------- quests ----------
  updateMusic() {
    const b = this.boss && !this.boss.dead ? this.boss : null;
    if (b && (b.aggro || dist(this.hero.x, this.hero.y, b.x, b.y) < 520)) { this.musicHold = this.now + 6; playTrack('boss'); }
    else if (this.now > this.musicHold) playTrack(this.R.music || 'theme');
  }

  updateMarkers() {
    const q = this.quest();
    for (const id in this.npcs) { const n = this.npcs[id]; const on = !!(q && q.kind === 'talk' && q.npc === id); n.mark.setVisible(on); n.mark.setText('!'); }
    if (this.npcs.hush && this.st.region === 'dunes') { const show = !!(q && q.id === 'ii_canyon'); const n = this.npcs.hush; if (n.c.visible !== show) { n.c.setVisible(show); n.name.setVisible(show); } }
    if (this.geodeGlow) this.geodeGlow.setVisible(!!(q && q.id === 'geode'));
    const B = this.R.boss;
    if (B) {
    const bossIdx = QUESTS.findIndex(q => q.id === B.quest), arena = this.P[B.at];
    if (!this.boss && this.st.q >= bossIdx && this.now > (this.bossCd || 0) && !this.hero.dead && dist(this.hero.x, this.hero.y, arena.x, arena.y) < 420) {
      this.spawnEnemy({ type: B.type, x: arena.x, y: arena.y, r: 1, count: 0, boss: true }, arena);
    }
    if (this.door) this.door.setVisible(this.st.q > bossIdx);
    }
    if (this.boss && !this.boss.dead && this.boss.aggro) this.ui.bossBar(this.boss);
  }

  talkTo(id) {
    const q = this.quest();
    if (q && q.kind === 'talk' && q.npc === id) { this.dialogue(q.talk, () => this.completeQuest()); return; }
    const lines = IDLE[id];
    if (lines) this.dialogue([{ who: id, text: lines[ri(0, lines.length - 1)] }]);
  }
  arrivePlace(place) {
    const q = this.quest(); if (!q || q.place !== place) return;
    if (q.talk) this.dialogue(q.talk, () => this.completeQuest()); else this.completeQuest();
  }
  dialogue(lines, done) {
    this.paused = true; this.hero.moving = false; this.joy = null; this.ui.joystick(null);
    this.ui.dialogue(lines, () => { this.paused = false; this.manualUntil = this.now + .6; if (done) done(); });
  }

  completeQuest() {
    const q = this.quest(); if (!q) return;
    const st = this.st, r = q.reward || {};
    if (q.id === 'geode') { this.tweens.add({ targets: [this.geodeSpr, this.geodeGlow], alpha: 0, duration: 500 }); this.cameras.main.flash(500, 191, 232, 255); }
    if (q.id === 'ii_dig' && this.chained) { this.tweens.killTweensOf(this.chained); this.tweens.add({ targets: [this.chained, this.chainG], alpha: 0, duration: 1500, onComplete: () => { this.chained.setVisible(false); this.chainG.setVisible(false); } }); }
    if (q.id === 'ii_canyon' && this.npcs.hush) { this.tweens.add({ targets: [this.npcs.hush.c, this.npcs.hush.name], alpha: 0, duration: 900 }); }
    if (r.xp) this.gainXp(r.xp);
    if (r.lumen) { st.lumen += r.lumen; this.ui.lumenBump(); }
    if (r.shards) st.shards += r.shards;
    if (r.geode) st.geodes += r.geode;
    if (r.gear) { const g = makeGear(st.cls, r.gear, Math.max(2, st.lvl), r.gearRar || 1); const cur = st.gear[r.gear]; if (cur) g.star = cur.star || 0; while (cur && gearValue(r.gear, cur) >= gearValue(r.gear, g)) g.ilvl++; st.gear[r.gear] = g; this.refreshStats(false); this.ui.gearPop(r.gear, g, true); }
    if (r.echo) { st.echoes[r.echo] = { lvl: 1, evo: 0 }; st.activeEcho = r.echo; this.setEcho(r.echo); this.ring(this.hero.x, this.hero.y - 20, 0xbfe8ff, 3); this.ui.newEcho(r.echo); }
    for (const c of q.codex || []) this.unlockCodex(c);
    sfx('quest');
    this.ui.questDone(q, r); this.ui.order('quest');
    st.q++; st.qp = 0;
    const after = () => { this.questChanged(); save(st); if (q.actEnd) this.time.delayedCall(600, () => this.ui.actEnd(q.actEnd)); };
    if (q.done) this.time.delayedCall(300, () => this.dialogue(q.done, after)); else after();
  }
  questChanged(initial) {
    const q = this.quest();
    if (this.st.q >= QUESTS.findIndex(x => x.id === 'ii_brief')) this.st.actDone = true;
    if (!q && !this.st.bounty) this.pickBounty();
    if (!q && this.st.bounty && this.bounty() && (this.bounty().region || 'verge') !== this.st.region && !this.R.tower) this.pickBounty();
    if (q && !initial) this.ui.toast('New quest: ' + q.title);
    if (q && q.kind === 'travel' && (q.region || 'verge') === this.st.region) { this.time.delayedCall(initial ? 900 : 200, () => { if (this.quest() === q) this.completeQuest(); }); }
    if (q && (q.kind === 'hatch' || q.kind === 'forge')) this.checkUiQuest();
    this.ui.quest();
  }
  checkUiQuest() {
    const q = this.quest(); if (!q) return;
    if (q.kind === 'hatch' && Object.keys(this.st.echoes).length > 1) this.completeQuest();
    else if (q.kind === 'forge' && Object.values(this.st.gear).some(g => g && g.up > 0)) this.completeQuest();
  }
  onUiEvent(kind) { const q = this.quest(); if (q && q.kind === kind) this.completeQuest(); }
  completeBounty(b) {
    this.st.lumen += b.lumen; this.st.shards += b.shards; this.ui.lumenBump(); sfx('quest');
    this.ui.toast(`Bounty complete: +${b.lumen} Lumen, +${b.shards} memory`); this.ui.order('quest');
    this.pickBounty(); this.ui.quest();
  }
  unlockCodex(id) { if (this.st.codex[id] || !CODEX[id]) return; this.st.codex[id] = true; this.ui.codexNew(id); }

  toast(s) { this.ui.toast(s); }
}
