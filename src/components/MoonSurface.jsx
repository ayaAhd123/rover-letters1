
"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Stars, useTexture } from "@react-three/drei";

const PIT = { x: 0, z: -15, radius: 5.2, depth: 5.7 };

function hash(n) {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
}

function smoothstep(a, b, x) {
    const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
}

function terrainHeight(x, z) {
    const fine =
        Math.sin(x * 1.7 + z * 0.8) * 0.035 +
        Math.cos(z * 1.9 - x * 0.7) * 0.028;

    const medium =
        Math.sin(x * 0.19 + z * 0.11) * 0.22 +
        Math.cos(z * 0.16 - x * 0.13) * 0.18 +
        Math.sin((x - z) * 0.055) * 0.3;

    let h = medium + fine;

    // Small impact craters.
    for (let i = 0; i < 32; i++) {
        const cx = (hash(i * 7 + 1) - 0.5) * 180;
        const cz = -8 - hash(i * 7 + 2) * 180;
        const radius = 0.7 + hash(i * 7 + 3) * 2.8;
        const d = Math.hypot(x - cx, z - cz) / radius;

        if (d < 1.5) {
            h +=
                -0.22 * Math.exp(-d * d * 3) +
                0.09 * Math.exp(-(((d - 0.91) / 0.12) ** 2));
        }
    }

    // Main lunar pit.
    const dx = x - PIT.x;
    const dz = z - PIT.z;
    const d = Math.hypot(dx, dz);
    const angle = Math.atan2(dz, dx);

    const irregularRadius =
        d +
        0.22 * Math.sin(angle * 5) +
        0.13 * Math.sin(angle * 9 + 1.2);

    const wallT = smoothstep(1.8, PIT.radius, irregularRadius);
    const floor = -PIT.depth + fine * 1.5;
    const pitBlend = 1 - wallT;

    h = THREE.MathUtils.lerp(h, floor, pitBlend);

    // Uneven raised rim.
    const rimDistance = irregularRadius - 4.7;
    h += 0.62 * Math.exp(-(rimDistance * rimDistance) / 0.22);

    // Rocky wall details.
    const wallMask =
        smoothstep(1.8, 2.4, d) *
        (1 - smoothstep(4.4, 5.25, d));

    h += wallMask * (
        Math.sin(angle * 17 + d * 3) * 0.11 +
        Math.sin(angle * 29 - d * 5) * 0.055
    );

    return h;
}

function Terrain() {
    const source = useTexture("/textures/moon.jpg");

    // Clone so tiling the ground does not change the Moon globe in space.
    const texture = useMemo(() => {
        const tiled = source.clone();
        tiled.wrapS = THREE.RepeatWrapping;
        tiled.wrapT = THREE.RepeatWrapping;
        tiled.repeat.set(8, 8);
        tiled.colorSpace = THREE.SRGBColorSpace;
        tiled.anisotropy = 8;
        tiled.needsUpdate = true;
        return tiled;
    }, [source]);

    useEffect(() => {
        return () => texture.dispose();
    }, [texture]);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(220, 220, 360, 360);
        const positions = geo.attributes.position;
        const colors = [];

        // Nearly white, cool silver-grey multipliers let the photo texture show.
        const regolith = new THREE.Color("#F0F2F5");
        const lighter = new THREE.Color("#FFFFFF");
        const shadowRock = new THREE.Color("#252930");
        const color = new THREE.Color();

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = -positions.getY(i);
            const h = terrainHeight(x, z);

            positions.setZ(i, h);

            const variation =
                0.5 +
                0.25 * Math.sin(x * 0.12 + z * 0.07) +
                0.15 * Math.sin(x * 0.7 - z * 0.5);

            color.copy(regolith).lerp(
                lighter,
                THREE.MathUtils.clamp(variation * 0.5, 0, 0.35)
            );

            // Keep the crater interior dark.
            const d = Math.hypot(x - PIT.x, z - PIT.z);

            if (d < 5.0) {
                const darkness =
                    0.92 * (1 - smoothstep(1.7, 4.8, d));

                color.lerp(shadowRock, darkness);
            }

            // Slight silver highlights on raised terrain.
            if (h > 0.45) {
                color.lerp(lighter, 0.16);
            }

            colors.push(color.r, color.g, color.b);
        }

        geo.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(colors, 3)
        );

        geo.computeVertexNormals();

        return geo;
    }, []);

    useEffect(() => {
        return () => geometry.dispose();
    }, [geometry]);

    return (
        <mesh
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.12, 0]}
            receiveShadow
        >
            <meshStandardMaterial
                map={texture}
                vertexColors
                roughness={1}
                metalness={0}
                color="#FFFFFF"
            />
        </mesh>
    );
}

function MoonSky({ radius = 180 }) {
    return (
        <mesh raycast={() => null} renderOrder={-1}>
            <sphereGeometry args={[radius, 48, 32]} />
            <meshBasicMaterial color="#000000" side={THREE.BackSide} depthWrite={false} />
        </mesh>
    );
}

export default function MoonSurface() {
    return (
        <group>
            <MoonSky radius={180} />
            <Stars
                radius={200}
                depth={120}
                count={480}
                factor={3}
                saturation={0}
                fade
                speed={0.08}
            />

            <fog attach="fog" args={["#000000", 12, 58]} />

            <directionalLight
                position={[-20, 18, -14]}
                intensity={0.45}
                color="#b8c8ff"
            />
            <hemisphereLight
                args={["#d8e4ff", "#141820", 0.35]}
            />

            <Terrain />
        </group>
    );
}
