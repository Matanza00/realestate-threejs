# "From Ground to Home": real estate scroll experience

Creative direction for concept G, aimed at selling to real estate developers,
agencies and architects on LinkedIn.

## The big idea

Most property 3D sites feel like a video game: a floating model, orbit controls,
CG-perfect light. This one feels like **standing on the plot yourself**. Every
camera move, light change and focus shift copies how a human eye sees, so the
viewer forgets it is 3D and starts imagining living there.

Pitch line for LinkedIn: *"Your buyers can't visit a building that doesn't exist
yet. So let them stand in it."*

---

## 1. What "human natural vision" means, made concrete

| Real eye behavior | How we fake it in Three.js |
|---|---|
| Eyes sit at about 1.6 m | Camera height 1.6 m in every walking shot; drone shots are rare and slow. |
| Natural field of view | A 35–50 mm lens equivalent (vertical FOV about 40–50°), never wide-angle distortion. |
| You walk, you don't glide | About 1.2 m/s walking speed, a tiny sinusoidal head bob (±1 cm), slight sway when turning. |
| Eyes move first, then the head | The look-at target leads the camera body by about 200 ms (two damped springs). |
| Focus follows attention | Depth of field auto-focuses on the object under the cursor or the current chapter's subject, with a slow rack-focus. |
| Pupils adapt to light | Auto-exposure: walking from bright balcony to interior blooms, then settles over about 1 s. |
| Real light is warm and imperfect | Physical sky plus a sun from a real lat/long and date; AgX tone mapping; soft contact shadows; light bounce baked in Blender. |
| Peripheral vision is softer | Very light vignette plus a small chromatic falloff at the edges. No heavy "cinematic" filters. |
| Life in the scene | Curtains moving in the wind, tree leaves, dust motes in sunbeams, birds, distant traffic sound, reflections in glass. |
| Nothing is perfect | Slight wear on materials, a mug on the counter, a book left open, roughness maps with variation. |

Rule: **if a move couldn't be filmed by a person holding a camera, it's not allowed** (except the opening and closing shots).

---

## 2. The scroll story (6 chapters, about 600vh)

**0. The empty plot, dawn (0–10%)**
Eye level on bare land. Mist, birdsong, first light on the horizon. A single
line of headline text: the project name. Scroll starts the day.

**1. The architect's line (10–25%)**
A hand-drawn pencil line sketches the building's outline *in the air* (an
animated line shader with paper-grain texture). The sketch thickens into blueprint
lines, then a ghostly wireframe standing on the real plot. It's the
"imagination" stage, which ties into the buyer's own imagination.

**2. The build, morning (25–45%)**
The building rises floor by floor out of the wireframe. Not dropping in like a game:
concrete pours upward (a dissolve shader with a rising mask), glass panes catch the sun one
by one, scaffolding appears and then disappears. The sun climbs, shadows swing across the
ground in real time. A small counter shows "Floor 7 of 14" and the timeline
(Q1 2026 → Q4 2027).

**3. Walk to the door, midday (45–60%)**
Camera drops to eye height and walks up the path: landscaping grows in,
a neighbor's dog, the lobby doors slide open. Auto-exposure adapts as you enter.

**4. The apartment, afternoon to golden hour (60–85%)**
A walk-through on a spline at walking pace: living room → kitchen → bedroom →
balcony. Focus racks to details (stone countertop, oak floor grain). Light
turns golden as you reach the balcony and the view opens up. **This is the shot
that sells.**

**5. Night, the building lives (85–100%)**
Camera pulls back to a human-height street view across the road. Windows light
up one by one (people "moving in"), city lights behind. Call to action:
"Book a visit / Reserve a unit."

---

## 3. Interaction (when the user stops scrolling)

- **Look around:** mouse or gyroscope moves the head a few degrees, with damping. It feels like turning your head, not orbiting.
- **Click a floor (chapter 2):** that floor slides out like a drawer and becomes a top-down plan with unit prices and availability (green/red).
- **Sun slider:** drag the time of day and see real light on the unit for any hour and season ("Will my living room get morning sun in winter?"). Strong selling point for buyers.
- **Style toggle (chapter 4):** Minimal / Warm / Luxury furniture sets cross-fade with a soft dissolve.
- **Measure:** tap two points on the floor and get the real distance in m and ft.
- **"Stand here":** click any spot in the apartment to walk the camera there at walking pace.
- **Ambient sound** (off by default, one toggle): birds, city hum, interior quiet.

---

## 4. Why it works on LinkedIn

LinkedIn is a feed of video and carousels, and people rarely leave the app. So we ship three things from one scene:

1. **The live site:** a link in the first comment, for the people who click.
2. **A 30–45 s vertical video (1080×1350 or 1080×1920)** recorded from the scroll timeline itself (deterministic playback → `CCapture`/`MediaRecorder`). That's the post. Hook in the first 2 s: empty plot → pencil line appears.
3. **A 5-slide carousel PDF** of key frames: plot, sketch, build, interior, night.

Content series idea: "Building in public" posts of each chapter as it gets made. It doubles as marketing for the studio's services.

**Business angle:** build it as a **white-label template**. Swap the glTF building, the location (sun data), the brand colors and the unit data, and you have a new client site. Target customers: off-plan developers, luxury agents, architecture firms.

---

## 5. Tech plan

- **Stack:** Vite + Three.js (vanilla) + GSAP ScrollTrigger + Lenis + postprocessing (DoF, bloom, vignette, auto-exposure via luminance). R3F only if the unit/plan UI gets large.
- **Assets:** Blender model split per floor + interior as separate glTF (Draco + KTX2). Lighting baked to lightmaps for the interior; real-time sun for exterior. Free placeholder building first (e.g. a CC0 Sketchfab/Poly Haven asset), real client model later.
- **Sky and sun:** `three/examples` `Sky` + sun position from the `suncalc` library (real lat/long/date).
- **Build effect:** per-floor `onBeforeCompile` shader with a world-height reveal mask + noise edge (concrete "pour"), glass `MeshPhysicalMaterial` with transmission.
- **Sketch effect:** `Line2` fat lines with a dash-offset draw-on and a paper-grain overlay.
- **Camera:** two damped springs (body + gaze) following `CatmullRomCurve3` rails per chapter; head bob added on top.
- **Performance tiers:** desktop (full post, real-time shadows) / mobile (baked shadows, no DoF, DPR 1.5). `prefers-reduced-motion` → cross-fading stills.
- **Modules:** `scene/ sky/ building/ interior/ camera/ scroll/ ui/ post/ capture/`, one concern each, so Graphify maps it cleanly and edits stay small.

## 6. Build milestones

1. Starter: Vite + Three + GSAP + Lenis, scroll chapters wired to a progress value, placeholder boxes as floors.
2. Sky + real sun + time of day tied to scroll.
3. Floor-by-floor build shader + pencil sketch intro.
4. Eye-level camera system (springs, head bob, DoF, auto-exposure).
5. Interior walk-through with a placeholder apartment + style toggle.
6. Floor plan drawer, sun slider, measure tool.
7. Video capture mode for LinkedIn exports.
8. Perf pass + mobile tier, deploy (Vercel/Netlify).

## Open choices (defaults picked)

- **Location for the sun:** default Dubai (strong off-plan market); swappable per client.
- **Building:** default a 14-floor residential tower placeholder until a real model exists.
- **Repo:** needs a GitHub repository attached to this project before code starts.
