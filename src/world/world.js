import * as THREE from 'three';
import { ISLAND, SHORE_Z, SAIL } from '../config.js';
import * as tex from '../sail/textures.js';

const dummy = new THREE.Object3D();
const rand = (a, b) => a + Math.random() * (b - a);

export function createWorld(scene) {
  scene.fog = new THREE.Fog(0xcfd8e0, 700, 4200);
  const sea = createSea(scene);
  createIsland(scene);
  const causeway = createCauseway(scene);
  createShore(scene);
  const palms = createPalms(scene);
  const city = createCity(scene);
  const fountain = createFountain(scene, new THREE.Vector3(0, SAIL.deck, ISLAND.centerZ + 62));

  const dawn = new THREE.Color(0xe8c7b0);
  const noon = new THREE.Color(0xcfdbe6);
  const night = new THREE.Color(0x0e1422);

  return {
    causeway,
    update({ day, elevation }, time, night01, gardens) {
      const c = elevation < 15 ? dawn.clone().lerp(noon, THREE.MathUtils.smoothstep(elevation, 2, 15)) : noon.clone();
      scene.fog.color.copy(night).lerp(c, day);
      sea.uniforms.uTime.value = time;
      palms.grow(gardens);
      city.material.emissiveIntensity = night01 * 0.12;
      causeway.lamps.material.emissiveIntensity = night01 * 3;
      fountain.update(time);
    },
  };
}

