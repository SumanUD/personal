import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import setAnimations from "./utils/animationUtils";
import { createExtras, Extras } from "./utils/extras";
import { setProgress } from "../Loading";

const MESSAGES = [
  "Hi, I'm Suman! 👋",
  "Need a Shopify store that sells? 🛍️",
  "Custom Shopify apps & themes ⚙️",
  "I build web apps & SaaS ⚡",
  "AI that saves you hours 🤖",
  "I built my own HRMS 💼",
  "Let's build something together 🚀",
];
const ANGRY_MESSAGE = "Hey! Easy on the pokes 😤";
const SPARKS = ["✨", "💜", "⚡", "✦", "🚀", "✨"];

const isTouchDevice = () =>
  window.matchMedia("(hover: none)").matches || navigator.maxTouchPoints > 0;

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!canvasDiv.current) return;
    const container = canvasDiv.current;
    const isMobile = window.innerWidth <= 1024;
    const touch = isTouchDevice();
    const scene = new THREE.Scene();

    const rect = container.getBoundingClientRect();
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: "high-performance",
    });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(14.5, rect.width / rect.height, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = isMobile ? 0.82 : 1.1;
    camera.updateProjectionMatrix();

    let headBone: THREE.Object3D | null = null;
    let screenLight: any = null;
    let mixer: THREE.AnimationMixer | undefined;
    let character: THREE.Object3D | null = null;
    let extras: Extras | null = null;
    let react: ((k: "surprised" | "angry") => void) | null = null;
    let ready = false;
    let disposed = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    const clock = new THREE.Clock();
    const light = setLighting(scene);
    const progress = setProgress((value) => setLoading(value));
    const { loadCharacter } = setCharacter(renderer, scene, camera);

    // ── Pointer / touch / gyro state ──────────────────────────
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let lastInput = 0; // ms timestamp of last real input
    let gyroActive = false;
    const offset = { x: 0, y: 0 }; // additive head offsets for nods / shakes
    const head = { x: 0, y: 0 };

    const setTarget = (x: number, y: number) => {
      target.x = THREE.MathUtils.clamp(x, -1, 1);
      target.y = THREE.MathUtils.clamp(y, -1, 1);
      lastInput = performance.now();
    };

    const onMouseMove = (e: MouseEvent) =>
      setTarget((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setTarget((t.clientX / window.innerWidth) * 2 - 1, -(t.clientY / window.innerHeight) * 2 + 1);
    };
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      // touch input wins for 2s after the finger lifts
      if (performance.now() - lastInput < 2000 && !gyroActive) return;
      gyroActive = true;
      target.x = THREE.MathUtils.clamp(e.gamma / 25, -1, 1);
      target.y = THREE.MathUtils.clamp((50 - e.beta) / 30, -1, 1);
      lastInput = performance.now();
    };

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    landingDiv?.addEventListener("touchstart", onTouch, { passive: true });
    landingDiv?.addEventListener("touchmove", onTouch, { passive: true });
    if (touch) window.addEventListener("deviceorientation", onOrientation);

    // ── Speech bubble ────────────────────────────────────────
    let msgIndex = 0;
    let bubbleTimer: ReturnType<typeof setTimeout> | undefined;
    const headScreen = new THREE.Vector3();
    const showBubble = (text: string, ms = 2600) => {
      const el = bubbleRef.current;
      if (!el) return;
      el.textContent = text;
      el.classList.remove("is-visible");
      void el.offsetWidth; // restart CSS animation
      el.classList.add("is-visible");
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => el.classList.remove("is-visible"), ms);
    };
    const positionBubble = () => {
      const el = bubbleRef.current;
      if (!el || !headBone || !el.classList.contains("is-visible")) return;
      headBone.getWorldPosition(headScreen);
      headScreen.project(camera);
      const r = container.getBoundingClientRect();
      const x = ((headScreen.x + 1) / 2) * r.width;
      const y = ((1 - headScreen.y) / 2) * r.height;
      el.style.transform = isMobile
        ? `translate(${Math.min(x + r.width * 0.12, r.width - el.offsetWidth - 12)}px, ${y - r.height * 0.33}px) translate(0, -100%)`
        : `translate(${x + r.height * 0.2}px, ${y - r.height * 0.36}px) translate(0, -100%)`;
    };

    // ── Tap / click reactions ────────────────────────────────
    let taps: number[] = [];
    const spawnSparks = (cx: number, cy: number) => {
      const host = sparksRef.current;
      if (!host) return;
      const r = host.getBoundingClientRect();
      for (let i = 0; i < 10; i++) {
        const s = document.createElement("span");
        s.className = "char-spark";
        s.textContent = SPARKS[i % SPARKS.length];
        const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
        const dist = 50 + Math.random() * 60;
        s.style.left = `${cx - r.left}px`;
        s.style.top = `${cy - r.top}px`;
        s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
        s.style.setProperty("--dy", `${Math.sin(angle) * dist - 30}px`);
        host.appendChild(s);
        setTimeout(() => s.remove(), 1000);
      }
    };

    const isOnCharacter = (clientX: number, clientY: number) => {
      if (!headBone) return false;
      const r = container.getBoundingClientRect();
      headBone.getWorldPosition(headScreen);
      headScreen.project(camera);
      const hx = r.left + ((headScreen.x + 1) / 2) * r.width;
      const hy = r.top + ((1 - headScreen.y) / 2) * r.height;
      const dx = Math.abs(clientX - hx);
      const dy = clientY - hy;
      return dx < r.height * 0.24 && dy > -r.height * 0.5 && dy < r.height * 0.3;
    };

    let askedGyro = false;
    const onClick = (e: MouseEvent) => {
      if (!ready || window.scrollY > 200) return;
      if ((e.target as HTMLElement)?.closest("a, button, input, textarea, select, form")) return;
      if (!isOnCharacter(e.clientX, e.clientY)) return;

      // iOS needs a user gesture before it will share motion data
      const DOE = window.DeviceOrientationEvent as any;
      if (touch && !askedGyro && DOE && typeof DOE.requestPermission === "function") {
        askedGyro = true;
        DOE.requestPermission().catch(() => {});
      }

      const now = performance.now();
      taps = taps.filter((t) => now - t < 2500);
      taps.push(now);
      spawnSparks(e.clientX, e.clientY);
      extras?.burst();

      if (taps.length >= 5) {
        taps = [];
        react?.("angry");
        showBubble(ANGRY_MESSAGE, 2400);
        gsap.fromTo(offset, { y: 0 }, { y: 0.22, duration: 0.07, yoyo: true, repeat: 7, ease: "sine.inOut", onComplete: () => { offset.y = 0; } });
        return;
      }

      react?.("surprised");
      msgIndex = (msgIndex + 1) % MESSAGES.length;
      showBubble(MESSAGES[msgIndex]);
      if (msgIndex % 2) {
        gsap.fromTo(offset, { x: 0 }, { x: -0.28, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut", onComplete: () => { offset.x = 0; } });
      } else {
        gsap.fromTo(offset, { y: 0 }, { y: 0.3, duration: 0.14, yoyo: true, repeat: 3, ease: "sine.inOut", onComplete: () => { offset.y = 0; } });
      }
    };
    document.addEventListener("click", onClick);

    // ── Resize (ignore mobile URL-bar height jitter) ─────────
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (!character) return;
      if (isMobile && window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      handleResize(renderer, camera, canvasDiv, character);
    };
    window.addEventListener("resize", onResize);

    // ── Load ─────────────────────────────────────────────────
    loadCharacter().then((gltf) => {
      if (!gltf || disposed) return;
      const animations = setAnimations(gltf);
      if (hoverDivRef.current && !touch) animations.hover(gltf, hoverDivRef.current);
      mixer = animations.mixer;
      react = animations.react;
      character = gltf.scene;
      scene.add(character);
      headBone = character.getObjectByName("spine006") || null;
      screenLight = character.getObjectByName("screenlight") || null;

      character.updateMatrixWorld(true);
      const headPos = new THREE.Vector3();
      headBone?.getWorldPosition(headPos);
      const dist = camera.position.distanceTo(headPos);
      const viewH = (2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / camera.zoom;
      extras = createExtras(scene, headPos, { isMobile, viewH, viewW: viewH * camera.aspect });

      progress.loaded().then(() => {
        // desktop waits for the loading screen to finish; mobile has none
        later(() => {
          light.turnOnLights();
          animations.startIntro();
          later(() => {
            ready = true;
            extras?.show();
          }, 1200);
          later(() => showBubble(touch ? "Hi! Tap me 👆" : MESSAGES[0], 3200), 2400);
        }, window.innerWidth <= 768 ? 150 : 2500);
      });
    });

    // ── Render loop ──────────────────────────────────────────
    let frame = 0;
    const maxRot = Math.PI / 6;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const t = clock.elapsedTime;
      const inHero = window.scrollY < 200;

      // idle "look around" on touch devices when nobody is interacting
      const idle = touch && performance.now() - lastInput > 3500;
      if (idle) {
        gyroActive = false;
        mouse.x = THREE.MathUtils.lerp(mouse.x, Math.sin(t * 0.45) * 0.7, 0.03);
        mouse.y = THREE.MathUtils.lerp(mouse.y, Math.sin(t * 0.7) * 0.25 + 0.05, 0.03);
      } else {
        mouse.x = THREE.MathUtils.lerp(mouse.x, target.x, 0.25);
        mouse.y = THREE.MathUtils.lerp(mouse.y, target.y, 0.25);
      }

      if (headBone) {
        if (inHero) {
          head.y = THREE.MathUtils.lerp(head.y, mouse.x * maxRot, 0.2);
          const ty = THREE.MathUtils.clamp(mouse.y, -0.3, 0.4);
          head.x = THREE.MathUtils.lerp(head.x, -ty - 0.5 * maxRot, 0.1);
        } else if (!isMobile) {
          head.x = THREE.MathUtils.lerp(head.x, -0.4, 0.03);
          head.y = THREE.MathUtils.lerp(head.y, -0.3, 0.03);
        }
        headBone.rotation.x = head.x + offset.y;
        headBone.rotation.y = head.y + offset.x;
        if (screenLight) light.setPointLight(screenLight);
      }

      // subtle camera parallax in the hero (x only; GSAP owns y/z on scroll)
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, inHero ? mouse.x * 0.25 : 0, 0.05);

      const fade = THREE.MathUtils.clamp(1 - window.scrollY / (window.innerHeight * 0.5), 0, 1);
      extras?.update(delta, t, mouse, fade);
      if (!inHero) bubbleRef.current?.classList.remove("is-visible");
      positionBubble();

      mixer?.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      clearTimeout(bubbleTimer);
      progress.clear();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("click", onClick);
      landingDiv?.removeEventListener("touchstart", onTouch);
      landingDiv?.removeEventListener("touchmove", onTouch);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("resize", onResize);
      extras?.dispose();
      scene.clear();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="character-container">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
        <div className="character-hover" ref={hoverDivRef}></div>
        <div className="character-bubble" ref={bubbleRef} aria-live="polite"></div>
        <div className="character-sparks" ref={sparksRef}></div>
      </div>
    </div>
  );
};

export default Scene;
