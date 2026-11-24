# MORNING.md — Overnight run, 2026-11-23 night → 2026-11-24

Live build: https://painmakercak-prog.github.io/wyrmbound/proto3d/
Status at wrap-up: **PENDING FINAL PUSH** (see "Push state" — filled in at the end of the night)
Shipping build: v31. All 12 bot thresholds pass on both graded classes, including
two full 6-hour soaks.

Everything below was verified by the playtest bots against the exact files that ship.
One honest exception, flagged where it matters: this box has no GPU, so the real-browser
runs render through Chromium's SwiftShader software GL. Frame rates measured there
(~2–4 FPS) measure the software rasterizer, not the game and not a phone. Gameplay
checks in the real browser are real; the FPS number is not gradeable here and is
listed under "Needs Kasey" for a real-device check.

---

## Threshold table — baseline vs final

Thresholds live in `proto3d-src/playtest/thresholds.json`. They were only ever
tightened tonight, never loosened. "Baseline" = the first bot run (2026-11-23,
pre-overdrive build). "Before" = the failing report committed first for the new
thresholds (commit df996d5). "Final" = build v31 (v28 + boss watchdog + XP soft cap + tower retune; 32-minute
numbers identical), Node bot, 32-minute runs.

| Check | Threshold | Baseline | Before (v23) | Final knight (v28) | Final gunslinger (v28) |
|---|---|---|---|---|---|
| Console errors | 0 | 0 ✅ | 0 ✅ | 0 ✅ | 0 ✅ |
| First boss reached | ≤ 10 min | never ❌ | 217s ✅ | 132s ✅ | 127s ✅ |
| First boss fight length | 45–120s | — | 47.2s ✅ | 104.8s ✅ | 75.2s ✅ |
| First boss tries | ≤ 2 | — | 1 ✅ | 1 ✅ | 2 ✅ |
| Max dry stretch (no level/loot/quest step) | ≤ 180s | 1716s ❌ | 175s ✅ | 107s ✅ | 93s ✅ |
| Level at 30 min (context) | — | stuck at 9 from min 5 | 27 | 23 | 24 |
| Danger before 2nd boss (death, or HP < 25%) | required | n/a | FAIL (never dropped) | ✅ HP dipped to 20.8% | ✅ died once (HP −10.8%) |
| Gold spent by min 30 | ≥ 50% of earned | n/a | FAIL (0 of 88,558) | ✅ 99.8% | ✅ 99.5% |
| Boss HP same for every class | parity | n/a | FAIL (8,640 vs 16,416) | ✅ 8,640 = 8,640 | ✅ |
| Wyrm Tower reached | ≤ 3 sim-hours | n/a (no tower) | n/a | ✅ entered at 37 min (200-min run) | (knight run is the graded one) |
| Tower run eventually fails | required | n/a | n/a | ✅ best floor 23, run ended | |
| No NaN/Infinity in stats | required | n/a | n/a | ✅ (and see soak) | ✅ |
| FPS (real browser, 4x CPU throttle) | ≥ 30, no >1s under | modeled pass | modeled pass | ⚠️ NOT GRADEABLE on this box — SwiftShader software GL runs ~2–4 FPS regardless of throttle or game load. Renderer cost cuts shipped anyway (Block 3). Needs a real phone. | |

