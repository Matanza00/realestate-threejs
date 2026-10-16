# Project context: realestate-threejs

_Last updated: 2026-10-16 by Claude Code (cloud project thread), after the sail build._

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
- 2026-10-16: Usman asked to build a Burj Al Arab project: model, interior, exterior, furniture, parking,
  gardens, more scroll animation, demo About/Contact pages, floor plans with buy, rent and hall rental.
  Built as "The Sail Residences", a concept study *inspired by* Burj Al Arab, with a footer disclaimer
  (not affiliated with Jumeirah; units, prices, contacts fictional). Model and textures are procedural
  (no downloaded photos, to avoid copyright issues and keep the repo light).

## Code map
See the Layout section in `CLAUDE.md` (kept there so it is loaded every session).

## Status
- Milestone 1 starter done, then replaced by the sail experience (old generic tower is in git history, commit c7d57a9).
- Sail experience: 10 scroll chapters (dawn, sketch, rising, sail unfurls, arrival over the causeway,
  atrium, royal duplex suite, sky deck, terrace, night light show), chapter rail, split-text headlines,
  counters, pinned horizontal amenities strip.
- Pages: Residences (Buy / Rent / Hall rental tabs, SVG floor plans, level picker, payment estimate),
  About, Contact (demo form). Each has a small live 3D hero of the sail.
- Checked in headless Chromium (screenshots of every chapter and page). Known rough edges: midday shots
  are bright and low-contrast; the suite is bright in afternoon sun; the level picker and calculator fade in on scroll.

## Next steps
1. Real sun position with suncalc (lat/long/date) and contrast grading for midday chapters.
2. Depth of field auto-focus and luminance-based auto-exposure (postprocessing).
3. Swap procedural parts for Blender glTF where it matters (suite furniture, fabric), KTX2 textures.
4. Video capture mode for LinkedIn exports (deterministic scroll playback).
5. Performance pass, mobile tier, deploy (Vercel or Netlify).
