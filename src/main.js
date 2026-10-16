import * as THREE from 'three';
import { CHAPTERS } from './config.js';
import { state, chapterAt, local } from './core/state.js';
import { createRenderer, createCamera, onResize } from './core/renderer.js';
import { initScroll } from './scroll/scroll.js';
import { createSky } from './sky/sky.js';
import { createWorld } from './world/world.js';
import { createTower, TOWER_TOP } from './sail/tower.js';
import { createAtrium } from './interior/atrium.js';
import { createSuite } from './interior/suite.js';
import { createRig } from './camera/rig.js';
import { buildShots } from './camera/shots.js';
import { updateHud } from './ui/hud.js';
import { initRail } from './ui/rail.js';
import { initText } from './ui/text.js';

const canvas = document.getElementById('webgl');
const renderer = createRenderer(canvas);
const camera = createCamera();
const scene = new THREE.Scene();
onResize(renderer, camera);

const sky = createSky(scene);
const world = createWorld(scene);
const tower = createTower(scene);
const atrium = createAtrium(scene);
const suite = createSuite(scene);
const fade = createFade();
const rig = createRig(camera, buildShots({ tower, causeway: world.causeway }), fade);
const lenis = initScroll();
window.__sail = { camera, renderer, state, scene };
initText();
initRail(lenis);

window.addEventListener('pointermove', (e) => {
  state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  state.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
});

const byId = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));
const backOut = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

// Hour of day follows scroll, eased between each chapter's hour.
function hourAt(p) {
  const c = chapterAt(CHAPTERS, p);
  const next = CHAPTERS[Math.min(CHAPTERS.indexOf(c) + 1, CHAPTERS.length - 1)];
  return THREE.MathUtils.lerp(c.hour, next.hour, local(c, p));
}

let adapt = 1;
const timer = new THREE.Timer();
renderer.setAnimationLoop((time) => {
  timer.update(time);
  const dt = Math.min(timer.getDelta(), 0.05);
  const t = (time ?? performance.now()) / 1000;
  state.progress = THREE.MathUtils.damp(state.progress, state.target, state.reducedMotion ? 30 : 6, dt);
  const p = state.progress;
  const chapter = chapterAt(CHAPTERS, p);

  state.hour = hourAt(p);
  const light = sky.update(state.hour, renderer);
  // Pupils open up indoors, over about a second.
  adapt = THREE.MathUtils.damp(adapt, chapter.exposure ?? 1, 2.5, dt);
  renderer.toneMappingExposure *= adapt;

  const sketchT = local(byId.sketch, p);
  const buildT = local(byId.build, p);
  const sailT = local(byId.sail, p);
  const nightT = local(byId.night, p);
  tower.setSketch(sketchT, (1 - THREE.MathUtils.smoothstep(buildT, 0.4, 0.95)) * Math.min(1, sketchT * 4) * 0.9);
  const rise = buildT >= 1 ? 1e4 : buildT * (TOWER_TOP + 75) - 1;
  tower.setBuild(rise);
  tower.setFabric(sailT > 0 ? Math.max(0.03, backOut(sailT)) : 0.03, rise - 12);
  tower.setNight(nightT, t);
  world.update(light, t, nightT, local(byId.arrive, p) * 1.4 + (p >= byId.arrive.end ? 1 : 0));

  atrium.group.visible = ['arrive', 'atrium'].includes(chapter.id);
  if (atrium.group.visible) atrium.update(t);
  suite.group.visible = chapter.id === 'suite';

  rig(dt);
  updateHud(chapter, buildT, state.hour);
  renderer.render(scene, camera);
});

// Quick dip to black on hard cuts, like a blink.
function createFade() {
  const el = document.createElement('div');
  el.className = 'blink';
  document.body.appendChild(el);
  return () => {
    el.style.transition = 'none';
    el.style.opacity = 0.9;
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.5s ease-out';
      el.style.opacity = 0;
    });
  };
}
