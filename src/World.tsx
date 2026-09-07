import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check } from 'lucide-react';
import { places, type PlaceId } from './content';
import { playSound } from './sound';

type Props = {
  night: boolean; sound: boolean; paused: boolean; reducedMotion: boolean;
  onVisit: (id: PlaceId) => void; onCollect: (index: number) => void; collected: number[];
  visited: PlaceId[]; command: { type: 'start' | 'jump' | 'reset'; nonce: number } | null;
};

export default function World(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef(props); callbacks.current = props;
  const api = useRef<(type: string) => void>(() => {});
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState<PlaceId | null>(null);

  useEffect(() => {
    const element = host.current!;
    const scene = new THREE.Scene();
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.setAttribute('aria-label', 'Playable island. Use arrow keys or WASD to move, Space to jump, and E to enter a nearby place. You can also click the ground to walk.');
    renderer.domElement.tabIndex = 0;
    element.prepend(renderer.domElement);
    const camera = new THREE.OrthographicCamera(-10, 10, 8, -8, 0.1, 100);
    camera.position.set(13, 16, 20); camera.lookAt(0, 0.2, 0);
    const ambient = new THREE.AmbientLight('#ffffff', 0.7); scene.add(ambient);
    const sky = new THREE.HemisphereLight('#fff9e9', '#91a789', 1.25); scene.add(sky);
    const sun = new THREE.DirectionalLight('#fff0d5', 2.5);
    sun.position.set(-8, 16, 8); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
    sun.shadow.normalBias = 0.04; sun.shadow.bias = -0.0001; sun.shadow.radius = 4;
    scene.add(sun);
    const materials = new Map<string, THREE.MeshStandardMaterial>();
    const mat = (color: string) => {
      if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.78 }));
      return materials.get(color)!;
    };
    const box = (parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, color: string, radius = 0.06) => {
      const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 3, h / 3, d / 3)), mat(color));
      mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    };
    const sphere = (parent: THREE.Object3D, radius: number, x: number, y: number, z: number, color: string, detail = 1) => {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, detail), mat(color));
      mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    };
    const cylinder = (parent: THREE.Object3D, top: number, bottom: number, height: number, x: number, y: number, z: number, color: string, segments = 24) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), mat(color));
      mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    };
    const textPlane = (parent: THREE.Object3D, text: string, x: number, y: number, z: number, width: number, height: number, background: string, color: string) => {
      const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = background; ctx.fillRect(0, 0, 768, 256);
      ctx.fillStyle = color; ctx.font = 'bold 94px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 384, 134);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    };
    const island = new THREE.Group(); scene.add(island);
    box(island, 13.8, 0.8, 10.4, 0, -0.56, 0, '#c5cab4', 0.35);
    box(island, 13.85, 0.25, 10.45, 0, -0.04, 0, '#b5c6a0', 0.2);
    box(island, 13.5, 0.07, 10.1, 0, 0.11, 0, '#c4d3b2', 0.03);
    // Sandstone paths connect every destination.
    box(island, 11.9, 0.07, 1.22, 0, 0.17, 0.65, '#f2e9cf');
    box(island, 1.25, 0.075, 8.8, 0.2, 0.18, 0, '#f2e9cf');
    box(island, 3.5, 0.08, 2.9, -3.4, 0.19, -1.8, '#e8dbc4');
    box(island, 3.0, 0.08, 2.65, 3.3, 0.19, -1.65, '#ded2e6');
    box(island, 3.4, 0.07, 2.3, -3.8, 0.17, 3.0, '#dddfbe');
    for (let i = 0; i < 10; i++) box(island, 0.015, 0.006, 1.2, -5.5 + i * 1.2, 0.212, 0.65, '#d4cbb5', 0);
    for (let i = 0; i < 8; i++) box(island, 1.2, 0.006, 0.015, 0.2, 0.225, -3.6 + i * 1.1, '#d4cbb5', 0);

    // An open-front studio, complete with a tiny working desk.
    const studio = new THREE.Group(); studio.position.set(-3.4, 0.23, -2); island.add(studio);
    box(studio, 3.1, 0.15, 2.4, 0, 0.05, 0, '#f8efe0');
    box(studio, 3.1, 2.15, 0.17, 0, 1.15, -1.1, '#efe5d1');
    box(studio, 0.16, 2.15, 2.3, -1.47, 1.15, 0, '#e2d3ba');
    box(studio, 3.45, 0.23, 2.65, 0, 2.35, 0, '#e3744f');
    for (let i = 0; i < 7; i++) box(studio, 0.045, 0.035, 2.6, -1.45 + i * 0.48, 2.483, 0, '#bd593e');
    box(studio, 0.13, 2.2, 0.13, 1.45, 1.1, 1.08, '#e48a60');
    box(studio, 2.0, 0.15, 0.7, 0, 0.94, -0.2, '#b88761');
    [-0.8, 0.8].forEach(x => box(studio, 0.1, 0.86, 0.5, x, 0.46, -0.2, '#86634e'));
    box(studio, 0.95, 0.66, 0.09, 0, 1.4, -0.3, '#34494b');
    box(studio, 0.83, 0.54, 0.015, 0, 1.4, -0.245, '#a7d1ba');
    textPlane(studio, '</>', 0, 1.4, -0.233, 0.76, 0.35, '#a7d1ba', '#28443b');
    box(studio, 0.1, 0.23, 0.12, 0, 1.02, -0.3, '#34494b');
    box(studio, 0.7, 0.04, 0.22, 0, 1.04, 0.03, '#e9e6db');
    cylinder(studio, 0.1, 0.09, 0.2, 0.75, 1.1, -0.02, '#eead62');
    box(studio, 0.63, 0.13, 0.6, 0, 0.56, 0.65, '#dd825c');
    box(studio, 0.63, 0.55, 0.12, 0, 0.83, 0.93, '#dd825c');
    cylinder(studio, 0.05, 0.05, 0.47, 0, 0.28, 0.65, '#425350');
    box(studio, 0.65, 0.07, 0.1, 0, 0.08, 0.65, '#425350');
    textPlane(studio, 'STUDIO 01', 0, 2.34, 1.337, 1.55, 0.19, '#e3744f', '#fff3dd');
    box(studio, 0.45, 0.5, 0.05, -0.8, 1.65, -0.997, '#809983');
    textPlane(studio, '*', -0.8, 1.65, -0.965, 0.35, 0.35, '#809983', '#ffe1a3');

    // Two candy-colored arcade cabinets.
    const arcade = new THREE.Group(); arcade.position.set(3.15, 0.23, -1.7); arcade.rotation.y = -0.12; island.add(arcade);
    const cabinet = (x: number, color: string, caption: string, name: string) => {
      box(arcade, 1.02, 1.1, 0.85, x, 0.59, 0, color);
      box(arcade, 1.02, 1.1, 0.62, x, 1.48, -0.12, color);
      box(arcade, 0.83, 0.67, 0.08, x, 1.45, 0.208, '#333c46');
      textPlane(arcade, caption, x, 1.48, 0.26, 0.71, 0.43, '#273e43', '#c8efac');
      box(arcade, 1.09, 0.22, 0.71, x, 2.11, -0.08, '#ddd0f0');
      textPlane(arcade, name, x, 2.12, 0.285, 0.8, 0.17, '#ddd0f0', '#615080');
      box(arcade, 1.04, 0.13, 0.65, x, 1.0, 0.25, '#b7a0d6');
      cylinder(arcade, 0.035, 0.035, 0.17, x - 0.22, 1.13, 0.36, '#3d4547');
      sphere(arcade, 0.09, x - 0.22, 1.23, 0.36, '#e77a62', 2);
      cylinder(arcade, 0.07, 0.07, 0.05, x + 0.18, 1.10, 0.35, '#f7d577');
      cylinder(arcade, 0.07, 0.07, 0.05, x + 0.35, 1.10, 0.35, '#de7a75');
      box(arcade, 0.22, 0.06, 0.02, x, 0.59, 0.436, '#473955');
    };
    cabinet(-0.62, '#748bba', 'SYNC', 'SUBSYNC'); cabinet(0.62, '#aa8cca', 'CLIP', 'CLIPPY');

    // BytesBurn's radio booth: a warm wooden receiver and a small broadcast tower.
    const radio = new THREE.Group(); radio.position.set(0.4, 0.23, -3.5); island.add(radio);
    cylinder(radio, 1.0, 1.1, 0.12, 0, 0.04, 0, '#e4c7ab');
    box(radio, 1.6, 1.05, 0.65, 0, 0.75, 0, '#c47b55', 0.13);
    box(radio, 1.43, 0.88, 0.04, 0, 0.75, 0.34, '#efd8b6');
    for(let i = 0; i < 7; i++) box(radio, 0.45, 0.025, 0.025, -0.4, 0.53 + i * 0.07, 0.376, '#9d6b4f');
    box(radio, 0.61, 0.35, 0.03, 0.29, 0.88, 0.38, '#34463f');
    textPlane(radio, '98.4', 0.29, 0.9, 0.4, 0.56, 0.19, '#34463f', '#f8c977');
    [-0.59,0.59].forEach(x=>box(radio, 0.16, 0.22, 0.45, x, 0.19, 0, '#976347'));
    [0.13,0.46].forEach(x=>{const knob=cylinder(radio,0.085,0.085,0.065,x,0.54,0.4,'#b17654');knob.rotation.x=Math.PI/2;});
    box(radio, 0.13, 0.27, 0.12, -0.39, 1.41, 0, '#815e48');
    box(radio, 0.13, 0.27, 0.12, 0.39, 1.41, 0, '#815e48');
    box(radio, 0.9, 0.13, 0.12, 0, 1.55, 0, '#815e48');
    const antenna = cylinder(radio,0.02,0.025,1.25,0.6,1.77,-0.12,'#ad9d7e'); antenna.rotation.z=-0.18;
    sphere(radio,0.055,0.71,2.38,-0.12,'#ed895b',2);
    textPlane(radio,'BYTESBURN',0,1.12,0.376,1.22,0.13,'#efd8b6','#a56340');
    const broadcastWaves: THREE.Mesh[] = [];
    [0.25,0.43,0.61].forEach(radius=>{
      const wave=new THREE.Mesh(new THREE.TorusGeometry(radius,0.018,6,28,Math.PI*1.25),new THREE.MeshBasicMaterial({color:'#d4995d',transparent:true,opacity:0.6}));
      wave.position.set(0.71,2.38,-0.12);wave.rotation.z=-Math.PI*0.12;radio.add(wave);broadcastWaves.push(wave);
    });
    // Reading garden bench and books.
    const garden = new THREE.Group(); garden.position.set(-3.65, 0.23, 2.75); island.add(garden);
    for (let i = 0; i < 4; i++) box(garden, 2.05, 0.12, 0.16, 0, 0.52, -0.24 + i * 0.19, '#c48e60');
    for (let i = 0; i < 3; i++) box(garden, 2.05, 0.15, 0.10, 0, 0.8 + i * 0.18, -0.36, '#c48e60');
    [-0.75, 0.75].forEach(x => { box(garden, 0.12, 1.15, 0.12, x, 0.58, -0.36, '#4f6858'); box(garden, 0.13, 0.52, 0.13, x, 0.26, 0.27, '#4f6858'); });
    box(garden, 0.46, 0.09, 0.33, 0.55, 0.64, 0.08, '#9272bb');
    const book = box(garden, 0.41, 0.08, 0.3, 0.57, 0.72, 0.07, '#f3be69'); book.rotation.y = 0.18;
    cylinder(garden, 0.42, 0.32, 0.15, -1.3, 0.54, 0.6, '#eee5cf');
    cylinder(garden, 0.08, 0.18, 0.5, -1.3, 0.25, 0.6, '#72886b');
    cylinder(garden, 0.09, 0.07, 0.16, -1.3, 0.68, 0.6, '#e77952');

    // The orange portal, with a softly pulsing inner ring.
    const portal = new THREE.Group(); portal.position.set(4.25, 0.23, 2.45); portal.rotation.y = -0.35; island.add(portal);
    cylinder(portal, 1.12, 1.25, 0.20, 0, 0.1, 0, '#ecdbc0');
    cylinder(portal, 0.85, 0.98, 0.14, 0, 0.26, 0, '#f5e9d2');
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.16, 12, 64), mat('#ef9d4e')); ring.position.y = 1.22; ring.castShadow = true; portal.add(ring);
    const glow = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.045, 8, 64), new THREE.MeshBasicMaterial({ color: '#ffe4a0' })); glow.position.set(0, 1.22, 0.145); portal.add(glow);
    const portalLight = new THREE.PointLight('#ffb252', 0, 5, 1.5); portalLight.position.set(0, 1.3, 0.4); portal.add(portalLight);
    const studioLight = new THREE.PointLight('#ffe0a0', 0, 5, 1.5); studioLight.position.set(0, 1.8, 0.4); studio.add(studioLight);
    const envelope = new THREE.Group(); portal.add(envelope); envelope.position.set(0, 1.2, 0);
    box(envelope, 0.75, 0.49, 0.1, 0, 0, 0, '#fff4da');
    const lineMat = new THREE.LineBasicMaterial({ color: '#d99058' });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.35, 0.22, 0.06), new THREE.Vector3(0, -0.025, 0.06), new THREE.Vector3(0.35, 0.22, 0.06)]), lineMat); envelope.add(line);
    box(portal, 1.05, 0.18, 0.26, 0, 0.18, 1.05, '#caac85');

    const trees: THREE.Group[] = [];
    function tree(x: number, z: number, scale: number, color: string) {
      const group = new THREE.Group(); group.position.set(x, 0.2, z); group.scale.setScalar(scale); island.add(group);
      cylinder(group, 0.085, 0.13, 1.35, 0, 0.66, 0, '#9d7c54', 7);
      sphere(group, 0.8, 0, 1.65, 0, color, 1);
      sphere(group, 0.6, -0.4, 1.4, 0.03, color, 1);
      sphere(group, 0.56, 0.38, 1.48, 0.06, color, 1);
      trees.push(group);
    }
    tree(-5.55, -2.8, 1.2, '#78977a'); tree(-1.7, -4.0, 0.65, '#90a37f');
    tree(5.3, -3.2, 1.25, '#a6b897'); tree(-5.65, 2.05, 1, '#88a58d');
    tree(2.5, -4.3, 0.55, '#dbb58d'); tree(-1.7, 3.9, 0.58, '#8caa88');
    // Flower beds, grass tufts and a small lily pond.
    cylinder(island, 0.9, 0.95, 0.08, 2.05, 0.22, 3.62, '#8dbab4', 48).scale.z = 0.7;
    cylinder(island, 0.72, 0.72, 0.02, 2.05, 0.27, 3.62, '#a6d2c9', 48).scale.z = 0.7;
    cylinder(island, 0.14, 0.14, 0.02, 1.8, 0.29, 3.6, '#6f9970');
    sphere(island, 0.08, 1.8, 0.35, 3.6, '#f0b9b6', 1);
    for (let i = 0; i < 42; i++) {
      const x = Math.sin(i * 71.7) * 6.3; const z = Math.cos(i * 29.4) * 4.6;
      if (Math.abs(x) < 0.95 || Math.abs(z - 0.65) < 0.85 || (Math.abs(x) < 5 && Math.abs(z) < 3.5)) continue;
      for (let j = 0; j < 3; j++) {
        const grass = box(island, 0.035, 0.14 + j * 0.055, 0.04, x + j * 0.07, 0.25, z, '#779471', 0.01); grass.rotation.z = (j - 1) * 0.35;
      }
      if (i % 2 === 0) sphere(island, 0.075, x, 0.4, z, i % 4 ? '#f1c66b' : '#e6a9a1', 0);
    }
    for (let i = 0; i < 7; i++) {
      box(island, 0.12, 0.7, 0.12, -6.35 + i * 0.65, 0.5, -4.65, '#f0e8d1');
    }
    box(island, 4.0, 0.12, 0.10, -4.4, 0.69, -4.65, '#f0e8d1');
    box(island, 4.0, 0.12, 0.10, -4.4, 0.37, -4.65, '#f0e8d1');
    // A direction sign at the crossroads.
    cylinder(island, 0.055, 0.06, 1.2, -1.04, 0.72, 0.6, '#997755');
    box(island, 0.82, 0.25, 0.09, -1.04, 1.17, 0.6, '#f4dfb4');
    textPlane(island, 'EXPLORE', -1.04, 1.18, 0.65, 0.72, 0.17, '#f4dfb4', '#81664c');

    // A tiny visitor in a sunny orange jacket.
    const player = new THREE.Group(); player.position.set(0.25, 0.24, 2.45); island.add(player);
    const body = box(player, 0.38, 0.44, 0.29, 0, 0.47, 0, '#ed7444', 0.09);
    sphere(player, 0.21, 0, 0.89, 0, '#a87452', 2);
    const hair = sphere(player, 0.22, 0, 0.97, -0.04, '#34332c', 1); hair.scale.y = 0.67;
    const leftLeg = box(player, 0.13, 0.26, 0.16, -0.1, 0.17, 0, '#3c4e4b');
    const rightLeg = box(player, 0.13, 0.26, 0.16, 0.1, 0.17, 0, '#3c4e4b');
    const leftArm = box(player, 0.12, 0.33, 0.14, -0.26, 0.47, 0, '#ed7444');
    const rightArm = box(player, 0.12, 0.33, 0.14, 0.26, 0.47, 0, '#ed7444');
    box(player, 0.17, 0.09, 0.23, -0.1, 0.06, 0.04, '#faf0d6');
    box(player, 0.17, 0.09, 0.23, 0.1, 0.06, 0.04, '#faf0d6');
    box(player, 0.27, 0.31, 0.13, 0, 0.49, -0.2, '#f1c269');
    [-0.075, 0.075].forEach(x => sphere(player, 0.026, x, 0.89, 0.184, '#242e2d', 1));
    const playerMarker = new THREE.Mesh(new THREE.RingGeometry(0.37, 0.41, 40), new THREE.MeshBasicMaterial({ color: '#faf8e7', side: THREE.DoubleSide }));
    playerMarker.rotation.x = -Math.PI / 2; playerMarker.position.set(0.25, 0.24, 2.45); island.add(playerMarker);
    const targetMarker = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.2, 32), new THREE.MeshBasicMaterial({ color: '#ed7444', side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
    targetMarker.rotation.x = -Math.PI / 2; targetMarker.visible = false; island.add(targetMarker);
    const collectibles: THREE.Mesh[] = [];
    [[1.7,-3.15],[0.2,-1.6],[0.2,0.1],[-2.1,0.65],[-4.7,0.65],[2.3,0.65],[4.9,0.65],[0.2,3.75]].forEach(([x,z], index) => {
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14), new THREE.MeshStandardMaterial({ color: '#edae39', metalness: 0.25, roughness: 0.35, emissive: '#b87514', emissiveIntensity: 0.15 }));
      gem.position.set(x, 0.65, z); gem.castShadow = true; gem.visible = !callbacks.current.collected.includes(index); island.add(gem); collectibles.push(gem);
    });
    const particles: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[] = [];
    const burst = (position: THREE.Vector3) => {
      for (let i = 0; i < 12; i++) {
        const p = box(island, 0.07, 0.07, 0.07, position.x, position.y, position.z, ['#efb54e', '#ee7a50', '#aa8fc7', '#fff3d6'][i % 4]);
        particles.push({ mesh: p, velocity: new THREE.Vector3(Math.sin(i * 2.4) * 2, 2 + i % 3, Math.cos(i * 2.4) * 2), life: 0.8 });
      }
    };
    // Soft floating shadows anchor the diorama to the page.
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
    const sc = shadowCanvas.getContext('2d')!; const grad = sc.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, 'rgba(58,62,47,0.19)'); grad.addColorStop(1, 'rgba(58,62,47,0)'); sc.fillStyle = grad; sc.fillRect(0,0,128,128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(22, 17), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.45; scene.add(shadow);

    let width = 0, height = 0;
    const resize = () => {
      width = element.clientWidth; height = element.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      const aspect = width / height; const halfWidth = Math.max(9.5, 7.1 * aspect);
      camera.left = -halfWidth; camera.right = halfWidth; camera.top = halfWidth / aspect; camera.bottom = -halfWidth / aspect;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    const keys = new Set<string>(); let target: THREE.Vector3 | null = null; let jumpVelocity = 0; let jumpHeight = 0; let nearest: PlaceId | null = null;
    const obstacles = [ {x:-3.4,z:-2,w:1.65,d:1.32}, {x:3.15,z:-1.7,w:1.25,d:0.65}, {x:-3.65,z:2.65,w:1.15,d:0.5}, {x:0.4,z:-3.5,w:0.85,d:0.4} ];
    const valid = (x: number, z: number) => Math.abs(x) < 6.5 && Math.abs(z) < 4.8 && !obstacles.some(o => Math.abs(x-o.x)<o.w+0.15 && Math.abs(z-o.z)<o.d+0.15);
    const jump = () => { if (jumpHeight <= 0.001) { jumpVelocity = 4.0; playSound('jump', callbacks.current.sound); } };
    api.current = type => {
      if (type.startsWith('move-')) {
        keys.clear(); target = null;
        const direction = type.slice(5);
        if (['up', 'down', 'left', 'right'].includes(direction)) keys.add(`arrow${direction}`);
      }
      if (type === 'stop') keys.clear();
      if (type === 'jump') jump();
      if (type === 'start') { renderer.domElement.focus({ preventScroll: true }); target = new THREE.Vector3(0.2, 0, 0.4); }
      if (type === 'reset') { player.position.set(0.25,0.24,2.45); target = null; jumpHeight = 0; jumpVelocity = 0; renderer.domElement.focus({preventScroll:true}); }
    };
    const keydown = (e: KeyboardEvent) => {
      if (callbacks.current.paused || (e.target instanceof HTMLElement && ['INPUT','TEXTAREA','BUTTON','A'].includes(e.target.tagName))) return;
      const key = e.key.toLowerCase();
      if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','e'].includes(key)) {
        e.preventDefault(); keys.add(key); target = null;
        if (key === ' ' && !e.repeat) jump();
        if (key === 'e' && nearest && !e.repeat) callbacks.current.onVisit(nearest);
      }
    };
    const keyup = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const blur = () => keys.clear();
    window.addEventListener('keydown',keydown); window.addEventListener('keyup',keyup); window.addEventListener('blur',blur);
    const raycaster = new THREE.Raycaster(); const plane = new THREE.Plane(new THREE.Vector3(0,1,0), -0.24);
    const walkToPointer = (e: PointerEvent) => {
      if (callbacks.current.paused) return;
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1, -(e.clientY-rect.top)/rect.height*2+1),camera);
      const point = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane,point) && valid(point.x,point.z)) {
        target = point; targetMarker.position.set(point.x,0.25,point.z); targetMarker.visible = true;
        renderer.domElement.focus({preventScroll:true}); playSound('click',callbacks.current.sound);
      }
    };
    let pointerStart: { x: number; y: number; id: number } | null = null;
    const pointerdown = (e: PointerEvent) => {
      if (e.isPrimary && e.button === 0) pointerStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const pointerup = (e: PointerEvent) => {
      if (pointerStart?.id === e.pointerId && Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) < 10) walkToPointer(e);
      pointerStart = null;
    };
    const pointercancel = () => { pointerStart = null; };
    renderer.domElement.addEventListener('pointerdown',pointerdown);
    renderer.domElement.addEventListener('pointerup',pointerup);
    renderer.domElement.addEventListener('pointercancel',pointercancel);
    let frame = 0; let previous = performance.now(); let elapsed = 0;
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min((now-previous)/1000,0.04); previous = now; elapsed += dt;
      const { night, paused, reducedMotion } = callbacks.current;
      ambient.intensity = THREE.MathUtils.lerp(ambient.intensity,night ? 0.3 : 0.7,0.04);
      sun.intensity = THREE.MathUtils.lerp(sun.intensity,night ? 0.4 : 2.5,0.04);
      sky.intensity = THREE.MathUtils.lerp(sky.intensity,night ? 0.55 : 1.25,0.04);
      portalLight.intensity = THREE.MathUtils.lerp(portalLight.intensity,night ? 5 : 0,0.04);
      studioLight.intensity = THREE.MathUtils.lerp(studioLight.intensity,night ? 4 : 0,0.04);
      if (paused) keys.clear();
      if (!paused) {
        let dx = 0, dz = 0;
        const horizontal = Number(keys.has('d')||keys.has('arrowright')) - Number(keys.has('a')||keys.has('arrowleft'));
        const vertical = Number(keys.has('s')||keys.has('arrowdown')) - Number(keys.has('w')||keys.has('arrowup'));
        dx = horizontal*0.84 + vertical*0.54; dz = -horizontal*0.54 + vertical*0.84;
        if (target && !horizontal && !vertical) { dx = target.x-player.position.x; dz = target.z-player.position.z; if (Math.hypot(dx,dz)<0.1) { target=null; dx=dz=0; } }
        const length = Math.hypot(dx,dz); const moving = length>0.05;
        if (moving) {
          dx=dx/length*dt*2.7; dz=dz/length*dt*2.7;
          const beforeX=player.position.x, beforeZ=player.position.z;
          if (valid(player.position.x+dx,player.position.z)) player.position.x+=dx;
          if (valid(player.position.x,player.position.z+dz)) player.position.z+=dz;
          if (target && Math.hypot(player.position.x-beforeX,player.position.z-beforeZ)<0.001) target=null;
          const angle = Math.atan2(dx,dz); player.rotation.y += Math.atan2(Math.sin(angle-player.rotation.y),Math.cos(angle-player.rotation.y))*Math.min(1,dt*12);
        }
        const stride = moving && !reducedMotion ? Math.sin(elapsed*15)*0.55 : 0;
        leftLeg.rotation.x = stride; rightLeg.rotation.x = -stride; leftArm.rotation.x = -stride; rightArm.rotation.x = stride;
        body.position.y = 0.47+(moving&&!reducedMotion?Math.sin(elapsed*30)*0.018:0);
        jumpVelocity -= dt*10; jumpHeight = Math.max(0,jumpHeight+jumpVelocity*dt); if (jumpHeight===0) jumpVelocity=0;
        player.position.y = 0.24+jumpHeight;
        playerMarker.position.set(player.position.x,0.245,player.position.z); playerMarker.scale.setScalar(1+jumpHeight*0.2);
        targetMarker.visible = !!target;
        let nextNear: PlaceId | null=null;
        for(const place of places) if(Math.hypot(player.position.x-place.position[0],player.position.z-place.position[2])<2.25) nextNear=place.id;
        if(nextNear!==nearest) { nearest=nextNear; setNear(nearest); }
        collectibles.forEach((gem,i)=>{
          if(!gem.visible)return;
          if(!reducedMotion) {gem.rotation.y=elapsed*1.6;gem.position.y=0.65+Math.sin(elapsed*2.5+i)*0.07;}
          if(Math.hypot(player.position.x-gem.position.x,player.position.z-gem.position.z)<0.48){gem.visible=false;burst(gem.position);callbacks.current.onCollect(i);playSound('collect',callbacks.current.sound);}
        });
      }
      if(!reducedMotion) {
        envelope.position.y=1.2+Math.sin(elapsed*2)*0.1; envelope.rotation.y=Math.sin(elapsed)*0.12;
        trees.forEach((tree,i)=>tree.rotation.z=Math.sin(elapsed*0.75+i)*0.014);
        glow.scale.setScalar(1+Math.sin(elapsed*2)*0.025);
        broadcastWaves.forEach((wave,i)=>{(wave.material as THREE.MeshBasicMaterial).opacity=0.22+(Math.sin(elapsed*2.3-i*0.8)+1)*0.2;});
      }
      for(let i=particles.length-1;i>=0;i--){ const p=particles[i];p.life-=dt;p.velocity.y-=dt*6;p.mesh.position.addScaledVector(p.velocity,dt);p.mesh.rotation.x+=dt*5;p.mesh.scale.setScalar(Math.max(0,p.life/0.8));if(p.life<=0){island.remove(p.mesh);p.mesh.geometry.dispose();particles.splice(i,1);} }
      places.forEach((place,i)=>{
        const projected = new THREE.Vector3(...place.position).project(camera);
        const label=labelRefs.current[i];
        if(label) {
          // Give the closely spaced radio and arcade pins separate touch targets.
          const compact = window.innerWidth <= 600;
          const offsetX = compact && place.id === 'podcast' ? -12 : compact && place.id === 'work' ? 12 : 0;
          const offsetY = compact && place.id === 'podcast' ? -9 : compact && place.id === 'work' ? 9 : compact && place.id === 'contact' ? 24 : 0;
          label.style.left=`${(projected.x*0.5+0.5)*width + offsetX}px`;
          label.style.top=`${(-projected.y*0.5+0.5)*height + offsetY}px`;
        }
      });
      renderer.render(scene,camera);
    };
    frame=requestAnimationFrame(animate); setReady(true);
    return()=>{
      cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);renderer.domElement.removeEventListener('pointerdown',pointerdown);renderer.domElement.removeEventListener('pointerup',pointerup);renderer.domElement.removeEventListener('pointercancel',pointercancel);
      scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const list=Array.isArray(object.material)?object.material:[object.material];list.forEach(material=>{if(material.map)material.map.dispose();material.dispose();});}else if(object instanceof THREE.Line){object.geometry.dispose();(object.material as THREE.Material).dispose();}});
      renderer.dispose();renderer.domElement.remove();api.current=()=>{};
    };
  },[]);

  useEffect(() => { if (props.command) api.current(props.command.type); }, [props.command]);

  return <><div className={`world ${ready?'is-ready':''} ${failed?'world-failed':''}`} ref={host}>
    {!ready&&!failed&&<div className="world-loading"><span className="loading-cube"/>Growing a little world…</div>}
    {failed&&<div className="world-loading">Your browser couldn’t open the 3D world.<br/>You can explore every place using the cards below.</div>}
    {ready&&places.map((place,i)=><button key={place.id} ref={el=>{labelRefs.current[i]=el;}} className={`world-label label-${place.id} ${near===place.id?'nearby':''} ${props.visited.includes(place.id)?'discovered':''}`} onClick={()=>props.onVisit(place.id)} aria-label={`Explore ${place.name}`} title={place.name}><span className="label-dot" style={{background:place.color}}>{props.visited.includes(place.id)?<Check size={9}/>:place.number}</span><span className="label-name">{place.name}</span><ArrowUpRight size={12}/></button>)}
    {near&&!props.paused&&<button className="interact-prompt" onClick={()=>props.onVisit(near)}><kbd>E</kbd> Enter {places.find(p=>p.id===near)?.name.toLowerCase()} <ArrowUpRight size={14}/></button>}
  </div>{ready&&<div className="touch-controls" aria-label="Touch game controls">
    <p>Hold an arrow to wander. Tap a pin to explore.</p>
    <div className="touch-directions">{([{direction:'left',Icon:ArrowLeft},{direction:'up',Icon:ArrowUp},{direction:'down',Icon:ArrowDown},{direction:'right',Icon:ArrowRight}]).map(({direction,Icon})=><button key={direction} aria-label={`Move ${direction}`} disabled={props.paused}
      onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);api.current(`move-${direction}`);}}
      onPointerUp={()=>api.current('stop')} onPointerCancel={()=>api.current('stop')} onLostPointerCapture={()=>api.current('stop')}
      onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();api.current(`move-${direction}`);}}}
      onKeyUp={e=>{if(e.key===' '||e.key==='Enter')api.current('stop');}} onBlur={()=>api.current('stop')}><Icon size={19}/></button>)}</div>
    <button className="touch-jump" onClick={()=>api.current('jump')} disabled={props.paused}><ArrowUp size={17}/> Jump</button>
  </div>}</>;
}
