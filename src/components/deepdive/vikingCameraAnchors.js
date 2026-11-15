import * as THREE from "three";

const _target = new THREE.Vector3();
const _position = new THREE.Vector3();
const _size = new THREE.Vector3();

/** Preset views around the normalized Viking lander GLB. */
const VIEWS = {
  fullLander: { distMul: 2.35, elev: 0.32, azim: 0.62, targetBias: 0.4 },
  fullLanderHigh: { distMul: 2.1, elev: 0.52, azim: 0.4, targetBias: 0.48 },
  fullLanderWide: { distMul: 2.75, elev: 0.28, azim: 1.05, targetBias: 0.44 },
  fullLanderLow: { distMul: 2.4, elev: 0.14, azim: 0.75, targetBias: 0.28 },
  deck: { distMul: 1.25, elev: 0.58, azim: -0.35, targetBias: 0.55 },
  arm: { distMul: 1.3, elev: 0.22, azim: 0.95, targetBias: 0.35 },
  legs: { distMul: 1.45, elev: 0.1, azim: 0.55, targetBias: 0.18 },
  instruments: { distMul: 1.2, elev: 0.42, azim: 1.25, targetBias: 0.5 },
};

export function cameraFrameForVikingAnchor(root, anchorKey = "fullLander") {
  if (!root) return null;
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return null;

  const view = VIEWS[anchorKey] ?? VIEWS.fullLander;
  const center = box.getCenter(_target);
  box.getSize(_size);
  const span = Math.max(_size.x, _size.y, _size.z, 0.08);
  const dist = span * view.distMul;

  _target.copy(center);
  _target.y = box.min.y + _size.y * view.targetBias;

  _position.set(
    _target.x + Math.cos(view.azim) * dist,
    _target.y + view.elev * dist,
    _target.z + Math.sin(view.azim) * dist
  );

  return {
    position: _position.toArray(),
    target: _target.toArray(),
    fov: anchorKey === "fullLanderWide" ? 48 : anchorKey.startsWith("full") ? 42 : 38,
  };
}