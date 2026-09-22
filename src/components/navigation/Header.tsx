"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/#intro" },
  { label: "Who We Are", href: "/#whoweare" },
  { label: "Let's talk →", href: "/#contact", isAccent: true },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const navOverlayRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<(HTMLAnchorElement | HTMLSpanElement | null)[]>([]);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const scrollPositionRef = useRef<number>(0);

  // Keyboard accessibility for Menu overlay (Escape key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen && !isAnimating) {
        handleToggleMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, isAnimating]);

  // Focus trap for Menu overlay when open
  useEffect(() => {
    if (menuOpen && navOverlayRef.current) {
      const focusableElements = navOverlayRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [menuOpen]);

  // Calculate exact button center coordinates relative to viewport for pixel-perfect clip-path origin
  const getButtonCenterPoint = useCallback(() => {
    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return { cx: Math.round(cx), cy: Math.round(cy) };
    }
    // Fallback if button ref unavailable
    return { cx: window.innerWidth - 44, cy: 44 };
  }, []);

  // Build reversible GSAP timeline for Menu expansion originating from button
  const toggleMenuAnimation = useCallback((open: boolean) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const overlay = navOverlayRef.current;
    const links = navLinksRef.current.filter(Boolean);

    if (!overlay) {
      setIsAnimating(false);
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReduced = motionQuery.matches;
    const isMobile = window.innerWidth <= 768;

    const { cx, cy } = getButtonCenterPoint();
    // Calculate radius to cover farthest corner of screen
    const maxDimX = Math.max(cx, window.innerWidth - cx);
    const maxDimY = Math.max(cy, window.innerHeight - cy);
    const maxRadius = Math.ceil(Math.hypot(maxDimX, maxDimY));

    const initialClip = `circle(0px at ${cx}px ${cy}px)`;
    const fullClip = `circle(${maxRadius}px at ${cx}px ${cy}px)`;

    if (open) {
      // 1. Lock body scroll safely without jumping to page top on iOS Safari
      scrollPositionRef.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      setMenuOpen(true);

      if (isReduced) {
        gsap.set(overlay, { display: "flex", opacity: 0, clipPath: "none" });
        gsap.to(overlay, {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
          onComplete: () => setIsAnimating(false),
        });
        return;
      }

      gsap.set(overlay, {
        display: "flex",
        opacity: 1,
        clipPath: initialClip,
        willChange: "clip-path",
      });

      gsap.set(links, {
        opacity: 0,
        y: isMobile ? 14 : 18,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { willChange: "auto" });
          setIsAnimating(false);
        },
      });

      tlRef.current = tl;

      // Surface expands smoothly from exact menu button position
      tl.to(overlay, {
        clipPath: fullClip,
        duration: isMobile ? 0.55 : 0.7,
        ease: "power3.inOut",
      });

      // Navigation links reveal sequentially with stagger (opacity: 0 -> 1, y: 18px -> 0, stagger: 0.055s, duration: 0.45s)
      tl.to(
        links,
        {
          opacity: 1,
          y: 0,
          duration: isMobile ? 0.38 : 0.45,
          stagger: 0.055,
          ease: "power3.out",
        },
        "-=0.3"
      );
    } else {
      // Close Menu sequence using collapse back to button position
      if (isReduced) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(overlay, { display: "none" });
            setMenuOpen(false);
            setIsAnimating(false);
            // Unlock body scroll safely restoring exact scroll Y
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            window.scrollTo(0, scrollPositionRef.current);
          },
        });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: "none", willChange: "auto" });
          setMenuOpen(false);
          setIsAnimating(false);

          // Restore scroll position safely
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          document.body.style.overflow = "";
          window.scrollTo(0, scrollPositionRef.current);
        },
      });

      tl.to(links, {
        opacity: 0,
        y: isMobile ? 10 : 14,
        duration: 0.25,
        stagger: 0.03,
        ease: "power2.in",
      });

      tl.to(
        overlay,
        {
          clipPath: initialClip,
          duration: isMobile ? 0.45 : 0.55,
          ease: "power3.inOut",
        },
        "-=0.15"
      );
    }
  }, [isAnimating, getButtonCenterPoint]);

  const handleToggleMenu = () => {
    if (isAnimating) return;
    toggleMenuAnimation(!menuOpen);
  };

  const handleLinkClick = () => {
    if (menuOpen && !isAnimating) {
      toggleMenuAnimation(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-none shadow-none pointer-events-none transition-all duration-200">
      {/* HEADER BAR: Floating MENU Button positioned at top-right */}
      <div className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] flex items-center justify-end pointer-events-auto">
        <button
          id="header-menu-button"
          ref={menuBtnRef}
          onClick={handleToggleMenu}
          disabled={isAnimating}
          aria-expanded={menuOpen}
          aria-controls="nav-dialog"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="header-menu-button relative z-[100] inline-flex items-center justify-center gap-2.5 bg-[#1677FF] hover:bg-[#1677FF]/90 active:bg-blue-700 text-white min-w-[44px] min-h-[44px] px-3.5 py-2.5 m-0 leading-none rounded-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-lg select-none touch-action-manipulation"
        >
          <span className="hidden md:inline text-[11px] sm:text-xs font-semibold uppercase tracking-wider leading-none font-sans">
            {menuOpen ? "CLOSE" : "MENU"}
          </span>

          {/* TWO-LINE ICON (Animated to X when open) */}
          <span className="relative w-4 h-3.5 flex flex-col justify-between items-center pointer-events-none">
            <span
              className={`block w-4 h-[1.5px] bg-white transition-transform duration-300 origin-center ${
                menuOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-4 h-[1.5px] bg-white transition-transform duration-300 origin-center ${
                menuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* FULL VIEWPORT PRIMARY BLUE NAVIGATION MENU PANEL */}
      <div
        id="nav-dialog"
        ref={navOverlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className="fixed inset-0 w-full h-[100dvh] z-[90] bg-[#1677FF] text-white hidden flex-col justify-between p-6 sm:p-12 pt-[max(5rem,env(safe-area-inset-top)+3rem)] pb-[max(2.5rem,env(safe-area-inset-bottom))] overflow-hidden pointer-events-auto shadow-2xl"
      >
        <div
          ref={navContainerRef}
          className="max-w-7xl w-full mx-auto my-auto flex flex-col justify-center gap-6 sm:gap-8"
        >
          {/* Metadata Top Header */}
          <div className="flex items-center gap-3 border-b border-white/20 pb-4 mb-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/80">
              NORTHFRAME DIRECTORY
            </span>
          </div>

          {/* Sequential Menu Links */}
          <nav className="flex flex-col gap-4 sm:gap-7 text-4xl sm:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-white">
            {NAV_ITEMS.map((item, idx) => (
              <TransitionLink
                key={item.label}
                ref={(el) => {
                  navLinksRef.current[idx] = el as HTMLAnchorElement;
                }}
                href={item.href}
                onClick={handleLinkClick}
                className={`w-fit transition-colors duration-200 hover:text-white/80 ${
                  item.isAccent ? "text-white underline underline-offset-8 decoration-white/40" : ""
                }`}
              >
                {item.label}
              </TransitionLink>
            ))}
          </nav>
        </div>

        {/* Footer Meta Details */}
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/20 pt-4 text-white/80 font-mono text-xs tracking-widest gap-2">
          <span>CREATIVE DIGITAL AGENCY</span>
          <span>© {new Date().getFullYear()} NORTHFRAME</span>
        </div>
      </div>
    </header>
  );
}





