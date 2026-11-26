export const WORLD = { w: 1800, h: 3000 };

export const ART = {
  portrait: { marr: 'art/p_marr.webp', sparks: 'art/p_sparks.webp', okafor: 'art/p_okafor.webp', skein: 'art/p_skein.webp', kestrel: 'art/p_kestrel.webp', corvin: 'art/p_corvin.webp', hush: 'art/p_hush.webp', ilse: 'art/p_ilse.webp', bix: 'art/p_bix.webp', pell: 'art/p_pell.webp', tovin: 'art/p_tovin.webp', nessa: 'art/p_nessa.webp' },
  calling: { vanguard: 'art/c_vanguard.webp', railwarden: 'art/c_railwarden.webp', psion: 'art/c_psion.webp', duelist: 'art/c_duelist.webp', shade: 'art/c_shade.webp', mender: 'art/c_mender.webp' },
  face: { vanguard: 'art/f_vanguard.webp', railwarden: 'art/f_railwarden.webp', psion: 'art/f_psion.webp', duelist: 'art/f_duelist.webp', shade: 'art/f_shade.webp', mender: 'art/f_mender.webp' },
  echo: { skein: 'art/e_skein.webp', glimmerkit: 'art/e_glimmerkit.webp', budlet: 'art/e_budlet.webp', rivet: 'art/e_rivet.webp', lumi: 'art/e_lumi.webp' },
  faceAlt: { vanguard_f: 'art/f_vanguard_f.webp', railwarden_f: 'art/f_railwarden_f.webp', psion_m: 'art/f_psion_m.webp', shade_f: 'art/f_shade_f.webp', mender_f: 'art/f_mender_f.webp', duelist_f: 'art/f_duelist_f.webp' },
  avatar: { hunter_m: 'art/av_hunter_m.webp', hunter_f: 'art/av_hunter_f.webp', veteran_m: 'art/av_veteran_m.webp', veteran_f: 'art/av_veteran_f.webp', warden_m: 'art/av_warden_m.webp', warden_f: 'art/av_warden_f.webp', ascendant_m: 'art/av_ascendant_m.webp', ascendant_f: 'art/av_ascendant_f.webp', starborn_m: 'art/av_starborn_m.webp', starborn_f: 'art/av_starborn_f.webp' },
  echoAsc: { skein: 'art/e_skein_asc.webp', glimmerkit: 'art/e_glimmerkit_asc.webp', budlet: 'art/e_budlet_asc.webp', rivet: 'art/e_rivet_asc.webp', lumi: 'art/e_lumi_asc.webp' },
  boss: { thornmother: 'art/b_thornmother.webp', marrowking: 'art/b_marrowking.webp', choir: 'art/b_choir.webp', firstcaptain: 'art/b_firstcaptain.webp' },
  codex: { skein: 'art/e_skein.webp', thornmother: 'art/b_thornmother.webp', echoes: 'art/e_glimmerkit.webp', ribline: 'art/r_dunes.webp', driftborn: 'art/p_kestrel.webp', skimmer: 'art/m_skimmer.webp', hound: 'art/m_hound.webp', syndicate: 'art/p_corvin.webp', quiet: 'art/p_hush.webp', marrowking: 'art/b_marrowking.webp', lattice: 'art/r_lattice.webp', skitter: 'art/m_skitter.webp', husker: 'art/m_husker.webp', leech: 'art/m_leech.webp', choir: 'art/b_choir.webp', hushfile: 'art/p_hush.webp', ledger: 'art/p_corvin.webp', drown: 'art/p_ilse.webp', echoorigin: 'art/e_skein_asc.webp', ossivar: 'art/r_tower.webp', heartstrand: 'art/r_heartstrand.webp', mauler: 'art/m_mauler.webp', archivist: 'art/m_archivist.webp', dredger: 'art/m_dredger.webp', firstcaptain: 'art/b_firstcaptain.webp', firstlanding: 'art/p_tovin.webp', why: 'art/p_hush.webp', relaunch: 'art/p_marr.webp', calf: 'art/p_pell.webp', signature: 'art/r_tower.webp' },
  region: { verge: 'art/title.webp', dunes: 'art/r_dunes.webp', lattice: 'art/r_lattice.webp', heartstrand: 'art/r_heartstrand.webp', tower: 'art/r_tower.webp' },
  title: 'art/title.webp'
};

export const CALLINGS = {
  vanguard: {
    name: 'Vanguard', role: 'Tank · Front line', mentor: 'Captain Ysolde Marr',
    blurb: 'Ark-security blood. Shield up, arc-blade out, and nothing gets past you.',
    base: { hp: 150, atk: 12, def: 8, crit: 0.06 }, per: { hp: 24, atk: 2.4, def: 1.8 },
    speed: 120, range: 46, atkCd: 0.85, attack: 'slash', color: 0xffb14a,
    skills: [
      { id: 'cleave', name: 'Arc Cleave', cd: 5, desc: 'Sweep the arc-blade for 190% damage to every enemy in front of you.' },
      { id: 'bulwark', name: 'Bulwark', cd: 14, desc: 'Raise a hard-light shield worth 30% of your max HP for 6 seconds.' },
      { id: 'slam', name: 'Shockwave', cd: 10, desc: 'Slam the ground for 150% damage around you and stun for 1.2 seconds.' }
    ],
    ult: { id: 'starbreaker', name: 'Starbreaker', desc: 'Leap and crash down for 520% damage around you.' }
  },
  railwarden: {
    name: 'Railwarden', role: 'Ranged · Precision', mentor: 'Old Brannoch',
    blurb: 'Frontier scout. You map the dunes, guard the caravans, and never miss twice.',
    base: { hp: 115, atk: 14, def: 5, crit: 0.12 }, per: { hp: 18, atk: 2.8, def: 1.2 },
    speed: 122, range: 210, atkCd: 1.05, attack: 'rail', color: 0x5ff2ff,
    skills: [
      { id: 'pierce', name: 'Piercing Rail', cd: 6, desc: 'Fire a rail that pierces every enemy in a line for 230% damage.' },
      { id: 'volley', name: 'Scatter Volley', cd: 8, desc: 'Three bolts in a cone, 110% damage each.' },
      { id: 'drone', name: 'Recon Drone', cd: 16, desc: 'Deploy a drone that fires for 60% damage every half second for 8 seconds.' }
    ],
    ult: { id: 'lance', name: 'Orbital Lance', desc: 'Call a beam from orbit: 620% damage around your target.' }
  },
  psion: {
    name: 'Psion', role: 'Area · Resonance', mentor: 'Sister Lio',
    blurb: 'You hear the Choir louder than anyone. Some days it almost sounds like words.',
    base: { hp: 105, atk: 15, def: 4, crit: 0.08 }, per: { hp: 16, atk: 3.0, def: 1.0 },
    speed: 116, range: 170, atkCd: 1.0, attack: 'orb', color: 0xc58bff,
    skills: [
      { id: 'pulse', name: 'Choir Pulse', cd: 6, desc: 'A wave of song: 170% damage to every enemy around you.' },
      { id: 'llance', name: 'Lumen Lance', cd: 7, desc: 'A spear of light for 320% damage to one target.' },
      { id: 'hush', name: 'Hush Field', cd: 13, desc: 'A field that slows enemies and deals 45% damage every half second for 5 seconds.' }
    ],
    ult: { id: 'requiem', name: 'Requiem', desc: 'Sing the dead awake: 380% damage to every enemy on screen.' }
  }
};

CALLINGS.shade = {
  name: 'Shade', role: 'Burst · Crits', mentor: 'Vex',
  blurb: 'Former Syndicate enforcer who walked away. Twin phase-knives, and you are never where they aim.',
  base: { hp: 120, atk: 15, def: 5, crit: 0.18 }, per: { hp: 19, atk: 3.0, def: 1.1 },
  speed: 132, range: 44, atkCd: 0.62, attack: 'knife', color: 0xff5a9a,
  skills: [
    { id: 'blink', name: 'Phase Step', cd: 6, desc: 'Blink behind your target and strike for 240% damage. Always a critical hit.' },
    { id: 'fan', name: 'Knife Fan', cd: 7, desc: 'Throw five phase-knives in a fan, 90% damage each. They pierce.' },
    { id: 'veil', name: 'Shadow Veil', cd: 14, desc: 'For 5 seconds, take 60% less damage and gain 25% crit chance.' }
  ],
  ult: { id: 'eclipse', name: 'Eclipse', desc: 'Dash through up to six nearby enemies for 320% damage each.' }
};
CALLINGS.mender = {
  name: 'Mender', role: 'Healer · Support', mentor: 'Doctor Amara Okafor',
  blurb: 'Lodge field medic. A pulse staff, a med-drone, and the stubbornness to keep everyone breathing.',
  base: { hp: 138, atk: 12, def: 7, crit: 0.06 }, per: { hp: 22, atk: 2.5, def: 1.6 },
  speed: 118, range: 165, atkCd: 0.95, attack: 'pulse', color: 0x5ff2d0,
  skills: [
    { id: 'mend', name: 'Mending Pulse', cd: 8, desc: 'Heal 22% of your max HP and deal 130% damage to every enemy around you.' },
    { id: 'medrone', name: 'Med-drone', cd: 16, desc: 'A drone that heals you 3% per second and zaps enemies for 55% damage. Lasts 8 seconds.' },
    { id: 'stasis', name: 'Stasis Field', cd: 12, desc: 'A field that slows enemies and deals 45% damage every half second for 5 seconds.' }
  ],
  ult: { id: 'lifeline', name: 'Lifeline', desc: 'Fully heal, gain a shield worth 40% of max HP, and burst for 320% damage around you.' }
};
CALLINGS.duelist = {
  name: 'Duelist', role: 'Fast · Single target', mentor: 'Kestrel',
  blurb: 'Driftborn sharpshooter. Twin pistols, a wide hat, and a habit of finishing fights early.',
  base: { hp: 112, atk: 13, def: 5, crit: 0.14 }, per: { hp: 17, atk: 2.7, def: 1.1 },
  speed: 126, range: 185, atkCd: 0.55, attack: 'pistol', color: 0xffcf5a,
  skills: [
    { id: 'quickdraw', name: 'Quickdraw', cd: 5, desc: 'Fan the hammer: four shots at your target, 85% damage each.' },
    { id: 'ricochet', name: 'Ricochet', cd: 8, desc: 'A round that bounces between up to five enemies, 150% damage each.' },
    { id: 'roll', name: 'Dune Roll', cd: 10, desc: 'Roll clear of danger. Your next three shots are critical hits.' }
  ],
  ult: { id: 'deadeye', name: 'Deadeye', desc: 'Mark up to five enemies on screen and fire: 460% damage to each.' }
};