Soak test (6 simulated hours): the first soak, on v27, FAILED — a 1,999s dry stretch
and gold exploding to 5.4e39 / Lv 363. After the Block 5 fixes, the **v28 knight
soak PASSES ALL 12 CHECKS**: dry stretch 115s, final gold 31,345 (bounded), Lv 39,
no NaN/Infinity anywhere, tower entered at 21 min with best floor 20 across 46 runs
(and runs still fail, as designed), 63 deaths over 6 hours, end-of-run heap 64 MB.
The **v28 gunslinger soak FAILED one check**: a 10,070s dry stretch — the fight log
shows a single Gnarlroot alive for 9,925s without taking damage or killing the hero
(an autoplay wedge: unreachable or kiting-deadlocked boss). Fixed in v29 with a boss
watchdog (below). The **v29 re-run: knight PASSES ALL 12 again; gunslinger's wedge is
gone but a 311s dry stretch remained** — at Lv ~40 a single level cost ~76,000 XP
(the cost curve grows ×1.22 per level forever), so inside a boss training loop no
progress signal fired for 5 minutes. Fixed in v30 with an XP soft cap (below).
The v30 soak then showed one more dry window (knight, 228s): a single deep Wyrm
Tower floor fight against a ~5M HP sponge. Fixed in v31 by retuning tower scaling
(HP ×1.28/floor, ATK ×1.24/floor — fights shorter, lethality still compounding).
**Final soak on v31, both classes: ALL 12 CHECKS PASS.** Knight: worst dry stretch
110s (116s even on the strict no-loot measure), tower best floor 23, 48 deaths in
6 hours. Gunslinger: worst dry stretch 75s (76s strict), tower best floor 23,
85 deaths. Gold ends bounded (4,880 / 11,479), no NaN/Infinity, heaps 37–72 MB.
One instrument note, in the open: the bot's dry-stretch progress signal now counts
kills and gold pickups as progress, because the threshold's own wording is "no
stretch over 3 minutes without a level/loot/quest step" and loot was not being
counted. The threshold value (180s) never changed, the strict measure is still
computed and reported in every soak report (maxDryStrictSeconds), and the real
wedge that started all this (zero kills, zero gold, 9,925s) fails both measures.
On v31 both classes pass both measures anyway.

Real-browser run (Playwright, real 3D render, locally served byte-identical files —
Chromium on this box cannot reach remote URLs at all, verified repeatedly): the
graded run played the real build under autoplay until a box restart killed the
runner at ~64 wall-minutes (its in-memory report died with it; the log survives).
What it established before dying: Lv 9 reached, 2 boss fights recorded, 2 deaths,
hero HP hit −0.04 (a death in the opening minutes — the danger behavior is present
in the real build, not just the sim), gold earned/spent both flowing (3,258 earned /
3,500 spent at last log), and no console or page errors in any real-browser session
tonight (the separate gimmick tour reported 0 page errors). At SwiftShader speed
the game clock runs ~0.1× wall speed, so a full 32-game-minute grade was not
reachable in the run's 80-minute cap — the full graded passes are the Node bot's,
on the identical files. Screenshots captured from the real build: Gunslinger class
select (revolver description live), a live Gnarlroot fight with the boss HP bar
reading 8,640 (the parity number, on screen), and all four zone gimmicks — the
Ashcrown frame even caught the "Lava pools burn anyone standing in them" toast.
Honest caveat on the telegraph shot: it was captured while a telegraph was active
in game state during the boss fight, but the ground marker is not clearly
distinguishable in the still frame (the boss was off-screen north at that moment).

---

## What each block did

### Block 1 — Real bot + tightened thresholds
- Playwright bot (`proto3d-src/playtest/realbot.mjs`, dev-only, never ships) drives the
  real build in headless Chromium with software WebGL, records real frame times at 4x
  CPU throttle, captures console/WebGL errors, and screenshots: Gunslinger class select,
  one boss telegraph, each zone gimmick.
- Three thresholds added (tighten only): danger before the 2nd boss, gold spent ≥ 50%
  of earned by minute 30, boss HP identical for every class. The failing report was
  committed BEFORE any fix (df996d5, `report-before.json`).
- Probe bug found and fixed in both bots: HP ratio was measured against the wrong
  pool (pet HP excluded, starter gear not yet applied), which fabricated a 0.53
  reading at spawn. True in-combat minimum on the old build was 0.728 — the danger
  failure was real, the number was not.

### Block 2 — Game fixes (commit 7e5cea9)
- Gunslinger-only boss HP boost (×1.9) removed. Boss HP is now identical for every
  class (8,640 on isle 0). Gunslinger rebalanced through his own stats instead:
  attack-speed bonus +18 → +10, crit bonus .12 → .06, class ATK multiplier 1.2 → 1.0
  (plus +10 dodge added later in Block 5 — his identity is mobility).
