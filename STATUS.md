# Wyrmbound: Starfall — Project Status

Last updated: 2026-11-27 (build 8.1.1 shipped)

Play it: https://painmakercak-prog.github.io/wyrmbound/starfall/
Code: `starfall/` on `main`. Deploys go to the `gh-pages` branch under `/starfall/`.
Lore bible: https://claude.ai/artifact/KD43zMSjsXWUJ3CTauGzoK

A 2D sci-fi auto-battler RPG for phones (Dragon Trail 2 style): auto-hunting, quests, Echo companions, gear, bosses.
Owner: Kasey. Code is written by Claude. Art comes from Grok, story from Muse, music from Suno.

## Shipped

| Build | Date | What players got |
|---|---|---|
| 1 | Nov 2026 | Act I, Glasswood Verge: 3 Callings, Echoes, Forge, Codex, Thornmother boss |
| 2 | Nov 2026 | Act II, Ribline Dunes: Kestrel, Corvin, Mother Hush, the silent canyon, Marrowking boss, travel between regions |
| 2.1 | 2026-11-25 | Real music: title theme, Verge, Dunes and boss tracks with seamless loops |
| 3 | 2026-11-25 | Shade, Mender and Duelist Callings; switching Calling at the Lodge; Ossivar's Spire endless tower; Ascendant Echoes; gear stars (Refine) |
| 4 | 2026-11-25 | Act III, Sunken Lattice: Ilse, Bix, Pell; Skitters, Huskers, Leeches; the Choir Below boss; 16 quests; reef music (Glassy Depths); Vey's tower logs; idle lines; Ascendant Echo art; fix for bosses fully healing after a knockout |
| 5 | 2026-11-25 | Character creator (name, body type, 3 heads, 3 faces, 3 bodies, skin, hair, gear toggle); rename and restyle any time; Ascension ranks I–VI (levels 1/10/20/30/40/50) with permanent bonuses, unlockable portraits with equipped bonuses, and frames; skill tree with 3 branches per Calling, 1 point per level, keystones (Executioner, Second Wind, Overdrive), reset for Lumen |
| 5.1 | 2026-11-25 | Grok portraits: female/male versions of every Calling face, and painted Ascension rank portraits (Hunter to Starborn, male and female) |
| 6 | 2026-11-25 | Act IV, The Heartstrand: Tovin Hale, Nessa Quill; Saltback Maulers (charge), Hollow Archivists (ranged), Memory Dredgers (steal buffs); The First Captain boss (pulse-shout, rifle line, recall beacons); 16 quests; Skein's portrait changes after "Skein Stays"; First Captain is now the floor-40 tower guardian |
| 6.1 | 2026-11-25 | iPhone fix: the game view no longer gets stuck at half height when the keyboard was open (found in Kasey's first real-device playtest) |
| 7 | 2026-11-25 | HUD rework: live minimap (enemies, NPCs, quest goal; tap it to travel), region name, edge arrow with distance to the current objective, power in the player card, full-width XP bar, solid bottom bar. Daily Orders: 3 jobs a day from the Lodge board (new Orders tab), Lumen and memory rewards, a bonus geode for all three, resets at local midnight. Fixes: panels open scrolled to the top, title shows your save, hero XP progress |
| 7.1 | 2026-11-26 | From Kasey's iPhone screenshots of the Hero panel: talents show names and PWR/CD tags, the talent detail and Learn button stay pinned on screen, "Spend for me" auto-assigns points into a branch; Recruit no longer uses the cartoon portrait; Appearance has a pinned Save and no duplicate title; menus size to Safari's visible screen; title tip for Add to Home Screen; save codes (Lodge, Settings) to move progress between Safari and the Home Screen app |
| 7.1.1 | 2026-11-26 | "Copy save code" button right on the title screen, so moving to the Home Screen app doesn't need the Lodge |
| 7.2 | 2026-11-26 | New interface from Kasey's sci-fi UI kit (SunGraphica "Sci Fi Game UI collection", free, commercial use allowed): nameplate player card with segmented HP, angled quest tracker, segmented boss bar, octagon frames on skills, Echo and talents, kit panels on every card, menu and dialogue box, chamfered buttons, tabs and pills, kit close and lock icons |
| 7.2.1 | 2026-11-26 | Fix: Start over now really erases the save (the exit autosave was writing it back) |
| 7.3 | 2026-11-26 | Lighting pass (graphic overhaul step 1): per-region ambient light with real light pools from lamps, fires, crystals, the Spire, the Heart and ship portholes; your hero, Echo, projectiles and skill blasts light their surroundings; soft ground shadows under props; floating glow particles; edge vignette |
| 8 | 2026-11-26 | Graphic overhaul slice: Glasswood Verge repainted with Muse's art (ground, dirt paths, glasswood trees, rocks, moss, bulbs, mushrooms, ribs, Landfall camp, the Spire, the Meridian hull, geode, roots and root door). Painted Railwarden from Grok's puppet parts, with 3 hair styles per sex and hair colour from Appearance. Painted Shardling, Glow-moth (flapping 4-wing rig) and Thorn-crawler. Railwarden effects: painted rail beam with muzzle flash and impact, Scatter Volley bolts, Recon Drone and Orbital Lance |
| 8.1 | 2026-11-26 | Test mode in the Lodge: God mode (no damage, full health, 0.4s skill cooldowns, Resonance refills), One-hit kills, and buttons for +100K Lumen, +1K Memory, +10 Geodes, +5 Levels, Skip quest and Full heal. The HUD shows a GOD / 1-HIT tag while either is on. Remove or hide before launch |
| 8.1.1 | 2026-11-27 | Fix: Skein's dialogue squeezed into one word per line and ran out of the box. Its text class clashed with the skill-button style |

## In progress

Nothing. Build 7.1 is live. Open question for Kasey: art direction for the in-game characters (cartoon sprites vs the painted portraits).

## Waiting on Kasey

- [ ] Muse: Ascension rank lines, skill tree names, 60 random names (sections 1-3 of the earlier prompt). Act IV script received and built.
- [ ] Optional: Suno track "The Heart Ashore" for the Heartstrand (prompt in chat). Until then it reuses Glassy Depths.
- [ ] Optional: have Grok or Muse playtest the live build in a browser (prompt in chat).

- [ ] Keep playtesting on the iPhone and report anything that feels slow, broken or unfinished. First real-device test found the half-screen bug (fixed in 6.1).
- [ ] Tell Claude if the tower or the Choir Below feels too easy or too hard.
- [x] Graphic overhaul slice (Glasswood Verge, Railwarden, Shardling, Glow-moth, Thorn-crawler). Shipped in build 8.
- [ ] Judge build 8 on the iPhone: if the painted Verge and Railwarden are the look, the next batches are the Verge NPCs (Marr, Sparks, Okafor), the Thornmother, the other 5 Callings, then the other regions.
- [ ] Before launch: remove or hide the Lodge Test mode section (build 8.1).
- [ ] Known gaps in the slice: the painted Railwarden ignores skin tone, face and body type, and the character creator and Hero portrait still show the old drawn version.
- [ ] Grok: Recruit rank portraits (male and female) so Rank I matches the others.
- [ ] Try build 7 on the iPhone: does the minimap, the objective arrow and the Orders tab feel right? Are the daily rewards too small or too big?
- [ ] Optional: Muse can write flavour names and lines for the Daily Orders (currently plain names like "Clear the field").

## Assets received

- UI kit: SunGraphica "Sci Fi Game UI collection FREE version" (GameDev Market). Recolored to the game palette, credited in Lodge settings.

- Art (Grok): Act I set, Act II Ribline set, Shade/Mender/tower set, Act III reef set, Ascendant Echoes, opposite-sex Calling faces, Ascension rank portraits and the Act IV Heartstrand set. All in the game.
- Music (Suno): First Light Beyond (title, tower), Glassy Horizons (Verge), Sun-bleached Frontier (Dunes), Glassy Depths (Sunken Lattice), Defending the Core (bosses). All in the game.
- Writing (Muse): Act III and Act IV scripts; tower codex, Ascend lines, idle lines, tower results. All in the game.

## Next up

1. Drop in Muse's names, rank lines and skill tree names as soon as they arrive.
2. Act V: "the order above Marr was signed by Aldren Vey." Needs a Muse script, then a Grok art batch.
3. More Echo species to hatch.
4. A real-iPhone performance pass.

## How work flows

1. Claude writes a single Grok prompt, a single Muse prompt, or a Suno prompt when assets are needed.
2. Kasey generates the assets and drops them into the Claude chat (zips for art, mp3s for music, pasted text for writing).
3. Claude builds, tests in a headless phone browser, deploys, and updates this file.
