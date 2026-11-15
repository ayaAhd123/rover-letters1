"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useDeepDive } from "./DeepDiveContext";

/** Drag to orbit the archive model; pauses scroll-synced camera until “Return to story view”. */
export default function ArchiveOrbitControls({ minDistance = 1.4, maxDistance = 7.5 }) {
  const controlsRef = useRef(null);
  const { setUserCameraActive, registerSceneApi, nasaRoverReady } = useDeepDive();

  useEffect(() => {
    registerSceneApi({ controlsRef });
  }, [registerSceneApi]);

  if (!nasaRoverReady) return null;

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={Math.PI * 0.88}
      onStart={() => setUserCameraActive(true)}
    />
  );
}