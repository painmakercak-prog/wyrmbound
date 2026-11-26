# Wyrmbound: Starfall — Project Status

Last updated: 2026-11-26 (build 7.1 shipped)

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

## In progress

Nothing. Build 7.1 is live. Open question for Kasey: art direction for the in-game characters (cartoon sprites vs the painted portraits).

## Waiting on Kasey

- [ ] Muse: Ascension rank lines, skill tree names, 60 random names (sections 1-3 of the earlier prompt). Act IV script received and built.
- [ ] Optional: Suno track "The Heart Ashore" for the Heartstrand (prompt in chat). Until then it reuses Glassy Depths.
- [ ] Optional: have Grok or Muse playtest the live build in a browser (prompt in chat).

- [ ] Keep playtesting on the iPhone and report anything that feels slow, broken or unfinished. First real-device test found the half-screen bug (fixed in 6.1).
- [ ] Tell Claude if the tower or the Choir Below feels too easy or too hard.
- [ ] Decide: keep the cartoon in-game characters and polish them, or move toward the painted look (needs Grok).
- [ ] Grok: Recruit rank portraits (male and female) so Rank I matches the others.
- [ ] Try build 7 on the iPhone: does the minimap, the objective arrow and the Orders tab feel right? Are the daily rewards too small or too big?
- [ ] Optional: Muse can write flavour names and lines for the Daily Orders (currently plain names like "Clear the field").

## Assets received

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
