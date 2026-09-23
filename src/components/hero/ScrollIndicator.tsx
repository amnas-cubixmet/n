"use client";

import React from "react";

interface ScrollIndicatorProps {
  labelRef?: React.RefObject<HTMLDivElement | null>;
  lineRef?: React.RefObject<HTMLSpanElement | null>;
}

export default function ScrollIndicator({
  labelRef,
  lineRef,
}: ScrollIndicatorProps) {
  return (
    <div
      ref={labelRef}
      aria-hidden="true"
      className="scroll-indicator-wrapper absolute top-[max(20px,env(safe-area-inset-top))] sm:top-[max(28px,env(safe-area-inset-top))] left-[max(16px,env(safe-area-inset-left))] sm:left-[max(28px,env(safe-area-inset-left))] z-[4] flex items-center gap-[10px] select-none pointer-events-none opacity-0"
    >
      <span
        ref={lineRef}
        className="scroll-indicator-line block bg-[#1677FF] w-[14px] h-[2px] origin-left scale-x-0 will-change-transform"
      />
      <span className="scroll-indicator text-white/90 text-[9.5px] sm:text-[11px] font-medium tracking-[0.22em] uppercase leading-none font-sans">
        SCROLL TO EXPLORE
      </span>
    </div>
  );
}
