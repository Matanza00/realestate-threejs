import * as THREE from 'three';
import { EYE_HEIGHT } from '../config.js';
import { SHOWCASE_Y } from '../building/building.js';
import { state } from '../core/state.js';

const E = EYE_HEIGHT;
const A = SHOWCASE_Y + E;
const v = (x, y, z) => new THREE.Vector3(x, y, z);

// Shots a person could film. `cut` = hard cut (elevator, crossing the street), not a fly.
const SHOTS = [
  { p: 0.0, pos: v(0, E, 72), look: v(0, 6, 0) },
  { p: 0.1, pos: v(8, E, 60), look: v(0, 10, 0) },
  { p: 0.25, pos: v(24, E, 52), look: v(0, 18, 0) },
  { p: 0.45, pos: v(40, E, 34), look: v(0, 24, 0) },
  { p: 0.47, pos: v(7, E, 34), look: v(0, 2, 0), cut: true },
  { p: 0.6, pos: v(1.2, E, 10.5), look: v(0, 1.9, 0) },
  { p: 0.62, pos: v(7, A, 3), look: v(-12, A - 0.3, 0), cut: true },
  { p: 0.78, pos: v(-5, A, 1), look: v(-20, A - 0.5, -2) },
  { p: 0.85, pos: v(-12.3, A, 0), look: v(-60, A - 6, -8) },
  { p: 0.87, pos: v(-32, E, 58), look: v(0, 18, 0), cut: true },
  { p: 1.0, pos: v(-20, E, 52), look: v(0, 22, 0) },
];

export function createRig(camera, onCut) {
  const desiredPos = new THREE.Vector3();
  const desiredLook = new THREE.Vector3();
  const body = SHOTS[0].pos.clone();
  const gaze = SHOTS[0].look.clone();
  const prevBody = body.clone();
  const look = new THREE.Euler(0, 0, 0, 'YXZ');
  let bobPhase = 0;
  let lastShot = 0;

  function sample(p) {
    let i = SHOTS.findIndex((s) => s.p > p);
    if (i === -1) i = SHOTS.length - 1;
    if (i === 0) i = 1;
    const a = SHOTS[i - 1];
    const b = SHOTS[i];
    if (b.cut) {
      // Hold the previous shot, then cut halfway through the gap.
      const src = (p - a.p) / (b.p - a.p) < 0.5 ? a : b;
      desiredPos.copy(src.pos);
      desiredLook.copy(src.look);
      return src === a ? i - 1 : i;
    }
    const t = THREE.MathUtils.smoothstep((p - a.p) / (b.p - a.p), 0, 1);
    desiredPos.lerpVectors(a.pos, b.pos, t);
    desiredLook.lerpVectors(a.look, b.look, t);
    return (p - a.p) / (b.p - a.p) < 0.5 ? i - 1 : i;
  }

  return function update(dt) {
    const shot = sample(state.progress);
    const crossedCut =
      (shot !== lastShot && SHOTS[Math.max(shot, lastShot)].cut) || desiredPos.distanceTo(body) > 40;
    lastShot = shot;

    if (crossedCut) {
      body.copy(desiredPos);
      gaze.copy(desiredLook);
      onCut?.();
    } else {
      // The gaze leads, the body follows: eyes move before the head and feet.
      const k = state.reducedMotion ? 20 : 1;
      body.x = THREE.MathUtils.damp(body.x, desiredPos.x, 2.5 * k, dt);
      body.y = THREE.MathUtils.damp(body.y, desiredPos.y, 2.5 * k, dt);
      body.z = THREE.MathUtils.damp(body.z, desiredPos.z, 2.5 * k, dt);
      gaze.x = THREE.MathUtils.damp(gaze.x, desiredLook.x, 4 * k, dt);
      gaze.y = THREE.MathUtils.damp(gaze.y, desiredLook.y, 4 * k, dt);
      gaze.z = THREE.MathUtils.damp(gaze.z, desiredLook.z, 4 * k, dt);
    }

    // Head bob from walking speed, about one step every 0.7 m.
    const speed = Math.min(body.distanceTo(prevBody) / Math.max(dt, 1e-4), 2);
    prevBody.copy(body);
    bobPhase += (speed * dt * Math.PI * 2) / 0.7;
    const bob = state.reducedMotion ? 0 : Math.sin(bobPhase) * 0.012 * Math.min(speed / 1.2, 1);

    camera.position.set(body.x, body.y + bob, body.z);
    camera.lookAt(gaze);

    // Looking around with the pointer: a few degrees, like turning your head.
    look.y = THREE.MathUtils.damp(look.y, -state.pointer.x * 0.12, 3, dt);
    look.x = THREE.MathUtils.damp(look.x, state.pointer.y * 0.07, 3, dt);
    camera.rotateY(look.y);
    camera.rotateX(look.x);
    camera.rotateZ(Math.sin(bobPhase * 0.5) * 0.002 * Math.min(speed, 1));
  };
}
