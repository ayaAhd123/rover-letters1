"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { useDeepDive } from "./DeepDiveContext";
import VikingArchiveModel, { VIKING_MODEL_URL } from "./VikingArchiveModel";
import VikingCameraRig from "./VikingCameraRig";
import ArchiveOrbitControls from "./ArchiveOrbitControls";
import SceneChrome from "./SceneChrome";

const NASA_BLUE = "#0B3D91";

export default function VikingDeepDiveScene() {
  const [landerRoot, setLanderRoot] = useState(null);
  const {
    activeSectionId,
    setNasaRoverReady,
    bumpCameraSync,
    nasaRoverReady,
    userCameraActive,
    reducedMotion,
    cameraSyncKey,
  } = useDeepDive();

  useEffect(() => {
    return () => {
      useGLTF.clear(VIKING_MODEL_URL);
    };
  }, []);

  const handleReady = useCallback(
    (root) => {
      setLanderRoot(root);
      setNasaRoverReady(true);
      bumpCameraSync();
    },
    [setNasaRoverReady, bumpCameraSync]
  );

  return (
    <div className="deep-dive-scene-wrap ring-stage touch-none" style={{ touchAction: "none" }}>
      {nasaRoverReady ? <SceneChrome /> : null}
      {nasaRoverReady ? (
        <p className="ring-caption viking-orbit-hint" aria-live="polite">
          Drag to turn the lander
          <small>Scroll the panel to change chapters</small>
        </p>
      ) : null}
      <Canvas
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.5, 4.1], fov: 42 }}
        className="h-full w-full"
      >
        <VikingCameraRig
          landerRoot={landerRoot}
          activeSectionId={activeSectionId}
          syncKey={cameraSyncKey}
          reducedMotion={reducedMotion}
          userCameraActive={userCameraActive}
          modelReady={nasaRoverReady}
        />
        <ArchiveOrbitControls />
        <ambientLight intensity={0.32} />
        <directionalLight position={[2, 6, 8]} intensity={1.15} color="#e8eef8" />
        <directionalLight position={[-6, 3, -4]} intensity={0.75} color={NASA_BLUE} />
        <directionalLight position={[0, -2, 4]} intensity={0.22} color="#6a7a9a" />
        <hemisphereLight args={["#d4e4ff", "#0c1224", 0.4]} />
        <Environment resolution={128} frames={1} environmentIntensity={0.32}>
          <Lightformer intensity={1.5} position={[0, 5, -4]} scale={[10, 10, 1]} color="#e8eef8" />
          <Lightformer
            intensity={0.95}
            position={[-5, 2, 3]}
            rotation-y={Math.PI / 2}
            scale={[8, 5, 1]}
            color="#6b8ec8"
          />
        </Environment>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <circleGeometry args={[3.5, 48]} />
          <meshStandardMaterial color="#10182c" roughness={0.92} metalness={0.12} />
        </mesh>
        <Suspense fallback={null}>
          <VikingArchiveModel groundY={0} onReady={handleReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}