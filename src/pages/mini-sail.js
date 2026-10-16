import * as THREE from 'three';
import { createRenderer } from '../core/renderer.js';
import { createSky } from '../sky/sky.js';
import { createTower } from '../sail/tower.js';
import { createWorld } from '../world/world.js';

// Small hero scene for the inner pages: the finished sail on its island,
// a slow orbit, a fixed hour of day. `night` turns on the fabric light show.
export function miniSail(canvas, { hour = 17.5, night = 0, distance = 520 } = {}) {
  const renderer = createRenderer(canvas);
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 6000);
  const scene = new THREE.Scene();
  const sky = createSky(scene);
  const world = createWorld(scene);
  const tower = createTower(scene);
  tower.setBuild(1e4);
  tower.setFabric(1, 1e4);
  world.update(sky.update(hour, renderer), 0, night, 1);

  function size() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  window.addEventListener('resize', size);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timer = new THREE.Timer();
  renderer.setAnimationLoop((time) => {
    timer.update(time);
    const t = (time ?? performance.now()) / 1000;
    const a = 0.9 + (reduced ? 0 : t * 0.03);
    camera.position.set(Math.sin(a) * distance, 30 + window.scrollY * 0.08, Math.cos(a) * distance);
    camera.lookAt(0, 120 - window.scrollY * 0.05, -10);
    const light = sky.update(hour, renderer);
    world.update(light, t, night, 1);
    tower.setNight(night, t);
    renderer.render(scene, camera);
  });
}
