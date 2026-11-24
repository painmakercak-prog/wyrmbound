// Static animation audit: every clip on every unit rig, ROLE resolution (same logic as mkChar),
// roles with no clip, clips never used. Usage: node audit.mjs <g3d.js path> <assets dir>
import fs from 'fs';
const [g3dPath, assetsDir] = process.argv.slice(2);
const src = fs.readFileSync(g3dPath, 'utf8');
const roleM = src.match(/const ROLE=(\{[^}]+\})/);
const ROLE = eval('(' + roleM[1] + ')');
function glbAnims(file) {
  const d = fs.readFileSync(file);
  if (d.toString('latin1', 0, 4) !== 'glTF') return [];
  const ln = d.readUInt32LE(12);
  const j = JSON.parse(d.toString('utf8', 20, 20 + ln));
  return (j.animations || []).map(a => a.name);
}
const UNITS = {
  knight: 'h_hooded', ranger: 'h_adventurer', mage: 'h_witch', assassin: 'h_adv2',
  scholar: 'h_wizard', gunslinger: 'h_adventurer', npc: 'npc', wolf: 'wolf',
  frog: 'frog', spider: 'spider', skel: 'skel', boss_skelw: 'skelw'
};
const out = { roles: Object.keys(ROLE), units: {}, missing: [], unused: {} };
for (const [unit, rig] of Object.entries(UNITS)) {
  let anims = [];
  try { anims = glbAnims(`${assetsDir}/${rig}.glb`); } catch (e) { out.units[unit] = { rig, error: 'missing glb' }; continue; }
  const short = anims.map(a => a.split('|').pop());
  const resolved = {}, used = new Set();
  for (const [role, names] of Object.entries(ROLE)) {
    const hit = names.find(nm => short.includes(nm));
    resolved[role] = hit || null;
    if (hit) used.add(hit); else out.missing.push(`${unit}:${role}`);
  }
  out.units[unit] = { rig, clips: short, resolved };
  out.unused[unit] = short.filter(c => !used.has(c));
}
console.log(JSON.stringify(out, null, 1));
