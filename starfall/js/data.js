export const WORLD = { w: 1800, h: 3000 };

export const ART = {
  portrait: { marr: 'art/p_marr.webp', sparks: 'art/p_sparks.webp', okafor: 'art/p_okafor.webp', skein: 'art/p_skein.webp', kestrel: 'art/p_kestrel.webp', corvin: 'art/p_corvin.webp', hush: 'art/p_hush.webp' },
  calling: { vanguard: 'art/c_vanguard.webp', railwarden: 'art/c_railwarden.webp', psion: 'art/c_psion.webp', duelist: 'art/c_duelist.webp', shade: 'art/c_shade.webp', mender: 'art/c_mender.webp' },
  face: { vanguard: 'art/f_vanguard.webp', railwarden: 'art/f_railwarden.webp', psion: 'art/f_psion.webp', duelist: 'art/f_duelist.webp', shade: 'art/f_shade.webp', mender: 'art/f_mender.webp' },
  echo: { skein: 'art/e_skein.webp', glimmerkit: 'art/e_glimmerkit.webp', budlet: 'art/e_budlet.webp', rivet: 'art/e_rivet.webp', lumi: 'art/e_lumi.webp' },
  boss: { thornmother: 'art/b_thornmother.webp', marrowking: 'art/b_marrowking.webp' },
  codex: { skein: 'art/e_skein.webp', thornmother: 'art/b_thornmother.webp', echoes: 'art/e_glimmerkit.webp', ribline: 'art/r_dunes.webp', driftborn: 'art/p_kestrel.webp', skimmer: 'art/m_skimmer.webp', hound: 'art/m_hound.webp', syndicate: 'art/p_corvin.webp', quiet: 'art/p_hush.webp', marrowking: 'art/b_marrowking.webp' },
  region: { verge: 'art/title.webp', dunes: 'art/r_dunes.webp', tower: 'art/r_tower.webp' },
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
  marrowking: { name: 'The Marrowking', lvl: [22, 22], hp: 9000, atk: 58, spd: 48, xp: 1300, lumen: [700, 700], range: 90, atkCd: 1.8, aggro: 340, radius: 64, boss: true, sub: 'Nest-warden of Kharos' }
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
    boss: { type: 'marrowking', at: 'arena', quest: 'ii_boss' }, music: 'dunes'
  },
  tower: {
    name: 'Ossivar’s Spire', hub: 'Endless floors', lvl: 'endless', w: 1200, h: 1500, bg: '#07070f', ground: 'towerfloor', path: 'path', motes: [0xffe6a0, 0x9ff6ff, 0xc58bff],
    paths: [], spawns: [],
    places: { start: { x: 600, y: 1180 }, arrive: { x: 600, y: 1180 }, spire: { x: 600, y: 1420 }, arena: { x: 600, y: 760 } },
    npcs: [], tower: true, boss: null, music: 'theme'
  }
};
export const TOWER_POOL = ['shardling', 'glowmoth', 'crawler', 'skimmer', 'hound', 'sdrone'];

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
  you: { name: 'You', short: 'You', title: '', color: '#e8f6ff' }
};

export const ECHOES = {
  skein: { name: 'Skein', family: 'Vaelborn', color: 0xbfe8ff, atk: 7, per: 1.5, skill: { name: 'Starlight Beam', cd: 8, desc: 'A beam of old light for 260% damage.' }, blurb: 'A sliver of something ancient. It chose you, and it will not say why.' },
  glimmerkit: { name: 'Glimmerkit', family: 'Fauna', color: 0x5ff2d0, atk: 6, per: 1.3, skill: { name: 'Dash Bite', cd: 6, desc: 'Dash through a target for 210% damage.' }, blurb: 'Friendly, fast, and always staring at the sky.' },
  budlet: { name: 'Budlet', family: 'Flora', color: 0xff8ab8, atk: 4, per: 0.9, skill: { name: 'Mend Spores', cd: 10, desc: 'Heal you for 14% of your max HP.' }, blurb: 'Remembers a garden that grew inside a starship.' },
  rivet: { name: 'Rivet', family: 'Machine', color: 0xffcf5a, atk: 5, per: 1.0, skill: { name: 'Patch Shield', cd: 12, desc: 'Shield you for 16% of your max HP.' }, blurb: 'A repair drone that remembers its passengers. All of them.' },
  lumi: { name: 'Lumi', family: 'Tide', color: 0x7fc8ff, atk: 5, per: 1.2, skill: { name: 'Tide Pulse', cd: 9, desc: '150% damage to every enemy near Lumi.' }, blurb: 'Drifts like it is still underwater. Hums when it is happy.' }
};
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
  bridge: { title: 'Meridian bridge deck', src: 'maintenance tag, Sparks', text: 'DO NOT OPEN. I mean it. It’s humming again.' }
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
    ] }
];

export const ACTS = {
  1: { title: 'Act I complete', sub: 'Landfall', text: 'The Thornmother was guarding a piece of the Meridian that should not exist. Captain Marr has questions. So does Skein.', next: 'Act II: The Singing Dark begins now. Captain Marr has news from the dunes.' },
  2: { title: 'Act II complete', sub: 'The Singing Dark', text: 'Lumen is memory. Something in the quiet canyon is hungry for it, the Syndicate is digging it up, and Mother Hush knows more than she says. Kestrel has joined the Lodge.', next: 'Act III: Memory of Water (the Sunken Lattice) is coming in the next build. Bounties are open in both regions.' }
};
export const ACT_END = ACTS[1];

export const BOUNTIES = [
  { id: 'b1', enemy: 'shardling', count: 15, lumen: 60, shards: 2, minLvl: 1 },
  { id: 'b2', enemy: 'glowmoth', count: 15, lumen: 110, shards: 3, minLvl: 4 },
  { id: 'b3', enemy: 'crawler', count: 15, lumen: 180, shards: 4, minLvl: 8 },
  { id: 'b4', enemy: 'skimmer', count: 15, lumen: 320, shards: 5, minLvl: 13, region: 'dunes' },
  { id: 'b5', enemy: 'hound', count: 15, lumen: 420, shards: 6, minLvl: 16, region: 'dunes' },
  { id: 'b6', enemy: 'sdrone', count: 15, lumen: 520, shards: 7, minLvl: 18, region: 'dunes' }
];
