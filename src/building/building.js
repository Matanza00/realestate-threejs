import * as THREE from 'three';
import { BUILDING } from '../config.js';
import { applyPour } from './pour.js';

const { floors, floorHeight: fh, width: W, depth: D, showcaseFloor } = BUILDING;
export const TOTAL_HEIGHT = floors * fh;
export const SHOWCASE_Y = showcaseFloor * fh + 0.35;

export function createBuilding(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const uConcrete = { value: -1 };
  const uGlass = { value: -1 };

  const concrete = applyPour(new THREE.MeshStandardMaterial({ color: 0xd9d3c7, roughness: 0.85 }), uConcrete);
  const frame = applyPour(new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.5, metalness: 0.6 }), uConcrete);
  const oak = applyPour(new THREE.MeshStandardMaterial({ color: 0xb08a5f, roughness: 0.6 }), uConcrete);
  const fabric = applyPour(new THREE.MeshStandardMaterial({ color: 0xe6e0d6, roughness: 0.95 }), uConcrete);
  const stone = applyPour(new THREE.MeshStandardMaterial({ color: 0xf1efe9, roughness: 0.25 }), uConcrete);

  const slabGeo = new THREE.BoxGeometry(W, 0.35, D);
  const colGeo = new THREE.BoxGeometry(0.5, fh - 0.35, 0.5);
  const glassGeo = new THREE.BoxGeometry(W - 1.2, fh - 0.35, D - 1.2);

  const glassMaterials = [];
  for (let i = 0; i < floors; i++) {
    const y = i * fh;
    const slab = new THREE.Mesh(slabGeo, concrete);
    slab.position.y = y + 0.175;
    slab.castShadow = slab.receiveShadow = true;
    group.add(slab);

    for (const [x, z] of [[-W / 2 + 0.6, -D / 2 + 0.6], [W / 2 - 0.6, -D / 2 + 0.6], [-W / 2 + 0.6, D / 2 - 0.6], [W / 2 - 0.6, D / 2 - 0.6]]) {
      const col = new THREE.Mesh(colGeo, frame);
      col.position.set(x, y + 0.35 + (fh - 0.35) / 2, z);
      col.castShadow = true;
      group.add(col);
    }

    const glass = applyPour(
      new THREE.MeshStandardMaterial({
        color: 0x9fb4c0, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.38,
        side: THREE.FrontSide, emissive: 0xffc98a, emissiveIntensity: 0, depthWrite: false,
      }),
      uGlass,
      '0.6, 0.8, 1.0',
    );
    glassMaterials.push(glass);
    const pane = new THREE.Mesh(glassGeo, glass);
    pane.position.y = y + 0.35 + (fh - 0.35) / 2;
    pane.renderOrder = 1;
    group.add(pane);
  }

  // Roof slab.
  const roof = new THREE.Mesh(slabGeo, concrete);
  roof.position.y = TOTAL_HEIGHT + 0.175;
  roof.castShadow = true;
  group.add(roof);

  // West-facing balcony on the showcase floor.
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 8), concrete);
  balcony.position.set(-W / 2 - 1.5, SHOWCASE_Y - 0.15, 0);
  balcony.castShadow = balcony.receiveShadow = true;
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 8), frame);
  rail.position.set(-W / 2 - 2.95, SHOWCASE_Y + 0.5, 0);
  group.add(balcony, rail);

  // Placeholder living room on the showcase floor.
  const room = new THREE.Group();
  const floorPlane = new THREE.Mesh(new THREE.BoxGeometry(W - 1.4, 0.02, D - 1.4), oak);
  floorPlane.position.y = SHOWCASE_Y + 0.01;
  floorPlane.receiveShadow = true;
  const sofa = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 3), fabric);
  sofa.position.set(-2, SHOWCASE_Y + 0.4, 0);
  const island = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.95, 1), stone);
  island.position.set(5, SHOWCASE_Y + 0.475, -3);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.15, fh - 0.4, 8), fabric);
  wall.position.set(8, SHOWCASE_Y + (fh - 0.4) / 2, 2);
  for (const m of [sofa, island, wall]) m.castShadow = m.receiveShadow = true;
  room.add(floorPlane, sofa, island, wall);
  group.add(room);

  // Lobby entrance on the front (+z) face.
  const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 0.2), frame);
  door.position.set(0, 1.75, D / 2 - 0.5);
  group.add(door);

  const sketch = createSketch(group);
  const lightOrder = Array.from({ length: floors }, () => Math.random());

  return {
    setBuild(height) {
      uConcrete.value = height;
      uGlass.value = height - 3 * fh;
    },
    setSketch(draw, opacity) {
      sketch.geometry.setDrawRange(0, Math.floor(draw * sketch.userData.count));
      sketch.material.opacity = opacity;
      sketch.visible = opacity > 0.001;
    },
    // 0 = dark, 1 = every window lit, floors light in a random order.
    setWindows(amount, interior) {
      glassMaterials.forEach((m, i) => {
        const lit = THREE.MathUtils.smoothstep(amount, lightOrder[i] * 0.7, lightOrder[i] * 0.7 + 0.15);
        m.emissiveIntensity = Math.max(lit * 1.4, i === showcaseFloor ? interior : 0);
      });
    },
  };
}

// The architect's line: building edges drawn on progressively.
function createSketch(group) {
  const pts = [];
  const box = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, TOTAL_HEIGHT, D));
  box.translate(0, TOTAL_HEIGHT / 2, 0);
  pts.push(...box.attributes.position.array);
  for (let i = 1; i < floors; i++) {
    const y = i * fh;
    const c = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]];
    for (let k = 0; k < 4; k++) {
      const [x1, z1] = c[k];
      const [x2, z2] = c[(k + 1) % 4];
      pts.push(x1, y, z1, x2, y, z2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0x2c3e66, transparent: true, opacity: 0 });
  const lines = new THREE.LineSegments(geo, mat);
  lines.userData.count = pts.length / 3;
  group.add(lines);
  return lines;
}
