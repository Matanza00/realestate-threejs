# Project context: realestate-threejs

_Last updated: 2026-10-16 by Claude Code (cloud project thread)._

## Goal
Build Three.js applications only. First product: a scroll-driven, interactive real
estate website ("From Ground to Home") to sell to developers, agencies and architects
through LinkedIn. It must look natural, like human vision, not like a video game.

## People and accounts
- Owner: Usman (GitHub `Matanza00`).
- Repo: https://github.com/Matanza00/realestate-threejs
- Tools: Claude Code (moving to VS Code) and Claude Chat (claude.ai, on a different account).
  Synced only through this `context/` folder.

## Decisions made
- 2026-10-16: Picked concept G (scroll-built architecture / real estate) out of 13 concepts
  (`research/threejs-site-concepts.md`). Target market: real estate on LinkedIn.
- 2026-10-16: Creative direction "From Ground to Home" (`research/real-estate-scroll-concept.md`):
  eye-level camera at 1.6 m, walking pace, ~45° vertical FOV, gaze leads body, head bob,
  auto-exposure, real sun. Rule: if a person holding a camera couldn't film it, don't do it.
- Story: plot at dawn → architect's sketch → floors pour up → walk to the door →
  apartment at golden hour → building lit at night.
- LinkedIn output: live site + 30–45 s vertical video recorded from the scroll timeline + 5-slide carousel.
  Build it as a white-label template.
- Defaults (changeable): sun location Dubai; 14-floor placeholder tower; showcase unit on floor 7, west-facing.
- Stack: Vite + vanilla Three.js + GSAP ScrollTrigger + Lenis. Postprocessing comes in milestone 4.
- Token budget: Graphify for code questions, one module per concern, edit one module at a time.

## Code map
- `src/config.js` chapters (scroll ranges + hours), building size, location.
- `src/core/` renderer (AgX tone mapping, 45° FOV), shared `state`.
- `src/scroll/scroll.js` Lenis + ScrollTrigger → `state.target`.
- `src/sky/sky.js` physical Sky, sun from hour, eye-adaptation exposure.
- `src/building/` floors, rising "pour" shader (`pour.js`), sketch lines, night windows, placeholder room.
- `src/camera/rig.js` shot list (`SHOTS`), body/gaze springs, hard cuts with a blink, head bob, pointer look-around.
- `src/world/world.js` ground, plot, path, growing trees, distant city, fog.
- `src/ui/hud.js` floor counter, construction quarter, clock.

## Status
- Milestone 1 (starter) done: all 6 chapters play on scroll with placeholder geometry.
  Checked in headless Chromium at 8 scroll points.
- Repo pushed to GitHub (main). Claude GitHub App installed, cloud sessions can push.

## Next steps (milestones from the concept doc)
2. Sky + real sun (suncalc, real lat/long/date) and time of day polish.
3. Fat-line pencil sketch draw-on with paper grain; better pour edge.
4. Eye-level camera polish: depth of field auto-focus, luminance-based auto-exposure.
5. Real interior (Blender glTF, baked lighting) + furniture style toggle.
6. Floor plan drawer, sun slider, measure tool.
7. Video capture mode for LinkedIn exports.
8. Performance pass, mobile tier, deploy.