export const LOCKED_CALLINGS = [];

export const ENEMIES = {
  shardling: { name: 'Shardling', lvl: [1, 3], hp: 40, atk: 6, spd: 62, xp: 12, lumen: [2, 4], range: 26, atkCd: 1.4, aggro: 110, radius: 16 },
  glowmoth: { name: 'Glow-moth', lvl: [4, 7], hp: 62, atk: 9, spd: 70, xp: 22, lumen: [3, 6], range: 120, atkCd: 1.9, aggro: 150, radius: 16, ranged: true },
  crawler: { name: 'Thorn-crawler', lvl: [7, 10], hp: 120, atk: 14, spd: 56, xp: 36, lumen: [5, 9], range: 30, atkCd: 1.5, aggro: 130, radius: 20 },
  thornmother: { name: 'The Thornmother', lvl: [12, 12], hp: 3000, atk: 24, spd: 42, xp: 900, lumen: [220, 220], range: 70, atkCd: 1.7, aggro: 320, radius: 52, boss: true, sub: 'Guardian of the old roots' },
  skimmer: { name: 'Sand-skimmer', lvl: [13, 16], hp: 80, atk: 16, spd: 92, xp: 40, lumen: [8, 13], range: 30, atkCd: 1.3, aggro: 150, radius: 20 },
  hound: { name: 'Scrap-hound', lvl: [16, 19], hp: 130, atk: 20, spd: 66, xp: 55, lumen: [10, 16], range: 32, atkCd: 1.5, aggro: 140, radius: 22 },
  sdrone: { name: 'Syndicate drone', lvl: [18, 21], hp: 90, atk: 16, spd: 60, xp: 60, lumen: [12, 18], range: 150, atkCd: 1.8, aggro: 170, radius: 18, ranged: true, shot: 'red' },
  marrowking: { name: 'The Marrowking', lvl: [22, 22], hp: 9000, atk: 58, spd: 48, xp: 1300, lumen: [700, 700], range: 90, atkCd: 1.8, aggro: 340, radius: 64, boss: true, sub: 'Nest-warden of Kharos' },
  skitter: { name: 'Lattice Skitter', lvl: [23, 26], hp: 150, atk: 24, spd: 86, xp: 70, lumen: [14, 20], range: 30, atkCd: 1.3, aggro: 150, radius: 20 },
  husker: { name: 'Drowned Husker', lvl: [26, 29], hp: 260, atk: 33, spd: 44, xp: 90, lumen: [16, 24], range: 34, atkCd: 2, aggro: 130, radius: 22 },
  leech: { name: 'Memory Leech', lvl: [28, 31], hp: 150, atk: 25, spd: 66, xp: 95, lumen: [18, 26], range: 150, atkCd: 2, aggro: 170, radius: 20, ranged: true, shot: 'blue' },
  mauler: { name: 'Saltback Mauler', lvl: [33, 36], hp: 340, atk: 40, spd: 60, xp: 110, lumen: [20, 28], range: 36, atkCd: 1.8, aggro: 160, radius: 26, charge: true },
  archivist: { name: 'Hollow Archivist', lvl: [36, 39], hp: 230, atk: 34, spd: 50, xp: 120, lumen: [22, 30], range: 165, atkCd: 2, aggro: 175, radius: 22, ranged: true, shot: 'page' },
  dredger: { name: 'Memory Dredger', lvl: [38, 41], hp: 300, atk: 38, spd: 72, xp: 130, lumen: [24, 32], range: 40, atkCd: 1.7, aggro: 160, radius: 24, steal: true },
  firstcaptain: { name: 'The First Captain', lvl: [42, 42], hp: 46000, atk: 150, spd: 56, xp: 3000, lumen: [1400, 1400], range: 175, atkCd: 1.7, aggro: 380, radius: 30, boss: true, ranged: true, shot: 'rifle', sub: 'Marr, before she forgot' },
  beacon: { name: 'Recall Beacon', lvl: [42, 42], hp: 1000, atk: 0, spd: 0, xp: 0, lumen: [0, 0], range: 0, atkCd: 99, aggro: 0, radius: 18, object: true },
  choir: { name: 'The Choir Below', lvl: [32, 32], hp: 22000, atk: 84, spd: 0, xp: 2200, lumen: [1100, 1100], range: 130, atkCd: 2.2, aggro: 380, radius: 70, boss: true, sub: 'What the reef remembers' }
};

export const REGIONS = {
  verge: {
    name: 'Glasswood Verge', hub: 'Landfall', lvl: '1 to 12', w: 1800, h: 3000, bg: '#0b2226', ground: 'ground', path: 'path', motes: [0x5ff2d0, 0xff8ab8, 0x9ff6ff],
    paths: [[[900, 2930], [900, 2600], [900, 2380], [820, 2160], [770, 1950], [900, 1720], [1040, 1480], [960, 1200], [820, 960], [860, 700], [900, 470]]],
    spawns: [
      { type: 'shardling', x: 900, y: 2040, r: 300, count: 10 },
      { type: 'glowmoth', x: 860, y: 1420, r: 330, count: 9 },
      { type: 'crawler', x: 920, y: 860, r: 320, count: 9 }
    ],
    places: { start: { x: 900, y: 2630 }, arrive: { x: 900, y: 2440 }, spire: { x: 900, y: 2380 }, marr: { x: 760, y: 2590 }, sparks: { x: 1050, y: 2600 }, okafor: { x: 1000, y: 2700 }, geode: { x: 1160, y: 2100 }, roots: { x: 900, y: 470 }, arena: { x: 900, y: 360 } },
    npcs: ['marr', 'sparks', 'okafor'],
    boss: { type: 'thornmother', at: 'arena', quest: 'boss' }, music: 'verge'
  },
  dunes: {
    name: 'Ribline Dunes', hub: 'Driftborn Camp', lvl: '13 to 22', w: 2000, h: 2800, bg: '#7a4a26', ground: 'sand', path: 'sandpath', motes: [0xffd9a0, 0xffe8c8, 0x5ff2d0],
    paths: [[[1000, 2780], [1000, 2450], [1000, 2050], [1180, 1820], [1050, 1560], [820, 1420], [900, 1220], [1080, 1100], [1000, 820], [1000, 520]], [[820, 1420], [600, 1200], [380, 960]]],
    spawns: [
      { type: 'skimmer', x: 1000, y: 2020, r: 320, count: 10 },
      { type: 'hound', x: 620, y: 1560, r: 280, count: 9 },
      { type: 'sdrone', x: 1230, y: 1180, r: 240, count: 8 }
    ],
    places: { start: { x: 1000, y: 2560 }, arrive: { x: 1000, y: 2480 }, spire: { x: 1000, y: 2420 }, kestrel: { x: 885, y: 2545 }, corvin: { x: 940, y: 1250 }, hush: { x: 300, y: 860 }, wreck: { x: 1520, y: 1800 }, dig: { x: 1210, y: 1060 }, canyon: { x: 330, y: 930 }, hollow: { x: 1000, y: 560 }, arena: { x: 1000, y: 420 } },
    npcs: ['kestrel', 'corvin', 'hush'],
    silent: { x: 300, y: 900, r: 250 },
    boss: { type: 'marrowking', at: 'arena', quest: 'ii_boss' }, music: 'dunes', unlock: 'ii_travel'
  },
  lattice: {
    name: 'Sunken Lattice', hub: 'Ribgate Camp', lvl: '23 to 32', w: 2000, h: 2800, bg: '#06222e', ground: 'reef', path: 'reefpath', motes: [0x7fc8ff, 0x5ff2d0, 0xbfe8ff],
    paths: [[[1000, 2780], [1000, 2450], [1000, 2140], [880, 1920], [1000, 1720], [1300, 1660], [1420, 1460], [1180, 1250], [1000, 1060], [1000, 820], [1000, 560]], [[880, 1920], [700, 1580], [480, 1330], [600, 1080], [1000, 1060]], [[1180, 1250], [1330, 1020]]],
    spawns: [
      { type: 'skitter', x: 720, y: 1960, r: 280, count: 10 },
      { type: 'husker', x: 1460, y: 1420, r: 230, count: 9 },
      { type: 'leech', x: 1000, y: 980, r: 230, count: 9 }
    ],
    places: { start: { x: 1000, y: 2580 }, arrive: { x: 1000, y: 2500 }, spire: { x: 1000, y: 2440 }, marr: { x: 870, y: 2565 }, okafor: { x: 1140, y: 2590 }, bix: { x: 1095, y: 2150 }, ribs: { x: 1000, y: 2160 }, ilse: { x: 1560, y: 1700 }, pump: { x: 1540, y: 1650 }, pell: { x: 640, y: 1570 }, hush: { x: 440, y: 1300 }, shrine: { x: 450, y: 1260 }, confluence: { x: 620, y: 1070 }, corvin: { x: 1350, y: 1010 }, sluice: { x: 1380, y: 970 }, heartgate: { x: 1000, y: 650 }, heart: { x: 1000, y: 560 }, arena: { x: 1000, y: 380 } },
    npcs: ['marr', 'okafor', 'bix', 'ilse', 'pell', 'hush', 'corvin'],
    boss: { type: 'choir', at: 'arena', quest: 'iii_boss' }, music: 'lattice', unlock: 'iii_travel'
  },
  heartstrand: {
    name: 'The Heartstrand', hub: 'Heartstrand Camp', lvl: '33 to 42', w: 2000, h: 2800, bg: '#2a2e34', ground: 'shore', path: 'shorepath', motes: [0x9ff6ff, 0x7fc8ff, 0xd8e0e8],
    paths: [[[1000, 2780], [1000, 2450], [1000, 2120], [820, 1880], [760, 1600], [860, 1360], [1000, 1250], [1000, 900], [1000, 520]], [[820, 1880], [560, 1640], [400, 1520]], [[1000, 2120], [1300, 2010]], [[1000, 1250], [1300, 1320], [1540, 1390]], [[1000, 1100], [760, 1050], [620, 1010]], [[1000, 820], [1350, 700], [1600, 640]]],
    spawns: [
      { type: 'mauler', x: 680, y: 2120, r: 250, count: 9 },
      { type: 'archivist', x: 1420, y: 1120, r: 210, count: 8 },
      { type: 'dredger', x: 1280, y: 880, r: 220, count: 9 }
    ],
    places: { start: { x: 1000, y: 2580 }, arrive: { x: 1000, y: 2500 }, spire: { x: 1000, y: 2440 }, marr: { x: 860, y: 2560 }, okafor: { x: 1150, y: 2590 }, heart: { x: 1000, y: 1870 }, core: { x: 1000, y: 1640 }, canyon: { x: 400, y: 1520 }, hush: { x: 410, y: 1470 }, nose: { x: 1300, y: 2010 }, vault: { x: 1540, y: 1390 }, tovin: { x: 1620, y: 1330 }, mill: { x: 620, y: 1010 }, corvin: { x: 660, y: 980 }, nessa: { x: 560, y: 1045 }, steps: { x: 1000, y: 1250 }, marker: { x: 1600, y: 640 }, kestrel: { x: 1660, y: 680 }, pell: { x: 900, y: 1880 }, arena: { x: 1000, y: 420 } },
    npcs: ['marr', 'okafor', 'hush', 'corvin', 'nessa', 'tovin', 'kestrel', 'pell'],
    boss: { type: 'firstcaptain', at: 'arena', quest: 'iv_boss' }, music: 'lattice', unlock: 'iv_travel'
  },
  tower: {
    name: 'Ossivar’s Spire', hub: 'Endless floors', lvl: 'endless', w: 1200, h: 1500, bg: '#07070f', ground: 'towerfloor', path: 'path', motes: [0xffe6a0, 0x9ff6ff, 0xc58bff],
    paths: [], spawns: [],
    places: { start: { x: 600, y: 1180 }, arrive: { x: 600, y: 1180 }, spire: { x: 600, y: 1420 }, arena: { x: 600, y: 760 } },
    npcs: [], tower: true, boss: null, music: 'theme'
  }
};
export const TOWER_POOL = ['shardling', 'glowmoth', 'crawler', 'skimmer', 'hound', 'sdrone', 'skitter', 'husker', 'leech', 'mauler', 'archivist', 'dredger'];
export const TOWER_GUARDS = ['thornmother', 'marrowking', 'choir', 'firstcaptain'];

