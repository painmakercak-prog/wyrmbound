export const WORLD = { w: 1800, h: 3000 };

export const ART = {
  portrait: { marr: 'art/p_marr.webp', sparks: 'art/p_sparks.webp', okafor: 'art/p_okafor.webp', skein: 'art/p_skein.webp' },
  calling: { vanguard: 'art/c_vanguard.webp', railwarden: 'art/c_railwarden.webp', psion: 'art/c_psion.webp', duelist: 'art/c_duelist.webp' },
  face: { vanguard: 'art/f_vanguard.webp', railwarden: 'art/f_railwarden.webp', psion: 'art/f_psion.webp', duelist: 'art/f_duelist.webp' },
  echo: { skein: 'art/e_skein.webp', glimmerkit: 'art/e_glimmerkit.webp', budlet: 'art/e_budlet.webp', rivet: 'art/e_rivet.webp', lumi: 'art/e_lumi.webp' },
  boss: { thornmother: 'art/b_thornmother.webp' },
  codex: { skein: 'art/e_skein.webp', thornmother: 'art/b_thornmother.webp', echoes: 'art/e_glimmerkit.webp' },
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

export const LOCKED_CALLINGS = [
  { name: 'Shade', role: 'Burst · Crits', blurb: 'Twin phase-knives. Former Syndicate enforcers who walked away.' },
  { name: 'Mender', role: 'Healer · Support', blurb: 'Med-drone and pulse staff. The Lodge’s field medics.' },
  { name: 'Duelist', role: 'Fast · Single target', blurb: 'Twin pistols and Driftborn swagger.', art: 'duelist' }
];

export const ENEMIES = {
  shardling: { name: 'Shardling', lvl: [1, 3], hp: 40, atk: 6, spd: 62, xp: 12, lumen: [2, 4], range: 26, atkCd: 1.4, aggro: 110, radius: 16 },
  glowmoth: { name: 'Glow-moth', lvl: [4, 7], hp: 62, atk: 9, spd: 70, xp: 22, lumen: [3, 6], range: 120, atkCd: 1.9, aggro: 150, radius: 16, ranged: true },
  crawler: { name: 'Thorn-crawler', lvl: [7, 10], hp: 120, atk: 14, spd: 56, xp: 36, lumen: [5, 9], range: 30, atkCd: 1.5, aggro: 130, radius: 20 },
  thornmother: { name: 'The Thornmother', lvl: [12, 12], hp: 3000, atk: 24, spd: 42, xp: 900, lumen: [220, 220], range: 70, atkCd: 1.7, aggro: 320, radius: 52, boss: true }
};

export const SPAWNS = [
  { type: 'shardling', x: 900, y: 2040, r: 300, count: 10 },
  { type: 'glowmoth', x: 860, y: 1420, r: 330, count: 9 },
  { type: 'crawler', x: 920, y: 860, r: 320, count: 9 }
];

export const PLACES = {
  start: { x: 900, y: 2630 },
  spire: { x: 900, y: 2380 },
  marr: { x: 760, y: 2590 },
  sparks: { x: 1050, y: 2600 },
  okafor: { x: 1000, y: 2700 },
  geode: { x: 1160, y: 2100 },
  roots: { x: 900, y: 470 },
  arena: { x: 900, y: 360 }
};

export const NPCS = {
  marr: { name: 'Captain Ysolde Marr', short: 'Marr', title: 'Beacon Lodge', color: '#ffb14a' },
  sparks: { name: 'Tessa “Sparks” Ruiz', short: 'Sparks', title: 'Landfall Forge', color: '#ff8a5a' },
  okafor: { name: 'Dr. Amara Okafor', short: 'Okafor', title: 'Lodge Mender', color: '#5ff2d0' },
  skein: { name: 'Skein', short: 'Skein', title: '???', color: '#bfe8ff' },
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
  { id: 'guarded', title: 'What Was She Guarding?', goal: 'Inspect the roots', kind: 'inspect', place: 'roots', reward: { xp: 120, lumen: 120 }, codex: ['bridge'],
    talk: [
      D('you', 'Under the roots there’s a door. Metal. Concord markings. This is part of the Meridian.'),
      D('you', 'This piece of the ark is a kilometer from where the ark landed. Nobody ever said it broke up.'),
      D('skein', 'it did not break. it was opened.'),
      D('skein', 'you were not the first we called. you are the first who answered.')
    ] }
];

export const ACT_END = {
  title: 'Act I complete',
  sub: 'Landfall',
  text: 'The Thornmother was guarding a piece of the Meridian that should not exist. Captain Marr has questions. So does Skein.',
  next: 'Act II: The Singing Dark — coming in the next build. Bounties stay open; keep hunting and growing your Echoes.'
};

export const BOUNTIES = [
  { id: 'b1', enemy: 'shardling', count: 15, lumen: 60, shards: 2, minLvl: 1 },
  { id: 'b2', enemy: 'glowmoth', count: 15, lumen: 110, shards: 3, minLvl: 4 },
  { id: 'b3', enemy: 'crawler', count: 15, lumen: 180, shards: 4, minLvl: 8 }
];
