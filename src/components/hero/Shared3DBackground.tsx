"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { createNorthframeGeometry } from "@/components/three/NorthframeGeometry";

function LivingStudioLighting({
  isHidden,
  isMobile,
  canHover,
}: {
  isHidden: boolean;
  isMobile: boolean;
  canHover: boolean;
}) {
  const leftRimRef = useRef<THREE.DirectionalLight>(null);
  const rightRimRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    if (isHidden) return;

    const pointerX = !isMobile && canHover ? state.pointer.x : 0;
    const rightBoost = Math.max(0, -pointerX) * 0.14;
    const leftBoost = Math.max(0, pointerX) * 0.14;

    if (leftRimRef.current) {
      leftRimRef.current.intensity +=
        (0.9 + leftBoost - leftRimRef.current.intensity) * 0.05;
    }

    if (rightRimRef.current) {
      rightRimRef.current.intensity +=
        (1.2 + rightBoost - rightRimRef.current.intensity) * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={isMobile ? 0.07 : 0.05} color="#ffffff" />

      <directionalLight
        position={[-3, 4, 4]}
        intensity={isMobile ? 2.25 : 2.6}
        color="#e2e8f0"
      />

      <directionalLight
        ref={leftRimRef}
        position={[-5, 1.5, -1.5]}
        intensity={0.9}
        color="#1677FF"
      />

      <directionalLight
        ref={rightRimRef}
        position={[5, 1.5, -1.5]}
        intensity={1.2}
        color="#1677FF"
      />
    </>
  );
}

function createFloorAlphaMap(size = 256): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const center = size / 2;
  const gradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  );

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.62)");
  gradient.addColorStop(0.62, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function StationaryModel({
  isMobile,
  isTablet,
  isHidden,
  canHover,
  reducedMotion,
}: {
  isMobile: boolean;
  isTablet: boolean;
  isHidden: boolean;
  canHover: boolean;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => createNorthframeGeometry(), []);

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
  }, [frontMaterial, geometry, sideMaterial]);

  const responsiveScale = isMobile ? 0.7 : isTablet ? 0.84 : 1;
  const baseRotX = THREE.MathUtils.degToRad(-2.5);
  const baseRotY = THREE.MathUtils.degToRad(4.5);
  const baseY = isMobile ? 0.26 : isTablet ? 0.1 : 0;

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || isHidden) return;

    if (reducedMotion) {
      group.rotation.x += (baseRotX - group.rotation.x) * 0.08;
      group.rotation.y += (baseRotY - group.rotation.y) * 0.08;
      group.position.x += (0 - group.position.x) * 0.08;
      group.position.y += (baseY - group.position.y) * 0.08;
      group.position.z += (0 - group.position.z) * 0.08;
      return;
    }

    const time = state.clock.getElapsedTime();
    const floatCycle = Math.sin((time * Math.PI) / 3);

    const floatRotX = floatCycle * THREE.MathUtils.degToRad(isMobile ? 0.16 : 0.32);
    const floatRotY = floatCycle * THREE.MathUtils.degToRad(isMobile ? 0.22 : 0.45);
    const floatY = floatCycle * (isMobile ? -0.006 : -0.012);

    let targetRotX = baseRotX + floatRotX;
    let targetRotY = baseRotY + floatRotY;
    let targetX = 0;
    let targetY = baseY + floatY;
    let targetZ = 0;

    if (!isMobile && canHover) {
      const pointerX = state.pointer.x;
      const pointerY = state.pointer.y;

      targetRotY += pointerX * THREE.MathUtils.degToRad(1.6);
      targetRotX -= pointerY * THREE.MathUtils.degToRad(1.2);
      targetX = pointerX * 0.035;
      targetY += pointerY * 0.025;
      targetZ = (Math.abs(pointerX) + Math.abs(pointerY)) * 0.012;
    }

    const lerp = isMobile ? 0.025 : 0.03;

    group.rotation.x += (targetRotX - group.rotation.x) * lerp;
    group.rotation.y += (targetRotY - group.rotation.y) * lerp;
    group.position.x += (targetX - group.position.x) * lerp;
    group.position.y += (targetY - group.position.y) * lerp;
    group.position.z += (targetZ - group.position.z) * lerp;
  });

  return (
    <group
      ref={groupRef}
      position={[0, baseY, 0]}
      scale={[responsiveScale, responsiveScale, responsiveScale]}
    >
      <mesh
        geometry={geometry}
        material={[frontMaterial, sideMaterial]}
        frustumCulled
      />
    </group>
  );
}

