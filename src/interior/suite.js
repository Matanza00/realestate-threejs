import * as THREE from 'three';
import { marble } from '../sail/textures.js';
import { M, sofa, armchair, coffeeTable, diningSet, bed, floorLamp, plant, chandelier, rug, spiralStairs, artwork } from './furniture.js';

// Duplex sea-view suite, staged at the height of floor 25 with its window wall
// facing west (-x) over the Gulf, away from the tower. Shown only in its chapter.
// Local origin = centre of the lower floor.
// Kept inside the sun's shadow frustum so walls and ceiling block the light.
export const SUITE_ORIGIN = new THREE.Vector3(-185, 120, 70);
const W = 18;
const D = 14;
const H = 7.2;
const MEZZ = 3.6;

export function createSuite(scene) {
  const g = new THREE.Group();
  g.position.copy(SUITE_ORIGIN);
  scene.add(g);

  const floorTex = marble('#d6c6ad', 'rgba(110,85,55,0.3)');
  floorTex.repeat.set(4, 3);
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.1 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd9cbb4, roughness: 0.85 });
  const box = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    m.castShadow = true;
    g.add(m);
    return m;
  };

  box(W, 0.2, D, floorMat, 0, -0.1, 0);
  box(W, 0.2, D, wallMat, 0, H + 0.1, 0);
  box(0.2, H, D, wallMat, W / 2, H / 2, 0);
  box(W, H, 0.2, wallMat, 0, H / 2, -D / 2);
  box(W, H, 0.2, wallMat, 0, H / 2, D / 2);
  // Gold trims along the ceiling and the window frame mullions.
  box(W, 0.12, 0.25, M.gold, 0, H - 0.1, -D / 2 + 0.15);
  box(W, 0.12, 0.25, M.gold, 0, H - 0.1, D / 2 - 0.15);
  for (let i = 0; i <= 6; i++) box(0.12, H, 0.12, M.gold, -W / 2, H / 2, -D / 2 + (i / 6) * D);
  box(0.12, 0.12, D, M.gold, -W / 2, MEZZ, 0);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(D, H), new THREE.MeshStandardMaterial({ color: 0xbfd8e6, transparent: true, opacity: 0.08, roughness: 0, metalness: 0.9 }));
  glass.position.set(-W / 2, H / 2, 0);
  glass.rotation.y = Math.PI / 2;
  g.add(glass);

  // Mezzanine over the back half with a glass balustrade.
  box(7, 0.25, D, floorMat, W / 2 - 3.5, MEZZ, 0);
  const bal = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, D - 3), new THREE.MeshStandardMaterial({ color: 0xcfe4ee, transparent: true, opacity: 0.25 }));
  bal.position.set(W / 2 - 7, MEZZ + 0.6, 1.5);
  g.add(bal);
  const place = (obj, x, y, z, ry = 0) => {
    obj.position.set(x, y, z);
    obj.rotation.y = ry;
    g.add(obj);
    return obj;
  };

  // Living area facing the view.
  place(rug(2.6), -3, 0, 0);
  place(sofa(3.4), -1.2, 0, 0, -Math.PI / 2);
  place(armchair(), -4.6, 0, -2.3, Math.PI * 0.2);
  place(armchair(), -4.6, 0, 2.3, Math.PI * 0.8);
  place(coffeeTable(1.6, 0.9), -3.2, 0, 0, Math.PI / 2);
  place(floorLamp(), -1.1, 0, 2.4);
  place(floorLamp(), -1.1, 0, -2.4);
  place(plant(1.8), -7.8, 0, -6);
  place(plant(1.4), -7.8, 0, 6);
  place(chandelier(1.1), -3, H - 1.4, 0);

  // Dining under the mezzanine edge.
  place(diningSet(6), 2.2, 0, -4.2);
  place(chandelier(0.7), 2.2, MEZZ - 0.9, -4.2);

  // Stairs up to the bedroom, art on the back wall.
  place(spiralStairs(MEZZ, 1.6, 18, Math.PI * 1.1), 3.4, 0, 4.6, Math.PI);
  place(artwork(2.2, 1.4, 30), W / 2 - 0.15, 1.9, -3, -Math.PI / 2);
  place(artwork(1.6, 1.1, 200), 0, 2, -D / 2 + 0.15);

  // Bedroom on the mezzanine.
  place(bed(), W / 2 - 2.4, MEZZ + 0.12, -2, -Math.PI / 2);
  place(floorLamp(), W / 2 - 1, MEZZ + 0.12, 0.6);
  place(plant(1.2), W / 2 - 1, MEZZ + 0.12, -5.6);

  const l1 = new THREE.PointLight(0xffd6a0, 60, 18, 2);
  l1.position.set(-3, H - 1.8, 0);
  const l2 = new THREE.PointLight(0xffd6a0, 40, 14, 2);
  l2.position.set(4, MEZZ - 1, -3);
  const l3 = new THREE.PointLight(0xffd6a0, 30, 10, 2);
  l3.position.set(W / 2 - 3, MEZZ + 2.4, -2);
  g.add(l1, l2, l3);

  return { group: g, size: { W, D, H, MEZZ } };
}
