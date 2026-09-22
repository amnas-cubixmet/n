"use client";

import React, { useId } from "react";
import Image from "next/image";

interface ServiceOrganicMaskImageProps {
  src: string;
  alt: string;
  objectPosition?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

// Exact shape mask from Creative Production ("flowing-bean")
const SHARED_SERVICE_MASK_PATH =
  "M 0.18,0.14 C 0.46,0.02 0.84,0.18 0.94,0.42 C 1.02,0.70 0.82,0.94 0.52,0.96 C 0.24,0.98 0.04,0.78 0.02,0.52 C 0.00,0.30 0.06,0.20 0.18,0.14 Z";

export function ServiceOrganicMaskImage({
  src,
  alt,
  objectPosition = "center center",
  className = "",
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 45vw",
}: ServiceOrganicMaskImageProps) {
  const rawId = useId();
  const clipId = `service-shared-clip-${rawId.replace(/:/g, "")}`;

  return (
    <div className={`relative w-full ${className}`}>
      {/* SVG clipPath Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={SHARED_SERVICE_MASK_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* Masked Image Container - No border, backing, or outer rectangle */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden"
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
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out"
          style={{ objectPosition }}
        />
      </div>
    </div>
  );
}
