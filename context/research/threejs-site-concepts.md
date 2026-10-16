# Scroll-driven & interactive Three.js website concepts

A motion-design view of what this project can build. Each concept lists the
story, the scroll choreography, the interaction layer, the tech from the
installed skills, and a difficulty rating (1 easy – 5 hard).

Shared stack for everything below (keeps every project consistent and cheap to
work on with Claude):

- **Three.js** (vanilla + Vite) or **React Three Fiber + drei** when the site has a lot of DOM UI.
- **GSAP ScrollTrigger** for scroll timelines (scrub, pin, snap), **Lenis** for smooth scroll.
- **Postprocessing** (bloom, depth of field, chromatic aberration, film grain) used sparingly.
- **Blender → glTF (Draco/KTX2)** for hero models; **Spline** for quick prototypes.
- One module per concern (`scene`, `camera`, `lights`, `materials`, `objects`, `scroll`, `input`) so Graphify can index it and edits touch one file.

---

## 1. Motion principles to design around

| Principle | How it shows up in Three.js |
|---|---|
| **Scroll = timeline scrubber** | One master GSAP timeline, `scrub: 1`, scroll progress 0→1 drives camera, materials and objects. Treat the page like an After Effects comp. |
| **Pin and reveal** | Pin the canvas section, run a 300–500vh sequence, then release. Each "chapter" is a timeline label. |
| **Camera is the editor** | Animate the camera along a `CatmullRomCurve3` spline with a separate look-at target. Cuts become dolly, orbit, push-in, rack focus (DoF). |
| **Easing and inertia** | Lenis smoothing + damped lerps (`THREE.MathUtils.damp`) on everything that follows the mouse. Nothing snaps. |
| **Secondary motion** | Idle float/breathing on objects, noise-driven micro-movement, so the scene is alive when the user stops scrolling. |
| **Shader-driven transitions** | Dissolve, morph, displacement and noise reveals in GLSL with a `uProgress` uniform tied to scroll. |
| **Type + 3D together** | DOM headlines animated with SplitText/stagger in sync with 3D beats, so the copy and the scene "hit" on the same frame. |
| **Cursor as a light / force** | Mouse position moves a light, bends particles, tilts the camera a few degrees (parallax). |

---

## 2. Website concepts

### A. Product reveal / "Apple-style" scrollytelling  ·  Difficulty 2
- **Story:** A product (sneaker, headphones, watch, phone, bottle) assembles, rotates and explodes into parts as you scroll, with feature callouts.
- **Scroll:** Pinned section; chapters = hero spin → exploded view → material close-up → color variants → buy CTA.
- **Interaction:** Drag to rotate, click swatches to change materials (animated color/roughness tweens), hotspots that open feature cards.
- **Tech:** glTF model with named parts, GSAP timeline per part, `MeshPhysicalMaterial` (clearcoat, transmission), HDRI environment, contact shadows.
- **Why first:** Best portfolio value per effort; reuses one pattern everywhere.

### B. Camera-on-rails journey (scroll fly-through)  ·  Difficulty 3
- **Story:** Scroll flies the camera through a world: a city, a forest, a data center, the inside of a machine, through space.
- **Scroll:** Camera progress along a spline; fog, color grading and light change per chapter; text panels fade in at waypoints.
- **Interaction:** Mouse adds a few degrees of look-around; hover objects to highlight; click a waypoint to jump (GSAP `scrollTo`).
- **Tech:** `CatmullRomCurve3`, instanced scenery, fog, postprocessing color LUT per chapter.

### C. Particle morph storytelling  ·  Difficulty 3
- **Story:** 20–100k particles morph between shapes, logo → globe → human figure → text, one shape per section.
- **Scroll:** `uProgress` blends between target position buffers in the vertex shader; color and size shift per section.
- **Interaction:** Cursor repels/attracts particles; click causes a shockwave ripple.
- **Tech:** `BufferGeometry` with multiple position attributes or GPGPU (FBO) simulation via `GPUComputationRenderer` for physics feel.
- **Great for:** Agency sites, AI/tech startups, personal brand.

### D. Interactive 3D portfolio room  ·  Difficulty 3
- **Story:** A stylized room or desk (Bruno Simon / isometric style). Objects are sections: monitor = projects, bookshelf = about, phone = contact.
- **Scroll:** Scroll orbits and zooms between "stations"; on mobile scroll is the only control.
- **Interaction:** Click an object to fly the camera to it, screens render live HTML (drei `<Html>` or render-to-texture), day/night toggle.
- **Tech:** Baked lighting from Blender (one texture, very fast), raycasting, R3F for the UI-heavy parts.

### E. Shader / generative art landing page  ·  Difficulty 2–4
- **Story:** A living abstract hero: liquid metal blob, flowing gradient mesh, noise terrain, iridescent glass shapes.
- **Scroll:** Scroll changes shader parameters (noise frequency, color palette, distortion) and morphs the shape between sections.
- **Interaction:** Mouse warps the surface (distortion uniform), click changes palette with a smooth tween, audio-reactive option.
- **Tech:** Custom `ShaderMaterial`, simplex noise, fresnel, `MeshTransmissionMaterial` (drei) for glass.
- **Cheapest wow per token:** mostly one shader file and one scroll timeline.

