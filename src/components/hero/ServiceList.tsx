"use client";

import React from "react";

export interface ServiceItemData {
  id: string;
  name: string;
  href: string;
}

export const defaultServices: ServiceItemData[] = [
  { id: "strategy", name: "STRATEGY", href: "#intro" },
  { id: "brand-identity", name: "BRAND IDENTITY", href: "#whoweare" },
  { id: "digital-marketing", name: "DIGITAL MARKETING", href: "#services" },
  { id: "technology", name: "TECHNOLOGY", href: "#services" },
  { id: "creative-production", name: "CREATIVE PRODUCTION", href: "#expertise" },
];


interface ServiceListProps {
  services?: ServiceItemData[];
  serviceItemsRef?: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
}

export default function ServiceList({
  services = defaultServices,
  serviceItemsRef,
  containerRef,
  isMobile = false,
}: ServiceListProps) {
  return (
    <div
      ref={containerRef}
      className="service-list pointer-events-auto select-none shrink-0"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "3px",
        paddingBottom: isMobile ? "0px" : "3px",
      }}
    >
      <nav aria-label="Disciplines">
        <ul className="flex flex-col items-start gap-[3px] m-0 p-0 list-none">
          {services.map((service, idx) => (
            <li key={service.id} className="m-0 p-0">
              <a
                ref={(el) => {
                  if (serviceItemsRef) {
                    serviceItemsRef.current[idx] = el;
                  }
                }}
                href={service.href}
                className="service-item transition-opacity duration-150 cursor-pointer will-change-transform opacity-0"
                style={{
                  display: "block",
                  width: "fit-content",
                  padding: 0,
                  margin: 0,
                  background: "#ffffff",
                  color: "#111111",
                  border: 0,
                  borderRadius: 0,
                  fontSize: "clamp(12px, 0.9vw, 17px)",
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: 0,
                  textTransform: "uppercase",
                  fontFamily: 'var(--font-montserrat), "Montserrat", sans-serif',
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.75";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {service.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
