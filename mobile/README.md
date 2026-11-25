# Mobile DEV.16-RC1

`index.html` (root) selects one entry before game initialization; `mobile/index.html` generated from canonical `index.template.html` loads only the mobile-specific controls plus the shared game. Desktop uses `desktop.html` without mobile JS/CSS. Run `node tools/build-entry.cjs` after any source edit; `--check` verifies output. Root router supports ?device=mobile or ?device=desktop. Do not manually edit generated HTML.

Mobile files: `fullscreen.js` (landscape/coordinates), `touch-input.js` (capture/cancel and ranges), `mobile.js` (pedals), `mirror-touch.js` (one active grip), `cabin-controls.js` (pointer dispatch + overlay controls), `layout.js`/`mobile-config.js` (sizes), `transmission.js` (2D fallback shift input), `modal-touch.js` (scroll and in-page select), `music-player.js` (embed handshake), `mobile-help.js` (tutorial), `mobile.css` (mobile presentation).

Host uses existing game actions and mirror/shift APIs. `TruckMobileTouch.release()` cancels tracked gestures. The shared 3D gear projection and optical renderer are not replaced. See migration ledger and unverified release gates in `docs/QA_dev16/`.
