import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { LOCATION } from '../config.js';

// Physical sky + a sun that follows the hour of day.
export function createSky(scene) {
  const sky = new Sky();
  sky.scale.setScalar(3000);
  const u = sky.material.uniforms;
  u.turbidity.value = 6;
  u.rayleigh.value = 1.6;
  u.mieCoefficient.value = 0.005;
  u.mieDirectionalG.value = 0.8;
  scene.add(sky);

  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 70, bottom: -30, near: 1, far: 400 });
  scene.add(sun, sun.target);

  const hemi = new THREE.HemisphereLight(0xbfd6ff, 0x5a4a35, 0.6);
  scene.add(hemi);

  const sunDir = new THREE.Vector3();
  const warm = new THREE.Color(0xffa45c);
  const noon = new THREE.Color(0xfff4e6);

  function update(hour, renderer) {
    // Day from 6:00 to 19:00; sun rises in the east (+x) and sets in the west (-x).
    const t = (hour - 6) / 13;
    const elevation = Math.sin(Math.PI * t) * LOCATION.maxElevation - 2;
    const azimuth = 90 - t * 180 + 15;
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sunDir.setFromSphericalCoords(1, phi, theta);
    u.sunPosition.value.copy(sunDir);

    sun.position.copy(sunDir).multiplyScalar(200);
    const day = THREE.MathUtils.smoothstep(elevation, -4, 12);
    sun.intensity = 3.2 * THREE.MathUtils.smoothstep(elevation, -2, 6);
    sun.color.copy(warm).lerp(noon, THREE.MathUtils.smoothstep(elevation, 5, 35));
    hemi.intensity = 0.15 + 0.5 * day;
    u.rayleigh.value = 0.4 + 1.4 * day;

    // Eye adaptation: exposure opens up as the light drops, like a pupil.
    renderer.toneMappingExposure = THREE.MathUtils.lerp(1.3, 0.9, day);
    return { elevation, day };
  }

  return { update, sun };
}
