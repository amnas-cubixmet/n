"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/#intro" },
  { label: "Who We Are", href: "/#founded-on-a-vision" },
  { label: "Let's talk →", href: "/#contact", isAccent: true },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const navPanelRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const panel = navPanelRef.current;
    if (!panel) return;

    gsap.set(panel, {
      autoAlpha: 0,
      scale: 0.16,
      transformOrigin: "top right",
      pointerEvents: "none",
    });

    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  const animateMenu = useCallback(
    (open: boolean) => {
      if (isAnimating) return;

      const panel = navPanelRef.current;
      if (!panel) return;

      const links = navLinksRef.current.filter(
        (link): link is HTMLAnchorElement => Boolean(link)
      );
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const mobile = window.innerWidth <= 768;

      timelineRef.current?.kill();
      setIsAnimating(true);

      if (open) {
        setMenuOpen(true);

        gsap.set(panel, {
          visibility: "visible",
          pointerEvents: "auto",
          transformOrigin: "top right",
        });

        if (reducedMotion) {
          gsap.set(panel, { scale: 1 });
          gsap.to(panel, {
            autoAlpha: 1,
            duration: 0.16,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(links, { autoAlpha: 1, y: 0 });
              setIsAnimating(false);
            },
          });
          return;
        }

        gsap.set(panel, {
          autoAlpha: 1,
          scale: mobile ? 0.13 : 0.16,
          force3D: true,
          willChange: "transform, opacity",
        });

        gsap.set(links, {
          autoAlpha: 0,
          y: mobile ? 12 : 16,
        });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(panel, { willChange: "auto" });
            setIsAnimating(false);
          },
        });

        timelineRef.current = tl;

        tl.to(panel, {
          scale: 1,
          duration: mobile ? 0.48 : 0.56,
          ease: "power3.inOut",
          force3D: true,
        }).to(
          links,
          {
            autoAlpha: 1,
            y: 0,
            duration: mobile ? 0.3 : 0.36,
            stagger: 0.045,
            ease: "power3.out",
          },
          "-=0.22"
        );
      } else {
        if (reducedMotion) {
          gsap.to(panel, {
            autoAlpha: 0,
            duration: 0.14,
            ease: "power2.in",
            onComplete: () => {
              gsap.set(panel, {
                scale: 0.16,
                visibility: "hidden",
                pointerEvents: "none",
              });
              setMenuOpen(false);
              setIsAnimating(false);
              menuBtnRef.current?.focus();
            },
          });
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(panel, {
              autoAlpha: 0,
              scale: mobile ? 0.13 : 0.16,
              visibility: "hidden",
              pointerEvents: "none",
              willChange: "auto",
            });
            setMenuOpen(false);
            setIsAnimating(false);
            menuBtnRef.current?.focus();
          },
        });

        timelineRef.current = tl;

        tl.to(links, {
          autoAlpha: 0,
          y: mobile ? 8 : 10,
          duration: 0.18,
          stagger: 0.025,
          ease: "power2.in",
        }).to(
          panel,
          {
            scale: mobile ? 0.13 : 0.16,
            autoAlpha: 0,
            duration: mobile ? 0.36 : 0.42,
            ease: "power3.inOut",
            force3D: true,
          },
          "-=0.08"
        );
      }
    },
    [isAnimating]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen && !isAnimating) {
        animateMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [animateMenu, isAnimating, menuOpen]);

  const handleToggleMenu = () => {
    if (!isAnimating) {
      animateMenu(!menuOpen);
    }
  };

  const handleLinkClick = () => {
    if (menuOpen && !isAnimating) {
      animateMenu(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full pointer-events-none">
      <div className="relative w-full max-w-[1920px] mx-auto p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] flex justify-end pointer-events-auto">
        <button
          id="header-menu-button"
          ref={menuBtnRef}
          type="button"
          onClick={handleToggleMenu}
          disabled={isAnimating}
          aria-expanded={menuOpen}
          aria-controls="northframe-menu-panel"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="header-menu-button relative z-[110] inline-flex min-w-[44px] min-h-[44px] items-center justify-center gap-2.5 bg-[#1677FF] px-3.5 py-2.5 text-white rounded-none select-none touch-action-manipulation cursor-pointer disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <span className="hidden md:inline font-mono text-[10px] font-semibold uppercase tracking-[0.12em] leading-none">
            {menuOpen ? "CLOSE" : "MENU"}
          </span>

          <span className="relative block w-4 h-3 pointer-events-none">
            <span
              className={
                "absolute left-0 top-[2px] block w-4 h-[1.5px] bg-white origin-center transition-transform duration-300 " +
                (menuOpen ? "translate-y-[3.5px] rotate-45" : "")
              }
            />
            <span
              className={
                "absolute left-0 bottom-[2px] block w-4 h-[1.5px] bg-white origin-center transition-transform duration-300 " +
                (menuOpen ? "-translate-y-[3.5px] -rotate-45" : "")
              }
            />
          </span>
        </button>

        <div
          id="northframe-menu-panel"
          ref={navPanelRef}
          aria-hidden={!menuOpen}
          className="fixed z-[100] overflow-hidden bg-[#1677FF] text-white pointer-events-none invisible shadow-none"
          style={{
            top: "max(1rem, env(safe-area-inset-top))",
            right: "max(1rem, env(safe-area-inset-right))",
            width: "min(258px, calc(100vw - 28px))",
            minHeight: "272px",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex min-h-[272px] flex-col px-5 pt-4 pb-5">
            <div className="flex items-center justify-between pr-12 font-mono text-[9px] uppercase tracking-[0.08em] leading-none text-white/90">
              <span>NORTHFRAME</span>
              <span>MENU</span>
            </div>

            <nav
              aria-label="Primary navigation"
              className="mt-7 flex flex-1 flex-col items-start justify-center gap-[4px]"
            >
              {NAV_ITEMS.map((item, index) => (
                <TransitionLink
                  key={item.label}
                  ref={(element) => {
                    navLinksRef.current[index] = element;
                  }}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={
                    "block w-fit font-montserrat text-[23px] sm:text-[24px] font-medium uppercase tracking-[-0.055em] leading-[0.98] text-white transition-opacity duration-150 hover:opacity-70 " +
                    (item.isAccent ? "mt-1" : "")
                  }
                >
                  {item.label}
                  <sup className="ml-1 align-top font-mono text-[8px] tracking-normal text-white/80">
                    {String(index + 1).padStart(2, "0")}
                  </sup>
                </TransitionLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
