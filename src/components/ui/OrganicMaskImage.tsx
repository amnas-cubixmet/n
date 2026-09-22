"use client";

import React, { useId } from "react";
import Image from "next/image";
import { OrganicShapeVariant } from "@/data/projects";

interface OrganicMaskImageProps {
  src: string;
  alt: string;
  shapeVariant?: OrganicShapeVariant;
  objectPosition?: string;
  className?: string;
  priority?: boolean;
}

const SHAPE_PATHS: Record<OrganicShapeVariant, string> = {
  // Shape 1: Soft asymmetric rounded blob
  "asymmetric-blob":
    "M 0.08,0.15 C 0.28,0.02 0.72,0.05 0.92,0.18 C 1.02,0.38 0.96,0.72 0.88,0.88 C 0.72,0.99 0.28,0.97 0.09,0.85 C -0.02,0.68 0.01,0.32 0.08,0.15 Z",

  // Shape 2: Rounded triangular or pebble shape
  "pebble-triangle":
    "M 0.48,0.03 C 0.78,0.03 0.97,0.35 0.95,0.68 C 0.93,0.92 0.65,0.99 0.38,0.95 C 0.12,0.91 0.02,0.72 0.04,0.45 C 0.07,0.18 0.25,0.03 0.48,0.03 Z",

  // Shape 3: Wide curved shape with a shallow top dip
  "shallow-dip":
    "M 0.05,0.22 C 0.28,0.10 0.50,0.20 0.75,0.12 C 0.92,0.05 0.98,0.15 0.97,0.35 C 0.96,0.65 0.95,0.82 0.86,0.92 C 0.68,0.98 0.32,0.96 0.10,0.88 C -0.01,0.74 -0.01,0.40 0.05,0.22 Z",

  // Shape 4: Tall oval-like asymmetric shape
  "tall-oval":
    "M 0.18,0.08 C 0.42,-0.02 0.82,0.06 0.92,0.25 C 0.99,0.52 0.94,0.78 0.82,0.92 C 0.62,1.02 0.22,0.96 0.08,0.78 C -0.02,0.55 0.02,0.24 0.18,0.08 Z",
};

export function OrganicMaskImage({
  src,
  alt,
  shapeVariant = "shallow-dip",
  objectPosition = "center center",
  className = "",
  priority = false,
}: OrganicMaskImageProps) {
  const rawId = useId();
  // Sanitize react useId for valid SVG clipPath selector
  const clipId = `organic-clip-${rawId.replace(/:/g, "")}`;

  const pathData = SHAPE_PATHS[shapeVariant] || SHAPE_PATHS["shallow-dip"];

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* SVG clipPath Definition with unique IDs and normalized objectBoundingBox coordinates */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={pathData} />
          </clipPath>
        </defs>
      </svg>

      {/* Clipped Container */}
      <div
        className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden transition-transform duration-500 ease-out"
        style={{
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition }}
        />
      </div>
    </div>
  );
}