### F. Image / gallery WebGL effects  ·  Difficulty 2
- **Story:** Editorial site, photographer, fashion lookbook, where images are WebGL planes, not `<img>`.
- **Scroll:** Planes bend and ripple with scroll velocity, RGB shift on fast scroll, infinite horizontal or circular gallery.
- **Interaction:** Hover distortion (displacement texture), click to expand an image into a fullscreen detail page (FLIP-style transition into 3D).
- **Tech:** DOM-synced planes (track `getBoundingClientRect`), velocity uniform from Lenis, Barba for page transitions.

### G. Scroll-built architecture / real estate  ·  Difficulty 3
- **Story:** A building constructs itself floor by floor as you scroll, then you tour an apartment.
- **Scroll:** Floors drop in with stagger, walls fade, interior reveals, sun position changes time of day.
- **Interaction:** Click a floor to see its plan, toggle furniture styles, measure tool.
- **Tech:** glTF per floor, clipping planes for section cuts, `SoftShadows`.

### H. Data story / 3D infographics  ·  Difficulty 3
- **Story:** Climate, finance, population: a globe with arcs and bars, 3D charts that rise and rearrange per chapter.
- **Scroll:** Each chapter re-arranges the same instanced objects into a new layout (globe → bar grid → timeline → scatter).
- **Interaction:** Hover tooltips, filter by category, drag globe.
- **Tech:** `InstancedMesh` with per-instance attributes animated by GSAP, `three-globe` or custom.

### I. Space / solar system explorer  ·  Difficulty 3
- **Story:** Scroll from the Sun outward, each planet a chapter with facts.
- **Scroll:** Camera hops planet to planet with ease-in-out, scale tricks for distance.
- **Interaction:** Click planets, time-speed slider, orbit controls when paused.
- **Tech:** Atmosphere shaders (fresnel), starfield particles, bloom.

### J. Character / mascot driven site  ·  Difficulty 4
- **Story:** A rigged character walks you through the site: waves, points at sections, reacts.
- **Scroll:** Scroll blends between Blender animation clips (walk, point, jump) via `AnimationMixer` weights.
- **Interaction:** Character's head follows the cursor, click to trigger reactions, idle animations when still.
- **Tech:** Blender rig → glTF with clips, `AnimationMixer` crossfades, bone look-at.

### K. Physics playground hero  ·  Difficulty 3
- **Story:** Brand letters or objects that fall, stack and get knocked around.
- **Scroll:** Scroll changes gravity direction or "pours" more objects in each section.
- **Interaction:** Drag and throw, cursor as a physical body.
- **Tech:** Rapier (`@react-three/rapier`) or cannon-es, instanced bodies.

### L. Music / audio-reactive experience  ·  Difficulty 3
- **Story:** Album launch or DJ site where the visuals pulse with the track.
- **Scroll:** Scroll moves through tracks or song sections; each has its own scene.
- **Interaction:** Play/pause, frequency bands drive scale, color and bloom; mouse adds distortion.
- **Tech:** Web Audio `AnalyserNode` → uniforms.

### M. WebXR / 360 showroom (stretch)  ·  Difficulty 4
- Same product or room scenes, viewable in VR/AR. Uses A-Frame or Three.js WebXR. Good later once A or D exists.

---

## 3. Recommended build order

1. **E – Shader hero landing page** (small, teaches uniforms + scroll binding).
2. **A – Product reveal scrollytelling** (core pinned-timeline pattern, model pipeline).
3. **C – Particle morph** (GPU/shader skills, high visual impact).
4. **B – Camera-on-rails journey** (spline camera, chapter system).
5. **D – 3D portfolio room** (combines raycast interaction + scroll + baked lighting).
6. Then pick from F–L by client/portfolio need.

Each later project reuses a shared starter (Vite + Three + GSAP + Lenis +
postprocessing + a `ScrollChapters` helper), so new sites start from a known
module layout that Graphify already understands.

---

## 4. Reusable building blocks to create once

| Block | Used by |
|---|---|
| `scroll/` — Lenis + ScrollTrigger setup, chapter labels, progress uniform | All |
| `camera/rail.js` — spline camera + look-at + mouse parallax | A, B, D, G, I |
| `input/pointer.js` — normalized, damped mouse/touch + raycaster | All |
| `materials/` — glass, iridescent, noise-displaced, dissolve shader | A, E, G |
| `particles/` — buffer morph + GPGPU sim | C, H, L |
| `loaders/` — glTF + Draco + KTX2 + loading screen with progress | A, D, G, J |
| `post/` — bloom, DoF, grain, toggled per quality tier | All |
| `perf/` — device quality tiers, `prefers-reduced-motion` fallback, pause when hidden | All |

## 5. Performance and accessibility rules

- Target 60fps on mid phones: cap `devicePixelRatio` at 1.5–2, instancing, baked lighting, KTX2 textures, Draco meshes, < 5 MB initial payload.
- Lazy-load heavy chapters; show a designed loader (it is part of the motion design).
- Honor `prefers-reduced-motion`: replace scrubbed motion with fades and static renders.
- Keep real HTML text for SEO and screen readers; the canvas is decoration plus interaction.
- Mobile: scroll is the main input; no hover-only features.

## 6. Reference sites worth studying (for motion ideas)

- Bruno Simon portfolio (driveable 3D world), Lusion, Active Theory, Igloo Inc, Resn, and the Awwwards "Three.js" and "WebGL" collections.
- Apple product pages (pinned scroll sequences), Codrops tutorials (shader/gallery effects), three.js examples (`webgl_gpgpu_*`, `webgl_postprocessing_*`).

_Inferred from domain knowledge; no live browsing was done for this file._
