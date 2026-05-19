import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Stadium } from '../../data/StadiumsData';

interface RealisticStadium3DProps {
  stadium: Stadium;
  currentTime?: Date;
  interactive?: boolean;
}

// ─── Sky / lighting params by hour ────────────────────────────────────────────
function getSky(hour: number) {
  if (hour >= 5 && hour < 8)  return { bg: 0x150802, sun: 0xffaa44, si: 1.5, ai: 0.5, sunPos: new THREE.Vector3(-5, 3, 6) };
  if (hour >= 8 && hour < 13) return { bg: 0x0a1424, sun: 0xffffff, si: 2.2, ai: 0.7, sunPos: new THREE.Vector3(2, 10, 4) };
  if (hour >= 13 && hour < 17)return { bg: 0x08101e, sun: 0xfff6e0, si: 1.8, ai: 0.6, sunPos: new THREE.Vector3(6, 8, 4) };
  if (hour >= 17 && hour < 20)return { bg: 0x180502, sun: 0xff6600, si: 1.4, ai: 0.4, sunPos: new THREE.Vector3(8, 3, 3) };
  return                           { bg: 0x020408, sun: 0x8899cc, si: 0.8, ai: 0.25, sunPos: new THREE.Vector3(0, 8, 5) };
}

// ─── Build ONE stadium group ──────────────────────────────────────────────────
function buildStadium(stadium: Stadium, hour: number): THREE.Group {
  const root = new THREE.Group();

  // Seed for per-stadium variation
  let h = 0;
  for (let i = 0; i < stadium.id.length; i++) h = stadium.id.charCodeAt(i) + ((h << 5) - h);
  const rng = () => { h = Math.sin(h) * 43758.5453; return h - Math.floor(h); };

  const isOval      = rng() > 0.45;                        // oval vs rectangular
  const hasDome     = stadium.capacity > 80000 && rng() > 0.5;
  const tierCount   = stadium.capacity > 70000 ? 3 : stadium.capacity > 50000 ? 2 : 1;
  const nightMode   = hour < 7 || hour >= 19;

  const primary  = new THREE.Color(stadium.color);
  const accent   = new THREE.Color(stadium.accentColor);

  // ── Materials ───────────────────────────────────────────────────────────────
  const matConcrete = new THREE.MeshLambertMaterial({ color: 0xd0ccc4 });
  const matPitch    = new THREE.MeshLambertMaterial({ color: 0x2a7d2a });
  const matLines    = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const matSeat     = new THREE.MeshLambertMaterial({ color: primary });
  const matSeatAlt  = new THREE.MeshLambertMaterial({ color: accent });
  const matRoof     = new THREE.MeshLambertMaterial({ color: 0xdddddd, transparent: true, opacity: hasDome ? 0.55 : 1 });
  const matSteel    = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.6, roughness: 0.2 });
  const matLight    = new THREE.MeshBasicMaterial({ color: nightMode ? 0xffffee : 0xdddddd });
  const matGround   = new THREE.MeshLambertMaterial({ color: 0x111316 });
  const matPlaque   = new THREE.MeshLambertMaterial({ color: 0xc8a84b });

  // ── Ground platform ─────────────────────────────────────────────────────────
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(isOval ? 4.8 : 5.2, isOval ? 5.0 : 5.4, 0.28, isOval ? 48 : 4),
    matGround
  );
  if (!isOval) platform.rotation.y = Math.PI / 4;
  root.add(platform);

  // Nameplate
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.08), matPlaque);
  plaque.position.set(0, 0.14, isOval ? 4.8 : 5.0);
  root.add(plaque);

  // ── Pitch ───────────────────────────────────────────────────────────────────
  const pitchW = isOval ? 3.2 : 3.6;
  const pitchD = isOval ? 4.8 : 5.0;

  const pitch = new THREE.Mesh(
    isOval
      ? new THREE.CylinderGeometry(pitchD / 2, pitchD / 2, 0.06, 48)
      : new THREE.BoxGeometry(pitchW, 0.06, pitchD),
    matPitch
  );
  if (isOval) pitch.scale.set(pitchW / pitchD, 1, 1);
  pitch.position.y = 0.17;
  root.add(pitch);

  // Pitch lines (simplified)
  const lineY = 0.21;
  const addLine = (w: number, d: number, x = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), matLines);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, lineY, z);
    root.add(m);
  };
  addLine(isOval ? pitchW * 0.92 : pitchW - 0.12, 0.018);               // halfway
  addLine(0.018, isOval ? pitchD * 0.88 : pitchD - 0.12);               // center vertical
  // center circle
  const circlePts: THREE.Vector2[] = [];
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    circlePts.push(new THREE.Vector2(Math.cos(a) * 0.55, Math.sin(a) * 0.55));
  }
  // corner arcs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const arc = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.20, 8, 1, 0, Math.PI / 2),
      matLines
    );
    arc.rotation.x = -Math.PI / 2;
    arc.rotation.z = Math.atan2(sz, sx) - Math.PI / 4;
    arc.position.set(sx * (isOval ? pitchW / 2 - 0.05 : pitchW / 2 - 0.06), lineY, sz * (isOval ? pitchD / 2 - 0.05 : pitchD / 2 - 0.06));
    root.add(arc);
  }
  // circle ring
  const ccRing = new THREE.Mesh(new THREE.RingGeometry(0.53, 0.57, 48), matLines);
  ccRing.rotation.x = -Math.PI / 2;
  ccRing.position.y = lineY;
  root.add(ccRing);

  // ── Bowl / stands using LatheGeometry ──────────────────────────────────────
  // Profile: bottom-inside → rises outward and upward per tier
  const buildBowl = (tierIdx: number) => {
    const outerR = (isOval ? 2.2 : 2.4) + tierIdx * 0.9;
    const innerR = (isOval ? 1.6 : 1.8) + tierIdx * 0.9;
    const baseY  = 0.20;
    const topY   = baseY + 0.55 + tierIdx * 0.10;

    // Lathe profile (cross-section)
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(innerR,  baseY),
      new THREE.Vector2(innerR + 0.08, baseY + 0.12),
      new THREE.Vector2(innerR + 0.35, baseY + 0.35),
      new THREE.Vector2(outerR - 0.08, topY - 0.1),
      new THREE.Vector2(outerR,        topY),
      new THREE.Vector2(outerR,        baseY - 0.02),
      new THREE.Vector2(innerR,        baseY),
    ];

    const segments = isOval ? 48 : 4;
    const geo = new THREE.LatheGeometry(pts, segments);
    if (!isOval) geo.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 4));

    // Squish to oval
    if (isOval) geo.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 1.38));

    const mat = tierIdx % 2 === 0 ? matSeat : matSeatAlt;
    const bowl = new THREE.Mesh(geo, mat);
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    root.add(bowl);

    // Concrete fascia (bottom lip)
    const fascia = new THREE.Mesh(
      new THREE.TorusGeometry(
        (innerR + outerR) / 2,
        0.06,
        6,
        segments
      ),
      matConcrete
    );
    if (isOval) fascia.scale.set(1, 1, 1.38);
    if (!isOval) fascia.rotation.y = Math.PI / 4;
    fascia.position.y = baseY + 0.06;
    root.add(fascia);

    return { outerR, topY };
  };

  let lastTier = { outerR: 0, topY: 0 };
  for (let t = 0; t < tierCount; t++) {
    lastTier = buildBowl(t);
  }

  // ── Roof structure ──────────────────────────────────────────────────────────
  const roofR = lastTier.outerR + 0.15;
  const roofY = lastTier.topY + 0.35;

  if (hasDome) {
    // Dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(roofR * 1.05, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.45),
      new THREE.MeshLambertMaterial({ color: accent, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    if (isOval) dome.scale.set(1, 0.42, 1.38);
    dome.position.y = roofY - roofR * 0.35;
    root.add(dome);
  } else {
    // Cantilevered ring roof
    const roofPts: THREE.Vector2[] = [
      new THREE.Vector2(roofR - 1.0, roofY),
      new THREE.Vector2(roofR,       roofY - 0.08),
      new THREE.Vector2(roofR,       roofY - 0.22),
      new THREE.Vector2(roofR - 0.08, roofY - 0.22),
      new THREE.Vector2(roofR - 0.08, roofY - 0.10),
      new THREE.Vector2(roofR - 1.0, roofY - 0.10),
    ];
    const roofSeg = isOval ? 48 : 4;
    const roofGeo = new THREE.LatheGeometry(roofPts, roofSeg);
    if (isOval) roofGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 1.38));
    if (!isOval) roofGeo.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 4));
    const roof = new THREE.Mesh(roofGeo, matRoof);
    roof.castShadow = true;
    root.add(roof);

    // Roof support columns
    const cols = isOval ? 12 : 4;
    for (let c = 0; c < cols; c++) {
      const a = (c / cols) * Math.PI * 2 + (isOval ? 0 : Math.PI / 4);
      const cx = Math.cos(a) * (roofR - 0.04);
      const cz = Math.sin(a) * (roofR - 0.04) * (isOval ? 1.38 : 1);
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, roofY - 0.18, 6),
        matSteel
      );
      col.position.set(cx, (roofY - 0.18) / 2 + 0.18, cz);
      root.add(col);
    }
  }

  // ── Light towers (night mode) ────────────────────────────────────────────────
  if (nightMode || true) { // always show towers
    const towerPositions = isOval
      ? [[roofR - 0.3, 0], [-(roofR - 0.3), 0], [0, (roofR - 0.3) * 1.38], [0, -(roofR - 0.3) * 1.38]]
      : [[roofR * 0.7, roofR * 0.7 * 1], [-(roofR * 0.7), roofR * 0.7], [roofR * 0.7, -(roofR * 0.7)], [-(roofR * 0.7), -(roofR * 0.7)]];

    for (const [tx, tz] of towerPositions) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, roofY + 0.6, 6), matSteel);
      pole.position.set(tx, (roofY + 0.6) / 2, tz);
      root.add(pole);

      // Light array at top
      for (let li = -1; li <= 1; li++) {
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), matLight);
        bulb.position.set(tx + li * 0.12, roofY + 0.55, tz);
        root.add(bulb);
      }

      if (nightMode) {
        const lgt = new THREE.PointLight(0xffffcc, 0.8, 5);
        lgt.position.set(tx, roofY + 0.55, tz);
        root.add(lgt);
      }
    }
  }

  // ── Scoreboard structures (2 ends) ──────────────────────────────────────────
  for (const side of [-1, 1]) {
    const endZ = side * (isOval ? lastTier.outerR * 1.38 - 0.2 : lastTier.outerR - 0.2);
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.06), matConcrete);
    board.position.set(0, lastTier.topY - 0.15, endZ);
    root.add(board);
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.37, 0.02),
      new THREE.MeshBasicMaterial({ color: nightMode ? 0x0a2040 : 0x111111 })
    );
    screen.position.set(0, lastTier.topY - 0.15, endZ + side * 0.04);
    root.add(screen);
  }

  // Scale to fit nicely in the view
  root.scale.setScalar(0.62);
  return root;
}