export const SPAWNS = REGIONS.verge.spawns;
export const PLACES = REGIONS.verge.places;

export const NPCS = {
  marr: { name: 'Captain Ysolde Marr', short: 'Marr', title: 'Beacon Lodge', color: '#ffb14a' },
  sparks: { name: 'Tessa “Sparks” Ruiz', short: 'Sparks', title: 'Landfall Forge', color: '#ff8a5a' },
  okafor: { name: 'Dr. Amara Okafor', short: 'Okafor', title: 'Lodge Mender', color: '#5ff2d0' },
  skein: { name: 'Skein', short: 'Skein', title: '???', color: '#bfe8ff' },
  kestrel: { name: 'Kestrel', short: 'Kestrel', title: 'Driftborn guide', color: '#ffb86a' },
  corvin: { name: 'Corvin Hale', short: 'Corvin', title: 'Cindermark Syndicate', color: '#ff7a5a' },
  hush: { name: 'Mother Hush', short: 'Hush', title: 'The Quiet', color: '#b9c7d2' },
  ilse: { name: 'Ilse Vane', short: 'Ilse', title: 'Lattice warden', color: '#7fc8ff' },
  bix: { name: 'Tomas \u201cBix\u201d Rey', short: 'Bix', title: 'Diver', color: '#5ff2d0' },
  pell: { name: 'Pell', short: 'Pell', title: 'Driftborn', color: '#ffd9a0' },
  tovin: { name: 'Tovin Hale', short: 'Tovin', title: 'First-landing pilot', color: '#9fc8ff' },
  nessa: { name: 'Nessa Quill', short: 'Nessa', title: 'Syndicate broker', color: '#d9a45a' },
  you: { name: 'You', short: 'You', title: '', color: '#e8f6ff' }
};

export const ECHOES = {
  skein: { name: 'Skein', family: 'Vaelborn', color: 0xbfe8ff, atk: 7, per: 1.5, skill: { name: 'Starlight Beam', cd: 8, desc: 'A beam of old light for 260% damage.' }, blurb: 'A sliver of something ancient. It chose you, and it will not say why.' },
  glimmerkit: { name: 'Glimmerkit', family: 'Fauna', color: 0x5ff2d0, atk: 6, per: 1.3, skill: { name: 'Dash Bite', cd: 6, desc: 'Dash through a target for 210% damage.' }, blurb: 'Friendly, fast, and always staring at the sky.' },
  budlet: { name: 'Budlet', family: 'Flora', color: 0xff8ab8, atk: 4, per: 0.9, skill: { name: 'Mend Spores', cd: 10, desc: 'Heal you for 14% of your max HP.' }, blurb: 'Remembers a garden that grew inside a starship.' },
  rivet: { name: 'Rivet', family: 'Machine', color: 0xffcf5a, atk: 5, per: 1.0, skill: { name: 'Patch Shield', cd: 12, desc: 'Shield you for 16% of your max HP.' }, blurb: 'A repair drone that remembers its passengers. All of them.' },
  lumi: { name: 'Lumi', family: 'Tide', color: 0x7fc8ff, atk: 5, per: 1.2, skill: { name: 'Tide Pulse', cd: 9, desc: '150% damage to every enemy near Lumi.' }, blurb: 'Drifts like it is still underwater. Hums when it is happy.' }
};
ECHOES.skein.ascend = 'i ran so the rest could stay sleeping.';
ECHOES.glimmerkit.ascend = 'i stole the light, then hid in it.';
ECHOES.budlet.ascend = 'i was the hand that stayed behind.';
ECHOES.rivet.ascend = 'i held the door while worlds fell through.';
ECHOES.lumi.ascend = 'i was brightest before i learned fear.';
export const HATCHABLE = ['glimmerkit', 'budlet', 'rivet', 'lumi'];

export const SLOTS = [
  { id: 'weapon', name: 'Weapon', stat: 'atk' },
  { id: 'armor', name: 'Armor', stat: 'hp' },
  { id: 'implant', name: 'Implant', stat: 'crit' },
  { id: 'charm', name: 'Charm', stat: 'def' }
];
export const RARITY = [
  { name: 'Common', mult: 1, color: '#b9c7d2' },
  { name: 'Fine', mult: 1.3, color: '#5fe08a' },
  { name: 'Rare', mult: 1.7, color: '#5fb8ff' },
  { name: 'Epic', mult: 2.3, color: '#c58bff' }
];
export const GEAR_NAMES = {
  vanguard: { weapon: ['Arc-blade', 'Lodge Cutter', 'Hull-breaker', 'Starfall Edge'], armor: ['Plate Vest', 'Bulkhead Mail', 'Ark Warden Plate', 'Vaelbone Aegis'], implant: ['Link Spur', 'Choir Splice', 'Resonant Core', 'Wyrm Sync'], charm: ['Brass Token', 'Lantern Pin', 'Captain’s Seal', 'Ossivar Shard'] },
  railwarden: { weapon: ['Rail Carbine', 'Dune Longrail', 'Ribline Repeater', 'Starfall Lance'], armor: ['Scout Duster', 'Sandglass Coat', 'Caravan Mantle', 'Vaelbone Shroud'], implant: ['Link Spur', 'Range Splice', 'Hawkeye Core', 'Wyrm Sync'], charm: ['Brass Token', 'Compass Pin', 'Brannoch’s Bullet', 'Ossivar Shard'] },
  shade: { weapon: ['Phase Knives', 'Quietsteel Pair', 'Veilcutters', 'Starfall Fangs'], armor: ['Night Wrap', 'Dustveil Leathers', 'Syndicate Shadowcoat', 'Vaelbone Shroud'], implant: ['Link Spur', 'Reflex Splice', 'Phase Core', 'Wyrm Sync'], charm: ['Brass Token', 'Broken Badge', 'Vex’s Coin', 'Ossivar Shard'] },
  mender: { weapon: ['Pulse Staff', 'Lifeline Rod', 'Choir Caduceus', 'Starfall Crook'], armor: ['Field Coat', 'Medic’s Mantle', 'Lodge Surgeon Plate', 'Vaelbone Vestment'], implant: ['Link Spur', 'Vitals Splice', 'Mending Core', 'Wyrm Sync'], charm: ['Brass Token', 'Suture Pin', 'Okafor’s Lens', 'Ossivar Shard'] },
  duelist: { weapon: ['Twin Irons', 'Dune Repeaters', 'Ribline Pair', 'Starfall Sixes'], armor: ['Trail Duster', 'Sandrunner Coat', 'Caravan Longcoat', 'Vaelbone Mantle'], implant: ['Link Spur', 'Deadeye Splice', 'Gunsight Core', 'Wyrm Sync'], charm: ['Brass Token', 'Lucky Shell', 'Kestrel’s Feather', 'Ossivar Shard'] },
  psion: { weapon: ['Focus Orb', 'Choir Prism', 'Hymn Lantern', 'Starfall Halo'], armor: ['Pilgrim Robe', 'Glasswood Vestment', 'Lattice Raiment', 'Vaelbone Veil'], implant: ['Link Spur', 'Echo Splice', 'Chorus Core', 'Wyrm Sync'], charm: ['Brass Token', 'Moth-wing Pin', 'Lio’s Bell', 'Ossivar Shard'] }
};

