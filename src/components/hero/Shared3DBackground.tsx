"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";
import { createNorthframeGeometry } from "@/components/three/NorthframeGeometry";

// Suppress internal @react-three/fiber THREE.Clock deprecation warning
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Clock: This module has been deprecated")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

/**
 * LivingStudioLighting:
 * Clean studio lights with subtle left/right rim lights and dynamic highlight response.
 * Completely removed any bottom blue glow.
 */
function LivingStudioLighting({ isHidden, pointerX }: { isHidden: boolean; pointerX: number }) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const leftRimRef = useRef<THREE.DirectionalLight>(null);
  const rightRimRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (isHidden) return;
    
    // Light response on 3D shape as mouse moves left/right
    const rightBoost = Math.max(0, -pointerX) * 0.4;
    const leftBoost = Math.max(0, pointerX) * 0.4;

    if (leftRimRef.current) {
      leftRimRef.current.intensity = 0.9 + leftBoost;
    }
    if (rightRimRef.current) {
      rightRimRef.current.intensity = 1.2 + rightBoost;
    }
  });

  return (
    <>
      {/* Low neutral ambient light */}
      <ambientLight intensity={0.05} color="#ffffff" />

      {/* 1. Main soft key light from upper-left */}
      <directionalLight
        ref={keyLightRef}
        position={[-3.0, 4.0, 4.0]}
        intensity={2.6}
        color="#e2e8f0"
      />

      {/* 2. LEFT SIDE: Subtle soft cool blue light */}
      <directionalLight
        ref={leftRimRef}
        position={[-5.0, 1.5, -1.5]}
        intensity={0.9}
        color={new THREE.Color("#1677FF")}
      />

      {/* 3. RIGHT SIDE: Slightly stronger subtle cool blue light */}
      <directionalLight
        ref={rightRimRef}
        position={[5.0, 1.5, -1.5]}
        intensity={1.2}
        color={new THREE.Color("#1677FF")}
      />
    </>
  );
}

/**
 * Procedural circular alpha map for floor plane
 */
function createFloorAlphaMap(size = 512): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.25, "rgba(255, 255, 255, 0.7)");
  grad.addColorStop(0.55, "rgba(255, 255, 255, 0.2)");
  grad.addColorStop(0.85, "rgba(255, 255, 255, 0.03)");
  grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Stationary 3D NORTHFRAME A model:
 * Exactly centered at X=0, Y=0, Z=0.
 * Smooth lerped mouse tracking on desktop, continuous float on mobile.
 */
function StationaryModel({
  isMobile,
  isTablet,
  isHidden,
  onPointerChange,
}: {
  isMobile: boolean;
  isTablet?: boolean;
  isHidden: boolean;
  onPointerChange: (px: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => createNorthframeGeometry(), []);

  // Front Face Material: Dark graphite (#020407)
  const frontMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#020407"),
        metalness: 0.92,
        roughness: 0.24,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
      }),
    []
  );

  // Side & Bevel Surfaces: (#070B10) with crisp edge highlight
  const sideMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#070B10"),
        metalness: 0.95,
        roughness: 0.16,
        clearcoat: 0.75,
        clearcoatRoughness: 0.12,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      frontMaterial.dispose();
      sideMaterial.dispose();
    };
  }, [geometry, frontMaterial, sideMaterial]);

  // Responsive scale
  const responsiveScale = isMobile ? 0.72 : isTablet ? 0.85 : 1.0;
  // Neutral angle (-2.5deg rotX, 4.5deg rotY)
  const baseRotX = -2.5 * (Math.PI / 180);
  const baseRotY = 4.5 * (Math.PI / 180);

  useFrame((state) => {
    if (isHidden || !groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // MOBILE / DESKTOP FALLBACK continuous float (6s sine cycle)
    const floatCycle = Math.sin((time * Math.PI) / 3.0); // 6s cycle
    const floatRotX = floatCycle * (1.5 * Math.PI / 180);
    const floatRotY = floatCycle * (2.0 * Math.PI / 180);
    const floatPosY = floatCycle * -0.06;

    let targetRotX = baseRotX + floatRotX;
    let targetRotY = baseRotY + floatRotY;
    let targetPosX = 0;
    let targetPosY = floatPosY;
    let targetPosZ = 0;

    const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!isMobile && canHover) {
      const px = state.pointer.x; // -1 -> +1
      const py = state.pointer.y; // -1 -> +1

      onPointerChange(px);

      // Max rotation ~6.5 degrees on Y (left/right) and X (up/down)
      targetRotY = baseRotY + floatRotY + px * (6.5 * Math.PI / 180);
      targetRotX = baseRotX + floatRotX - py * (5.5 * Math.PI / 180);

      // Subtle translate for depth & scale boost
      targetPosX = px * 0.12;
      targetPosY = floatPosY + py * 0.08;
      targetPosZ = (Math.abs(px) + Math.abs(py)) * 0.05;
    } else {
      onPointerChange(0);
    }

    // Smooth lerp / interpolation (heavy premium feel, never snap)
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.045;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.045;

    groupRef.current.position.x += (targetPosX - groupRef.current.position.x) * 0.045;
    groupRef.current.position.y += (targetPosY - groupRef.current.position.y) * 0.045;
    groupRef.current.position.z += (targetPosZ - groupRef.current.position.z) * 0.045;
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      scale={[responsiveScale, responsiveScale, responsiveScale]}
    >
      <mesh geometry={geometry} material={[frontMaterial, sideMaterial]} />
    </group>
  );
}

