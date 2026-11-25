import { WORLD, CALLINGS, ENEMIES, SPAWNS, PLACES, NPCS, ECHOES, QUESTS, SLOTS, RARITY, CODEX, BOUNTIES } from './data.js';
import { buildArt, ANCHORS } from './art.js';
import { heroStats, echoStats, xpNeed, makeGear, rollRarity, gearValue, save } from './state.js';
import { sfx } from './audio.js';

const PATH = [[900, 2930], [900, 2600], [900, 2380], [820, 2160], [770, 1950], [900, 1720], [1040, 1480], [960, 1200], [820, 960], [860, 700], [900, 470]];
const dist = (a, b, c, d) => Math.hypot(c - a, d - b);
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));

function distToPath(x, y) {
  let best = 1e9;
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, ay] = PATH[i], [bx, by] = PATH[i + 1];
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, dist(x, y, ax + dx * t, ay + dy * t));
  }
  return best;
}

export class WorldScene extends Phaser.Scene {
  constructor() { super('world'); }

  init(d) { this.ui = d.ui; this.st = d.state; this.TS = d.TS; this.Z = d.Z; this.dpr = d.dpr; this.onReady = d.onReady; }

  create() {
    this.art = buildArt(this.TS);
    for (const [k, c] of Object.entries(this.art)) this.textures.addCanvas(k, c);
    this.cameras.main.setBackgroundColor('#0b2226');
    this.paused = false;
    this.now = 0;
    this.fx = this.add.layer(); this.fx.setDepth(5e5);
    this.enemies = []; this.projs = []; this.zones = []; this.teles = []; this.drones = []; this.pickups = [];
    this.manualUntil = 0; this.joy = null; this.tapTarget = null; this.tapPoint = null;
    this.res = 0; this.shield = 0; this.shieldT = 0;
    this.cds = [0, 0, 0]; this.echoCd = 0; this.atkCd = 0;
    this.buildWorld();
    this.makeHero();
    this.refreshStats(true);
    this.makeNpcs();
    this.setEcho(this.st.activeEcho);
    for (const s of SPAWNS) for (let i = 0; i < s.count; i++) this.spawnEnemy(s);
    this.cameras.main.setBounds(0, 0, WORLD.w, WORLD.h);
    this.cameras.main.startFollow(this.hero, true, 0.12, 0.12);
    this.setZoom(this.Z, this.dpr);
    this.cameras.main.centerOn(this.hero.x, this.hero.y);
    this.motes = this.add.particles(0, 0, 'dot', {
      x: { min: -400, max: 400 }, y: { min: -500, max: 500 }, lifespan: 6000, speedY: { min: -14, max: -4 }, speedX: { min: -6, max: 6 },
      scale: { start: .5 / this.TS * 2, end: 0 }, alpha: { start: .55, end: 0 }, tint: [0x5ff2d0, 0xff8ab8, 0x9ff6ff], frequency: 90, blendMode: 'ADD'
    });
    this.motes.setDepth(4e5);
    this.burstE = this.add.particles(0, 0, 'dot', { speed: { min: 60, max: 220 }, lifespan: { min: 250, max: 550 }, scale: { start: .9, end: 0 }, alpha: { start: 1, end: 0 }, blendMode: 'ADD', emitting: false });
    this.burstE.setDepth(5e5 + 2);
    this.shardE = this.add.particles(0, 0, 'shardbit', { speed: { min: 80, max: 200 }, lifespan: { min: 300, max: 650 }, scale: { start: 1 / this.TS * 2, end: 0 }, rotate: { min: 0, max: 360 }, gravityY: 300, emitting: false });
    this.shardE.setDepth(5e5 + 1);
    this.input.on('pointerdown', p => this.onDown(p));
    this.input.on('pointermove', p => this.onMove(p));
    this.input.on('pointerup', p => this.onUp(p));
    this.input.on('pointerupoutside', p => this.onUp(p));
    this.ui.attach(this);
    this.questChanged(true);
    this.time.addEvent({ delay: 8000, loop: true, callback: () => save(this.st) });
    if (this.onReady) this.onReady(this);
  }

  setZoom(Z, dpr) { this.Z = Z; this.dpr = dpr; this.cameras.main.setZoom(Z * dpr); }
  sx(key) { const c = this.art[key]; return c.unitW / c.width; }
  img(x, y, key, ax = .5, ay = .5, s = 1) { return this.add.image(x, y, key).setOrigin(ax, ay).setScale(this.sx(key) * s); }

