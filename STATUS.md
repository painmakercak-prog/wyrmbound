# Wyrmbound: Starfall — Project Status

Last updated: 2026-11-25 (build 4 in progress)

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

## In progress: build 4 (Act III, "Memory of Water")

- New region: the Sunken Lattice (drowned crystal reef inside a dragon's ribcage)
- New characters: Ilse Vane, Bix, Pell. Corvin, Mother Hush, Marr and Okafor return
- New enemies: Lattice Skitter, Drowned Husker, Memory Leech. Boss: the Choir Below
- 16 quests, 11 new codex entries, Act III end card
- Muse's extra writing: Aldren Vey's tower logs every 10 floors, Ascend lines, idle lines for every character, tower knockout lines
- Ascendant Echo art in menus

## Waiting on Kasey

- [ ] Optional: Suno track "Memory of Water" for the Sunken Lattice (prompt in chat). Until it arrives, the reef reuses Glassy Horizons.
- [ ] Play builds 3 and 4 on the iPhone and report anything that feels slow or wrong. Real-device performance and sound are not yet confirmed.
- [ ] Tell Claude if the tower feels too easy or too hard (guardian floors especially).

## Assets received

- Art (Grok): Act I set, Act II Ribline set, Shade/Mender/tower set, Act III reef set and Ascendant Echoes. All used.
- Music (Suno): First Light Beyond (title), Glassy Horizons (Verge), Sun-bleached Frontier (Dunes), Defending the Core (boss). All used.
- Writing (Muse): Act III script; tower codex, Ascend lines, idle lines, tower results. Going into build 4.

## Next up (after build 4)

1. Act IV: "the heart is coming ashore." Needs a Muse script, a Grok art batch and optionally a Suno track.
2. More Echo species to hatch.
3. A real-iPhone performance pass.

## How work flows

1. Claude writes a single Grok prompt, a single Muse prompt, or a Suno prompt when assets are needed.
2. Kasey generates the assets and drops them into the Claude chat (zips for art, mp3s for music, pasted text for writing).
3. Claude builds, tests in a headless phone browser, deploys, and updates this file.
