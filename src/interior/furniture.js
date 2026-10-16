import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { marble } from '../sail/textures.js';

// Small furniture kit built from soft primitives. Every piece is a Group whose
// origin sits on the floor at its centre.
export const M = {
  velvet: new THREE.MeshStandardMaterial({ color: 0x1f3a6e, roughness: 0.9 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xf1e7d6, roughness: 0.9 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd8ad55, roughness: 0.25, metalness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x6e4a2f, roughness: 0.55 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x3f6b35, roughness: 0.8 }),
  pot: new THREE.MeshStandardMaterial({ color: 0xe9e3d8, roughness: 0.6 }),
  marble: new THREE.MeshStandardMaterial({ map: marble(), roughness: 0.15 }),
  linen: new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: 1 }),
  light: new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 2 }),
};

const rbox = (w, h, d, mat, r = 0.08) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
};
const at = (obj, x, y, z) => (obj.position.set(x, y, z), obj);

export function sofa(w = 3, mat = M.velvet) {
  const g = new THREE.Group();
  g.add(at(rbox(w, 0.45, 1, mat, 0.12), 0, 0.3, 0));
  g.add(at(rbox(w, 0.6, 0.25, mat, 0.1), 0, 0.75, -0.4));
  g.add(at(rbox(0.25, 0.55, 1, mat, 0.1), -w / 2 + 0.12, 0.6, 0));
  g.add(at(rbox(0.25, 0.55, 1, mat, 0.1), w / 2 - 0.12, 0.6, 0));
  for (let i = 0; i < Math.round(w / 0.9); i++) {
    const c = rbox(0.5, 0.45, 0.15, M.cream, 0.07);
    c.rotation.x = -0.2;
    g.add(at(c, -w / 2 + 0.6 + i * 0.85, 0.8, -0.22));
  }
  return g;
}

export function armchair(mat = M.cream) {
  const g = sofa(1, mat);
  g.add(at(rbox(0.06, 0.3, 0.06, M.gold), -0.4, 0.05, 0.4), at(rbox(0.06, 0.3, 0.06, M.gold), 0.4, 0.05, 0.4));
  return g;
}

export function coffeeTable(w = 1.4, d = 0.8) {
  const g = new THREE.Group();
  g.add(at(rbox(w, 0.06, d, M.marble, 0.02), 0, 0.42, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), M.gold), (x * (w - 0.1)) / 2, 0.2, (z * (d - 0.1)) / 2));
  }
  return g;
}

export function diningSet(chairs = 6) {
  const g = new THREE.Group();
  g.add(at(rbox(2.6, 0.06, 1.1, M.wood, 0.02), 0, 0.75, 0));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.72, 12), M.gold), -0.8, 0.36, 0));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.72, 12), M.gold), 0.8, 0.36, 0));
  for (let i = 0; i < chairs; i++) {
    const c = new THREE.Group();
    c.add(at(rbox(0.48, 0.08, 0.48, M.cream, 0.03), 0, 0.47, 0));
    c.add(at(rbox(0.48, 0.55, 0.06, M.cream, 0.03), 0, 0.78, -0.22));
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) c.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), M.gold), x * 0.2, 0.22, z * 0.2));
    const side = i % 2 ? 1 : -1;
    c.position.set(-0.85 + Math.floor(i / 2) * 0.85, 0, side * 0.8);
    c.rotation.y = side > 0 ? Math.PI : 0;
    g.add(c);
  }
  return g;
}

export function bed() {
  const g = new THREE.Group();
  g.add(at(rbox(2.2, 0.35, 2.3, M.velvet, 0.06), 0, 0.2, 0));
  g.add(at(rbox(2.1, 0.25, 2.2, M.linen, 0.1), 0, 0.5, 0.02));
  g.add(at(rbox(2.4, 1.3, 0.15, M.gold, 0.05), 0, 0.85, -1.15));
  for (const x of [-0.5, 0.5]) g.add(at(rbox(0.7, 0.2, 0.4, M.cream, 0.08), x, 0.72, -0.85));
  g.add(at(rbox(2.15, 0.08, 0.8, M.velvet, 0.03), 0, 0.64, 0.7));
  return g;
}

export function floorLamp() {
  const g = new THREE.Group();
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16), M.gold), 0, 0.015, 0));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 8), M.gold), 0, 0.8, 0));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.3, 16, 1, true), M.light), 0, 1.65, 0));
  return g;
}

export function plant(h = 1.4) {
  const g = new THREE.Group();
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.45, 16), M.pot), 0, 0.22, 0));
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), M.leaf);
    leaf.scale.set(0.5, 1.4, 0.2);
    leaf.position.set(Math.cos(i * 2.4) * 0.18, 0.5 + (i / 9) * h * 0.7, Math.sin(i * 2.4) * 0.18);
    leaf.rotation.set(Math.cos(i) * 0.6, i, Math.sin(i) * 0.6);
    leaf.castShadow = true;
    g.add(leaf);
  }
  return g;
}

export function chandelier(r = 0.9) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 8, 48), M.gold).rotateX(Math.PI / 2));
  g.add(new THREE.Mesh(new THREE.TorusGeometry(r * 0.6, 0.025, 8, 36), M.gold).rotateX(Math.PI / 2).translateZ(-0.25));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M.light), Math.cos(a) * r, -0.05, Math.sin(a) * r));
  }
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4), M.gold), 0, 0.6, 0));
  return g;
}

export function rug(r = 1.8, color = '#c9a96a') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#efe4cf';
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = color;
  for (let i = 0; i < 6; i++) {
    g.lineWidth = 6 - i * 0.6;
    g.beginPath();
    g.arc(128, 128, 120 - i * 18, 0, Math.PI * 2);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.01;
  m.receiveShadow = true;
  return m;
}

// Spiral staircase climbing `height` over `turn` radians, with a gold rail.
export function spiralStairs(height = 3.6, radius = 1.6, steps = 18, turn = Math.PI * 1.2) {
  const g = new THREE.Group();
  const rail = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const a = t * turn;
    const s = rbox(radius, 0.08, 0.5, M.marble, 0.02);
    s.position.set(Math.cos(a) * radius * 0.5, t * height, Math.sin(a) * radius * 0.5);
    s.rotation.y = -a;
    g.add(s);
    rail.push(new THREE.Vector3(Math.cos(a) * radius, t * height + 0.95, Math.sin(a) * radius));
  }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail), 64, 0.03, 8), M.gold));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, height + 1, 12), M.gold), 0, (height + 1) / 2, 0));
  return g;
}

export function artwork(w = 1.4, h = 1, hue = 30) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 180;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 256, 180);
  grd.addColorStop(0, `hsl(${hue},55%,70%)`);
  grd.addColorStop(1, `hsl(${hue + 160},40%,30%)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 180);
  for (let i = 0; i < 5; i++) {
    g.fillStyle = `hsla(${hue + i * 40},60%,${50 + i * 8}%,0.5)`;
    g.beginPath();
    g.arc(40 + i * 45, 90 + Math.sin(i) * 40, 30 + i * 6, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const grp = new THREE.Group();
  grp.add(rbox(w + 0.1, h + 0.1, 0.05, M.gold, 0.01));
  grp.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 })), 0, 0, 0.03));
  return grp;
}