export const CODEX = {
  landfall: { title: 'Landfall', src: 'Concord welcome placard', text: 'Welcome to Landfall, first and finest city of Aurelis, built inside the hull of the colony ark Meridian. Population 41,000. Please keep to marked walkways. The bridge deck is closed for your safety.' },
  lumen: { title: 'Lumen', src: 'Concord Grid Bureau, public notice', text: 'Lumen is safe, clean and renewable. One shard powers a household for a week. Please return spent shards to your district depot for recycling. Do not stare into a shard for longer than a minute.' },
  spire: { title: 'The Spires', src: 'Lodge field guide', text: 'Crystal towers grown from the spines of the fallen Vael. Your Lumen-link syncs with the nearest Spire. If you fall in the field, it pulls you back. Nobody knows why the Spires agreed to do this.' },
  shardling: { title: 'Shardling', src: 'Lodge field guide', text: 'Small, round, and covered in crystal. Harmless alone, annoying in groups. They hop toward anything that glows, which includes you.' },
  skein: { title: 'Skein', src: 'no source', text: 'you were not the first we called. you are the first who answered.' },
  glasswood: { title: 'Glasswood Verge', src: 'Driftborn saying', text: 'The trees are the feathers of Seyrith, who fell first. At dusk they remember falling. Do not sleep under them at dusk.' },
  glowmoth: { title: 'Glow-moth', src: 'Lodge field guide', text: 'Their wing-dust stores light for days. Menders use it to read Lumen in the blood. The moths spit when cornered, and the spit stings.' },
  echoes: { title: 'Echoes', src: 'Dr. Okafor, intake notes', text: 'An Echo is a memory that found a body. It bonds by choice, and it can leave by choice. Treat it like a partner and it will fight like one.' },
  crawler: { title: 'Thorn-crawler', src: 'Lodge field guide', text: 'Armored, slow, stubborn. Crawlers have been gathering near the old roots in the north for a month. Nobody has asked them why.' },
  thornmother: { title: 'The Thornmother', src: 'recovered Lodge log, Hunter Pell', text: 'It isn’t angry. That’s the part nobody tells you. It’s protecting something under the roots, and it looked at me like I should have known what.' },
  vael: { title: 'The Vael', src: 'Captain Marr', text: 'Living ships, recruit. Big as mountain ranges. Nine of them fell here twelve thousand years ago. We live in their bones and burn their memories for light, and most days I try not to think about that.' },
  ribline: { title: 'The Ribline Dunes', src: 'Driftborn saying', text: 'Walk between the ribs, never under them. Sing when you cross the hollow one, so it knows you are still alive.' },
  driftborn: { title: 'The Driftborn', src: 'Concord census note, struck through', text: 'Nomads of the dunes, descended from ark colonists who walked out of Landfall in the first decade. Population unknown. Do not count them; they find it rude.' },
  skimmer: { title: 'Sand-skimmer', src: 'Lodge field guide', text: 'Glides an inch above the sand on bone-white fins. Curious, fast, territorial. A skimmer that circles you twice has already decided you are a problem.' },
  hound: { title: 'Scrap-hound', src: 'Lodge field guide', text: 'Old salvage drones that went feral and kept working. They still collect Lumen. Nobody remembers telling them where to bring it.' },
  syndicate: { title: 'The Cindermark Syndicate', src: 'Syndicate recruitment flyer', text: 'Cheap power for every home on Aurelis. Good wages, hot meals, and the proudest work on the planet. Ask about our family housing in the dig towns.' },
  sdrone: { title: 'Syndicate drone', src: 'Syndicate equipment tag', text: 'Model C-9 perimeter unit. Property of Cindermark. Authorized to respond to trespass. Do not feed.' },
  lumenmemory: { title: 'Lumen (unprinted)', src: 'your own notes, the dig', text: 'Lumen is memory. The extractor pulled light out of Kharos and an Echo faded as the crate filled. Every lamp in Landfall burns someone\u2019s life.' },
  silentzone: { title: 'Silent zone', src: 'Dr. Okafor, field notes', text: 'Three hunters back from the quiet canyon. No injuries. Cannot remember their own children\u2019s names. Their Echoes will not come near them.' },
  quiet: { title: 'The Quiet', src: 'Mother Hush', text: 'Out there the Choir sings to you. In here you can hear yourself think. Ask yourself who taught the Vael to sing.' },
  hollowrib: { title: 'The hollow rib', src: 'Kestrel', text: 'Driftborn kids learn where it is before they can walk, and they learn never to go inside. Turns out something was living in there the whole time.' },
  marrowking: { title: 'The Marrowking', src: 'Kestrel', text: 'It wasn\u2019t stealing the Lumen. It was burying it, deep in Kharos\u2019s spine, as far from that canyon as it could get.' },
  ossivar: { title: 'Ossivar’s Spire', src: 'Lodge founder Aldren Vey, last log', text: 'The eldest stands upright, and every floor of his spine remembers a fight. I am going to the top. If the Lodge reads this, do not follow me until you are ready.' },
  bridge: { title: 'Meridian bridge deck', src: 'maintenance tag, Sparks', text: 'DO NOT OPEN. I mean it. It’s humming again.' },
  lattice: { title: 'The Sunken Lattice', src: 'Lodge survey, Act III', text: 'A star-dragon’s ribcage, half drowned, grown through with blue crystal. The tide moves hourly. The camp moves with it.' },
  drown: { title: 'Why Dragons Drown', src: 'Ilse Vane, warden’s log', text: 'A star-dragon in pain seeks deep water. Pressure dulls the memories in its bones. It stays submerged until the loudest memory fades.' },
  drownedlumen: { title: 'Drowned Lumen', src: 'Doctor Amara Okafor, field notes', text: 'Waterlogged Lumen plays memories slower and quieter. Voices sound younger underwater. Several samples repeated names none of us remember using.' },
  ledger: { title: 'Corvin’s Ledger', src: 'Syndicate crate manifest, recovered', text: 'Every missing crate is marked delivered, not sold. Destination is always blank. Handwriting underneath reads: for the quiet, keep it quiet.' },
  tags: { title: 'The First Meridian Tags', src: 'Sparks, engineering report', text: 'Recovered suit tags predate our launch records by eleven years. Serial numbers match living colonists. Either the records lie, or we do.' },
  hushfile: { title: 'Mother Hush', src: 'Captain Marr, personal note', text: 'Hush was listed as Meridian’s memory archivist. Officially, she died during landing. She claims she chose the canyon instead.' },
  echoorigin: { title: 'What Echoes Are', src: 'Unknown, scratched inside Pell’s helmet', text: 'Echo creatures form when a dragon loses part of itself. They stay small by forgetting. If reminded fully, they may grow again.' },
  skitter: { title: 'Lattice Skitter', src: 'Bix, dive notes', text: 'Crystal crabs that nest in the shallows. They build with stolen Lumen, and only keep the shards that remember drowning.' },
  husker: { title: 'Drowned Husker', src: 'Ilse Vane', text: 'Old colonist suits full of water and light. They repeat orders nobody gave in this lifetime. Do not answer them.' },
  leech: { title: 'Memory Leech', src: 'Doctor Amara Okafor', text: 'Eels with clear bellies full of other people’s memories. They drain Lumen and carry it deeper than Hush’s nets can reach.' },
  choir: { title: 'The Choir Below', src: 'Pell', text: 'Faces in the rib. They sing what they took. It sounded like my mother, and I never met my mother.' },
  vey10: { title: 'The First Ten', src: 'Aldren Vey, climb log 1', text: 'Spine is hollow inside. Steps are worn smooth. Someone climbed this long before me.' },
  vey20: { title: 'Supplies', src: 'Aldren Vey, climb log 4', text: 'Left food at floor fifteen. Too heavy now. The tower provides water. It tastes like rain.' },
  vey30: { title: 'Windows', src: 'Aldren Vey, climb log 7', text: 'Vertebrae have openings like windows. Country looks smaller. Saw the Meridian wreck. We parked badly.' },
  vey40: { title: 'Other Climbers', src: 'Carving found beside the steps', text: 'Names cut deep into bone. Hundreds of them. None are dated. None are Lodge.' },
  vey50: { title: 'Halfway Is a Lie', src: 'Aldren Vey, climb log 12', text: 'Floor fifty. Breathing hurts. Knee is worse. Found my own boot print heading down.' },
  vey60: { title: 'The Quiet Floors', src: 'Aldren Vey, climb log 15', text: 'No enemies since forty. That worries me more. My Echo stopped talking at fifty-eight.' },
  vey70: { title: 'Camp', src: 'Aldren Vey, unsent letter to Marr', text: 'Found a camp. Bedroll still warm. Nobody here. If you read this, I borrowed their rope.' },
  vey80: { title: 'Fresh Dust', src: 'Writing traced in dust, no author', text: 'Do not count the floors out loud. It adds one when you do.' },
  vey90: { title: 'Vey, Slower', src: 'Aldren Vey, climb log 21', text: 'Hands shake now. Writing takes two tries. Something above keeps pace with me.' },
  vey100: { title: 'Not the Top', src: 'Aldren Vey, final recovered log', text: 'Floor one hundred is another door. Locked from above. Heard myself knock back. Then I stopped recording.' },
  heartstrand: { title: 'The Heartstrand', src: 'Lodge survey, Act IV', text: 'A gray beach where the canyon river meets the sea. A dragon heart the size of a hill lies on it, still beating.' },
  mauler: { title: 'Saltback Mauler', src: 'Kestrel, hunting notes', text: 'Big, crystal grown through the fur. They charge toward the heartbeat and feed between beats. Count the beats.' },
  archivist: { title: 'Hollow Archivist', src: 'Sparks, field sketch', text: 'Vault drones built from paper-thin crystal sheets. Every sheet is a file. They throw the pages at you.' },
  dredger: { title: 'Memory Dredger', src: 'Pell', text: 'Long arms, longer nets. They steal whatever you are holding onto, then run it to the heart.' },
  firstcaptain: { title: 'The First Captain', src: 'Captain Marr', text: 'I gave Hush the worst of me so I could keep working. The heart found it, and gave it a rifle.' },
  firstlanding: { title: 'First Landing', src: 'Tovin Hale, recorded statement', text: 'We landed cleanly eleven years before the remembered crash. We built the vault, met the dragons, made mistakes.' },
  why: { title: 'Why We Forgot', src: 'Mother Hush, archivist note', text: 'The heart learned names from harvested memories. Named people could be called, controlled, and emptied.' },
  relaunch: { title: 'The Relaunch Order', src: 'Captain Marr, first-landing log', text: 'Wipe the crew. Relaunch with the crew asleep and Corvin awake. Crash us again where nobody will dig honestly.' },
  calf: { title: 'The Calf', src: 'Pell, listening session transcript', text: 'The calf died under falling Meridian debris. It was an accident. The heart never believed us.' },
  cones: { title: 'Two Nose Cones', src: 'Sparks, engineering report', text: 'Both cones are original Meridian parts, same serial. One was replaced before relaunch and buried deliberately.' },
  signature: { title: 'The Signature Above', src: 'Unknown, vault file copy', text: 'Every first-landing order carries one extra signature. Aldren Vey signed before the Lodge existed.' }
};

const D = (who, text) => ({ who, text });

