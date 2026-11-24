# UI overhaul - asset map (Step 1 output, 2026-11-24)

## The one look: Kenney fantasy (all CC0 1.0, license files inside each zip)
- Skin (buttons, panels, banners, bars): UI Pack - Adventure 1.1 - https://kenney.nl/assets/ui-pack-adventure
- Panel borders/dividers: UI Pack RPG Extension - https://kenney.nl/assets/ui-pack-rpg-expansion
- Icon glyphs: Game Icons + Game Icons Expansion (White 2x) - https://kenney.nl/assets/game-icons , https://kenney.nl/assets/game-icons-expansion
- Base UI Pack 2.0 also on hand (CC0) but its flat style stays OUT to keep one look.
- Display font: MedievalSharp (SIL OFL 1.1, wmk69) for titles; system font for body/numbers.
- Kenney glyphs do not cover fantasy item/creature icons (egg, dragon, sword...). Those ~26 glyphs are AUTHORED in-house as flat silhouettes in the same Kenney glyph language and join the same atlas in Step 3. They are original art, not Kenney art, and CREDITS.md says so.

## Delivery through the existing build pipeline
- build3d/out/ui/*.webp -> window.UI data URLs -> --ui-<name> CSS vars / [data-ui] imgs.
- Icon atlas: ui-assets/atlas/icons.webp (Kenney glyphs, 25 KB) + icons.json rects; authored glyphs extend it in Step 3.
- Added-download budget: 1.5 MB total. Atlas 25 KB + skin WebPs + subset font (~25 KB) lands far under.

## Emoji -> icon (50 distinct; Kenney = K, authored = A, existing game art = G, CSS dot = C)
💎 diamond(K) · 🥚 egg(A) · 🍖 meat(A) · 🗝 key(K) · 🐉 dragon(A) · 🗼 tower(A) · ⚔ sword(A) · 🏹 bow(A) ·
🟢 dot(C) · 🧝 class portrait(G) · 💚 heart(A) · 🐲 dragon(A) · 🔊 audioOn(K) · 🏆 trophy(K) · ⭐ star(K) ·
🛡 shield(A) · 🔥 flame(A) · ⛑ helmet(A) · 🥋 armor(A) · 🧤 glove(A) · 👢 boot(A) · 📿 amulet(A) · 🍄 mushroom(A) ·
🐸 frog(A) · 🦀 crab(A) · 💀 skull(A) · 🐺 wolf(A) · 🪨 rock(A) · 🦇 bat(A) · 🌳 tree(A) · ☠ skull(A) ·
🌋 volcano(A) · 💥 burst(A) · 🐾 paw(A) · 📜 scroll(K) · 🙏 hands(A) · ⬆ arrowUp(K) · 🏕 tent(A) · 🧺 basket(A) ·
💰 sack(A) · 🎟 ticket(A) · 🗡 sword(A) · 📖 book(A) · 🤠 hat(A) · ⚪ dot(C) · 🎁 gift(A) · 🔇 audioOff(K) ·
🌟 star(K) · ✅ checkmark(K) · 🔒 locked(K) · ✕ cross(K)

## Skin picks (Adventure, Double size unless noted)
Buttons: button_brown (primary), button_red (danger/boss), button_grey (secondary); pressed = same art darkened + 1px translate (CSS) with the pack's *_close for icon buttons.
Panels: RPG Expansion panel borders + Adventure panelInset/panel backgrounds; bars: Adventure barBack/barGreen/barRed segments.
