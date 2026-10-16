import * as THREE from 'three';
import { SAIL } from '../config.js';
import { marble } from '../sail/textures.js';
import { M, sofa, armchair, coffeeTable, plant } from './furniture.js';

// The ground-floor atrium inside the V of the sail: marble floor, gold columns,
// a dancing fountain, aquariums beside the escalators, a reception desk.
export function createAtrium(scene) {
  const g = new THREE.Group();
  g.position.y = SAIL.deck;
  scene.add(g);

  const floorTex = marble('#f3eee6', 'rgba(170,140,90,0.25)');
  floorTex.repeat.set(10, 10);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(68, 90), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.12, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.03, -5);
  floor.receiveShadow = true;
  g.add(floor);

  for (let i = 0; i < 6; i++) {
    for (const x of [-12, 12]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 22, 24), M.gold);
      col.position.set(x, 11, -32 + i * 9);
      g.add(col);
    }
  }

  // Fountain basin with pulsing jets.
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.4, 0.8, 48), M.marble);
  basin.position.set(0, 0.4, -12);
  const water = new THREE.Mesh(new THREE.CircleGeometry(5.7, 48), new THREE.MeshStandardMaterial({ color: 0x3fb4d0, roughness: 0.05, emissive: 0x1a6e88, emissiveIntensity: 0.6 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.82, -12);
  g.add(basin, water);
  const jets = [];
  const jetMat = new THREE.MeshStandardMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.55, emissive: 0x9fdcff, emissiveIntensity: 0.6, depthWrite: false });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 1, 8), jetMat);
    jet.geometry.translate(0, 0.5, 0);
    jet.position.set(Math.cos(a) * 3.6, 0.8, -12 + Math.sin(a) * 3.6);
    jets.push(jet);
    g.add(jet);
  }

  // Escalators flanked by glowing aquariums.
  const tankMat = new THREE.MeshStandardMaterial({ color: 0x1b6fa8, emissive: 0x0f5d9a, emissiveIntensity: 1.1, roughness: 0.05, transparent: true, opacity: 0.85 });
  const fishMat = new THREE.MeshStandardMaterial({ color: 0xffa13d, emissive: 0xff7a1a, emissiveIntensity: 0.6 });
  const fish = [];
  for (const x of [-7, 7]) {
    const tank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6, 18), tankMat);
    tank.position.set(x, 3, 6);
    const esc = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 20), M.gold);
    esc.position.set(x * 0.6, 4, 6);
    esc.rotation.x = -0.32;
    g.add(tank, esc);
    for (let k = 0; k < 14; k++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 6), fishMat);
      f.rotation.x = Math.PI / 2;
      f.userData = { x, y: 1 + Math.random() * 4, speed: 0.4 + Math.random() * 0.6, phase: Math.random() * 10 };
      fish.push(f);
      g.add(f);
    }
  }

  // Reception desk and lounge groups.
  const desk = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 1.1, 48, 1, true, Math.PI * 0.75, Math.PI * 0.5), M.gold);
  desk.position.set(0, 0.55, -28);
  desk.material = M.gold;
  g.add(desk);
  for (const [x, z, r] of [[-20, -6, 0.6], [20, -6, -0.6], [-18, 12, 0.3], [18, 12, -0.3]]) {
    const lounge = new THREE.Group();
    lounge.add(sofa(3));
    const a1 = armchair();
    a1.position.set(-2, 0, 1.6);
    a1.rotation.y = Math.PI / 2;
    const a2 = armchair();
    a2.position.set(2, 0, 1.6);
    a2.rotation.y = -Math.PI / 2;
    const t = coffeeTable();
    t.position.set(0, 0, 1.5);
    const p = plant(1.8);
    p.position.set(2.4, 0, -0.4);
    lounge.add(a1, a2, t, p);
    lounge.position.set(x, 0, z);
    lounge.rotation.y = r;
    g.add(lounge);
  }

  const warm = [new THREE.PointLight(0xffd29a, 900, 70, 2), new THREE.PointLight(0xffd29a, 900, 70, 2), new THREE.PointLight(0x9fc8ff, 500, 60, 2)];
  warm[0].position.set(-14, 14, 0);
  warm[1].position.set(14, 14, -20);
  warm[2].position.set(0, 9, 6);
  g.add(...warm);

  return {
    group: g,
    update(time) {
      jets.forEach((j, i) => (j.scale.y = 3 + 4 * (0.5 + 0.5 * Math.sin(time * 1.6 + i * 0.8))));
      fish.forEach((f) => {
        const u = f.userData;
        const z = 6 + Math.sin(time * u.speed + u.phase) * 8;
        f.position.set(u.x + Math.sin(time + u.phase) * 0.6, u.y + Math.sin(time * 0.7 + u.phase) * 0.3, z);
        f.rotation.z = Math.cos(time * u.speed + u.phase) > 0 ? 0 : Math.PI;
      });
    },
  };
}