export const QUESTS = [
  { id: 'arrive', title: 'Arrival', goal: 'Talk to Captain Marr', kind: 'talk', npc: 'marr', reward: { xp: 20, lumen: 20 }, codex: ['landfall'],
    talk: [
      D('marr', 'So you’re the new recruit. Implant took? Good. Most people pass out. You only swayed a little.'),
      D('marr', 'Welcome to the Beacon Lodge. We hunt so the rest of Landfall doesn’t have to.'),
      D('marr', 'Go see Sparks at the forge. She’ll kit you out. Try not to let her talk your ear off.')
    ] },
  { id: 'kit', title: 'Kit Up', goal: 'Talk to Sparks at the forge', kind: 'talk', npc: 'sparks', reward: { xp: 20, lumen: 30, gear: 'weapon' },
    talk: [
      D('sparks', 'Fresh recruit! Okay okay okay. Hold still. Calibrating. Done. Here, take this, it’s mostly not on fire.'),
      D('sparks', 'Your gear runs on Lumen, same as the lamps. Bring me Lumen and I’ll make it better. That’s the whole deal. That’s my whole life.'),
      D('sparks', 'Shardlings are out past the Spire. Go poke some. Your link’ll pull you back to the Spire if they poke you harder.')
    ] },
  { id: 'hunt1', title: 'First Hunt', goal: 'Hunt Shardlings', kind: 'hunt', enemy: 'shardling', count: 5, reward: { xp: 60, lumen: 40 }, codex: ['spire', 'lumen'],
    done: [D('you', 'Five down. There’s something glowing by the rocks to the east.')] },
  { id: 'geode', title: 'Something in the Geode', goal: 'Inspect the glowing geode', kind: 'inspect', place: 'geode', reward: { xp: 60, echo: 'skein' }, codex: ['skein'],
    talk: [
      D('you', 'A geode, split open. The light inside is moving.'),
      D('skein', '...'),
      D('skein', 'there you are.'),
      D('you', 'It’s climbing onto my arm. My implant is burning. It’s, it’s bonding. I didn’t do anything!')
    ] },
  { id: 'report', title: 'Report In', goal: 'Return to Captain Marr', kind: 'talk', npc: 'marr', reward: { xp: 40, lumen: 30, gear: 'armor' }, codex: ['vael'],
    talk: [
      D('marr', 'That’s an Echo. On your arm. On your first day.'),
      D('marr', 'Echoes don’t bond on their own. They don’t. I’ve been doing this for thirty years.'),
      D('marr', 'Keep it quiet. Go see Dr. Okafor. And recruit? Don’t let anyone from the Syndicate see it.')
    ] },
  { id: 'checkup', title: 'Check-up', goal: 'Talk to Dr. Okafor', kind: 'talk', npc: 'okafor', reward: { xp: 30 }, codex: ['echoes'],
    talk: [
      D('okafor', 'Hold out your arm. Thank you. Hm. The link is stable. The Echo is… unusual. Its pattern doesn’t match anything in our records.'),
      D('okafor', 'I need glow-moth dust to read it properly. The moths nest in the hollow north of the meadow. Ten should do.'),
      D('skein', 'she is kind. she is afraid. she is right to be.')
    ] },
  { id: 'moths', title: 'Moth Dust', goal: 'Hunt Glow-moths', kind: 'hunt', enemy: 'glowmoth', count: 10, reward: { xp: 120, lumen: 60, shards: 5 }, codex: ['glowmoth', 'glasswood'] },
  { id: 'dust', title: 'Deliver the Dust', goal: 'Bring the dust to Dr. Okafor', kind: 'talk', npc: 'okafor', reward: { xp: 60, lumen: 40, geode: 1, gear: 'charm' },
    talk: [
      D('okafor', 'Perfect. Let me see… the dust lights up along every line of its pattern. This Echo remembers a great deal. More than it should.'),
      D('okafor', 'Take this. A Lumen geode from my own stock. Hatch it at the Echo bay. Every hunter should have a partner they chose for themselves.'),
      D('okafor', 'And go see Sparks. If something is waking up in the north, you will want better gear.')
    ] },
  { id: 'hatch', title: 'A Partner of Your Own', goal: 'Hatch the geode (Echoes tab)', kind: 'hatch', reward: { xp: 60, shards: 5 } },
  { id: 'forge', title: 'Better Gear', goal: 'Upgrade any gear once (Forge tab)', kind: 'forge', reward: { xp: 60, lumen: 30 } },
  { id: 'crawlers', title: 'Thornfield', goal: 'Hunt Thorn-crawlers', kind: 'hunt', enemy: 'crawler', count: 12, reward: { xp: 260, lumen: 120, shards: 8, gear: 'implant', gearRar: 2 }, codex: ['crawler'] },
  { id: 'roots', title: 'The Old Roots', goal: 'Go to the roots in the north', kind: 'goto', place: 'roots', reward: { xp: 40 },
    talk: [
      D('you', 'The crawlers were all heading here. The roots are moving.'),
      D('skein', 'she is waking. she is not angry. she is guarding.'),
      D('skein', 'let her see you.')
    ] },
  { id: 'boss', title: 'The Thornmother', goal: 'Defeat the Thornmother', kind: 'boss', enemy: 'thornmother', count: 1, reward: { xp: 600, lumen: 300, geode: 1 }, codex: ['thornmother'] },
  { id: 'guarded', title: 'What Was She Guarding?', goal: 'Inspect the roots', kind: 'inspect', place: 'roots', reward: { xp: 120, lumen: 120 }, codex: ['bridge'], actEnd: 1,
    talk: [
      D('you', 'Under the roots there’s a door. Metal. Concord markings. This is part of the Meridian.'),
      D('you', 'This piece of the ark is a kilometer from where the ark landed. Nobody ever said it broke up.'),
      D('skein', 'it did not break. it was opened.'),
      D('skein', 'you were not the first we called. you are the first who answered.')
    ] },

  { id: 'ii_brief', act: 2, region: 'verge', title: 'The Missing Convoys', goal: 'Talk to Captain Marr', kind: 'talk', npc: 'marr', reward: { xp: 200, lumen: 100 },
    talk: [
      D('marr', 'You came back. Good. I sealed that door under the roots and told the Concord it was a collapsed storage bay. Don\u2019t make me a liar.'),
      D('marr', 'Different problem. Lumen convoys out of the Ribline Dunes have gone missing. Three this month. No wreckage, no survivors, no calls for help.'),
      D('marr', 'The dunes Spire is synced to ours now. A Driftborn guide named Kestrel will meet you at her camp. Be polite. The Driftborn remember who wasn\u2019t.'),
      D('skein', 'the sand remembers a heart. it is still beating, somewhere.')
    ] },
  { id: 'ii_travel', act: 2, region: 'dunes', title: 'Spire Sync', goal: 'Sync to the Ribline Dunes at the Spire', kind: 'travel', reward: { xp: 100 }, codex: ['ribline'] },
  { id: 'ii_kestrel', act: 2, region: 'dunes', title: 'The Driftborn Guide', goal: 'Find Kestrel at the camp', kind: 'talk', npc: 'kestrel', reward: { xp: 200, lumen: 80 }, codex: ['driftborn'],
    talk: [
      D('kestrel', 'So you\u2019re the Lodge\u2019s new recruit. Huh. Your Echo is staring at me.'),
      D('kestrel', 'It can see my eyes, can\u2019t it. Don\u2019t worry about my eyes.'),
      D('kestrel', 'Skimmers have been circling camp since the convoys vanished. Something out there spooked them. Thin the flock and I\u2019ll show you the last convoy.'),
      D('skein', 'she hears us. she has always heard us.')
    ] },
  { id: 'ii_skim', act: 2, region: 'dunes', title: 'Thin the Flock', goal: 'Hunt Sand-skimmers', kind: 'hunt', enemy: 'skimmer', count: 12, reward: { xp: 600, lumen: 160, shards: 6 }, codex: ['skimmer'],
    done: [D('kestrel', 'Not bad, Lodge. The last convoy went down east of here, past the flats. Come on.')] },
  { id: 'ii_wreck', act: 2, region: 'dunes', title: 'The Last Convoy', goal: 'Inspect the wrecked convoy', kind: 'inspect', place: 'wreck', reward: { xp: 300, gear: 'armor', gearRar: 2 },
    talk: [
      D('you', 'The convoy. Tipped on its side, half buried. Every cargo crate is open and empty.'),
      D('kestrel', 'Skimmers don\u2019t open crates. Look, scrap-hound tracks all around the cargo. They carried it off.'),
      D('kestrel', 'And these are tread marks. Syndicate crawler treads, heading north toward their dig.')
    ] },
  { id: 'ii_hounds', act: 2, region: 'dunes', title: 'Follow the Hounds', goal: 'Hunt Scrap-hounds', kind: 'hunt', enemy: 'hound', count: 12, reward: { xp: 800, lumen: 220, shards: 6, gear: 'weapon', gearRar: 2 }, codex: ['hound'],
    done: [D('kestrel', 'They\u2019re hauling shards north. Toward the dig, and toward that man who runs it.')] },
  { id: 'ii_corvin', act: 2, region: 'dunes', title: 'The Man Who Smiles', goal: 'Talk to Corvin Hale at the dig', kind: 'talk', npc: 'corvin', reward: { xp: 250, lumen: 120 }, codex: ['syndicate'],
    talk: [
      D('corvin', 'A Lodge hunter, all the way out here! And a Driftborn. Kestrel, isn\u2019t it? Your mother sold me water once. Excellent water.'),
      D('corvin', 'Missing convoys? Terrible business. We\u2019ve lost shipments too. Hounds, sand, bad luck. The dunes are hungry this year.'),
      D('corvin', 'Tell Captain Marr the Syndicate is doing everything it can. And please don\u2019t wander into the dig. It\u2019s dangerous, and frankly the paperwork is worse.'),
      D('kestrel', 'He smiled the whole time. Nobody smiles that much out here.')
    ] },
  { id: 'ii_drones', act: 2, region: 'dunes', title: 'Paperwork', goal: 'Get past the dig\u2019s security drones', kind: 'hunt', enemy: 'sdrone', count: 10, reward: { xp: 800, lumen: 240, shards: 6 }, codex: ['sdrone'],
    done: [D('kestrel', 'Security drones, firing on a Lodge hunter. \u201cPaperwork,\u201d he said. The way in is open.')] },
  { id: 'ii_dig', act: 2, region: 'dunes', title: 'What the Dig Drinks', goal: 'Inspect the Syndicate extractor', kind: 'inspect', place: 'dig', reward: { xp: 400, shards: 10 }, codex: ['lumenmemory'],
    talk: [
      D('you', 'A drill sunk straight down into bone. Kharos\u2019s heart, maybe. Lumen is pouring up the pipes and into crates.'),
      D('you', 'There\u2019s an Echo chained to the extractor. It\u2019s flickering.'),
      D('skein', 'they are drinking it. every shard is a memory. every memory was someone.'),
      D('you', 'The Echo fades a little more every time a crate fills. Lumen isn\u2019t fuel. It\u2019s what the Vael remember.'),
      D('kestrel', 'Then every lamp in Landfall is burning somebody\u2019s life.'),
      D('skein', 'yes.')
    ] },
  { id: 'ii_canyon', act: 2, region: 'dunes', title: 'The Quiet Canyon', goal: 'Follow the crate trail west', kind: 'goto', place: 'canyon', reward: { xp: 400 }, codex: ['silentzone', 'quiet'],
    talk: [
      D('you', 'It\u2019s quiet here. Not peaceful. Quiet. My implant has gone silent, and my Echo won\u2019t follow me in.'),
      D('kestrel', 'Even my eyes go dark here. The hounds dragged the crates this way, then turned back.'),
      D('hush', 'Turn back, little hunter. You have found the only honest place on Aurelis.'),
      D('hush', 'Out there the Choir sings to you. In here you can hear yourself think. Ask yourself who taught the Vael to sing.'),
      D('kestrel', 'She\u2019s gone. Who was that?'),
      D('skein', '\u2026the quiet hurts. please. go back.')
    ] },
  { id: 'ii_hollow', act: 2, region: 'dunes', title: 'The Hollow Rib', goal: 'Go to the hollow rib in the north', kind: 'goto', place: 'hollow', reward: { xp: 300 }, codex: ['hollowrib'],
    talk: [
      D('kestrel', 'The hollow rib. We sing when we cross it, so it knows we\u2019re still alive.'),
      D('kestrel', 'The tracks go inside. Crates, hounds, all of it. Something big has been nesting in Kharos\u2019s spine.'),
      D('skein', 'it is not hungry. it is hiding the light from the quiet.')
    ] },
  { id: 'ii_boss', act: 2, region: 'dunes', title: 'The Marrowking', goal: 'Defeat the Marrowking', kind: 'boss', enemy: 'marrowking', count: 1, reward: { xp: 2000, lumen: 600, geode: 1 }, codex: ['marrowking'] },
  { id: 'ii_after', act: 2, region: 'dunes', title: 'Buried Light', goal: 'Talk to Kestrel at the camp', kind: 'talk', npc: 'kestrel', reward: { xp: 600, lumen: 400, geode: 1 }, actEnd: 2,
    talk: [
      D('kestrel', 'The Marrowking wasn\u2019t stealing the Lumen. It was burying it. Keeping it away from that canyon.'),
      D('kestrel', 'Something in the quiet wants memories. The Syndicate is digging them up. And somebody is buying.'),
      D('you', 'Corvin\u2019s crates went west, toward the silence. He\u2019s not losing shipments. He\u2019s delivering them.'),
      D('kestrel', 'Then I\u2019m coming with you. The Driftborn owe the Lodge a favor, and I owe that smiling man a punch.'),
      D('skein', 'the water remembers more. go to the water.')
    ] },
  { id: 'iii_travel', act: 3, region: 'lattice', title: 'Go to the Water', goal: 'Sync to the Sunken Lattice at the Spire', kind: 'travel', reward: { xp: 300 }, codex: ['lattice'] },
  { id: 'iii_marr', act: 3, region: 'lattice', title: 'Arrival at Ribgate', goal: 'Talk to Captain Marr at Ribgate Camp', kind: 'talk', npc: 'marr', reward: { xp: 500, lumen: 200 },
    talk: [
      D('marr', 'Half the reef is underwater. Tides change hourly.'),
      D('you', 'Skein led us here. It said the water remembers.'),
      D('marr', 'Then listen fast. We lose the camp at high tide.'),
      D('skein', 'it is already listening back.')
    ] },
  { id: 'iii_ribs', act: 3, region: 'lattice', title: 'The Open Ribs', goal: 'Reach the Open Ribs', kind: 'goto', place: 'ribs', reward: { xp: 400 },
    talk: [
      D('bix', 'You’re the Lodge hunter? Bix. Syndicate diver. Ex.'),
      D('you', 'Ex since when?'),
      D('bix', 'Since they started drowning people for crystals.'),
      D('bix', 'Skitters nest in the shallows past here. Mind your fingers. I didn’t.')
    ] },
  { id: 'iii_skitter', act: 3, region: 'lattice', title: 'Nests in the Shallows', goal: 'Clear Lattice Skitters', kind: 'hunt', enemy: 'skitter', count: 12, reward: { xp: 1400, lumen: 300, shards: 8 }, codex: ['skitter'],
    done: [
      D('bix', 'Every nest is the same. Shards from drowned things, nothing else.'),
      D('skein', 'they only keep the drowning ones.')
    ] },
  { id: 'iii_ilse', act: 3, region: 'lattice', title: 'The Warden', goal: 'Question Ilse at the pump house', kind: 'talk', npc: 'ilse', reward: { xp: 600, lumen: 200 }, codex: ['drown'],
    talk: [
      D('ilse', 'This dragon did not crash. It landed here.'),
      D('you', 'Why land inside a flood plain?'),
      D('ilse', 'To drown itself. Slowly, on purpose.'),
      D('ilse', 'Something in its head was too loud.'),
      D('ilse', 'Old suits walk the eastern flats. Bring me their tags.')
    ] },
  { id: 'iii_husker', act: 3, region: 'lattice', title: 'Old Suits', goal: 'Recover tags from Drowned Huskers', kind: 'hunt', enemy: 'husker', count: 10, reward: { xp: 1800, lumen: 360, shards: 8, gear: 'armor', gearRar: 2 }, codex: ['husker'],
    done: [
      D('bix', 'These tags. Meridian crew.'),
      D('you', 'Dated before we launched. That’s not possible.'),
      D('bix', 'Tell the tags.')
    ] },
  { id: 'iii_pell', act: 3, region: 'lattice', title: 'The Listening Boy', goal: 'Find the boy by the water', kind: 'talk', npc: 'pell', reward: { xp: 500 },
    talk: [
      D('pell', 'You hear it too? The singing under the floor.'),
      D('you', 'I hear water.'),
      D('pell', 'Then you’re not listening yet. Come on. The old lady wants you.'),
      D('skein', 'he hears what i hear.')
    ] },
  { id: 'iii_hush', act: 3, region: 'lattice', title: 'Hush in the Water', goal: 'Meet Mother Hush at the shrine', kind: 'talk', npc: 'hush', reward: { xp: 700, lumen: 240 }, codex: ['drownedlumen'],
    talk: [
      D('hush', 'You followed the quiet boy. Good.'),
      D('you', 'You knew Corvin’s crates were coming here.'),
      D('hush', 'I asked him to bring them.'),
      D('hush', 'Dry memories scream. Drowned memories whisper.')
    ] },
  { id: 'iii_current', act: 3, region: 'lattice', title: 'Blue Current', goal: 'Follow the blue current to the Confluence', kind: 'goto', place: 'confluence', reward: { xp: 600 },
    talk: [
      D('pell', 'The current goes down here. Everything sad goes down here.'),
      D('skein', 'follow it.')
    ] },
  { id: 'iii_corvin', act: 3, region: 'lattice', title: 'The Delivery Man', goal: 'Confront Corvin at the sluice', kind: 'talk', npc: 'corvin', reward: { xp: 800, lumen: 300 }, codex: ['ledger'],
    talk: [
      D('corvin', 'Finally. I am tired of looking guilty.'),
      D('you', 'You delivered the Lumen to Hush, not to buyers.'),
      D('corvin', 'The Syndicate thinks I stole it. Let them.'),
      D('corvin', 'She sinks it here. The canyon thing goes hungry.'),
      D('skein', 'he lies less in water.')
    ] },
  { id: 'iii_leech', act: 3, region: 'lattice', title: 'What Feeds Below', goal: 'Hunt Memory Leeches', kind: 'hunt', enemy: 'leech', count: 12, reward: { xp: 2200, lumen: 420, shards: 10, gear: 'weapon', gearRar: 2 }, codex: ['leech'],
    done: [
      D('corvin', 'They go around her nets. Straight down.'),
      D('you', 'Down to what?'),
      D('skein', 'to the one who is looking.')
    ] },
  { id: 'iii_tags', act: 3, region: 'lattice', title: 'Names We Lost', goal: 'Bring the tags to Doctor Okafor at camp', kind: 'talk', npc: 'okafor', reward: { xp: 900, lumen: 300 }, codex: ['tags', 'hushfile'],
    talk: [
      D('okafor', 'These tags match Meridian crew. Our crew.'),
      D('you', 'But the dates are before we crashed.'),
      D('okafor', 'Before we remember crashing, you mean.'),
      D('sparks', 'Someone wiped us. Then stored the copies here.')
    ] },
  { id: 'iii_gate', act: 3, region: 'lattice', title: 'Down to the Heart', goal: 'Reach the Flooded Heart Chamber', kind: 'goto', place: 'heartgate', reward: { xp: 600 },
    talk: [
      D('bix', 'Last dry ground. After this, we swim.'),
      D('you', 'You coming?'),
      D('bix', 'Somebody has to hold the rope. Go.')
    ] },
  { id: 'iii_heart', act: 3, region: 'lattice', title: 'Skein’s Voice', goal: 'Listen at the Heart', kind: 'goto', place: 'heart', reward: { xp: 900, shards: 10 }, codex: ['echoorigin'],
    talk: [
      D('hush', 'The canyon feeder is not a monster.'),
      D('you', 'Then what is it?'),
      D('hush', 'This dragon’s heart. Still searching for its calf.'),
      D('skein', 'i am not the calf.'),
      D('skein', 'i am the part that ran.')
    ] },
  { id: 'iii_boss', act: 3, region: 'lattice', title: 'The Choir Below', goal: 'Defeat the Choir Below', kind: 'boss', enemy: 'choir', count: 1, reward: { xp: 4000, lumen: 1000, geode: 1 }, codex: ['choir'] },
  { id: 'iii_after', act: 3, region: 'lattice', title: 'Memory of Water', goal: 'Talk to Ilse at the pump house', kind: 'talk', npc: 'ilse', reward: { xp: 1200, lumen: 600, geode: 1 }, actEnd: 3,
    talk: [
      D('ilse', 'The Choir is quiet. First time in my life.'),
      D('you', 'It was guarding a memory. The Meridian, launching twice.'),
      D('ilse', 'Then somebody launched you before. And wiped it.'),
      D('skein', 'the heart heard me. it is coming.'),
      D('ilse', 'Coming where?'),
      D('skein', 'ashore.')
    ] },
  { id: 'iv_travel', act: 4, region: 'heartstrand', title: 'Ashore', goal: 'Sync to the Heartstrand at the Spire', kind: 'travel', reward: { xp: 400 }, codex: ['heartstrand'] },
  { id: 'iv_marr', act: 4, region: 'heartstrand', title: 'It Came Ashore', goal: 'Talk to Captain Marr at Heartstrand Camp', kind: 'talk', npc: 'marr', reward: { xp: 700, lumen: 300 },
    talk: [
      D('marr', 'It beached overnight. No tracks. It just arrived.'),
      D('you', 'Skein hasn’t stopped shaking since dawn.'),
      D('marr', 'Then keep it close. And keep it honest.'),
      D('skein', 'it heard me breathe. sorry.')
    ] },
  { id: 'iv_heart', act: 4, region: 'heartstrand', title: 'First Approach', goal: 'Reach the Beached Heart', kind: 'goto', place: 'heart', reward: { xp: 600 },
    talk: [
      D('pell', 'It beats slower when Skein is near.'),
      D('hush', 'Slower is not calmer. It is listening harder.'),
      D('skein', 'do not touch. it knows hands.')
    ] },
  { id: 'iv_mauler', act: 4, region: 'heartstrand', title: 'Drawn to the Beat', goal: 'Clear Saltback Maulers from the Salt Flats', kind: 'hunt', enemy: 'mauler', count: 12, reward: { xp: 2600, lumen: 500, shards: 10 }, codex: ['mauler'],
    done: [
      D('you', 'Fresh Lumen in their fur. Stamped with Meridian serials.'),
      D('skein', 'the heart has been eating our names.')
    ] },
  { id: 'iv_hush', act: 4, region: 'heartstrand', title: 'What Hush Did', goal: 'Talk to Mother Hush at the Canyon Mouth', kind: 'talk', npc: 'hush', reward: { xp: 900, lumen: 300 }, codex: ['why'],
    talk: [
      D('you', 'You wiped us. Say it plainly.'),
      D('hush', 'I wiped you. At your captain’s request.'),
      D('you', 'Why would Marr ask for that?'),
      D('hush', 'Because the heart had learned your names.')
    ] },
  { id: 'iv_vault', act: 4, region: 'heartstrand', title: 'The Consent Forms', goal: 'Enter the Archivist Vault', kind: 'goto', place: 'vault', reward: { xp: 800 },
    talk: [
      D('sparks', 'Vault was sealed from inside. By us.'),
      D('okafor', 'That is my signature. I do not remember signing.'),
      D('hush', 'You cried afterward. Then you thanked me.'),
      D('sparks', 'There’s a pod back here. Someone’s still breathing.')
    ] },
  { id: 'iv_amara', act: 4, region: 'heartstrand', title: 'Amara Remembers Paper', goal: 'Talk to Doctor Okafor at camp', kind: 'talk', npc: 'okafor', reward: { xp: 900, lumen: 300 },
    talk: [
      D('okafor', 'My handwriting. My medical shorthand. No doubt.'),
      D('you', 'What did we see on first landing?'),
      D('okafor', 'Enough that forgetting felt like treatment.'),
      D('okafor', 'I hate that I still agree.')
    ] },
  { id: 'iv_archivist', act: 4, region: 'heartstrand', title: 'Staff Problems', goal: 'Clear the Hollow Archivists from the vault stairs', kind: 'hunt', enemy: 'archivist', count: 10, reward: { xp: 2800, lumen: 520, shards: 10, gear: 'implant', gearRar: 2 }, codex: ['archivist', 'relaunch'],
    done: [
      D('nessa', 'Thank you. Those drones guard one file. The relaunch order.'),
      D('you', 'And you are?'),
      D('nessa', 'Nessa Quill. I buy what people forget. That file is worth a fortune.'),
      D('you', 'It’s not for sale.'),
      D('nessa', 'Everything is for sale. Ask Corvin.')
    ] },
  { id: 'iv_nose', act: 4, region: 'heartstrand', title: 'The Piece That Should Not Exist', goal: 'Inspect the Second Meridian Nose', kind: 'goto', place: 'nose', reward: { xp: 900, shards: 8 }, codex: ['cones'],
    talk: [
      D('sparks', 'Same serial as the piece the Thornmother guarded.'),
      D('you', 'Two nose cones. One ship.'),
      D('sparks', 'No. One ship, landed twice. This proves it.'),
      D('skein', 'it remembers falling. twice.')
    ] },
  { id: 'iv_corvin', act: 4, region: 'heartstrand', title: 'Corvin Was Awake', goal: 'Talk to Corvin at the Memory Mill', kind: 'talk', npc: 'corvin', reward: { xp: 1000, lumen: 400 },
    talk: [
      D('corvin', 'I was never wiped. Someone had to steer.'),
      D('you', 'You flew the relaunch, then staged the crash?'),
      D('corvin', 'Staged is ugly. Call it a hard reset.'),
      D('corvin', 'Hush hid the vault. I hid the landing.'),
      D('nessa', 'And I sell whatever washes up. Everyone has a job.')
    ] },
  { id: 'iv_dredger', act: 4, region: 'heartstrand', title: 'What the Heart Lost', goal: 'Stop Memory Dredgers reaching the heart', kind: 'hunt', enemy: 'dredger', count: 12, reward: { xp: 3200, lumen: 600, shards: 12, gear: 'weapon', gearRar: 2 }, codex: ['dredger', 'calf'],
    done: [
      D('pell', 'They all carry the same memory.'),
      D('pell', 'A little dragon. Ship parts falling. It was an accident.'),
      D('skein', 'the heart never believed you.')
    ] },
  { id: 'iv_steps', act: 4, region: 'heartstrand', title: 'Skein Stays', goal: 'Walk with Skein to the Tidal Steps', kind: 'goto', place: 'steps', reward: { xp: 1000, shards: 15 },
    talk: [
      D('you', 'You can run again. I won’t stop you.'),
      D('skein', 'i know. that is why i can stay.'),
      D('skein', 'i was the part that ran from grief.'),
      D('skein', 'i am still small. i am not running.')
    ] },
  { id: 'iv_marker', act: 4, region: 'heartstrand', title: 'A Signal From the Shadow', goal: 'Reach Vey’s Marker under Ossivar', kind: 'goto', place: 'marker', reward: { xp: 900 },
    talk: [
      D('kestrel', 'Marker is new. Paint is still wet.'),
      D('pell', 'Someone knocked three times inside my helmet.'),
      D('skein', 'that was not the heart. that was higher.')
    ] },
  { id: 'iv_tovin', act: 4, region: 'heartstrand', title: 'Tovin Wakes', goal: 'Talk to Tovin at the vault', kind: 'talk', npc: 'tovin', reward: { xp: 1100, lumen: 400 }, codex: ['firstlanding'],
    talk: [
      D('tovin', 'I piloted the first landing. Corvin piloted the second.'),
      D('you', 'Who ordered the wipe and the relaunch?'),
      D('tovin', 'Marr did. After we killed the calf.'),
      D('tovin', 'But the order above Marr was already signed.')
    ] },
  { id: 'iv_boss', act: 4, region: 'heartstrand', title: 'The First Captain', goal: 'Defeat the First Captain', kind: 'boss', enemy: 'firstcaptain', count: 1, reward: { xp: 6000, lumen: 1400, geode: 1 }, codex: ['firstcaptain'] },
  { id: 'iv_after', act: 4, region: 'heartstrand', title: 'The Heart Ashore', goal: 'Talk to Captain Marr at camp', kind: 'talk', npc: 'marr', reward: { xp: 1800, lumen: 800, geode: 1 }, actEnd: 4, codex: ['signature'],
    talk: [
      D('marr', 'I watched myself try to kill you.'),
      D('you', 'It wasn’t you. It was what you asked Hush to take.'),
      D('marr', 'I asked her to take it. I never asked her to keep it.'),
      D('marr', 'Tovin says the order above mine was already signed.'),
      D('skein', 'i saw the name. you will not like it.')
    ] }
];

