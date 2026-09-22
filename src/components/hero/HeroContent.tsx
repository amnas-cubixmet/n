"use client";

import React from "react";
import Image from "next/image";
import ServiceList, { ServiceItemData } from "./ServiceList";

interface HeroContentProps {
  logoWrapperRef: React.RefObject<HTMLDivElement | null>;
  servicesContainerRef?: React.RefObject<HTMLDivElement | null>;
  serviceItemsRef: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
  services?: ServiceItemData[];
}

export default function HeroContent({
  logoWrapperRef,
  servicesContainerRef,
  serviceItemsRef,
  services,
}: HeroContentProps) {
  return (
    <div className="heroBottom absolute z-[3] pointer-events-none flex items-start">
      <div
        ref={logoWrapperRef}
        className="hero-logo-wrapper pointer-events-auto shrink-0 select-none opacity-0"
      >
        <Image
          src="/images/brand/northframe-logo.webp"
          alt="NORTHFRAME"
          width={700}
          height={116}
          priority
          sizes="(max-width: 768px) 76vw, (max-width: 1200px) 38vw, 520px"
          className="block h-auto w-full object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
        />
      </div>

      <ServiceList
        services={services}
        serviceItemsRef={serviceItemsRef}
        containerRef={servicesContainerRef}
      />
    </div>
  );
}
