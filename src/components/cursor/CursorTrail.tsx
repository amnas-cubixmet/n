"use client";

import React, { useEffect, useRef } from "react";

interface NodePoint {
  x: number;
  y: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atmosphereRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Disable on non-fine pointer (touch/mobile) or reduced motion preference
    const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || isReducedMotion || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Physics trail settings
    const NUM_NODES = 24;
    const nodes: NodePoint[] = [];
    const target = { x: -1000, y: -1000 };
    let isMouseActive = false;
    let lastMouseMoveTime = 0;

    // Layer B delayed lerp position
    let posB = { x: -1000, y: -1000 };

    for (let i = 0; i < NUM_NODES; i++) {
      nodes.push({ x: -1000, y: -1000 });
    }

    const rootEl = document.documentElement;

    const handleMouseMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      lastMouseMoveTime = performance.now();

      if (!isMouseActive) {
        isMouseActive = true;
        posB.x = e.clientX;
        posB.y = e.clientY;
        for (let i = 0; i < NUM_NODES; i++) {
          nodes[i].x = e.clientX;
          nodes[i].y = e.clientY;
        }
      }
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isMouseActive) return;

      const now = performance.now();
      const idleTime = now - lastMouseMoveTime;

      // Smooth lerp physics
      const easeHead = 0.45;
      nodes[0].x += (target.x - nodes[0].x) * easeHead;
      nodes[0].y += (target.y - nodes[0].y) * easeHead;

      const easeTail = 0.42;
      for (let i = 1; i < NUM_NODES; i++) {
        nodes[i].x += (nodes[i - 1].x - nodes[i].x) * easeTail;
        nodes[i].y += (nodes[i - 1].y - nodes[i].y) * easeTail;
      }

      // Smooth delayed position for Accent B atmosphere
      posB.x += (target.x - posB.x) * 0.1;
      posB.y += (target.y - posB.y) * 0.1;

      // Update global CSS variables for pointer position without triggering React re-renders
      const normX = ((target.x / window.innerWidth) * 2 - 1).toFixed(3);
      const normY = ((target.y / window.innerHeight) * 2 - 1).toFixed(3);
      rootEl.style.setProperty("--mouse-x", `${target.x.toFixed(1)}px`);
      rootEl.style.setProperty("--mouse-y", `${target.y.toFixed(1)}px`);
      rootEl.style.setProperty("--mouse-x-norm", normX);
      rootEl.style.setProperty("--mouse-y-norm", normY);
      rootEl.style.setProperty("--mouse-x-b", `${posB.x.toFixed(1)}px`);
      rootEl.style.setProperty("--mouse-y-b", `${posB.y.toFixed(1)}px`);

      let distanceSum = 0;
      for (let i = 1; i < NUM_NODES; i++) {
        const dx = nodes[i].x - nodes[i - 1].x;
        const dy = nodes[i].y - nodes[i - 1].y;
        distanceSum += Math.hypot(dx, dy);
      }

      let globalAlpha = 1;
      if (idleTime > 300) {
        globalAlpha = Math.max(0, 1 - (idleTime - 300) / 400);
      }

      if (globalAlpha <= 0.001 || distanceSum < 0.8) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.setLineDash([6, 4]);
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";

      // Render dual-color segmented strokes (Accent A -> Accent B transition)
      for (let i = 0; i < NUM_NODES - 1; i++) {
        const p1 = nodes[i];
        const p2 = nodes[i + 1];

        const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (segDist < 0.5) continue;

        const progress = 1 - i / (NUM_NODES - 1);
        const segmentAlpha = Math.pow(progress, 0.85) * globalAlpha;

        ctx.lineWidth = 2 + progress * 1.2;
        
        // Transition from Accent A (#1677FF -> 22, 119, 255) to Accent B (#00E599 -> 0, 229, 153)
        const r = Math.round(22 * progress + 0 * (1 - progress));
        const g = Math.round(119 * progress + 229 * (1 - progress));
        const b = Math.round(255 * progress + 153 * (1 - progress));

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${segmentAlpha.toFixed(3)})`;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      ctx.restore();
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Dual-Color Ambient Atmosphere Fields */}
      <div
        ref={atmosphereRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-20 overflow-hidden mix-blend-screen opacity-35 hidden md:block"
        style={{
          background: `
            radial-gradient(450px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(var(--accent-a-rgb), 0.08), transparent 75%),
            radial-gradient(650px circle at var(--mouse-x-b, 50vw) var(--mouse-y-b, 50vh), rgba(var(--accent-b-rgb), 0.05), transparent 75%)
          `,
        }}
      />
      {/* Dual-Color Segmented Cursor Trail */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50 w-full h-full hidden md:block"
      />
    </>
  );
}