export const ACTS = {
  1: { title: 'Act I complete', sub: 'Landfall', text: 'The Thornmother was guarding a piece of the Meridian that should not exist. Captain Marr has questions. So does Skein.', next: 'Act II: The Singing Dark begins now. Captain Marr has news from the dunes.' },
  2: { title: 'Act II complete', sub: 'The Singing Dark', text: 'Lumen is memory. Something in the quiet canyon is hungry for it, the Syndicate is digging it up, and Mother Hush knows more than she says. Kestrel has joined the Lodge.', next: 'Act III: Memory of Water begins now. Skein wants to go to the water.' },
  3: { title: 'Act III complete', sub: 'Memory of Water', text: 'Corvin was sinking Lumen to keep it from the canyon. The drowned memories include Meridian crew, from before the crash.', next: 'Act IV: The Heart Ashore begins now. Something huge just landed on the beach.' },
  4: { title: 'Act IV complete', sub: 'The Heart Ashore', text: 'The crew landed first, killed the calf by accident, and asked Hush to wipe them. Hush and Corvin relaunched the Meridian and staged its second crash.', next: 'Act V: the order above Marr was signed by Aldren Vey. Coming in a later build. Bounties are open in every region.' }
};
export const ACT_END = ACTS[1];

export const ORDERS = {
  kill: { name: 'Clear the field', goal: 'Defeat {n} enemies', n: 80, icon: 'cleave' },
  ult: { name: 'Let it ring', goal: 'Unleash your Resonance {n} times', n: 6, icon: 'starbreaker' },
  quest: { name: 'Lodge business', goal: 'Finish {n} quests or bounties', n: 2, icon: 'lance' },
  forge: { name: 'Keep Sparks busy', goal: 'Upgrade gear {n} times at the Forge', n: 3, icon: 'weapon' },
  echo: { name: 'Feed the bond', goal: 'Level up or evolve an Echo {n} times', n: 2, icon: 'echo' },
  tower: { name: 'Climb', goal: 'Clear {n} floors of Ossivar\u2019s Spire', n: 3, icon: 'tower' },
  boss: { name: 'Wake-breaker', goal: 'Defeat a Waker or Spire guardian', n: 1, icon: 'eclipse' }
};

