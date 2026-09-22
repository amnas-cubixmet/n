"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import StudioLighting from "@/components/three/StudioLighting";
import AtmosphereBackdrop from "@/components/three/AtmosphereBackdrop";
import Northframe3DModel from "./Northframe3DModel";

interface HeroSceneProps {
  isMobile: boolean;
  isTablet?: boolean;
}

export default function HeroScene({
  isMobile,
  isTablet = false,
}: HeroSceneProps) {
  return (
    <div className="w-full h-full pointer-events-none select-none flex items-center justify-center">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
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
          gl.toneMappingExposure = 1.15;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        className="w-full h-full pointer-events-none"
      >
        {/* Depth fog to dissolve edges naturally into deep black */}
        <fog attach="fog" args={["#030507", 4.5, 14]} />

        {/* Cinematic Studio Lighting */}
        <StudioLighting />

        {/* Subtle Atmospheric Halo & Contact Floor */}
        <AtmosphereBackdrop />

        {/* Stationary Centered 3D Model */}
        <Northframe3DModel isMobile={isMobile} isTablet={isTablet} />
      </Canvas>
    </div>
  );
}
