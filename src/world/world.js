import * as THREE from 'three';
import { BUILDING } from '../config.js';

const dummy = new THREE.Object3D();

export function createWorld(scene) {
  scene.fog = new THREE.Fog(0xcfd8e0, 120, 1100);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshStandardMaterial({ color: 0x7d8556, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  const plot = new THREE.Mesh(
    new THREE.PlaneGeometry(BUILDING.width + 16, BUILDING.depth + 16),
    new THREE.MeshStandardMaterial({ color: 0x9a8263, roughness: 1 }),
  );
  plot.rotation.x = -Math.PI / 2;
  plot.position.y = 0.01;
  plot.receiveShadow = true;

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 50),
    new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.9 }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, BUILDING.depth / 2 + 25);
  path.receiveShadow = true;
  scene.add(ground, plot, path);

  // Garden trees along the path; they grow in as you walk up.
  const trees = makeTrees(18);
  scene.add(trees.mesh);

  // Distant city silhouette; windows glow at night.
  const cityMat = new THREE.MeshStandardMaterial({ color: 0x5d6470, roughness: 0.9, emissive: 0xffb36b, emissiveIntensity: 0 });
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cityMat, 140);
  for (let i = 0; i < 140; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 480 + Math.random() * 520;
    const h = 15 + Math.random() ** 3 * 120;
    dummy.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    dummy.scale.set(14 + Math.random() * 20, h, 14 + Math.random() * 20);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    city.setMatrixAt(i, dummy.matrix);
  }
  scene.add(city);

  const dawn = new THREE.Color(0xe8c7b0);
  const noon = new THREE.Color(0xcfdbe6);
  const night = new THREE.Color(0x121826);

  return {
    update({ day, elevation }, growth, night01) {
      const c = elevation < 15 ? dawn.clone().lerp(noon, THREE.MathUtils.smoothstep(elevation, 2, 15)) : noon.clone();
      scene.fog.color.copy(night).lerp(c, day);
      trees.grow(growth);
      cityMat.emissiveIntensity = night01 * 0.12;
    },
  };
}

function makeTrees(count) {
  const geo = new THREE.ConeGeometry(1.6, 5, 7);
  geo.translate(0, 4, 0);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0x4f6b3a, roughness: 0.9 }), count);
  mesh.castShadow = true;
  const spots = Array.from({ length: count }, (_, i) => ({
    x: (i % 2 ? 1 : -1) * (4 + Math.random() * 6),
    z: BUILDING.depth / 2 + 6 + Math.floor(i / 2) * 4.5 + Math.random(),
    s: 0.7 + Math.random() * 0.5,
    delay: Math.random() * 0.5,
  }));
  let last = -1;
  function grow(t) {
    if (Math.abs(t - last) < 0.002) return;
    last = t;
    spots.forEach((p, i) => {
      const k = THREE.MathUtils.smoothstep(t, p.delay, p.delay + 0.5) * p.s;
      dummy.position.set(p.x, 0, p.z);
      dummy.scale.setScalar(Math.max(k, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
  grow(0);
  return { mesh, grow };
}
