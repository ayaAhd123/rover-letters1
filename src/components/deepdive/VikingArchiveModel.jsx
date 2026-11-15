"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export const VIKING_MODEL_URL = "/models/viking-lander.glb";

function prepareScene(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = false;
    obj.receiveShadow = true;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach((mat) => {
      if (!mat) return;

      if (mat.map) {
        mat.map.colorSpace = THREE.SRGBColorSpace;
        mat.map.needsUpdate = true;
        if (mat.color) mat.color.setRGB(1, 1, 1);
      } else if (mat.color && (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial)) {
        const hex = mat.color.getHex();
        if (hex < 0x252525) mat.color.setHex(0xb8b0a8);
      }

      if (mat.emissive) mat.emissive.setHex(0x000000);
      if ("emissiveIntensity" in mat) mat.emissiveIntensity = 0;

      if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
        mat.metalness = 0;
        mat.roughness = 0.82;
        if ("envMapIntensity" in mat) mat.envMapIntensity = 0.55;
        if ("transmission" in mat) mat.transmission = 0;
        if ("clearcoat" in mat) mat.clearcoat = 0;
      }

      mat.needsUpdate = true;
    });
  });
}

export default function VikingArchiveModel({ groundY = 0, onReady }) {
  const { scene } = useGLTF(VIKING_MODEL_URL);
  const readySent = useRef(false);

  const fitted = useMemo(() => {
    const clone = scene.clone(true);
    prepareScene(clone);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray(), 0.001);
    const scale = 2.15 / maxDim;
    clone.position.sub(center);
    clone.scale.setScalar(scale);
    clone.updateMatrixWorld(true);
    const grounded = new THREE.Box3().setFromObject(clone);
    clone.position.y += groundY - grounded.min.y;
    return clone;
  }, [scene, groundY]);

  useEffect(() => {
    readySent.current = false;
  }, []);

  useEffect(() => {
    if (readySent.current) return;
    const box = new THREE.Box3().setFromObject(fitted);
    if (box.isEmpty()) return;
    readySent.current = true;
    onReady?.(fitted);
  }, [fitted, onReady]);

  return (
    <group>
      <primitive object={fitted} />
    </group>
  );
}