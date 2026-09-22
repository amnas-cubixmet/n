"use client";

import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";

/**
 * Procedural circular alpha map for the floor plane.
 * Fades smoothly from solid in the center to 0.0 at the outer edge,
 * ensuring the floor plane has NO visible boundary or hard edges.
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
  grad.addColorStop(0.25, "rgba(255, 255, 255, 0.85)");
  grad.addColorStop(0.55, "rgba(255, 255, 255, 0.35)");
  grad.addColorStop(0.85, "rgba(255, 255, 255, 0.05)");
  grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural soft atmospheric halo texture for the backdrop plane behind the A.
 * Center is a soft dark navy/blue (#1677FF at very low opacity) fading smoothly to black.
 */
function createAtmosphericHaloTexture(size = 512): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  // Extremely subtle #1677FF halo:
  grad.addColorStop(0, "rgba(22, 119, 255, 0.16)");
  grad.addColorStop(0.2, "rgba(15, 65, 120, 0.10)");
  grad.addColorStop(0.45, "rgba(7, 28, 55, 0.04)");
  grad.addColorStop(0.75, "rgba(3, 8, 15, 0.01)");
  grad.addColorStop(1.0, "rgba(3, 5, 7, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function AtmosphereBackdrop() {
  const floorAlphaMap = useMemo(() => createFloorAlphaMap(), []);
  const haloMap = useMemo(() => createAtmosphericHaloTexture(), []);

  const floorGeo = useMemo(() => new THREE.PlaneGeometry(32, 32), []);
  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#030507"),
        roughness: 0.65,
        metalness: 0.28,
        alphaMap: floorAlphaMap || undefined,
        transparent: true,
        depthWrite: false,
      }),
    [floorAlphaMap]
  );

  const haloGeo = useMemo(() => new THREE.PlaneGeometry(22, 22), []);
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: haloMap || undefined,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        opacity: 0.9,
      }),
    [haloMap]
  );

  useEffect(() => {
    return () => {
      floorGeo.dispose();
      floorMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      floorAlphaMap?.dispose();
      haloMap?.dispose();
    };
  }, [floorGeo, floorMat, haloGeo, haloMat, floorAlphaMap, haloMap]);

  return (
    <>
      {/* 1. SOFT ATMOSPHERIC HALO PLANE (Located behind model at z = -2.2 for true 3D optical parallax) */}
      <mesh
        geometry={haloGeo}
        material={haloMat}
        position={[0, 0.1, -2.2]}
      />

      {/* 2. REAL CONTACT SHADOWS DIRECTLY UNDER THE LEGS */}
      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.65}
        scale={6.5}
        blur={2.2}
        far={3.0}
        resolution={512}
        color="#000000"
      />

      {/* 3. SEAMLESS FLOOR PLANE (Fades naturally into black environment) */}
      <mesh
        geometry={floorGeo}
        material={floorMat}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.26, 0]}
      />
    </>
  );
}
