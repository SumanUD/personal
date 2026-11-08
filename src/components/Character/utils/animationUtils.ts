import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { eyebrowBoneNames, typingBoneNames } from "../../../data/boneData";

const setAnimations = (gltf: GLTF) => {
  let character = gltf.scene;
  let mixer = new THREE.AnimationMixer(character);
  if (gltf.animations) {
    const introClip = gltf.animations.find(
      (clip) => clip.name === "introAnimation"
    );
    const introAction = mixer.clipAction(introClip!);
    introAction.setLoop(THREE.LoopOnce, 1);
    introAction.clampWhenFinished = true;
    introAction.play();
    const clipNames = ["key1", "key2", "key5", "key6"];
    clipNames.forEach((name) => {
      const clip = THREE.AnimationClip.findByName(gltf.animations, name);
      if (clip) {
        const action = mixer?.clipAction(clip);
        action!.play();
        action!.timeScale = 1.2;
      } else {
        console.error(`Animation "${name}" not found`);
      }
    });
    let typingAction: THREE.AnimationAction | null = null;
    typingAction = createBoneAction(gltf, mixer, "typing", typingBoneNames);
    if (typingAction) {
      typingAction.enabled = true;
      typingAction.play();
      typingAction.timeScale = 1.2;
    }
  }
  function startIntro() {
    const introClip = gltf.animations.find(
      (clip) => clip.name === "introAnimation"
    );
    const introAction = mixer.clipAction(introClip!);
    introAction.clampWhenFinished = true;
    introAction.reset().play();
    setTimeout(() => {
      const blink = gltf.animations.find((clip) => clip.name === "Blink");
      mixer.clipAction(blink!).play().fadeIn(0.5);
    }, 2500);
  }
  function hover(gltf: GLTF, hoverDiv: HTMLDivElement) {
    let eyeBrowUpAction = createBoneAction(
      gltf,
      mixer,
      "browup",
      eyebrowBoneNames
    );
    let isHovering = false;
    if (eyeBrowUpAction) {
      eyeBrowUpAction.setLoop(THREE.LoopOnce, 1);
      eyeBrowUpAction.clampWhenFinished = true;
      eyeBrowUpAction.enabled = true;
    }
    const onHoverFace = () => {
      if (eyeBrowUpAction && !isHovering) {
        isHovering = true;
        eyeBrowUpAction.reset();
        eyeBrowUpAction.enabled = true;
        eyeBrowUpAction.setEffectiveWeight(4);
        eyeBrowUpAction.fadeIn(0.5).play();
      }
    };
    const onLeaveFace = () => {
      if (eyeBrowUpAction && isHovering) {
        isHovering = false;
        eyeBrowUpAction.fadeOut(0.6);
      }
    };
    if (!hoverDiv) return;
    hoverDiv.addEventListener("mouseenter", onHoverFace);
    hoverDiv.addEventListener("mouseleave", onLeaveFace);
    return () => {
      hoverDiv.removeEventListener("mouseenter", onHoverFace);
      hoverDiv.removeEventListener("mouseleave", onLeaveFace);
    };
  }
  // Quick facial reactions used when the visitor taps / clicks the character
  const browFlash = createBoneAction(gltf, mixer, "browup", eyebrowBoneNames);
  if (browFlash) {
    browFlash.setLoop(THREE.LoopOnce, 1);
    browFlash.clampWhenFinished = true;
  }
  const angryBrows = createBoneAction(gltf, mixer, "angry", eyebrowBoneNames);
  if (angryBrows) {
    angryBrows.setLoop(THREE.LoopOnce, 1);
    angryBrows.clampWhenFinished = true;
  }
  let reactionTimer: ReturnType<typeof setTimeout> | undefined;
  function react(kind: "surprised" | "angry") {
    const action = kind === "angry" ? angryBrows : browFlash;
    const other = kind === "angry" ? browFlash : angryBrows;
    if (!action) return;
    other?.fadeOut(0.2);
    action.reset();
    action.enabled = true;
    action.setEffectiveWeight(kind === "angry" ? 2 : 4);
    action.fadeIn(0.25).play();
    clearTimeout(reactionTimer);
    reactionTimer = setTimeout(() => action.fadeOut(0.6), kind === "angry" ? 2200 : 1100);
  }

  return { mixer, startIntro, hover, react };
};

const createBoneAction = (
  gltf: GLTF,
  mixer: THREE.AnimationMixer,
  clip: string,
  boneNames: string[]
): THREE.AnimationAction | null => {
  const AnimationClip = THREE.AnimationClip.findByName(gltf.animations, clip);
  if (!AnimationClip) {
    console.error(`Animation "${clip}" not found in GLTF file.`);
    return null;
  }

  const filteredClip = filterAnimationTracks(AnimationClip, boneNames);

  return mixer.clipAction(filteredClip);
};

const filterAnimationTracks = (
  clip: THREE.AnimationClip,
  boneNames: string[]
): THREE.AnimationClip => {
  const filteredTracks = clip.tracks.filter((track) =>
    boneNames.some((boneName) => track.name.includes(boneName))
  );

  return new THREE.AnimationClip(
    clip.name + "_filtered",
    clip.duration,
    filteredTracks
  );
};

export default setAnimations;
