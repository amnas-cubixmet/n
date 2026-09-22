"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Hero3DObjectProps {
  mousePosRef: React.RefObject<{ x: number; y: number }>;
  scrollProgressRef: React.RefObject<number>;
  isMobile: boolean;
  isReducedMotion: boolean;
  onLoaded?: () => void;
}

export default function Hero3DObject({
  mousePosRef,
  scrollProgressRef,
  isMobile,
  isReducedMotion,
  onLoaded,
}: Hero3DObjectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();

    const width = container.clientWidth || 650;
    const height = container.clientHeight || 700;

    // Camera: positioned around [0, 0.15, 5]
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Safely reset container children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 1. CINEMATIC STUDIO LIGHTING
    // Ambient: very weak neutral ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.10);
    scene.add(ambientLight);

    // Key light: upper-left/front, soft cool-white, creates crisp silver highlights
    const keyLight = new THREE.DirectionalLight(0xf1f5f9, 3.4);
    keyLight.position.set(-3.2, 4.5, 4.2);
    scene.add(keyLight);

    // Blue rim light: behind / right side of object (#1677FF, low/moderate intensity)
    const blueRimLight = new THREE.DirectionalLight(new THREE.Color("#1677FF"), 1.8);
    blueRimLight.position.set(4.2, 2.0, -2.2);
    scene.add(blueRimLight);

    // Subtle cyan-blue light near the lower-left edge
    const lowerLeftBlue = new THREE.PointLight(new THREE.Color("#38bdf8"), 1.2, 5.0, 2);
    lowerLeftBlue.position.set(-1.8, -1.1, 1.2);
    scene.add(lowerLeftBlue);

    // Subtle top fill
    const topFill = new THREE.DirectionalLight(0x94a3b8, 0.35);
    topFill.position.set(0, 5.0, 2.5);
    scene.add(topFill);

    // 2. FLOOR PLANE & SOFT REFLECTION
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#05080b"),
      roughness: 0.75,
      metalness: 0.55,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.26;
    scene.add(floor);

    // Soft blue reflection light underneath the two logo legs fading naturally
    const floorGlowLight = new THREE.PointLight(new THREE.Color("#1677FF"), 2.2, 4.0, 2);
    floorGlowLight.position.set(0, -1.22, 0.2);
    scene.add(floorGlowLight);

    // 3. OBJECT GEOMETRY — NORTHFRAME "A" MARK SILHOUETTE
    const group = new THREE.Group();
    scene.add(group);

    const shape = new THREE.Shape();
    const H = 2.4;
    const W = 2.36;
    const halfW = W / 2; // 1.18
    const halfH = H / 2; // 1.2
    const legInnerX = 0.48;
    const notchY = -halfH + H * 0.325; // -0.42

    // Apex (top point)
    shape.moveTo(0, halfH);
    // Outer right diagonal edge to bottom-right outer corner
    shape.lineTo(halfW, -halfH);
    // Bottom-right leg horizontal base to bottom-right inner corner
    shape.lineTo(legInnerX, -halfH);
    // Inner notch right diagonal slope up to notch apex
    shape.lineTo(0, notchY);
    // Inner notch left diagonal slope down to bottom-left inner corner
    shape.lineTo(-legInnerX, -halfH);
    // Bottom-left leg horizontal base to bottom-left outer corner
    shape.lineTo(-halfW, -halfH);
    // Outer left diagonal edge back to apex
    shape.lineTo(0, halfH);

    // ExtrudeGeometry per recommendations:
    // depth: 0.28, bevelThickness: 0.025, bevelSize: 0.018, bevelSegments: 3, curveSegments: 12
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.018,
      bevelSegments: 3,
      curveSegments: 12,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // 4. MATERIALS — BLACK / GRAPHITE (Body is NOT blue, blue is lighting only)
    // Front Face Material:
    // color: #090b0e, metalness: 0.92, roughness: 0.20, clearcoat: 0.65, clearcoatRoughness: 0.16
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#090b0e"),
      metalness: 0.92,
      roughness: 0.20,
      clearcoat: 0.65,
      clearcoatRoughness: 0.16,
    });

    // Extruded Sides & Bevel: Glossy deep black
    const sideMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#050608"),
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 0.85,
      clearcoatRoughness: 0.10,
    });

    const mesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
    group.add(mesh);

    // INITIAL ROTATION:
    // rotation.x ≈ -0.03
    // rotation.y ≈ 0.08
    // rotation.z = 0
    const baseRotX = -0.03;
    const baseRotY = 0.08;
    const baseRotZ = 0.0;

    group.rotation.set(baseRotX, baseRotY, baseRotZ);

    if (onLoaded) {
      onLoaded();
    }

    // 5. ANIMATION LOOP
    const startTime = performance.now();
    let animFrameId: number;

    let smoothedMouseX = 0;
    let smoothedMouseY = 0;

    const renderLoop = () => {
      const elapsedTime = (performance.now() - startTime) * 0.001;

      if (!isReducedMotion) {
        // Slow floating motion: position.y base ± 0.04
        const floatY = Math.sin(elapsedTime * 0.7) * 0.04;

        // Idle rotation: rotation.y approximately -0.04 to +0.04
        const idleRotY = Math.sin(elapsedTime * 0.4) * 0.04;
        // rotation.x maximum ±0.015
        const idleRotX = Math.cos(elapsedTime * 0.35) * 0.015;

        // Mouse interaction:
        // rotationY = mouseX * 0.06
        // rotationX = -mouseY * 0.025
        const currentMouse = mousePosRef.current || { x: 0, y: 0 };
        const mouseTargetY = isMobile ? 0 : currentMouse.x * 0.06;
        const mouseTargetX = isMobile ? 0 : -currentMouse.y * 0.025;

        // Inertia smoothing via lerp
        smoothedMouseX += (mouseTargetX - smoothedMouseX) * 0.03;
        smoothedMouseY += (mouseTargetY - smoothedMouseY) * 0.03;

        // Scroll animation:
        // rotation.y: 0.08 -> -0.10 (offset: progress * -0.18)
        // position.y: 0 -> -0.15
        // scale: 1 -> 1.04
        const scrollProgress = scrollProgressRef.current || 0;
        const scrollRotY = scrollProgress * -0.18;
        const scrollPosY = scrollProgress * -0.15;
        const baseScale = isMobile ? 0.78 : 1.0;
        const currentScale = baseScale * (1 + scrollProgress * 0.04);

        group.rotation.x = baseRotX + idleRotX + smoothedMouseX;
        group.rotation.y = baseRotY + idleRotY + smoothedMouseY + scrollRotY;
        group.rotation.z = baseRotZ;

        group.position.y = floatY + scrollPosY;
        group.position.x = 0;
        group.position.z = 0;

        group.scale.set(currentScale, currentScale, currentScale);
      } else {
        const baseScale = isMobile ? 0.78 : 1.0;
        group.scale.set(baseScale, baseScale, baseScale);
      }

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      frontMaterial.dispose();
      sideMaterial.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      renderer.dispose();

      const domEl = renderer.domElement;
      if (domEl && container && domEl.parentNode === container) {
        try {
          container.removeChild(domEl);
        } catch {
          // Node already detached
        }
      }
    };
  }, [isMobile, isReducedMotion, mousePosRef, scrollProgressRef, onLoaded]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full pointer-events-none select-none flex items-center justify-center relative"
    />
  );
}
