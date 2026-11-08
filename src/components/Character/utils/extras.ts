import * as THREE from "three";

const ACCENT = "#c2a4ff";

/** Soft round sprite used for the particle field. */
function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(214,190,255,0.7)");
  g.addColorStop(1, "rgba(194,164,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A glassy pill with a coloured dot and a label, drawn to a canvas. */
function makeBadgeTexture(label: string, dot: string) {
  const scale = 2;
  const font = `600 ${30 * scale}px Geist, system-ui, sans-serif`;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = font;
  const textW = ctx.measureText(label).width;
  const h = 64 * scale;
  const padX = 26 * scale;
  const dotR = 9 * scale;
  const w = Math.ceil(padX * 2 + dotR * 2 + 14 * scale + textW);
  c.width = w;
  c.height = h;
  ctx.font = font;

  const r = h / 2 - 3 * scale;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(3 * scale, 3 * scale, w - 6 * scale, h - 6 * scale, r);
  else ctx.rect(3 * scale, 3 * scale, w - 6 * scale, h - 6 * scale);
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "rgba(40,26,58,0.92)");
  bg.addColorStop(1, "rgba(18,12,24,0.92)");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 2.5 * scale;
  ctx.strokeStyle = "rgba(194,164,255,0.65)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(padX + dotR, h / 2, dotR, 0, Math.PI * 2);
  ctx.fillStyle = dot;
  ctx.shadowColor = dot;
  ctx.shadowBlur = 14 * scale;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#f3eefb";
  ctx.textBaseline = "middle";
  ctx.fillText(label, padX + dotR * 2 + 14 * scale, h / 2 + 2 * scale);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: w / h };
}

export type Extras = ReturnType<typeof createExtras>;

/**
 * Orbiting skill badges + drifting particle field around the character.
 * `head` is the world-space position of the character's head.
 */
export function createExtras(
  scene: THREE.Scene,
  head: THREE.Vector3,
  opts: { isMobile: boolean; viewH: number; viewW: number }
) {
  // viewH / viewW = visible world height / width at the head's depth,
  // so everything scales with how big the character appears on screen.
  const { viewH, viewW } = opts;
  const group = new THREE.Group();
  scene.add(group);

  // ── Particles ────────────────────────────────────────────
  const count = opts.isMobile ? 140 : 260;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const yMin = head.y - viewH * 0.6;
  const yMax = head.y + viewH * 0.9;
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * viewW * 1.4;
    positions[i * 3 + 1] = yMin + Math.random() * (yMax - yMin);
    positions[i * 3 + 2] = -1.5 - Math.random() * 6;
    speeds[i] = (0.02 + Math.random() * 0.05) * viewH;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    size: viewH * (opts.isMobile ? 0.03 : 0.022),
    map: makeDotTexture(),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: new THREE.Color(ACCENT),
  });
  const points = new THREE.Points(pGeo, pMat);
  group.add(points);

  // ── Orbiting badges ──────────────────────────────────────
  const labels: [string, string][] = [
    ["Shopify", "#95bf47"],
    ["React", "#61dafb"],
    ["AI / ML", "#ff7ad9"],
    ["Node.js", "#68a063"],
    ["Python", "#ffd43b"],
    ["Next.js", "#ffffff"],
    ["Liquid", "#7ab55c"],
    ["TypeScript", "#3178c6"],
  ];
  // `head` is the neck joint; orbit around the middle of the face
  // ring around the neck / shoulders: in front over the chest, behind the head
  const center = new THREE.Vector3(head.x, head.y + viewH * 0.04, head.z);
  const radiusX = Math.min(viewH * 0.3, viewW * 0.3);
  const radiusZ = viewH * 0.62; // deep enough to pass in front of the chest
  const badgeH = viewH * (opts.isMobile ? 0.042 : 0.06);
  const badges = labels.map(([label, dot], i) => {
    const { tex, aspect } = makeBadgeTexture(label, dot);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      // The model has invisible (opacity 0) planes that still write depth, so
      // badges skip depth testing and instead fade out as they pass behind.
      depthTest: false,
      opacity: 0,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(badgeH * aspect, badgeH, 1);
    sprite.renderOrder = 2;
    group.add(sprite);
    return {
      sprite,
      base: new THREE.Vector2(badgeH * aspect, badgeH),
      angle: (i / labels.length) * Math.PI * 2,
      bob: Math.random() * Math.PI * 2,
      pop: 0, // 0 → hidden, 1 → visible (animated in `show`)
    };
  });

  let shown = false;
  let showTime = 0;
  let spin = 0; // extra spin impulse (e.g. on tap)

  function show() {
    shown = true;
    showTime = performance.now();
  }

  function burst() {
    spin = 2.2;
  }

  /**
   * @param dt     seconds since last frame
   * @param t      elapsed seconds
   * @param mouse  normalised pointer (-1..1)
   * @param fade   0..1 overall visibility (fades out on scroll)
   */
  function update(dt: number, t: number, mouse: { x: number; y: number }, fade: number) {
    // particles drift upward and wrap
    const arr = pGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(t * 0.6 + i) * viewH * 0.0003;
      if (arr[i * 3 + 1] > yMax) arr[i * 3 + 1] = yMin;
    }
    pGeo.attributes.position.needsUpdate = true;
    points.position.x = THREE.MathUtils.lerp(points.position.x, mouse.x * viewH * 0.05, 0.04);
    points.position.y = THREE.MathUtils.lerp(points.position.y, mouse.y * viewH * 0.03, 0.04);
    pMat.opacity = THREE.MathUtils.lerp(pMat.opacity, shown ? 0.85 * Math.max(fade, 0.35) : 0, 0.05);

    // badges orbit on a tilted ellipse
    spin = THREE.MathUtils.lerp(spin, 0, 0.03);
    const orbitSpeed = 0.28 + spin;
    const tilt = -0.25 + mouse.y * 0.06;
    badges.forEach((b, i) => {
      b.angle += orbitSpeed * dt;
      const sinceShow = shown ? (performance.now() - showTime) / 1000 - i * 0.12 : -1;
      const target = sinceShow > 0 ? 1 : 0;
      b.pop = THREE.MathUtils.lerp(b.pop, target, 0.08);
      const x = Math.cos(b.angle) * radiusX;
      const z = Math.sin(b.angle) * radiusZ;
      const y = Math.sin(b.angle) * tilt * radiusX + Math.sin(t * 1.4 + b.bob) * viewH * 0.008;
      b.sprite.position.set(center.x + x + mouse.x * viewH * 0.02, center.y + y, center.z + z);
      // badges at the back are smaller & dimmer for depth
      const depth = (z / radiusZ + 1) / 2; // 0 back → 1 front
      const s = b.pop * (0.78 + depth * 0.32);
      b.sprite.scale.set(b.base.x * s, b.base.y * s, 1);
      const front = THREE.MathUtils.smoothstep(depth, 0.32, 0.58);
      (b.sprite.material as THREE.SpriteMaterial).opacity = b.pop * fade * front;
    });
    group.visible = fade > 0.01 || pMat.opacity > 0.01;
  }

  function dispose() {
    scene.remove(group);
    pGeo.dispose();
    pMat.map?.dispose();
    pMat.dispose();
    badges.forEach((b) => {
      (b.sprite.material as THREE.SpriteMaterial).map?.dispose();
      b.sprite.material.dispose();
    });
  }

  return { update, show, burst, dispose };
}