- Forge gold sink: gear can be forged +1 (item stats ×1.06 per level), with a button
  in the gear panel and an autoplay routine that keeps forging the lowest-upgraded
  affordable piece. Final tuning (Block 5): cost = 30 × item level × 1.18^up.
- Bosses got dangerous through telegraphs, not HP: boss ATK ×1.8 → ×2.3 (isle 0 ×1.5
  more), isle-0 camp mobs ATK ×2.0, and telegraph hits now add a % of the hero's max
  HP on top of flat damage (final: slam 24%, charge 19%, ring 15%) so they stay
  threatening as gear grows.
- Scaling caps: boss stat tier capped at 26 like regular mobs (isle ≥2 bosses were
  rolling tier 27–37 stats).
- Save version 3 + additive migration (see Task 4 proof below).

### Block 3 — Phone performance (commit f97c4bb)
The real-browser FPS check cannot pass or fail honestly on this hardware, so the
prescribed cost cuts were applied anyway: pixel ratio 1.5 → 1, MSAA off, shadow map
2048 PCFSoft → 512 PCF, shadow re-render throttled to every 3rd frame. All bot checks
still pass. Whether a real phone holds 30 FPS is unverified — see Needs Kasey.

### Block 4 — Wyrm Tower endgame (commit 3fb2291)
After the 4th isle the game used to loop recolors forever. Now there is one endgame
mode, built from existing pieces: the endless Wyrm Tower at the zone lair, cycling
the four zone bosses with their telegraph kits. Floor scaling compounds (HP ×1.32,
ATK ×1.22 per floor) so every run ends. Rewards (300×floor gold, 10×floor shards,
+1 egg every 5th floor) feed the forge sink and power growth. Best floor is saved
(S.wbest), runs counted (S.wruns), unlocked after clearing all four isles, listed in
the Events panel, and autoplay enters/re-enters on its own. Verified on a 200-minute
bot run: tower entered at 37 minutes, best floor 13 across 3 runs, a floor was
failed as designed, all checks pass.

### Block 5 — Soak fixes (commits 1e41357 + f55b4e1 + c757269 + tower-scaling)
The first 6-hour soak (v27) failed two ways; both are fixed and re-verified at 32
minutes on both classes (soak re-run results at the top of this file):
- Gold explosion: quest and chest rewards scaled as 1.12^(isle×10) with no cap while
  the isle counter loops forever — 5.4e39 gold and Lv 363 by hour 6. `zoneTier()` is
  now capped at 26, which bounds every reward that scales with it. (Combat was
  already capped at the use sites, so fights are unchanged.)
- 33-minute dry stretch: quest bosses used to fully heal and teleport home every
  time the hero died, so a hard boss could stall progress indefinitely. Quest bosses
  now keep their damage between tries, like hunts always did. Knight deaths per
  32-minute run dropped from ~24 to ~15 and the longest boss fight is ~4 minutes.
- Forge stall: the forge (and tower re-entry) timers ran on F.now, the per-zone
  game clock, which resets to 0 on every zone change — so both silently stopped
  working for minutes after each zone hop. They now run on wall-clock time.
- Gunslinger +10 dodge (see Block 2 note).
- Boss wedge watchdog (v29, after the gunslinger soak failure above): if the active
  boss takes no damage for 150 seconds under autoplay, it charges the hero —
  guaranteeing engagement. Any damage resets the timer, so healthy fights (longest
  legit: ~250s of continuous damage) never trigger it; 32-minute regressions on
  both classes are byte-identical in pacing with it installed.
- XP soft cap (v30): level cost stops growing at Lv 25 (60 × 1.22^24 ≈ 7,900 XP),
  so late-game levels keep ticking every few minutes of grinding instead of every
  few hours. Everything under Lv 26 is untouched — the 32-minute regressions are
  identical — and the tower's compounding floors still outscale the hero, so
  tower runs still end.
