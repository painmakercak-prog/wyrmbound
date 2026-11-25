# Wyrmbound: Starfall — Project Status

Last updated: 2026-11-25 (build 4 shipped)

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

## In progress

Nothing yet. Next build is waiting on Kasey's playtest notes and a decision on what comes next (see below).

## Waiting on Kasey

- [ ] Play builds 3 and 4 on the iPhone (Act III, the tower, Ascend, Refine, new Callings) and report anything that feels slow or wrong. Real-device performance and sound are not yet confirmed.
- [ ] Tell Claude if the tower or the Choir Below feels too easy or too hard.
- [ ] Decide what's next: Act IV, more Echo species, or polish.

## Assets received

- Art (Grok): Act I set, Act II Ribline set, Shade/Mender/tower set, Act III reef set and Ascendant Echoes. All in the game.
- Music (Suno): First Light Beyond (title, tower), Glassy Horizons (Verge), Sun-bleached Frontier (Dunes), Glassy Depths (Sunken Lattice), Defending the Core (bosses). All in the game.
- Writing (Muse): Act III script; tower codex, Ascend lines, idle lines, tower results. All in the game.

## Next up

1. Act IV: "the heart is coming ashore." Needs a Muse script, a Grok art batch and optionally a Suno track.
2. More Echo species to hatch.
3. A real-iPhone performance pass.

## How work flows

1. Claude writes a single Grok prompt, a single Muse prompt, or a Suno prompt when assets are needed.
2. Kasey generates the assets and drops them into the Claude chat (zips for art, mp3s for music, pasted text for writing).
3. Claude builds, tests in a headless phone browser, deploys, and updates this file.
