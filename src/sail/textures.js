import * as THREE from 'three';

// Procedural canvas textures: small, no downloads, tile cleanly.
function canvasTexture(w, h, draw, { repeat = true, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// One floor of the outer wing: white slab edge, tinted glass, thin mullions.
export const wingOuter = () =>
  canvasTexture(256, 64, (g, w, h) => {
    g.fillStyle = '#7f95a3';
    g.fillRect(0, 0, w, h);
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, 'rgba(255,255,255,0.18)');
    grd.addColorStop(1, 'rgba(0,0,0,0.12)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4f2ee';
    g.fillRect(0, 0, w, h * 0.34);
    g.fillStyle = 'rgba(230,230,228,0.9)';
    for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 3, h);
  });

// Atrium side of the wings: gold balcony fronts over deep blue.
export const wingInner = () =>
  canvasTexture(256, 64, (g, w, h) => {
    g.fillStyle = '#1d3a6b';
    g.fillRect(0, 0, w, h);
    const gold = g.createLinearGradient(0, 0, 0, h * 0.4);
    gold.addColorStop(0, '#f3d27a');
    gold.addColorStop(1, '#a8781f');
    g.fillStyle = gold;
    g.fillRect(0, 0, w, h * 0.4);
    g.fillStyle = 'rgba(255,214,140,0.85)';
    for (let x = 12; x < w; x += 32) g.fillRect(x, h * 0.62, 8, 6);
  });

// Fabric wall: soft white with the curved steel ribs.
export const fabric = () =>
  canvasTexture(64, 128, (g, w, h) => {
    g.fillStyle = '#f7f6f2';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(150,155,160,0.55)';
    g.fillRect(0, 0, w, 3);
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, 'rgba(0,0,0,0.06)');
    grd.addColorStop(0.5, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.06)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  });

export const marble = (base = '#efe9df', vein = 'rgba(120,110,100,0.25)') =>
  canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = vein;
    for (let i = 0; i < 18; i++) {
      g.lineWidth = 0.6 + Math.random() * 1.8;
      g.beginPath();
      let x = Math.random() * w;
      let y = 0;
      g.moveTo(x, y);
      while (y < h) {
        x += (Math.random() - 0.5) * 40;
        y += 10 + Math.random() * 30;
        g.lineTo(x, y);
      }
      g.stroke();
    }
  });

export const helipad = () =>
  canvasTexture(
    256,
    256,
    (g, w) => {
      g.fillStyle = '#2f6b45';
      g.fillRect(0, 0, w, w);
      g.strokeStyle = '#f4f4f0';
      g.lineWidth = 10;
      g.beginPath();
      g.arc(w / 2, w / 2, w * 0.36, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = '#f4f4f0';
      g.font = 'bold 120px sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('H', w / 2, w / 2 + 6);
    },
    { repeat: false },
  );

// Parking bays: one row of bay lines on asphalt.
export const parking = () =>
  canvasTexture(256, 128, (g, w, h) => {
    g.fillStyle = '#3a3c40';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9e7df';
    for (let x = 0; x <= w; x += 32) g.fillRect(x, 0, 3, h * 0.42);
    for (let x = 0; x <= w; x += 32) g.fillRect(x, h * 0.58, 3, h * 0.42);
  });

export const sand = () =>
  canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#e6d3ad';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(${150 + Math.random() * 80},${130 + Math.random() * 60},90,0.12)`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });
