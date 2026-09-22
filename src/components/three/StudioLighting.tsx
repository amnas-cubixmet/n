"use client";

import React from "react";
import * as THREE from "three";

/**
 * StudioLighting creates cinematic studio illumination for the NORTHFRAME A mark:
 * - Very low ambient illumination
 * - Soft cool-white key light (controlled silver highlights on bevel & extrusion)
 * - Subtle secondary fill light
 * - Subtle #1677FF blue rim light behind/right of the model
 * - Subtle blue bounce from below the legs
 * - Lower-left weak blue accent
 * - Soft atmospheric glow light behind the model
 */
export default function StudioLighting() {
  return (
    <>
      {/* Very low ambient illumination */}
      <ambientLight intensity={0.08} color="#ffffff" />

      {/* Main key light: upper-left/front, cool white for silver highlights */}
      <directionalLight
        position={[-3.2, 4.5, 4.2]}
        intensity={3.4}
        color="#f1f5f9"
      />

      {/* Second fill light: upper-right, soft and lower intensity */}
      <directionalLight
        position={[3.0, 3.5, 3.0]}
        intensity={0.7}
        color="#94a3b8"
      />

      {/* Blue rim light: behind / right of model (#1677FF) */}
      <directionalLight
        position={[4.2, 2.0, -2.5]}
        intensity={2.2}
        color={new THREE.Color("#1677FF")}
      />

      {/* Subtle blue accent: lower-left edge */}
      <pointLight
        position={[-2.0, -0.8, 1.2]}
        intensity={1.0}
        distance={5.0}
        decay={2}
        color={new THREE.Color("#1677FF")}
      />

      {/* Subtle blue bounce from below (illuminates floor & bottom of legs) */}
      <pointLight
        position={[0, -1.22, 0.3]}
        intensity={1.5}
        distance={4.2}
        decay={2}
        color={new THREE.Color("#1677FF")}
      />

      {/* Atmospheric back-glow light directly behind the A mark */}
      <pointLight
        position={[0, 0.2, -1.8]}
        intensity={1.6}
        distance={7.0}
        decay={2}
        color={new THREE.Color("#1677FF")}
      />
    </>
  );
}