  buildWorld() {
    const W = WORLD.w, H = WORLD.h;
    const g = this.add.tileSprite(0, 0, W, H, 'ground').setOrigin(0).setTileScale(this.sx('ground'));
    g.setDepth(-1e6);
    const tint = (x, y, r, col, a, mode = 'ADD') => { const s = this.add.image(x, y, 'soft').setScale(r / 32).setTint(col).setAlpha(a).setBlendMode(mode); s.setDepth(-9e5); return s; };
    tint(900, 2640, 400, 0xffa04a, .16); tint(900, 2060, 420, 0x5ff2d0, .07); tint(860, 1420, 520, 0x9a5aff, .16); tint(900, 860, 480, 0xff3a6a, .09);
    tint(900, 380, 340, 0xff5aa8, .14); tint(900, 380, 300, 0x000000, .35, 'NORMAL'); tint(900, 2380, 180, 0x9ff6ff, .18);
    for (let i = 0; i < PATH.length - 1; i++) {
      const [ax, ay] = PATH[i], [bx, by] = PATH[i + 1], n = Math.ceil(dist(ax, ay, bx, by) / 24);
      for (let k = 0; k < n; k++) { const t = k / n; const d = this.img(ax + (bx - ax) * t + rnd(-6, 6), ay + (by - ay) * t + rnd(-4, 4), 'path', .5, .5, rnd(1.1, 1.5)); d.setDepth(-8e5); d.setAlpha(i < 2 ? .0 : 1); }
    }
    for (let i = 0; i < 70; i++) { const a = rnd(0, Math.PI * 2), r = rnd(0, 240); const d = this.img(900 + Math.cos(a) * r * 1.4, 2640 + Math.sin(a) * r * .6, 'plaza', .5, .5, rnd(1.2, 1.8)); d.setDepth(-8e5); }
    const R = (() => { let a = 1234; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
    const okSpot = (x, y, pad) => distToPath(x, y) > pad && dist(x, y, 900, 2660) > 380 && dist(x, y, PLACES.spire.x, PLACES.spire.y) > 120 && dist(x, y, PLACES.arena.x, PLACES.arena.y) > 260 && dist(x, y, PLACES.geode.x, PLACES.geode.y) > 80;
    this.tall = [];
    const placeProp = (key, x, y, s = 1, flip = false) => { const [ax, ay] = ANCHORS[key] || [.5, .9]; const p = this.img(x, y, key, ax, ay, s); if (flip) p.setFlipX(true); p.setDepth(y); if (/^tree|^rib|^spire/.test(key)) this.tall.push(p); return p; };
    for (let i = 0; i < 320 && this.countTrees !== 140; i++) {
      const edge = R() < .55; const x = edge ? (R() < .5 ? rnd(-20, 260) : rnd(1540, 1820)) : rnd(80, 1720); const y = rnd(60, 2560);
      if (!okSpot(x, y, edge ? 60 : 170)) continue;
      const v = y < 1700 && y > 1150 && R() < .6 ? 3 : Math.floor(R() * 3);
      placeProp('tree' + v, x, y, rnd(.85, 1.25), R() < .5); this.countTrees = (this.countTrees || 0) + 1;
    }
    for (let i = 0; i < 160; i++) { const x = rnd(40, 1760), y = rnd(80, 2600); if (!okSpot(x, y, 70)) continue; const r = R(); placeProp(r < .3 ? 'rock' : r < .7 ? 'moss' : 'bulb', x, y, rnd(.8, 1.2), R() < .5); }
    placeProp('rib', 300, 1980, 1.1); placeProp('rib', 1500, 1700, 1, true); placeProp('rib', 260, 1100, 1.2); placeProp('rib', 1560, 820, 1.15, true);
    this.spire = placeProp('spire', PLACES.spire.x, PLACES.spire.y, .9);
    this.spireGlow = this.add.image(PLACES.spire.x, PLACES.spire.y - 270, 'soft').setTint(0x9ff6ff).setBlendMode('ADD').setScale(3).setAlpha(.5).setDepth(PLACES.spire.y + 1);
    this.tweens.add({ targets: this.spireGlow, alpha: .9, scale: 3.6, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    placeProp('hull', 900, 2998, 1.05);
    for (const [x, y] of [[690, 2540], [1110, 2540], [620, 2700], [1180, 2700], [830, 2470], [970, 2470]]) { placeProp('lamp', x, y, 1); const l = this.add.image(x, y - 80, 'soft').setTint(0xffb85a).setBlendMode('ADD').setScale(2.2).setAlpha(.45).setDepth(y + 1); this.tweens.add({ targets: l, alpha: .6, duration: rnd(900, 1500), yoyo: true, repeat: -1 }); }
    placeProp('banner', 728, 2572, 1); placeProp('forge', 1112, 2582, 1); placeProp('tent', 1090, 2712, .9); placeProp('stall', 700, 2700, .9); placeProp('stall', 560, 2600, .85, true);
    for (const [x, y] of [[600, 2640], [624, 2668], [1180, 2610], [1204, 2640], [1240, 2760]]) placeProp('crate', x, y, rnd(.9, 1.1));
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + rnd(-.1, .1); const rr = rnd(150, 260); const x = PLACES.arena.x + Math.cos(a) * rr, y = PLACES.arena.y + Math.sin(a) * rr * .75; const r = this.img(x, y, 'root', .5, .5, rnd(.8, 1.3)); r.setRotation(a + rnd(-.3, .3)); r.setDepth(-7e5); }
    for (let i = 0; i < 10; i++) { const a = rnd(Math.PI * 1.05, Math.PI * 1.95), rr = rnd(250, 330); placeProp('tree' + (i % 2 ? 3 : 1), PLACES.arena.x + Math.cos(a) * rr, PLACES.arena.y + Math.sin(a) * rr * .7, rnd(1, 1.3)); }
    this.geodeSpr = placeProp('geode', PLACES.geode.x, PLACES.geode.y, 1.1);
    this.geodeGlow = this.add.image(PLACES.geode.x, PLACES.geode.y - 14, 'soft').setTint(0x5ff2d0).setBlendMode('ADD').setScale(1.6).setDepth(PLACES.geode.y + 1);
    this.tweens.add({ targets: this.geodeGlow, scale: 2.2, alpha: .4, duration: 900, yoyo: true, repeat: -1 });
    this.door = placeProp('door', PLACES.roots.x, PLACES.roots.y + 30, 1); this.door.setVisible(false);
  }

  makeHero() {
    const cls = this.st.cls, C = CALLINGS[cls];
    const h = this.add.container(PLACES.start.x, PLACES.start.y);
    const shadow = this.img(0, 0, 'shadow', .5, .5, 1.1);
    const fl = this.img(-7, -2, 'foot', .5, .5), fr = this.img(7, -2, 'foot', .5, .5);
    const body = this.img(0, 0, 'ch_' + cls, .5, .97);
    const wkey = C.attack === 'slash' ? 'w_blade' : C.attack === 'rail' ? 'w_rifle' : 'w_orb';
    const weapon = this.img(0, 0, wkey, .5, C.attack === 'slash' ? .85 : .5);
    h.add([shadow, fl, fr, body, weapon]);
    Object.assign(h, { shadow, fl, fr, body, weapon, facing: 1, walkT: 0, moving: false, vx: 0, vy: 0, kind: C.attack, hp: 1, dead: false, target: null, swing: 0 });
    this.hero = h;
    this.halo = this.img(0, 0, 'ring', .5, .5, .5).setTint(0x5ff2ff).setAlpha(0).setBlendMode('ADD');
  }

  makeNpcs() {
    this.npcs = {};
    for (const id of ['marr', 'sparks', 'okafor']) {
      const p = PLACES[id];
      const c = this.add.container(p.x, p.y);
      const shadow = this.img(0, 0, 'shadow', .5, .5, 1.1), body = this.img(0, 0, 'ch_' + id, .5, .97);
      c.add([shadow, this.img(-7, -2, 'foot'), this.img(7, -2, 'foot'), body]);
      if (id === 'sparks') { const w = this.img(16, -20, 'wrench', .5, .8); w.setRotation(.5); c.add(w); }
      if (id === 'marr') body.setFlipX(true);
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
    const shadow = this.img(0, 0, 'shadow', .5, .5, .7);
    const body = this.img(0, -6, 'echo_' + id, .5, 1);
    const glow = this.add.image(0, -18, 'soft').setTint(ECHOES[id].color).setBlendMode('ADD').setAlpha(.35).setScale(1.2);
    e.add([shadow, glow, body]);
    const hover = ['skein', 'lumi', 'rivet'].includes(id);
    Object.assign(e, { id, body, glow, hover, t: 0, cd: 1, target: null, dash: null });
    if (this.st.echoes[id].evo) { body.setScale(body.scaleX * 1.25); glow.setScale(1.8).setAlpha(.5); }
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
    const lvl = ri(D.lvl[0], D.lvl[1]);
    const c = this.add.container(x, y);
    const shadow = this.img(0, 0, 'shadow', .5, .5, D.boss ? 4.4 : D.radius / 16);
    const key = sp.type === 'glowmoth' ? 'moth' : sp.type;
    const parts = [shadow];
    let wl, wr;
    if (sp.type === 'glowmoth') {
      wl = this.img(-2, -30, 'wing', 1, .5); wl.setFlipX(true); wr = this.img(2, -30, 'wing', 0, .5);
      const gl = this.add.image(0, -28, 'soft').setTint(0xc58bff).setBlendMode('ADD').setAlpha(.4).setScale(1.3);
      parts.push(gl, wl, wr);
    }
    const body = this.img(0, sp.type === 'glowmoth' ? -14 : 0, key, .5, sp.type === 'glowmoth' ? .9 : .95);
    parts.push(body);
    c.add(parts);
    const hpMul = D.boss ? 1 : (1 + .2 * (lvl - 1)), atkMul = D.boss ? 1 : (1 + .13 * (lvl - 1));
    const bar = this.add.graphics().setDepth(4.4e5);
    Object.assign(c, { type: sp.type, D, sp, lvl, hpMax: Math.round(D.hp * hpMul), atk: D.atk * atkMul, body, wl, wr, shadow, bar, state: 'idle', cd: rnd(.5, 1.5), wander: null, wt: rnd(0, 3), t: rnd(0, 10), stun: 0, slow: 0, flash: 0, home: { x, y }, special: 5, broodA: false, broodB: false, dead: false, aggro: false });
    c.hp = c.hpMax;
    if (D.boss) { c.setScale(1); this.boss = c; this.ui.bossBar(c); sfx('boss'); this.cameras.main.shake(500, .004); this.ui.bossIntro(D, sp.type); }
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
    const e = this.enemies.find(e => !e.dead && dist(wx, wy, e.x, e.y - (e.D.boss ? 50 : 16)) < (e.D.boss ? 90 : 34));
    if (e) { this.hero.target = e; this.tapTarget = e; this.tapPoint = null; this.manualUntil = this.now + 1; sfx('tap'); return; }
    for (const id in this.npcs) { const n = this.npcs[id]; if (dist(wx, wy, n.x, n.y - 30) < 40) { this.tapPoint = { x: n.x, y: n.y + 26, npc: id }; this.manualUntil = this.now + 30; return; } }
    this.tapPoint = { x: wx, y: wy }; this.tapTarget = null; this.manualUntil = this.now + 3;
    const r = this.img(wx, wy, 'ring', .5, .5, .25).setTint(0x5ff2ff).setBlendMode('ADD').setDepth(-6e5);
    this.tweens.add({ targets: r, scale: r.scale * .4, alpha: 0, duration: 450, onComplete: () => r.destroy() });
  }

  // ---------- main loop ----------
  update(time, dms) {
    const dt = Math.min(.05, dms / 1000) * (window.__SPEED || 1);
    this.motes.setPosition(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y);
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
    this.fadeProps(dt);
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

  quest() { return QUESTS[this.st.q] || null; }

  goalFor() {
    const q = this.quest();
    if (!q) { const b = this.st.bounty && BOUNTIES.find(b => b.id === this.st.bounty.id); return { hunt: b ? b.enemy : this.bestHunt() }; }
    if (q.kind === 'talk') { const n = this.npcs[q.npc]; return { x: n.x, y: n.y + 26, npc: q.npc }; }
    if (q.kind === 'inspect' || q.kind === 'goto') { const p = PLACES[q.place]; return { x: p.x, y: p.y + 30, place: q.place }; }
    if (q.kind === 'hunt') return { hunt: q.enemy };
    if (q.kind === 'boss') return { boss: true };
    return { hunt: this.bestHunt() };
  }
  bestHunt() { const l = this.st.lvl; return l >= 9 ? 'crawler' : l >= 5 ? 'glowmoth' : 'shardling'; }

  updateHero(dt) {
    const h = this.hero;
    if (h.dead) return;
    const C = CALLINGS[this.st.cls];
    this.atkCd -= dt; for (let i = 0; i < 3; i++) this.cds[i] = Math.max(0, this.cds[i] - dt);
    if (this.shieldT > 0) { this.shieldT -= dt; if (this.shieldT <= 0) this.shield = 0; }
    this.halo.setPosition(h.x, h.y - 26).setDepth(h.y + 2).setAlpha(this.shield > 0 ? .55 + Math.sin(this.now * 6) * .15 : 0);
    let mvx = 0, mvy = 0;
    const speed = C.speed;
    const tele = this.teles.find(t => !t.done && !t.friendlyOnly && dist(h.x, h.y, t.x, t.y) < t.r + 12);
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
        if (G.npc || G.place) {
          const near = this.nearestEnemy(h.x, h.y, 90, e => e.aggro);
          if (near) h.target = near;
          else { h.target = null; goal = G; if (dist(h.x, h.y, G.x, G.y) < 12) { if (G.npc) this.talkTo(G.npc); else this.arrivePlace(G.place); goal = null; } }
        } else if (G.boss) {
          const b = this.enemies.find(e => e.D.boss && !e.dead);
          if (b) h.target = b; else { h.target = this.nearestEnemy(h.x, h.y, 90, e => e.aggro); if (!h.target) goal = { x: PLACES.arena.x, y: PLACES.arena.y + 110 }; }
        } else if (G.hunt) {
          if (!h.target || h.target.dead || (h.target.type !== G.hunt && !h.target.aggro)) h.target = this.nearestEnemy(h.x, h.y, 2000, e => e.type === G.hunt) || this.nearestEnemy(h.x, h.y, 120, e => e.aggro);
          if (!h.target) { const sp = SPAWNS.find(s => s.type === G.hunt); goal = { x: sp.x, y: sp.y }; }
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
    h.x = Phaser.Math.Clamp(h.x + mvx * speed * dt, 20, WORLD.w - 20);
    h.y = Phaser.Math.Clamp(h.y + mvy * speed * dt, 40, WORLD.h - 30);
    h.moving = Math.abs(mvx) + Math.abs(mvy) > .05;
    if (h.moving && Math.abs(mvx) > .2) this.face(Math.sign(mvx));
    this.animHero(dt);
    h.setDepth(h.y);
  }

  face(s) { const h = this.hero; if (s && s !== h.facing) { h.facing = s; h.setScale(s, 1); } }
  faceTo(x) { this.face(Math.sign(x - this.hero.x) || this.hero.facing); }

  animHero(dt) {
    const h = this.hero; const k = this.sx('ch_' + this.st.cls);
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
    else { w.setPosition(20, -40 + Math.sin(this.now * 3) * 4 + h.body.y); w.setScale(wk * (1 + h.swing * .5)); }
  }

  nearestEnemy(x, y, r, f) { let best = null, bd = r; for (const e of this.enemies) { if (e.dead || (f && !f(e))) continue; const d = dist(x, y, e.x, e.y); if (d < bd) { bd = d; best = e; } } return best; }
  enemiesIn(x, y, r) { return this.enemies.filter(e => !e.dead && dist(x, y, e.x, e.y) < r + (e.D.boss ? 40 : 0)); }

  tryAttack(t, C) {
    if (this.atkCd > 0) return;
    this.atkCd = C.atkCd; this.hero.swing = 1;
    const h = this.hero;
    if (C.attack === 'slash') {
      const a = Math.atan2(t.y - 14 - (h.y - 22), t.x - h.x);
      const s = this.img(h.x + Math.cos(a) * 20, h.y - 22 + Math.sin(a) * 12, 'slash', .5, .5, .9).setRotation(a).setTint(0x9ff6ff).setBlendMode('ADD').setDepth(h.y + 5);
      this.tweens.add({ targets: s, alpha: 0, scale: s.scale * 1.3, duration: 220, onComplete: () => s.destroy() });
      sfx('slash');
      this.hit(t, 1, 'basic');
    } else if (C.attack === 'rail') {
      this.beam(h.x + h.facing * 26, h.y - 24, t.x, t.y - 16, 0x5ff2ff, 3, 140); sfx('rail');
      this.hit(t, 1, 'basic');
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
      this.castSkill(i); break;
    }
    if (this.echo && this.echoCd <= 0 && this.st.settings.autoSkill) this.castEcho();
  }

  // ---------- damage ----------
  hit(e, mult, kind, opts = {}) {
    if (!e || e.dead) return;
    const h = this.hero;
    const crit = Math.random() < h.crit;
    let dmg = h.atk * mult * rnd(.92, 1.08) * (crit ? h.critDmg : 1);
    if (e.D.boss) dmg *= .9;
    dmg = Math.max(1, Math.round(dmg));
    this.damageEnemy(e, dmg, crit, opts.color);
    this.gainRes(kind === 'basic' ? 3.5 : 6);
  }
  damageEnemy(e, dmg, crit, color) {
    e.hp -= dmg; e.flash = .08; e.aggro = true; if (e.state === 'idle' || e.state === 'return') e.state = 'chase';
    this.num(e.x + rnd(-8, 8), e.y - (e.D.boss ? 120 : 44), crit ? dmg + '!' : '' + dmg, crit ? '#ffcf5a' : (color || '#ffffff'), crit ? 22 : 16, crit);
    this.burstE.setParticleTint(crit ? 0xffcf5a : 0x9ff6ff); this.burstE.explode(crit ? 10 : 5, e.x, e.y - (e.D.boss ? 60 : 18));
    if (crit) this.cameras.main.shake(90, .0025);
    if (!e.D.boss) { const a = Math.atan2(e.y - this.hero.y, e.x - this.hero.x); e.x += Math.cos(a) * 4; e.y += Math.sin(a) * 3; }
    sfx(crit ? 'crit' : 'hit');
    if (e.hp <= 0) this.kill(e);
    else if (e.D.boss) this.ui.bossBar(e);
  }
  num(x, y, s, color, size, pop) {
    const t = this.add.text(x, y, s, this.txt(size, color, 4)).setOrigin(.5).setDepth(5e5 + 5);
    if (pop) { t.setScale(.4); this.tweens.add({ targets: t, scale: 1.15, duration: 120, yoyo: true, hold: 60, ease: 'Back.easeOut' }); }
    this.tweens.add({ targets: t, y: y - 34, alpha: { from: 1, to: 0 }, duration: 750, delay: 120, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  }
  gainRes(n) { this.res = Math.min(100, this.res + n); }

  hurtHero(amount, src) {
    const h = this.hero; if (h.dead) return;
    let dmg = Math.max(1, Math.round(amount * (60 / (60 + h.def)) * rnd(.9, 1.1)));
    if (this.shield > 0) { const a = Math.min(this.shield, dmg); this.shield -= a; dmg -= a; if (a) this.num(h.x, h.y - 70, 'absorb ' + a, '#9ff6ff', 12); }
    if (dmg <= 0) return;
    h.hp -= dmg; this.gainRes(1.5);
    this.num(h.x + rnd(-6, 6), h.y - 76, '-' + dmg, '#ff6a7a', 15);
    h.body.setTintFill(0xff8a8a); this.time.delayedCall(70, () => h.body.clearTint());
    this.ui.hurt();
    if (h.hp <= 0) this.heroDown();
    this.ui.stats();
  }
  heal(n, label = '') {
    const h = this.hero; n = Math.round(n); h.hp = Math.min(h.hpMax, h.hp + n);
    this.num(h.x, h.y - 76, '+' + n + label, '#7fffb0', 15); this.ui.stats();
  }

  heroDown() {
    const h = this.hero; h.dead = true; h.hp = 0;
    this.tweens.add({ targets: h, alpha: 0, duration: 600 });
    this.ui.toast('Link lost. Resyncing at the Spire…');
    sfx('down');
    for (const e of this.enemies) { e.aggro = false; if (!e.D.boss) e.state = 'return'; }
    this.time.delayedCall(2600, () => {
      h.x = PLACES.spire.x; h.y = PLACES.spire.y + 50; h.alpha = 1; h.dead = false; h.hp = h.hpMax; h.target = null; this.tapPoint = null; this.tapTarget = null;
      this.ring(h.x, h.y - 20, 0x9ff6ff, 2.4); sfx('sync'); this.ui.stats();
      if (this.boss && !this.boss.dead) { this.boss.hp = Math.min(this.boss.hpMax, this.boss.hp + this.boss.hpMax * .2); this.ui.bossBar(this.boss); }
    });
  }

  kill(e) {
    e.dead = true; e.bar.destroy();
    this.shardE.setParticleTint(e.type === 'glowmoth' ? 0xd9a8ff : e.type === 'crawler' ? 0xff8ab8 : 0x9ff6ff);
    this.shardE.explode(e.D.boss ? 40 : 10, e.x, e.y - 16);
    e.body.setTintFill(0xffffff);
    this.tweens.add({ targets: e, alpha: 0, scaleX: e.scaleX * 1.25, scaleY: e.scaleY * .6, duration: 260, onComplete: () => e.destroy() });
    this.enemies = this.enemies.filter(x => x !== e);
    sfx(e.D.boss ? 'bossdie' : 'die');
    const st = this.st;
    st.kills[e.type] = (st.kills[e.type] || 0) + 1;
    const xp = Math.round(e.D.xp * (1 + .15 * (e.lvl - 1)) * (e.lvl < st.lvl - 4 ? .4 : 1));
    this.gainXp(xp);
    const lum = ri(e.D.lumen[0], e.D.lumen[1]) + Math.floor(e.lvl / 2);
    this.dropLumen(e.x, e.y - 10, lum, e.D.boss ? 16 : Math.min(4, 1 + Math.floor(lum / 3)));
    if (Math.random() < (e.D.boss ? 1 : .14)) this.dropShards(e.x, e.y - 10, e.D.boss ? 10 : 1);
    if (Math.random() < (e.D.boss ? 1 : .08)) this.dropGear(e);
    this.unlockCodex(e.type);
    const q = this.quest();
    if (q && (q.kind === 'hunt' || q.kind === 'boss') && q.enemy === e.type) { st.qp++; this.ui.quest(); if (st.qp >= q.count) this.time.delayedCall(450, () => this.completeQuest()); }
    if (!q && st.bounty) { const b = BOUNTIES.find(b => b.id === st.bounty.id); if (b && b.enemy === e.type) { st.bounty.prog++; this.ui.quest(); if (st.bounty.prog >= b.count) this.completeBounty(b); } }
    if (e.D.boss) {
      this.boss = null; this.ui.bossBar(null); st.bossKills++; this.bossCd = this.now + 240; this.cameras.main.shake(700, .008); this.cameras.main.flash(300, 255, 200, 240);
    } else {
      const sp = e.sp; this.time.delayedCall(rnd(4500, 7000), () => { if (sp && !sp.boss) this.spawnEnemy(sp); });
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
      if (cur) g.up = Math.max(0, (cur.up || 0) - 1);
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
    const st = this.st; st.xp += n;
    let up = false;
    while (st.xp >= xpNeed(st.lvl)) { st.xp -= xpNeed(st.lvl); st.lvl++; up = true; }
    if (up) {
      this.refreshStats(true);
      this.ring(this.hero.x, this.hero.y - 30, 0xffcf5a, 3); this.burstE.setParticleTint(0xffcf5a); this.burstE.explode(30, this.hero.x, this.hero.y - 30);
      this.ui.levelUp(st.lvl); sfx('level');
    }
    this.ui.stats();
  }

  ring(x, y, tint, s = 2) {
    const r = this.img(x, y, 'ring', .5, .5, .2).setTint(tint).setBlendMode('ADD').setDepth(5e5);
    this.tweens.add({ targets: r, scale: this.sx('ring') * s, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => r.destroy() });
  }
  beam(x1, y1, x2, y2, col, w = 3, dur = 160) {
    const g = this.add.graphics().setBlendMode('ADD').setDepth(5e5 + 1);
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
      if (p.tgt) { if (p.tgt.dead) { p.tgt = null; } else { tx = p.tgt.x; ty = p.tgt.y - (p.tgt.D?.boss ? 60 : 16); } }
      if (p.toHero) { tx = this.hero.x; ty = this.hero.y - 26; }
      if (tx === undefined) { p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt; }
      else { const a = Math.atan2(ty - p.y, tx - p.x); p.vx = Math.cos(a) * p.spd; p.vy = Math.sin(a) * p.spd; p.x += p.vx * dt; p.y += p.vy * dt; }
      p.s.setPosition(p.x, p.y); p.s.rotation = Math.atan2(p.vy || 0, p.vx || 1);
      if (Math.random() < .5) { const tr = this.add.image(p.x, p.y, 'dot').setScale(this.sx('dot') * .8).setTint(p.tint || 0xffffff).setBlendMode('ADD').setDepth(5e5 - 1).setAlpha(.6); this.tweens.add({ targets: tr, alpha: 0, scale: 0, duration: 260, onComplete: () => tr.destroy() }); }
      if (p.toHero) { if (dist(p.x, p.y, tx, ty) < 14) { p.done = true; this.hurtHero(p.dmg); this.burstE.setParticleTint(0xff6ab0); this.burstE.explode(6, p.x, p.y); } }
      else if (p.pierce) { for (const e of this.enemies) if (!e.dead && !p.hitSet.has(e) && dist(p.x, p.y, e.x, e.y - 16) < 26 + (e.D.boss ? 40 : 0)) { p.hitSet.add(e); this.hit(e, p.mult, 'skill'); } }
      else { const e = p.tgt || this.enemies.find(e => !e.dead && dist(p.x, p.y, e.x, e.y - 16) < 22); if (e && dist(p.x, p.y, e.x, e.y - (e.D.boss ? 60 : 16)) < 20 + (e.D.boss ? 40 : 0)) { p.done = true; this.hit(e, p.mult, 'basic'); if (p.splash) for (const o of this.enemiesIn(e.x, e.y, p.splash)) if (o !== e) this.hit(o, p.mult * .5, 'basic'); this.burstE.setParticleTint(p.tint || 0xffffff); this.burstE.explode(6, p.x, p.y); } }
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
    const needsTarget = !['bulwark', 'pulse', 'slam'].includes(S.id);
    if (needsTarget && !t) { this.ui.toast('No target in range'); return false; }
    this.cds[i] = S.cd; h.swing = 1; sfx('skill');
    if (t) this.faceTo(t.x);
    const ax = h.x, ay = h.y - 20;
    switch (S.id) {
      case 'cleave': {
        const a = Math.atan2(t.y - h.y, t.x - h.x);
        const s = this.img(h.x + Math.cos(a) * 26, h.y - 22 + Math.sin(a) * 14, 'slash', .5, .5, 1.8).setRotation(a).setTint(0xffcf5a).setBlendMode('ADD').setDepth(h.y + 5);
        this.tweens.add({ targets: s, alpha: 0, scale: s.scale * 1.4, duration: 300, onComplete: () => s.destroy() });
        for (const e of this.enemiesIn(h.x, h.y, 95)) { const d = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(e.y - h.y, e.x - h.x) - a)); if (d < 1.3) this.hit(e, 1.9, 'skill'); }
        break;
      }
      case 'bulwark': this.shield = Math.round(h.hpMax * .3); this.shieldT = 6; this.ring(h.x, h.y - 26, 0x5ff2ff, 1.4); this.num(h.x, h.y - 84, 'Bulwark', '#9ff6ff', 14); break;
      case 'slam': this.ring(h.x, h.y - 4, 0xffcf5a, 2.2); this.cameras.main.shake(180, .005); for (const e of this.enemiesIn(h.x, h.y, 100)) { this.hit(e, 1.5, 'skill'); e.stun = 1.2; } break;
      case 'pierce': {
        const a = Math.atan2(t.y - h.y, t.x - h.x);
        this.beam(ax, ay, ax + Math.cos(a) * 340, ay + Math.sin(a) * 340, 0x9ff6ff, 7, 260); this.cameras.main.shake(100, .003);
        for (const e of this.enemies) { if (e.dead) continue; const dx = e.x - h.x, dy = e.y - h.y; const along = dx * Math.cos(a) + dy * Math.sin(a), perp = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)); if (along > 0 && along < 340 && perp < 26 + (e.D.boss ? 40 : 0)) this.hit(e, 2.3, 'skill'); }
        break;
      }
      case 'volley': { const a = Math.atan2(t.y - h.y, t.x - h.x); for (const d of [-.25, 0, .25]) this.proj({ x: ax, y: ay, vx: Math.cos(a + d) * 520, vy: Math.sin(a + d) * 520, key: 'bolt', spd: 520, mult: 1.1, pierce: true, hitSet: new Set(), tint: 0x5ff2ff, life: .7 }); break; }
      case 'drone': { const d = this.img(h.x - 30, h.y - 60, 'echo_rivet', .5, .5, .8).setTint(0x9ff6ff).setDepth(5e5); this.drones.push({ s: d, t: 8, cd: 0 }); break; }
      case 'pulse': { this.ring(h.x, h.y - 20, 0xc58bff, 2.6); for (const e of this.enemiesIn(h.x, h.y, 125)) this.hit(e, 1.7, 'skill'); break; }
      case 'llance': this.proj({ x: ax, y: ay - 20, tgt: t, key: 'orb', scale: 2, spd: 640, mult: 3.2, tint: 0xe2c6ff }); break;
      case 'hush': this.zone(t.x, t.y, 90, 5, .45, 0xc58bff); break;
    }
    this.ui.skills();
    return true;
  }
  ultReady() { return !this.hero.dead && (this.hero.target && !this.hero.target.dead) && (this.enemiesIn(this.hero.x, this.hero.y, 220).length >= 3 || this.hero.target.D.boss); }
  castUlt() {
    if (this.res < 100 || this.hero.dead || this.paused) return false;
    const C = CALLINGS[this.st.cls], h = this.hero;
    const t = (h.target && !h.target.dead) ? h.target : this.nearestEnemy(h.x, h.y, 400);
    this.res = 0; sfx('ult'); this.ui.ultCast(C.ult.name);
    if (C.ult.id === 'starbreaker') {
      this.tweens.add({ targets: h.body, y: -60, duration: 220, yoyo: true, ease: 'Quad.easeOut', onComplete: () => {
        this.ring(h.x, h.y, 0xffcf5a, 4); this.ring(h.x, h.y, 0xffffff, 2.6); this.cameras.main.shake(350, .01);
        for (const e of this.enemiesIn(h.x, h.y, 150)) this.hit(e, 5.2, 'ult');
      } });
    } else if (C.ult.id === 'lance') {
      const x = t ? t.x : h.x, y = t ? t.y : h.y;
      this.addTele(x, y, 120, .55, 0x5ff2ff, true);
      this.time.delayedCall(550, () => { this.beam(x, y - 900, x, y, 0x9ff6ff, 22, 400); this.ring(x, y, 0x9ff6ff, 3.4); this.cameras.main.shake(300, .01); for (const e of this.enemiesIn(x, y, 125)) this.hit(e, 6.2, 'ult'); });
    } else {
      this.cameras.main.flash(260, 197, 139, 255);
      const v = this.cameras.main.worldView;
      for (const e of this.enemies.filter(e => !e.dead && v.contains(e.x, e.y))) this.time.delayedCall(rnd(0, 250), () => { this.ring(e.x, e.y - 16, 0xc58bff, 1.2); this.hit(e, 3.8, 'ult'); });
    }
    return true;
  }
  castEcho() {
    const e = this.echo; if (!e || this.echoCd > 0 || this.hero.dead) return false;
    const D = ECHOES[e.id], S = echoStats(this.st, e.id), h = this.hero;
    const t = (h.target && !h.target.dead) ? h.target : this.nearestEnemy(e.x, e.y, 260);
    const eatk = S.atk + h.atk * .3;
    const id = e.id;
    if ((id === 'skein' || id === 'glimmerkit' || id === 'lumi') && !t) return false;
    if (id === 'budlet' && h.hp > h.hpMax * .8) return false;
    if (id === 'rivet' && this.shield > 0) return false;
    this.echoCd = D.skill.cd; sfx('echo');
    if (id === 'skein') { this.beam(e.x, e.y - 22, t.x, t.y - 16, 0xbfe8ff, 6, 360); this.ring(t.x, t.y - 16, 0xbfe8ff, 1.2); this.damageEnemy(t, Math.round(eatk * 2.6 * rnd(.92, 1.08)), false, '#bfe8ff'); }
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
      const tx = h.x - h.facing * 34, ty = h.y + 8; const d = dist(e.x, e.y, tx, ty);
      const k = d > 260 ? 1 : Math.min(1, dt * 4.5); e.x += (tx - e.x) * k; e.y += (ty - e.y) * k;
      if (Math.abs(tx - e.x) > 2) e.body.setFlipX(tx < e.x);
    }
    e.cd -= dt;
    const t = h.target && !h.target.dead ? h.target : null;
    if (t && e.cd <= 0 && dist(e.x, e.y, t.x, t.y) < 200) {
      e.cd = 1.5; const S = echoStats(this.st, e.id);
      this.proj({ x: e.x, y: e.y - 22, tgt: t, key: 'dot', scale: 1.4, spd: 420, mult: (S.atk + h.atk * .3) / h.atk * .9, tint: ECHOES[e.id].color });
    }
    const k = this.sx('echo_' + e.id) * (this.st.echoes[e.id]?.evo ? 1.25 : 1);
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
      if (d.cd <= 0) { const t = this.nearestEnemy(d.s.x, d.s.y, 230); if (t) { d.cd = .5; this.beam(d.s.x, d.s.y, t.x, t.y - 16, 0x5ff2ff, 2, 100); this.hit(t, .6, 'skill'); } }
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
      if (e.flash > 0) e.body.setTintFill(0xffffff); else e.body.clearTint();
      const D = e.D, sp = D.spd * (e.slow > 0 ? .5 : 1) * (D.boss && e.hp < e.hpMax * .25 ? 1.3 : 1);
      const dh = dist(e.x, e.y, h.x, h.y);
      let mvx = 0, mvy = 0;
      if (!h.dead && !e.aggro && dh < D.aggro && (D.boss || Math.random() < dt * 2)) { e.aggro = true; e.state = 'chase'; }
      if (e.stun > 0) {}
      else if (e.state === 'chase' && !h.dead) {
        const leash = D.boss ? 420 : 380;
        if (dist(e.x, e.y, e.home.x, e.home.y) > leash) { e.state = 'return'; e.aggro = false; }
        else if (dh > D.range + (D.boss ? 30 : 0)) { mvx = (h.x - e.x) / dh; mvy = (h.y - e.y) / dh; }
        else if (e.cd <= 0) this.enemyAttack(e);
        if (D.boss) this.bossLogic(e, dt);
      } else if (e.state === 'return' || (h.dead && e.aggro)) {
        const d = dist(e.x, e.y, e.home.x, e.home.y);
        if (d > 8) { mvx = (e.home.x - e.x) / d; mvy = (e.home.y - e.y) / d; } else { e.state = 'idle'; e.hp = e.hpMax; }
        e.hp = Math.min(e.hpMax, e.hp + e.hpMax * dt * .2);
      } else {
        e.wt -= dt;
        if (e.wt <= 0) { e.wt = rnd(2, 5); const a = rnd(0, Math.PI * 2); e.wander = { x: e.home.x + Math.cos(a) * rnd(10, 70), y: e.home.y + Math.sin(a) * rnd(10, 50) }; }
        if (e.wander) { const d = dist(e.x, e.y, e.wander.x, e.wander.y); if (d > 4) { mvx = (e.wander.x - e.x) / d * .4; mvy = (e.wander.y - e.y) / d * .4; } else e.wander = null; }
      }
      if (!D.boss) for (const o of this.enemies) { if (o === e || o.dead) continue; const d = dist(e.x, e.y, o.x, o.y); if (d < 26 && d > 0) { mvx += (e.x - o.x) / d * .5; mvy += (e.y - o.y) / d * .5; } }
      e.x += mvx * sp * dt; e.y += mvy * sp * dt;
      this.animEnemy(e, dt, Math.abs(mvx) + Math.abs(mvy) > .05, mvx);
      e.setDepth(e.y);
      e.bar.clear();
      if (!D.boss && e.hp < e.hpMax) {
        const w = 34, y = e.y - (e.type === 'glowmoth' ? 66 : e.type === 'crawler' ? 50 : 50);
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
    else if (e.type === 'crawler') { e.body.rotation = moving ? Math.sin(e.t * 20) * .05 : 0; e.body.y = moving ? -Math.abs(Math.sin(e.t * 20)) * 1.5 : 0; }
    else { e.body.setScale(k * (1 + Math.sin(e.t * 2) * .015), k * (1 + Math.sin(e.t * 2 + 1) * .02)); }
  }

  enemyAttack(e) {
    const D = e.D, h = this.hero; e.cd = D.atkCd * rnd(.9, 1.15);
    if (D.ranged) {
      e.body.setTintFill(0xff8ac8); this.time.delayedCall(90, () => e.body && e.body.clearTint());
      this.time.delayedCall(250, () => { if (!e.dead) this.proj({ x: e.x, y: e.y - 40, toHero: true, key: 'spore', spd: 230, dmg: e.atk, tint: 0xff6ab0, life: 2 }); });
      return;
    }
    const lunge = Math.atan2(h.y - e.y, h.x - e.x);
    this.tweens.add({ targets: e.body, x: Math.cos(lunge) * (D.boss ? 16 : 8), duration: 110, yoyo: true });
    this.time.delayedCall(110, () => { if (!e.dead && !h.dead && dist(e.x, e.y, h.x, h.y) < D.range + 30 + (D.boss ? 40 : 0)) { this.hurtHero(e.atk); if (D.boss) this.cameras.main.shake(140, .004); } });
  }

  bossLogic(e, dt) {
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
  brood(e) {
    this.num(e.x, e.y - 170, 'Brood Call', '#ff8ab8', 16);
    for (let i = 0; i < 3; i++) {
      const a = rnd(0, Math.PI * 2); const m = this.spawnEnemy({ type: 'shardling', x: e.x, y: e.y, r: 10, count: 0, boss: true }, { x: e.x + Math.cos(a) * 90, y: e.y + Math.sin(a) * 60 });
      m.lvl = 11; m.hpMax = m.hp = Math.round(ENEMIES.shardling.hp * 3); m.atk = ENEMIES.shardling.atk * 2.2; m.aggro = true; m.state = 'chase'; m.sp = null; m.body.setTint(0xffa0d0);
    }
  }

  // ---------- quests ----------
  updateMarkers() {
    const q = this.quest();
    for (const id in this.npcs) { const n = this.npcs[id]; const on = !!(q && q.kind === 'talk' && q.npc === id); n.mark.setVisible(on); n.mark.setText('!'); }
    const showGeode = q && q.id === 'geode';
    this.geodeGlow.setVisible(!!showGeode);
    const bossIdx = QUESTS.findIndex(q => q.id === 'boss');
    if (!this.boss && this.st.q >= bossIdx && this.now > (this.bossCd || 0) && !this.hero.dead && dist(this.hero.x, this.hero.y, PLACES.arena.x, PLACES.arena.y) < 420) {
      this.spawnEnemy({ type: 'thornmother', x: PLACES.arena.x, y: PLACES.arena.y, r: 1, count: 0, boss: true }, PLACES.arena);
    }
    this.door.setVisible(this.st.q > bossIdx);
    if (this.boss && !this.boss.dead && this.boss.aggro) this.ui.bossBar(this.boss);
  }

  talkTo(id) {
    const q = this.quest();
    if (q && q.kind === 'talk' && q.npc === id) { this.dialogue(q.talk, () => this.completeQuest()); return; }
    const idle = { marr: 'Hunt smart, recruit. Come back in one piece.', sparks: 'Bring me Lumen! I have so many ideas. Some of them are safe!', okafor: 'Rest when you can. Your Echo feels it when you push too hard.' };
    this.dialogue([{ who: id, text: idle[id] }]);
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
    if (r.xp) this.gainXp(r.xp);
    if (r.lumen) { st.lumen += r.lumen; this.ui.lumenBump(); }
    if (r.shards) st.shards += r.shards;
    if (r.geode) st.geodes += r.geode;
    if (r.gear) { const g = makeGear(st.cls, r.gear, Math.max(2, st.lvl), r.gearRar || 1); const cur = st.gear[r.gear]; while (cur && gearValue(r.gear, cur) >= gearValue(r.gear, g)) g.ilvl++; st.gear[r.gear] = g; this.refreshStats(false); this.ui.gearPop(r.gear, g, true); }
    if (r.echo) { st.echoes[r.echo] = { lvl: 1, evo: false }; st.activeEcho = r.echo; this.setEcho(r.echo); this.ring(this.hero.x, this.hero.y - 20, 0xbfe8ff, 3); this.ui.newEcho(r.echo); }
    for (const c of q.codex || []) this.unlockCodex(c);
    sfx('quest');
    this.ui.questDone(q, r);
    st.q++; st.qp = 0;
    const after = () => { this.questChanged(); save(st); };
    if (q.done) this.time.delayedCall(300, () => this.dialogue(q.done, after)); else after();
  }
  questChanged(initial) {
    const q = this.quest();
    if (!q && !this.st.actDone) { this.st.actDone = true; this.st.bounty = { id: 'b' + (this.st.lvl >= 9 ? 3 : this.st.lvl >= 5 ? 2 : 1), prog: 0 }; this.time.delayedCall(800, () => this.ui.actEnd()); }
    if (q && !initial) this.ui.toast('New quest: ' + q.title);
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
    this.ui.toast(`Bounty complete: +${b.lumen} Lumen, +${b.shards} memory`);
    const next = BOUNTIES.filter(x => this.st.lvl >= x.minLvl).pop();
    this.st.bounty = { id: next.id, prog: 0 }; this.ui.quest();
  }
  unlockCodex(id) { if (this.st.codex[id] || !CODEX[id]) return; this.st.codex[id] = true; this.ui.codexNew(id); }

  toast(s) { this.ui.toast(s); }
}