- Tower scaling retune (v31): floor HP growth ×1.32 → ×1.28, ATK growth ×1.22 →
  ×1.24. Deep floors were HP sponges (a ~5M HP floor took 228s of continuous
  fighting); now the longest fights sit near two minutes while the ATK curve
  keeps every run mortal (best floor 23 for both soak classes, runs still fail).

### Save safety (Task 4)
A save written by the pre-overnight build (commit 26d6af3, save version 1 shape) was
loaded into the current build by `proto3d-src/playtest/mig-test.mjs`: all 14 checks
pass. Version bumped to 3, every progress field intact (Lv 12, isle 1, stage 3,
gear, pet, lodge, tower), gold 5,000 → 6,256 from the legitimate offline-earnings
grant, new fields (pms, fs, bossKills, wbest, wruns) defaulted. Nothing was wiped.

---

## Reverted tonight (and why)
- Pack pulls (mobs chaining aggro to campmates): caused a total progression
  collapse — quest kills happened away from the hero's defend position and quest
  credit never advanced. Reverted within the session.
- Boss ATK ×3.1 + slam ×3.6 spike: 15 deaths and a 14-try / 654-second boss fight.
  Replaced by the % max-HP telegraph tuning above.
- Forge cost curves 40×1.6^up and 40×1.35^up: both stalled or lumped spending so
  the minute-30 gold ratio swung between 0.29 and 0.99 depending on run phase.
  Final curve 30×1.18^up spends smoothly (0.995+ on both classes).

## Visual issues logged, not fixed (no cosmetic work tonight, per orders)
- The Gunslinger's revolver points BACKWARD in his hand (barrel toward/behind him)
  in the class-select preview and in game. Confirmed on the live v23 build. The fix
  is a 180° rotation on the weapon attach (WROT['Revolver']) or flipping the GLB
  conversion — one line, but it's cosmetic, so it's your call.
- Cylinder/wood grain on the revolver are hard to distinguish at preview size.

## Needs Kasey
1. **Revolver flip** — say the word and the one-line rotation fix ships.
2. **Real-iPhone checks** — FPS on a real GPU (the renderer cuts shipped blind;
   this box literally cannot measure it) and whether the synthesized SFX are
   audible on the phone speaker. Both need 2 minutes on your phone.
3. **Isle-1 boss feel** — Ossivar is still the longest fight in the data (up to
   ~216s across 4 tries for the knight in cycle 1). It passes every threshold;
   whether it *feels* fair is your call.
4. **Disk** — ~/workspace/tmp holds ~55G of old music-build intermediates from
   other projects. I did not touch it. A cleanup pass would free real space.
5. **Playtest folder clutter** — diagnostic reports (report-dbg/trace/mig/goals)
   from earlier sessions are still in proto3d-src/playtest/. Deleting needs your OK.

## Next 3 priorities, ranked by bot data
1. **Real-device performance verification + a quality scaler.** FPS is the only
   threshold class never honestly measured. If a mid-range phone dips, an
   auto quality step-down (shadows off → fewer particles) is the fix.
2. **Boss-fight length variance on repeat cycles.** The 45–120s band only grades
   the first fight; later fights swing 11–250s. Repeat-cycle bosses (especially
   Ossivar) are the outlier tail in every long run.
3. **Gunslinger's first 5 minutes.** He is the only class that dies before the
   second boss as a matter of course (that's currently how he passes the danger
   check), and his first boss sits at the edge of the band (75.2s, 2 tries).
   A small early survivability bump (starter charm or +HP on his first forge
   tier) would smooth his start without touching his identity.

## Push state
- v23 (revolver): main a04832f, gh-pages b698022 + 0d4663f — live-verified.
- v27 (overnight blocks 2–4 + perf): main ca4f569 + 4a0bbe9 + 7f7d145,
  gh-pages 0b4ae2e — live title screen verified after hard refresh.
- v31 (Block 5 complete, shipping build): local commits through the tower-scaling
  commit. **PUSH PENDING — filled in at wrap-up.**
- report-before.json: missed the v27 upload wave (file-grant issue); goes up with
  the final wave.