function FloorBackdrop({ isMobile }: { isMobile: boolean }) {
  const floorAlphaMap = useMemo(() => createFloorAlphaMap(), []);
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(32, 32), []);

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#05080B"),
        roughness: 0.82,
        metalness: 0.12,
        alphaMap: floorAlphaMap ?? undefined,
        transparent: true,
        depthWrite: false,
      }),
    [floorAlphaMap]
  );

  useEffect(() => {
    return () => {
      floorGeometry.dispose();
      floorMaterial.dispose();
      floorAlphaMap?.dispose();
    };
  }, [floorAlphaMap, floorGeometry, floorMaterial]);

  return (
    <>
      {!isMobile && (
        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.7}
          scale={6.5}
          blur={2.8}
          far={3}
          resolution={384}
          color="#000000"
        />
      )}

      <mesh
        geometry={floorGeometry}
        material={floorMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.26, 0]}
      />
    </>
  );
}

export default function Shared3DBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(false);
  const [rangeVisible, setRangeVisible] = useState(true);
  const [canHover, setCanHover] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncViewport = () => {
      const width = window.innerWidth;
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const mobileLike = width <= 768 || (coarsePointer && width <= 1024);

      setIsMobile(mobileLike);
      setIsTablet(!mobileLike && width > 768 && width <= 1024);
    };

    const syncHover = () => setCanHover(hoverQuery.matches);
    const syncMotion = () => setReducedMotion(motionQuery.matches);
    const syncVisibility = () => setDocumentHidden(document.hidden);

    syncViewport();
    syncHover();
    syncMotion();
    syncVisibility();

    let resizeFrame = 0;
    const handleResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(syncViewport);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize);
    document.addEventListener("visibilitychange", syncVisibility);

    const sharedRange = document.querySelector(".shared-background-range");
    const rangeObserver =
      sharedRange && "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => setRangeVisible(entry.isIntersecting),
            { rootMargin: "160px 0px", threshold: 0 }
          )
        : null;

    if (sharedRange && rangeObserver) {
      rangeObserver.observe(sharedRange);
    }

    if (typeof hoverQuery.addEventListener === "function") {
      hoverQuery.addEventListener("change", syncHover);
      motionQuery.addEventListener("change", syncMotion);
    } else {
      hoverQuery.addListener(syncHover);
      motionQuery.addListener(syncMotion);
    }

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("visibilitychange", syncVisibility);
      rangeObserver?.disconnect();

      if (typeof hoverQuery.removeEventListener === "function") {
        hoverQuery.removeEventListener("change", syncHover);
        motionQuery.removeEventListener("change", syncMotion);
      } else {
        hoverQuery.removeListener(syncHover);
        motionQuery.removeListener(syncMotion);
      }
    };
  }, []);

  const isHidden = documentHidden || !rangeVisible;

  return (
    <div className="shared-3d-background hero-a-stage fixed inset-0 z-0 h-screen h-[100svh] h-[100dvh] w-full overflow-hidden bg-[#05080B] pointer-events-none">
      <div
        aria-hidden="true"
        className="hero-side-light left-light absolute -left-[20vw] top-[35%] h-[45vh] w-[35vw] rounded-full blur-[50px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(22,119,255,0.05), rgba(22,119,255,0.015) 35%, transparent 70%)",
        }}
      />

      <div
        aria-hidden="true"
        className="hero-side-light right-light absolute -right-[18vw] top-[32%] h-[50vh] w-[38vw] rounded-full blur-[55px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(22,119,255,0.07), rgba(22,119,255,0.02) 35%, transparent 72%)",
        }}
      />

      <div className="hero-a-float h-full w-full">
        <div className="hero-a-interaction h-full w-full">
          <div className="hero-a-object h-full w-full">
            <Canvas
              dpr={isMobile ? 1 : [1, 1.5]}
              frameloop={isHidden ? "never" : "always"}
              gl={{
                antialias: !isMobile,
                alpha: true,
                powerPreference: "high-performance",
              }}
              camera={{
                position: [0, 0, 5],
                fov: isMobile ? 40 : isTablet ? 37 : 34,
                near: 0.1,
                far: 100,
              }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = isMobile ? 1.05 : 1.1;
                gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
              className="relative z-10 h-full w-full pointer-events-none"
            >
              <fog attach="fog" args={["#05080B", 4.5, 14]} />

              <LivingStudioLighting
                isHidden={isHidden}
                isMobile={isMobile}
                canHover={canHover}
              />

              <FloorBackdrop isMobile={isMobile} />

              <StationaryModel
                isMobile={isMobile}
                isTablet={isTablet}
                isHidden={isHidden}
                canHover={canHover}
                reducedMotion={reducedMotion}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
