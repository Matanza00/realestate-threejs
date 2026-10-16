import * as THREE from 'three';
import { CHAPTERS } from './config.js';
import { state, chapterAt, local } from './core/state.js';
import { createRenderer, createCamera, onResize } from './core/renderer.js';
import { initScroll } from './scroll/scroll.js';
import { createSky } from './sky/sky.js';
import { createWorld } from './world/world.js';
import { createBuilding, TOTAL_HEIGHT } from './building/building.js';
import { createRig } from './camera/rig.js';
import { updateHud } from './ui/hud.js';

const canvas = document.getElementById('webgl');
const renderer = createRenderer(canvas);
const camera = createCamera();
const scene = new THREE.Scene();
onResize(renderer, camera);

const sky = createSky(scene);
const world = createWorld(scene);
const building = createBuilding(scene);
const fade = createFade();
const rig = createRig(camera, fade);
initScroll();

window.addEventListener('pointermove', (e) => {
  state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  state.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
});

const byId = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));

// Hour of day follows scroll, eased between each chapter's hour.
function hourAt(p) {
  const i = CHAPTERS.findIndex((c) => p < c.end);
  const c = CHAPTERS[i === -1 ? CHAPTERS.length - 1 : i];
  const next = CHAPTERS[Math.min(CHAPTERS.indexOf(c) + 1, CHAPTERS.length - 1)];
  return THREE.MathUtils.lerp(c.hour, next.hour, local(c, p));
}

const timer = new THREE.Timer();
renderer.setAnimationLoop((time) => {
  timer.update(time);
  const dt = Math.min(timer.getDelta(), 0.05);
  state.progress = THREE.MathUtils.damp(state.progress, state.target, state.reducedMotion ? 30 : 6, dt);
  const p = state.progress;

  state.hour = hourAt(p);
  const light = sky.update(state.hour, renderer);

  const sketchT = local(byId.sketch, p);
  const buildT = local(byId.build, p);
  const nightT = local(byId.night, p);
  building.setSketch(sketchT, (1 - THREE.MathUtils.smoothstep(buildT, 0.3, 0.9)) * Math.min(1, sketchT * 4) * 0.85);
  building.setBuild(buildT >= 1 ? 1e4 : buildT * (TOTAL_HEIGHT + 4) - 0.5);
  building.setWindows(nightT, local(byId.apartment, p) * 0.4);
  world.update(light, local(byId.walk, p) * 1.3 + (p > byId.walk.end ? 1 : 0), nightT);

  rig(dt);
  updateHud(chapterAt(CHAPTERS, p).id, buildT, state.hour);
  renderer.render(scene, camera);
});

// Quick dip to black on hard cuts, like a blink.
function createFade() {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'fixed', inset: 0, background: '#000', opacity: 0, pointerEvents: 'none', zIndex: 3, transition: 'opacity 0.35s' });
  document.body.appendChild(el);
  return () => {
    el.style.transition = 'none';
    el.style.opacity = 0.85;
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.45s ease-out';
      el.style.opacity = 0;
    });
  };
}