/**
 * Ground floor plane with soft contact shadows behind the object
 */
function FloorBackdrop({ isMobile }: { isMobile: boolean }) {
  const floorAlphaMap = useMemo(() => createFloorAlphaMap(), []);
  const floorGeo = useMemo(() => new THREE.PlaneGeometry(32, 32), []);
  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#05080B"),
        roughness: 0.8,
        metalness: 0.15,
        alphaMap: floorAlphaMap || undefined,
        transparent: true,
        depthWrite: false,
      }),
    [floorAlphaMap]
  );

  useEffect(() => {
    return () => {
      floorGeo.dispose();
      floorMat.dispose();
      floorAlphaMap?.dispose();
    };
  }, [floorGeo, floorMat, floorAlphaMap]);

  return (
    <>
      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.75}
        scale={6.5}
        blur={2.8}
        far={3.0}
        resolution={isMobile ? 256 : 512}
        color="#000000"
      />
      <mesh
        geometry={floorGeo}
        material={floorMat}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.26, 0]}
      />
    </>
  );
}

/**
 * Shared3DBackground:
 * Fixed 100vh near-black backdrop (#05080B) with subtle left/right edge lighting.
 */
export default function Shared3DBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [pointerX, setPointerX] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    const handleVisibilityChange = () => {
      setIsHidden(document.hidden);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="shared-3d-background hero-a-stage fixed inset-0 w-[100vw] h-[100svh] h-[100dvh] pointer-events-none z-0 overflow-hidden bg-[#05080B]">
      {/* SUBTLE SIDE LIGHTING ONLY */}
      <div
        aria-hidden="true"
        className="left-light absolute -left-[20vw] top-[35%] w-[35vw] h-[45vh] pointer-events-none rounded-full blur-[50px] opacity-100"
        style={{
          background:
            "radial-gradient(circle, rgba(22,119,255,0.05), rgba(22,119,255,0.015) 35%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="right-light absolute -right-[18vw] top-[32%] w-[38vw] h-[50vh] pointer-events-none rounded-full blur-[55px] opacity-100"
        style={{
          background:
            "radial-gradient(circle, rgba(22,119,255,0.07), rgba(22,119,255,0.02) 35%, transparent 72%)",
        }}
      />

      <div className="hero-a-float w-full h-full">
        <div className="hero-a-interaction w-full h-full">
          <div className="hero-a-object w-full h-full">
            <Canvas
              dpr={isMobile ? [1, 1.25] : [1, 1.5]}
              gl={{
                antialias: !isMobile,
                alpha: true,
                powerPreference: "high-performance",
              }}
              camera={{
                position: [0, 0, 5],
                fov: isMobile ? 38 : 34,
                near: 0.1,
                far: 100,
              }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.1;
                gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
              className="w-full h-full pointer-events-none relative z-10"
            >
              <fog attach="fog" args={["#05080B", 4.5, 14]} />
              <LivingStudioLighting isHidden={isHidden} pointerX={pointerX} />
              <FloorBackdrop isMobile={isMobile} />
              <StationaryModel
                isMobile={isMobile}
                isTablet={isTablet}
                isHidden={isHidden}
                onPointerChange={setPointerX}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

