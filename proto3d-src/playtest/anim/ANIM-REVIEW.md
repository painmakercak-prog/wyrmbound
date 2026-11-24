# Animation overhaul (v32) - summary, 2026-11-24

Live: proto3d/ v32. Review page: proto3d/anim-review/ (BEFORE v31 vs AFTER v32 videos + audit table).

## What changed (g3d.js, proto.js - visual only, no gameplay numbers touched)
- Mount: procedural seated ride pose (bind-pose leg bones slerped to a riding position, seat height eased). No rig ships a sitting clip; that was the standing-on-the-wolf bug.
- Impact sync: every attack clip's impact frame measured (max weapon-hand forward extension); swings start early by that wind-up using the attack cooldown, plus an approach prediction (time-to-range from closing speed) for the first swing of a fight and for mobs. Measured wind-ups (s): Sword_Slash .45, Punch_Right .71, Kick_Right .20, Gun_Shoot .05, Roll .24, Frog_Attack .42, Spider_Attack .49, Skeleton chop .38 (est, same rig family), Spell1/Staff .30 (placeholders, scholar rig not yet measured).
- Reactions: hero hit clip on HP drop, cheer on level-up and boss kill; mob procedural flinch that never cancels its attack; boss stagger only on crits and skill hits.
- Class identity: per-class attack rotations (knight sword/punch/kick, assassin punch first, mage cast/punch, ranger and gunslinger shoot paths, gunslinger skill 2 = Gun_Shoot at 1.7x "fan the hammer"); skills use distinct clips per class; ranged classes attack while moving via upper-body-only clips (spine-and-up tracks) over walk/run.
- Bosses/life: telegraph wind-up animation retimed so its impact lands when the telegraph fires; idle fidget after 6 s; NPCs wave when the hero comes close; mobs scale/rise in on spawn instead of popping; hero death plays the death clip and sinks instead of vanishing.
- Phone cost: mobs farther than 26 world units update animation at half rate. Measured camp-scene mixer cost 789 -> 772.5 us/frame (-2.1%, cap +15%).

## Verification
- Judge (judge.mjs, headless Chromium, hand-stepped clock): (a) role resolution audit in audit.mjs/audit-before.json; (b) T-pose PASS, 0 bind-pose frames / 240 samples; (c) foot slide PASS, median 0% / p90 0% of stride at steady run (was median 10.0% / p90 18.3% with the smoothed-speed clip rate); (d) impact sync PASS via sync.mjs clean-room harness: 6/6 paired swings at -33 ms (pets dismissed, skills disabled; the autoplay-based sampling in judge.mjs was too noisy and is kept for the record in judge-after.json).
- Bot thresholds: 12/12 PASS, knight and gunslinger 32-min runs (report-anim-knight.json, report-anim-gunslinger.json in playtest/).
- Videos: capture.mjs BEFORE (v31) and AFTER (v32) sets, 39 scenes each, in the review page.

## Asset gaps (Needs Kasey - no clips exist in the CC0 packs on hand)
- Scholar rig has no Wave/cheer clip: cheer falls back to the Spell2 skill clip.
- Frog and spider rigs have no hit-reaction clip: they use the procedural flinch.
- Mage rig (h_witch) has no Spell1/Spell2: cast falls back to Gun_Shoot.
