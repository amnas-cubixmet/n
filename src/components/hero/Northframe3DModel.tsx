"use client";

import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { createNorthframeGeometry } from "@/components/three/NorthframeGeometry";

interface Northframe3DModelProps {
  isMobile: boolean;
  isTablet?: boolean;
}

export default function Northframe3DModel({
  isMobile,
  isTablet = false,
}: Northframe3DModelProps) {
  // Memoize exact NORTHFRAME A geometry
  const geometry = useMemo(() => createNorthframeGeometry(), []);

  // Memoize Materials
  // Front Face: Dark satin graphite
  const frontMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#080A0D"),
        metalness: 0.92,
        roughness: 0.19,
        clearcoat: 0.7,
        clearcoatRoughness: 0.15,
      }),
    []
  );

  // Extruded Sides: Glossy deep black / chrome
  const sideMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#050608"),
        metalness: 0.95,
        roughness: 0.12,
        clearcoat: 0.85,
        clearcoatRoughness: 0.10,
      }),
    []
  );

  // Dispose resources on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
      frontMaterial.dispose();
      sideMaterial.dispose();
    };
  }, [geometry, frontMaterial, sideMaterial]);

  // Base responsive scale: Desktop: 1.0 (45-55% viewport height), Tablet: 0.85, Mobile: 0.72
  const responsiveScale = isMobile ? 0.72 : isTablet ? 0.85 : 1.0;

  // Exact fixed architectural rotation revealing 3D depth
  const rotation: [number, number, number] = [-0.025, 0.08, 0];

  return (
    <group
      position={[0, 0, 0]}
      rotation={rotation}
      scale={[responsiveScale, responsiveScale, responsiveScale]}
    >
      <mesh
        geometry={geometry}
        material={[frontMaterial, sideMaterial]}
      />
    </group>
  );
}
