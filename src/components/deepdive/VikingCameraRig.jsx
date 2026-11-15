"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import sections from "@/data/vikingDeepDive";
import { cameraFrameForVikingAnchor } from "./vikingCameraAnchors";

const DEFAULT_POS = [0, 0.5, 4.1];
const DEFAULT_TARGET = [0, 0.32, 0];
const DEFAULT_FOV = 42;

export default function VikingCameraRig({
  landerRoot,
  activeSectionId,
  syncKey,
  reducedMotion,
  userCameraActive,
  modelReady,
}) {
  const camera = useThree((s) => s.camera);
  const goalPos = useRef(new THREE.Vector3(...DEFAULT_POS));
  const goalTarget = useRef(new THREE.Vector3(...DEFAULT_TARGET));
  const goalFov = useRef(DEFAULT_FOV);
  const lookAt = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useEffect(() => {
    if (!modelReady) return;
    if (userCameraActive || !landerRoot) {
      goalPos.current.set(...DEFAULT_POS);
      goalTarget.current.set(...DEFAULT_TARGET);
      goalFov.current = DEFAULT_FOV;
      return;
    }

    const section = sections.find((s) => s.id === activeSectionId);
    const anchor = section?.cameraTarget ?? "fullLander";
    landerRoot.updateMatrixWorld(true);
    const frame = cameraFrameForVikingAnchor(landerRoot, anchor);
    if (!frame) return;

    goalPos.current.fromArray(frame.position);
    goalTarget.current.fromArray(frame.target);
    goalFov.current = frame.fov ?? DEFAULT_FOV;

    if (reducedMotion) {
      camera.position.copy(goalPos.current);
      camera.fov = goalFov.current;
      camera.updateProjectionMatrix();
      camera.lookAt(goalTarget.current);
      initialized.current = true;
    }
  }, [landerRoot, activeSectionId, syncKey, reducedMotion, userCameraActive, modelReady, camera]);

  useFrame((_, dt) => {
    if (!modelReady || userCameraActive) return;
    const section = sections.find((s) => s.id === activeSectionId);
    const anchor = section?.cameraTarget ?? "fullLander";
    landerRoot?.updateMatrixWorld(true);
    const frame = landerRoot ? cameraFrameForVikingAnchor(landerRoot, anchor) : null;
    if (frame) {
      goalPos.current.fromArray(frame.position);
      goalTarget.current.fromArray(frame.target);
      goalFov.current = frame.fov ?? DEFAULT_FOV;
    }

    const speed = reducedMotion ? 1 : 1 - Math.exp(-dt * 5.5);
    if (!initialized.current) {
      camera.position.copy(goalPos.current);
      lookAt.current.copy(goalTarget.current);
      camera.lookAt(lookAt.current);
      initialized.current = true;
      return;
    }
    camera.position.lerp(goalPos.current, speed);
    lookAt.current.lerp(goalTarget.current, speed);
    camera.lookAt(lookAt.current);
    if (Math.abs(camera.fov - goalFov.current) > 0.01) {
      camera.fov += (goalFov.current - camera.fov) * speed;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}