function createSea(scene) {
  const geo = new THREE.PlaneGeometry(6000, 6000, 200, 200);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1d5f78, roughness: 0.18, metalness: 0.1, envMapIntensity: 0.6 });
  const uniforms = { uTime: { value: 0 } };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying float vWave;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec2 q = position.xz;
        float w = sin(q.x * 0.035 + uTime * 0.8) * 0.35 + sin(q.y * 0.05 - uTime * 0.6) * 0.25
                + sin((q.x + q.y) * 0.11 + uTime * 1.3) * 0.08;
        transformed.y += w;
        vWave = w;`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `vec2 qn = position.xz;
        float dx = cos(qn.x * 0.035 + uTime * 0.8) * 0.35 * 0.035 + cos((qn.x + qn.y) * 0.11 + uTime * 1.3) * 0.08 * 0.11;
        float dz = cos(qn.y * 0.05 - uTime * 0.6) * 0.25 * 0.05 + cos((qn.x + qn.y) * 0.11 + uTime * 1.3) * 0.08 * 0.11;
        vec3 objectNormal = normalize(vec3(-dx, 1.0, -dz));`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vWave;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb += vec3(0.05, 0.12, 0.1) * smoothstep(0.2, 0.6, vWave);');
  };
  const sea = new THREE.Mesh(geo, mat);
  sea.receiveShadow = true;
  scene.add(sea);
  return { uniforms };
}

function createIsland(scene) {
  const { radius: R, centerZ: cz } = ISLAND;
  const stone = new THREE.MeshStandardMaterial({ map: tex.marble('#ddd6c8', 'rgba(150,140,120,0.15)'), roughness: 0.7 });
  stone.map.repeat.set(8, 8);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R, R + 6, SAIL.deck + 3, 96), stone);
  base.position.set(0, SAIL.deck / 2 - 1.5, cz);
  base.receiveShadow = true;
  scene.add(base);

  // Rock armour around the edge.
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0x8d877c, roughness: 0.95 }), 420);
  for (let i = 0; i < 420; i++) {
    const a = (i / 420) * Math.PI * 2 + rand(-0.01, 0.01);
    const r = R + rand(3, 11);
    dummy.position.set(Math.cos(a) * r, rand(-0.5, 1.2), cz + Math.sin(a) * r);
    dummy.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
    dummy.scale.setScalar(rand(1.6, 3.4));
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  }
  rocks.castShadow = rocks.receiveShadow = true;
  scene.add(rocks);

  // Terrace with two pools, loungers and parasols on the west side.
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xc9a77c, roughness: 0.8 });
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(70, 1, 46), deckMat);
  terrace.position.set(-R - 20, SAIL.deck - 0.5, cz + 10);
  terrace.receiveShadow = true;
  scene.add(terrace);
  const water = new THREE.MeshStandardMaterial({ color: 0x3fc1d6, roughness: 0.05, metalness: 0.1, emissive: 0x0c5866, emissiveIntensity: 0.3 });
  for (const [x, z, w, d] of [[-R - 30, cz + 2, 34, 12], [-R - 8, cz + 22, 16, 9]]) {
    const pool = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), water);
    pool.position.set(x, SAIL.deck + 0.05, z);
    scene.add(pool);
  }
  const lounger = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 0.4, 2), new THREE.MeshStandardMaterial({ color: 0xf5f1e8, roughness: 0.9 }), 24);
  const parasol = new THREE.InstancedMesh(new THREE.ConeGeometry(1.8, 0.7, 12), new THREE.MeshStandardMaterial({ color: 0xf0e2c4, roughness: 0.9 }), 12);
  for (let i = 0; i < 24; i++) {
    dummy.position.set(-R - 45 + (i % 12) * 3, SAIL.deck + 0.2, cz + (i < 12 ? 12 : -8));
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    lounger.setMatrixAt(i, dummy.matrix);
    if (i % 2 === 0) {
      dummy.position.y = SAIL.deck + 2.6;
      dummy.updateMatrix();
      parasol.setMatrixAt(i / 2, dummy.matrix);
    }
  }
  lounger.castShadow = parasol.castShadow = true;
  scene.add(lounger, parasol);

  // Hedges and flower beds along the island edge.
  const hedge = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3f6b35, roughness: 0.95 }), 160);
  const flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 6, 5), new THREE.MeshStandardMaterial({ roughness: 0.8 }), 400);
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * (R - 6), SAIL.deck + 0.6, cz + Math.sin(a) * (R - 6));
    dummy.scale.set(1.4, 0.9, 1.4);
    dummy.updateMatrix();
    hedge.setMatrixAt(i, dummy.matrix);
  }
  const palette = [0xe0457b, 0xf2c14e, 0xffffff, 0xb05cd9];
  for (let i = 0; i < 400; i++) {
    const a = rand(0, Math.PI * 2);
    const r = R - rand(9, 13);
    dummy.position.set(Math.cos(a) * r, SAIL.deck + 0.3, cz + Math.sin(a) * r);
    dummy.scale.setScalar(rand(0.7, 1.3));
    dummy.updateMatrix();
    flowers.setMatrixAt(i, dummy.matrix);
    flowers.setColorAt(i, new THREE.Color(palette[i % palette.length]));
  }
  hedge.castShadow = true;
  scene.add(hedge, flowers);
}

// Curved bridge from the island to the shore, with lamps.
function createCauseway(scene) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, SAIL.deck, ISLAND.centerZ + ISLAND.radius - 4),
    new THREE.Vector3(-35, SAIL.deck + 1.5, 190),
    new THREE.Vector3(-20, SAIL.deck + 1.5, 290),
    new THREE.Vector3(10, SAIL.deck, SHORE_Z + 10),
  ]);
  const N = 120;
  const road = new THREE.Group();
  const deckGeo = new THREE.BoxGeometry(14, 1, 1);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xd9d4c8, roughness: 0.8 });
  const segs = new THREE.InstancedMesh(deckGeo, deckMat, N);
  const lamps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffd28a, emissiveIntensity: 0 }), N / 3);
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.15, 6, 6), new THREE.MeshStandardMaterial({ color: 0x9a9a98 }), N / 3);
  const len = curve.getLength();
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    dummy.position.copy(p).setY(p.y - 0.5);
    dummy.scale.set(1, 1, len / N + 0.3);
    dummy.lookAt(p.clone().add(tan).setY(p.y - 0.5));
    dummy.updateMatrix();
    segs.setMatrixAt(i, dummy.matrix);
    if (i % 3 === 0) {
      const side = new THREE.Vector3(tan.z, 0, -tan.x).normalize().multiplyScalar((i % 6 ? 1 : -1) * 7.5);
      dummy.scale.setScalar(1);
      dummy.rotation.set(0, 0, 0);
      dummy.position.copy(p).add(side).setY(p.y + 3);
      dummy.updateMatrix();
      posts.setMatrixAt(i / 3, dummy.matrix);
      dummy.position.y = p.y + 6.1;
      dummy.updateMatrix();
      lamps.setMatrixAt(i / 3, dummy.matrix);
    }
  }
  segs.receiveShadow = segs.castShadow = true;
  road.add(segs, lamps, posts);
  scene.add(road);
  return { curve, lamps };
}

function createShore(scene) {
  const sandTex = tex.sand();
  sandTex.repeat.set(60, 20);
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(4000, 1400), new THREE.MeshStandardMaterial({ map: sandTex, roughness: 1 }));
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(0, 0.4, SHORE_Z + 700);
  beach.receiveShadow = true;
  scene.add(beach);

  // Car park beside the causeway gate, with parked cars.
  const lotTex = tex.parking();
  lotTex.repeat.set(6, 3);
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), new THREE.MeshStandardMaterial({ map: lotTex, roughness: 0.9 }));
  lot.rotation.x = -Math.PI / 2;
  lot.position.set(240, 0.45, SHORE_Z + 70);
  lot.receiveShadow = true;
  scene.add(lot);

  const colors = [0xf2f2f2, 0x1c1c1e, 0x8a9199, 0x7b1e24, 0x1f3550, 0xd8cfc0];
  const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(1.9, 0.8, 4.6), new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.7 }), 70);
  const cabins = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 0.6, 2.4), new THREE.MeshStandardMaterial({ color: 0x1a2229, roughness: 0.1, metalness: 0.9 }), 70);
  let n = 0;
  for (let row = 0; row < 6 && n < 70; row++) {
    for (let k = 0; k < 18 && n < 70; k++) {
      if (Math.random() < 0.3) continue;
      const x = 240 - 56 + k * 6.6;
      const z = SHORE_Z + 70 - 25 + row * 10 + (row % 2 ? -2 : 2);
      dummy.rotation.set(0, row % 2 ? 0 : Math.PI, 0);
      dummy.scale.setScalar(1);
      dummy.position.set(x, 0.85, z);
      dummy.updateMatrix();
      bodies.setMatrixAt(n, dummy.matrix);
      bodies.setColorAt(n, new THREE.Color(colors[n % colors.length]));
      dummy.position.y = 1.55;
      dummy.updateMatrix();
      cabins.setMatrixAt(n, dummy.matrix);
      n++;
    }
  }
  bodies.count = cabins.count = n;
  bodies.castShadow = cabins.castShadow = true;
  scene.add(bodies, cabins);

  // Gatehouse at the start of the causeway.
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xece6da, roughness: 0.7 });
  for (const x of [-2, 22]) {
    const kiosk = new THREE.Mesh(new THREE.BoxGeometry(4, 3.4, 5), gateMat);
    kiosk.position.set(x, 2.1, SHORE_Z + 22);
    kiosk.castShadow = true;
    scene.add(kiosk);
  }
}

// Palms on the island, along the causeway gate and the beach; they grow in for the gardens chapter.
function createPalms(scene) {
  const spots = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    spots.push({ x: Math.cos(a) * (ISLAND.radius - 16), y: SAIL.deck, z: ISLAND.centerZ + Math.sin(a) * (ISLAND.radius - 16) });
  }
  for (let i = 0; i < 30; i++) spots.push({ x: rand(-300, 260), y: 0.4, z: SHORE_Z + rand(20, 140) });
  spots.forEach((s) => Object.assign(s, { h: rand(9, 14), delay: rand(0, 0.5), lean: rand(-0.12, 0.12) }));

  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 1, 6);
  trunkGeo.translate(0, 0.5, 0);
  const frondGeo = new THREE.ConeGeometry(0.6, 4.5, 4);
  frondGeo.translate(0, 2.25, 0);
  frondGeo.rotateZ(Math.PI / 2.3);
  const trunks = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x8b6b48, roughness: 1 }), spots.length);
  const fronds = new THREE.InstancedMesh(frondGeo, new THREE.MeshStandardMaterial({ color: 0x4d7a37, roughness: 0.9 }), spots.length * 7);
  trunks.castShadow = fronds.castShadow = true;
  scene.add(trunks, fronds);

  let last = -1;
  function grow(t) {
    if (Math.abs(t - last) < 0.003) return;
    last = t;
    spots.forEach((s, i) => {
      const k = Math.max(0.0001, THREE.MathUtils.smoothstep(t, s.delay, s.delay + 0.5));
      dummy.position.set(s.x, s.y, s.z);
      dummy.rotation.set(s.lean, 0, s.lean * 0.5);
      dummy.scale.set(k, s.h * k, k);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);
      for (let f = 0; f < 7; f++) {
        dummy.position.set(s.x + Math.sin(s.lean) * s.h * k, s.y + s.h * k, s.z);
        dummy.rotation.set(0, (f / 7) * Math.PI * 2 + i, 0);
        dummy.scale.setScalar(k);
        dummy.updateMatrix();
        fronds.setMatrixAt(i * 7 + f, dummy.matrix);
      }
    });
    trunks.instanceMatrix.needsUpdate = fronds.instanceMatrix.needsUpdate = true;
  }
  grow(0);
  return { grow };
}

function createCity(scene) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.9, emissive: 0xffb36b, emissiveIntensity: 0 });
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, 160);
  for (let i = 0; i < 160; i++) {
    const x = rand(-1600, 1600);
    const h = 20 + Math.random() ** 3 * 200;
    dummy.position.set(x, h / 2, SHORE_Z + rand(600, 1300));
    dummy.scale.set(rand(20, 45), h, rand(20, 45));
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    city.setMatrixAt(i, dummy.matrix);
  }
  scene.add(city);
  return city;
}

// Drop-off fountain: a basin and jets made of points.
function createFountain(scene, at) {
  const basin = new THREE.Mesh(new THREE.TorusGeometry(9, 0.6, 8, 48), new THREE.MeshStandardMaterial({ color: 0xe7e1d6, roughness: 0.5 }));
  basin.rotation.x = Math.PI / 2;
  basin.position.copy(at).setY(at.y + 0.6);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshStandardMaterial({ color: 0x4fb7cc, roughness: 0.05, emissive: 0x0b4f5e, emissiveIntensity: 0.3 }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.copy(at).setY(at.y + 0.4);
  scene.add(basin, pool);

  const N = 1500;
  const seeds = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    seeds[i * 3] = Math.random() * Math.PI * 2;
    seeds[i * 3 + 1] = Math.random();
    seeds[i * 3 + 2] = 4 + Math.random() * 3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const drops = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xdff6ff, size: 0.25, transparent: true, opacity: 0.8, depthWrite: false }));
  drops.position.copy(at);
  scene.add(drops);
  const p = geo.attributes.position.array;
  return {
    update(time) {
      for (let i = 0; i < N; i++) {
        const a = seeds[i * 3];
        const t = (seeds[i * 3 + 1] + time * 0.5) % 1;
        const r = seeds[i * 3 + 2] * t;
        p[i * 3] = Math.cos(a) * r * 0.6;
        p[i * 3 + 1] = 0.8 + 11 * t - 14 * t * t;
        p[i * 3 + 2] = Math.sin(a) * r * 0.6;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}
