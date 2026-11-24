# UI Overhaul Review (v33)

Goal (Kasey, 2026-11-24): the UI looks like a polished mobile RPG, not a prototype, and its theme shifts with what the player is doing. Gameplay timing and numbers untouched.

## What shipped
- One coherent look: Kenney "UI Pack - Adventure" (CC0 1.0) skins for buttons, panels, banners; "UI Pack RPG Extension" (CC0) borders and bar segments; MedievalSharp display font (SIL OFL 1.1), subset to 20 KB woff2.
- Icon atlas (65 glyphs, 70 KB webp): 32 Kenney Game Icons glyphs (CC0) + 33 glyphs authored in-house as flat silhouettes in the same language (Kenney has no fantasy item/creature glyphs). All ~147 emoji occurrences in game.js, proto.js, field.js and the HTML were replaced by atlas icons, CSS dots, or plain text (canvas-rendered floaters keep emoji, they are drawn glyphs, not DOM).
- Theme tokens: one token set (panel, ink, gold, accent, button gradients, HP/XP bars, nav, HUD) with per-context variants: village, isle0 Bloomvale, isle1 Sunken Ruins, isle2 Frostvein, isle3 Ashcrown, boss (red alert), tower (arcane violet). Theme is picked live (tower > boss > village proximity > current isle), crossfades in 300 ms, boss theme scales the skill cluster x1.07.
- Feel: tap sound on every button press (existing AUD synth), gold flash overlay on level-up and new gear, press-scale on the event cluster, all tap targets >= 44x44 (mute 30->44, panel close 44, nav 56 tall, .btn min-height 44).
- Payload growth about +125 KB (budget was 1.5 MB).

## Verification
- UI checks (contrast 4.5:1 / 3:1 large, targets >=44, no overflow at 360px, zero DOM emoji), every screen x 3 sizes: BEFORE (v31) 2206 contrast / 366 targets / 123 overflow / 380 emoji findings; AFTER (v33) 0 / 0 / 0 / 0.
- Audit instrument fix, disclosed: the Step 0 checker's background walk skipped solid rgb() backgrounds, undercounting verifiable contrast failures (it reported 252 before). The walk was corrected and the BEFORE build re-measured with the corrected checker (2206). The 4.5:1 requirement never changed; the fix made the checker stricter.
- Per-theme audit (7 themes x 3 sizes x HUD+panel): all zero findings.
- Cost (same box, software WebGL): load-to-ready 8233 ms -> 6141 ms (-25.4%); median frame 866.7 ms -> 883.2 ms (+1.9%). Gate was +10%.
- Gameplay bot: all 12 thresholds pass on v33, knight and gunslinger (report-ui-knight.json, report-ui-gunslinger.json). One real bug found by the bot: the gold-flash MutationObserver crashed headless environments; it is now feature-guarded (no behavior change in browsers).

## Known gaps / Needs Kasey
- BEFORE screenshots are v31 (the parked 2.5D-era build was never the UI baseline; v32 changed animation only, no UI).
- Real-iPhone checks still open: FPS on a real GPU, synthesized SFX audibility, Ossivar fight feel.
- Carried over: revolver points backward (cosmetic, one-line fix on your call); workspace/tmp cleanup; playtest folder clutter deletion.
