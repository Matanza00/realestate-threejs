# realestate-threejs

Scroll-driven real estate experience, "From Ground to Home": an empty plot at dawn,
a sketch of the building, floors rising, walk to the door, apartment tour at golden
hour, the building at night. Everything should read as human vision (eye height
1.6 m, walking pace, ~45° vertical FOV, damped gaze).

## Layout (one concern per module)
- `src/main.js` wires modules and runs the render loop.
- `src/config.js` chapters, building dimensions, location. Change values here first.
- `src/core/` renderer, scene, shared state (`state.progress` 0..1).
- `src/scroll/` Lenis + ScrollTrigger, writes `state.progress`.
- `src/sky/` physical sky, sun, time of day from progress.
- `src/building/` placeholder floors, rising-pour shader, sketch wireframe, night windows.
- `src/camera/` eye-level rig: camera keyframes per chapter, body + gaze springs, head bob.
- `src/world/` ground, trees, fog.
- `src/ui/` DOM HUD (floor counter, chapter text).

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