export const BOUNTIES = [
  { id: 'b1', enemy: 'shardling', count: 15, lumen: 60, shards: 2, minLvl: 1 },
  { id: 'b2', enemy: 'glowmoth', count: 15, lumen: 110, shards: 3, minLvl: 4 },
  { id: 'b3', enemy: 'crawler', count: 15, lumen: 180, shards: 4, minLvl: 8 },
  { id: 'b4', enemy: 'skimmer', count: 15, lumen: 320, shards: 5, minLvl: 13, region: 'dunes' },
  { id: 'b5', enemy: 'hound', count: 15, lumen: 420, shards: 6, minLvl: 16, region: 'dunes' },
  { id: 'b6', enemy: 'sdrone', count: 15, lumen: 520, shards: 7, minLvl: 18, region: 'dunes' },
  { id: 'b7', enemy: 'skitter', count: 15, lumen: 640, shards: 8, minLvl: 23, region: 'lattice' },
  { id: 'b8', enemy: 'husker', count: 15, lumen: 760, shards: 9, minLvl: 26, region: 'lattice' },
  { id: 'b9', enemy: 'leech', count: 15, lumen: 880, shards: 10, minLvl: 28, region: 'lattice' },
  { id: 'b10', enemy: 'mauler', count: 15, lumen: 1000, shards: 11, minLvl: 33, region: 'heartstrand' },
  { id: 'b11', enemy: 'archivist', count: 15, lumen: 1120, shards: 12, minLvl: 36, region: 'heartstrand' },
  { id: 'b12', enemy: 'dredger', count: 15, lumen: 1240, shards: 13, minLvl: 38, region: 'heartstrand' }
];

