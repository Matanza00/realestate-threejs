# realestate-threejs

Scroll-driven real estate experience, "From Ground to Home": an empty plot at dawn,
a sketch of the building, floors rising, walk to the door, apartment tour at golden
hour, the building at night. Everything should read as human vision (eye height
1.6 m, walking pace, ~45° vertical FOV, damped gaze).

## Layout (one concern per module)
- `index.html` + `src/main.js`: the scroll story. Wires modules, runs the render loop. `window.__sail` exposes camera/state for browser tests.
- `src/config.js` chapters (scroll range, hour, indoor exposure), sail dimensions, island, location.
- `src/core/` renderer (ACES, 45° FOV), shared `state` (progress 0..1).
- `src/scroll/` Lenis + ScrollTrigger -> `state.target`.
- `src/sky/` physical sky, sun by hour, env map, night sky gradient, eye-adaptation exposure.
- `src/sail/` the sail tower: `shape.js` (profile + plan math), `tower.js` (wings, fabric, exoskeleton, mast, helipad, sky deck, sketch lines, light show), `textures.js` (procedural canvas textures).
- `src/shaders/pour.js` rising-height reveal used by the build chapter.
- `src/world/world.js` sea shader, island, rocks, terrace + pools, causeway, beach, parking + cars, palms, city, fountain.
- `src/interior/` `furniture.js` kit, `atrium.js`, `suite.js` (staged duplex, shown only in its chapter).
- `src/camera/` `shots.js` (shot list per chapter, cuts) and `rig.js` (springs, head bob, look-around).
- `src/ui/` HUD, chapter rail, split-text/counter/horizontal-strip animations.
- `residences.html`, `about.html`, `contact.html` + `src/pages/` (demo data, mini hero scene, page logic).

## Token budget
- Use the installed design skills (threejs-webgl, gsap-scrolltrigger, web3d-integration-patterns,
  modern-web-design); load only the one the task needs.
- Never read node_modules/, dist/, minified files, or binary assets (.glb, .hdr, .ktx2, textures).
- Edit one module at a time; answer with diffs or the changed function, not whole files.

## Shared context with Claude Chat (read first, every session)
- Before any work, read `context/PROJECT_CONTEXT.md`, then the newest file in
  `context/log/claude-chat/` and in `context/log/claude-code/` (skim, don't read every old log).
- `PROJECT_CONTEXT.md` is the source of truth. Before finishing a session, update its
  "Decisions made", "Status" and "Next steps" sections and keep it under ~200 lines.
- If the user pastes "CONTEXT UPDATES" from a Claude Chat log, merge them into `PROJECT_CONTEXT.md`.
- The SessionEnd hook exports this conversation to `context/log/claude-code/`; never edit old logs.
- See `context/README.md` for how the sync works and `context/PROMPTS.md` for the prompts.
