const AMBIENT = { verge: 0x7590a4, dunes: 0xc4a084, lattice: 0x5c84a4, heartstrand: 0x82788e, tower: 0x66668e };
const PROP_LIGHTS = {
  lamp: [-80, 125, 0xffc27a, .75, .12],
  fire: [-14, 175, 0xff9a40, .85, .25],
  forge: [-30, 120, 0xff8a3a, .7, .2],
  bulb: [-26, 58, 0x7fffe0, .55, 0],
  crystal: [-34, 90, 0x7fc8ff, .6, 0],
  vein: [-14, 70, 0xffb84a, .5, .1],
  geode: [-14, 100, 0x5ff2d0, .7, 0],
  spire: [-150, 240, 0x9ff6ff, .8, 0],
  bigheart: [-120, 330, 0x5fc8ff, .75, 0],
  cone: [-30, 90, 0x7fc8ff, .5, 0],
  marker: [-40, 80, 0xffcf5a, .5, 0]
};

export class Lighting {
  constructor(sc, region) {
    this.sc = sc; this.q = 4; this.lights = []; this.flashes = []; this.t = 0;
    this.amb = AMBIENT[region] || AMBIENT.verge;
    if (!sc.textures.exists('light')) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgb(255,255,255)'); g.addColorStop(.22, 'rgb(204,204,204)'); g.addColorStop(.5, 'rgb(90,90,90)'); g.addColorStop(.78, 'rgb(26,26,26)'); g.addColorStop(1, 'rgb(0,0,0)');
      x.fillStyle = '#000'; x.fillRect(0, 0, 128, 128); x.fillStyle = g; x.fillRect(0, 0, 128, 128); sc.textures.addCanvas('light', c);
    }
    this.rt = null;
  }
  add(x, y, r, col, a = 1, flick = 0) { const L = { x, y, r, col, a, flick, ph: Math.random() * 6.28 }; this.lights.push(L); return L; }
  prop(key, x, y, s = 1) { const d = PROP_LIGHTS[key]; if (d) this.add(x, y + d[0] * s, d[1] * s, d[2], d[3], d[4]); if (key === 'spire') this.add(x, y - 290 * s, 170 * s, 0xbff8ff, .85); if (key === 'hull') for (const o of [-138, 0, 138]) this.add(x + o * s, y - 84 * s, 95 * s, 0xffd080, .8, .05); }
  pool(x, y, r, col, a) { this.add(x, y, r * .6, col, Math.min(.3, a * 1.7)); }
  flash(x, y, r, col, life = .4, a = 1) { this.flashes.push({ x, y, r, col, a, life, max: life }); }
  update(dt) {
    const sc = this.sc, cam = sc.cameras.main, q = this.q, m = 4;
    this.t += dt;
    const vw = cam.width / cam.zoom, vh = cam.height / cam.zoom, vx = cam.midPoint.x - vw / 2, vy = cam.midPoint.y - vh / 2;
    const w = Math.ceil(vw / q) + m * 2, h = Math.ceil(vh / q) + m * 2;
    if (!this.rt || this.rt.width !== w || this.rt.height !== h) {
      const vis = this.rt ? this.rt.visible : true;
      if (this.rt) this.rt.destroy();
      this.rt = sc.add.renderTexture(0, 0, w, h).setOrigin(0).setDepth(4.5e5).setBlendMode(Phaser.BlendModes.MULTIPLY).setVisible(vis);
    }
    const x0 = vx - m * q, y0 = vy - m * q;
    this.rt.setPosition(x0, y0).setScale(q);
    this.rt.fill(this.amb, 1);
    this.rt.beginDraw();
    const R = this.rt, cfg = { scale: 1, tint: 0xffffff, alpha: 1, originX: .5, originY: .5, blendMode: Phaser.BlendModes.ADD, skipBatch: true };
    const stamp = (x, y, r, col, a) => {
      if (a <= .01 || x + r < x0 || y + r < y0 || x - r > x0 + w * q || y - r > y0 + h * q) return;
      const k = Math.min(1, a); cfg.scale = r / q / 64; cfg.tint = (((col >> 16 & 255) * k) << 16) | (((col >> 8 & 255) * k) << 8) | ((col & 255) * k); cfg.alpha = 1;
      R.stamp('light', null, (x - x0) / q, (y - y0) / q, cfg);
    };
    const t = this.t;
    for (const L of this.lights) stamp(L.x, L.y, L.r, L.col, L.a * (1 - L.flick * (.5 + .5 * Math.sin(t * 9 + L.ph) * Math.sin(t * 5.3 + L.ph * 2))));
    const hh = sc.hero;
    if (hh && !hh.dead) { stamp(hh.x, hh.y - 24, 200, 0xd8dce8, .62); stamp(hh.x, hh.y - 24, 90, 0xffffff, .3); }
    if (sc.echo && sc.echo.visible !== false) stamp(sc.echo.x, sc.echo.y - 20, 70, sc.echoColor || 0x9ff6ff, .45);
    for (const p of sc.projs) stamp(p.x, p.y, 60, p.tint || 0xffffff, .7);
    if (sc.boss && !sc.boss.dead) stamp(sc.boss.x, sc.boss.y - 40, 160, 0xffc0d8, .3);
    for (const p of sc.pickups) if (p.o && p.o.active) stamp(p.o.x, p.o.y, 34, p.kind === 'shards' ? 0xc58bff : 0x5ff2d0, .5);
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i]; f.life -= dt;
      if (f.life <= 0) { this.flashes.splice(i, 1); continue; }
      const k = f.life / f.max; stamp(f.x, f.y, f.r * (1.15 - .15 * k), f.col, f.a * k);
    }
    this.rt.endDraw();
  }
}