export const IDLE = {
  marr: ['Still standing? Good. Stay that way.', 'Orders are on the board. No surprises today.', 'You smell like swamp and trouble again.'],
  sparks: ['Do not touch that. It is load-bearing.', 'I fixed it twice. Third time costs you.', 'If it sparks, step back. If I spark, run.'],
  okafor: ['Sit. Breathe. You are not fine.', 'Drink water before you tell me anything.', 'I patch hunters. Excuses heal themselves.'],
  kestrel: ['Wind is good. Sight lines are better.', 'I missed once today. Still annoyed.', 'You walk loud. We will work on that.'],
  corvin: ['Buying, selling, or just enjoying my face?', 'Everything is negotiable. Almost everything.', 'I delivered it. Where is another question.'],
  hush: ['Quiet suits you.', 'Listen first. Speak if it helps.', 'The water heard you coming.'],
  ilse: ['Check your seals before you check your courage.', 'Tide does not care about your plans.', 'Blue light means memory. Deep blue means leave.'],
  bix: ['Lost two fingers. Kept the important ones.', 'Syndicate pays better. Lodge lets me sleep.', 'Goggles crack before I do. Usually.'],
  pell: ['Your helmet would remember you loudly.', 'I heard a dragon dreaming under us.', 'Can Skein stay? It hums nice.'],
  tovin: ['I slept eleven years. Still tired.', 'Second launch felt rougher. Now I know why.', 'Do not trust a log I wrote.'],
  nessa: ['Memories sell better when owners forget them.', 'I never buy my own stock. Rule one.', 'Corvin smiles. I count the exits.']
};

export const TOWER_LINES = ['The tower keeps your place. Try again when ready.', 'Knocked out at the knees, not in spirit.', 'Good climb. Bad landing. There is a difference.', 'The stairs are patient. They will wait.', 'You fell. The tower took notes.', 'Rest up. Ossivar is not going anywhere.'];

export const RANKS = [
  { id: 'recruit', n: 'I', name: 'Recruit', lvl: 1, perm: {}, permText: 'Where everyone starts', pb: { xp: .1 }, pbText: '+10% XP', color: '#8aa0aa' },
  { id: 'hunter', n: 'II', name: 'Hunter', lvl: 10, perm: { hpPct: .04 }, permText: '+4% max HP', pb: { aspd: .05 }, pbText: '+5% attack speed', color: '#5ff2d0' },
  { id: 'veteran', n: 'III', name: 'Veteran', lvl: 20, perm: { atkPct: .04 }, permText: '+4% attack', pb: { hpPct: .08 }, pbText: '+8% max HP', color: '#d9a45a' },
  { id: 'warden', n: 'IV', name: 'Warden', lvl: 30, perm: { crit: .03 }, permText: '+3% crit chance', pb: { defPct: .12 }, pbText: '+12% defense', color: '#5ff2ff' },
  { id: 'ascendant', n: 'V', name: 'Ascendant', lvl: 40, perm: { critDmg: .1 }, permText: '+10% crit damage', pb: { res: .15, echo: .1 }, pbText: '+15% Resonance gain, +10% Echo damage', color: '#ffcf5a' },
  { id: 'starborn', n: 'VI', name: 'Starborn', lvl: 50, perm: { atkPct: .05, hpPct: .05 }, permText: '+5% attack and max HP', pb: { atkPct: .06, hpPct: .06 }, pbText: '+6% attack and max HP', color: '#ffffff' }
];
export const CALLING_PORTRAIT = { id: 'calling', name: 'Calling', pb: { skill: .06 }, pbText: '+6% skill power' };

export const TREE_THEMES = {
  might: [
    { k: 'atkPct', v: .03, max: 5, name: 'Sharpened', icon: 'weapon', fmt: 'attack' },
    { k: 'skillDmg', v: .12, max: 3, name: 'Honed', icon: 'S', fmt: 'power' },
    { k: 'crit', v: .02, max: 3, name: 'Keen Eye', icon: 'deadeye', fmt: 'crit chance' },
    { k: 'skillCd', v: .08, max: 3, name: 'Practiced', icon: 'S', fmt: 'cooldown' },
    { k: 'critDmg', v: .08, max: 3, name: 'Cruel Edge', icon: 'cleave', fmt: 'crit damage' },
    { k: 'key', key: 'execute', max: 1, name: 'Executioner', icon: 'starbreaker', desc: 'Deal 30% more damage to enemies below 30% HP.' }
  ],
  guard: [
    { k: 'hpPct', v: .04, max: 5, name: 'Hardened', icon: 'armor', fmt: 'max HP' },
    { k: 'skillDmg', v: .12, max: 3, name: 'Empowered', icon: 'S', fmt: 'power' },
    { k: 'defPct', v: .05, max: 3, name: 'Plated', icon: 'bulwark', fmt: 'defense' },
    { k: 'skillCd', v: .08, max: 3, name: 'Steady', icon: 'S', fmt: 'cooldown' },
    { k: 'regen', v: .002, max: 3, name: 'Mending', icon: 'mend', fmt: 'regen' },
    { k: 'key', key: 'secondWind', max: 1, name: 'Second Wind', icon: 'lifeline', desc: 'Once every 90 seconds, a killing blow leaves you at 30% HP instead.' }
  ],
  tempo: [
    { k: 'aspd', v: .04, max: 5, name: 'Rhythm', icon: 'quickdraw', fmt: 'attack speed' },
    { k: 'skillDmg', v: .12, max: 3, name: 'Charged', icon: 'S', fmt: 'power' },
    { k: 'res', v: .1, max: 3, name: 'Resonant', icon: 'pulse', fmt: 'Resonance gain' },
    { k: 'skillCd', v: .08, max: 3, name: 'Swift', icon: 'S', fmt: 'cooldown' },
    { k: 'echo', v: .1, max: 3, name: 'Bonded', icon: 'echo', fmt: 'Echo damage' },
    { k: 'key', key: 'overdrive', max: 1, name: 'Overdrive', icon: 'eclipse', desc: 'For 6 seconds after your Resonance ultimate, attack 30% faster and deal 20% more damage.' }
  ]
};
export const TREE_ROW_REQ = [0, 3, 6, 9, 12, 15];
export const TREES = {
  vanguard: [{ theme: 'might', skill: 'cleave', name: 'Breaker', desc: 'Cut deep, finish fast.' }, { theme: 'guard', skill: 'bulwark', name: 'Bastion', desc: 'Nothing gets past you.' }, { theme: 'tempo', skill: 'slam', name: 'Tremor', desc: 'Hit the ground. Keep hitting it.' }],
  railwarden: [{ theme: 'might', skill: 'pierce', name: 'Marksman', desc: 'One shot, one line, one less problem.' }, { theme: 'tempo', skill: 'volley', name: 'Skirmisher', desc: 'Keep the rifle hot.' }, { theme: 'guard', skill: 'drone', name: 'Overwatch', desc: 'Let the drone watch your back.' }],
  psion: [{ theme: 'might', skill: 'llance', name: 'Lance', desc: 'Focus the Choir into a point.' }, { theme: 'tempo', skill: 'pulse', name: 'Resonance', desc: 'Ride the hum.' }, { theme: 'guard', skill: 'hush', name: 'Stillness', desc: 'Make the world slow down.' }],
  shade: [{ theme: 'might', skill: 'blink', name: 'Assassin', desc: 'Be behind them first.' }, { theme: 'tempo', skill: 'fan', name: 'Flurry', desc: 'More knives, less talking.' }, { theme: 'guard', skill: 'veil', name: 'Phantom', desc: 'Never quite where they aim.' }],
  mender: [{ theme: 'guard', skill: 'mend', name: 'Lifeward', desc: 'Nobody drops on your watch.' }, { theme: 'tempo', skill: 'medrone', name: 'Fieldcraft', desc: 'Two pairs of hands are better.' }, { theme: 'might', skill: 'stasis', name: 'Entropy', desc: 'Time is a weapon too.' }],
  duelist: [{ theme: 'might', skill: 'quickdraw', name: 'Gunslinger', desc: 'Draw first. Draw again.' }, { theme: 'tempo', skill: 'ricochet', name: 'Trickshot', desc: 'Every wall is a second chance.' }, { theme: 'guard', skill: 'roll', name: 'Daredevil', desc: 'Dodge now, gloat later.' }]
};

export const NAMES = {
  m: ['Rook', 'Dace', 'Tavish', 'Corran', 'Jessop', 'Halden', 'Marek', 'Orrin', 'Bram', 'Kito', 'Garrick', 'Wade'],
  f: ['Wren', 'Sable', 'Isolde', 'Maren', 'Tamsin', 'Juno', 'Rhea', 'Nyla', 'Cass', 'Odessa', 'Lark', 'Vesna'],
  n: ['Ash', 'Quill', 'Ember', 'Rue', 'Sparrow', 'Kestrin', 'Lumen', 'Morrow', 'Tally', 'Hollis', 'Reed', 'Onyx']
};