// ─── React Component ─────────────────────────────────────────────────────────
const RealisticStadium3D: React.FC<RealisticStadium3DProps> = ({
  stadium,
  currentTime = new Date(),
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef      = useRef({ active: false, prevX: 0, prevY: 0, rotY: Math.PI * 0.22, rotX: 0.26 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W = container.clientWidth  || 320;
    const H = container.clientHeight || 280;
    const hour = currentTime.getHours();
    const sky  = getSky(hour);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sky.bg);
    scene.fog = new THREE.Fog(sky.bg, 12, 22);

    // Camera
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 60);
    camera.position.set(0, 5, 9);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, sky.ai));
    const sun = new THREE.DirectionalLight(sky.sun, sky.si);
    sun.position.copy(sky.sunPos);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512);
    scene.add(sun);

    if (hour < 7 || hour >= 19) {
      // night fill lights
      const f1 = new THREE.PointLight(0x3355ff, 0.5, 8); f1.position.set(-3, 3, 0); scene.add(f1);
      const f2 = new THREE.PointLight(0x5533ff, 0.4, 8); f2.position.set(3, 3, 0);  scene.add(f2);
    }

    // Stadium
    const model = buildStadium(stadium, hour);
    model.rotation.x = dragRef.current.rotX;
    model.rotation.y = dragRef.current.rotY;
    scene.add(model);

    // ── Pointer drag to orbit ──────────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      if (!interactive) return;
      dragRef.current.active = true;
      dragRef.current.prevX  = e.clientX;
      dragRef.current.prevY  = e.clientY;
      container.setPointerCapture(e.pointerId);
      container.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.rotY += (e.clientX - dragRef.current.prevX) * 0.012;
      dragRef.current.rotX += (e.clientY - dragRef.current.prevY) * 0.008;
      dragRef.current.rotX  = Math.max(-0.1, Math.min(0.9, dragRef.current.rotX));
      dragRef.current.prevX  = e.clientX;
      dragRef.current.prevY  = e.clientY;
      model.rotation.y = dragRef.current.rotY;
      model.rotation.x = dragRef.current.rotX;
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current.active = false;
      container.releasePointerCapture(e.pointerId);
      container.style.cursor = interactive ? 'grab' : 'default';
    };

    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup',   onUp);

    // ── Animation loop ─────────────────────────────────────────────────────────
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!dragRef.current.active) {
        dragRef.current.rotY += 0.003;
        model.rotation.y = dragRef.current.rotY;
      }
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup',   onUp);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [stadium.id, currentTime.getHours(), interactive]);

  return (
    <div
      ref={containerRef}
      style={{
        width:      '100%',
        height:     '100%',
        cursor:     interactive ? 'grab' : 'default',
        touchAction:'none',
        borderRadius: 12,
        overflow:   'hidden',
      }}
    />
  );
};

export default RealisticStadium3D;
