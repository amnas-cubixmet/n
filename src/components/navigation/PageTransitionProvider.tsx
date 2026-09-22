"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";

interface PageTransitionContextType {
  triggerTransition: (href: string) => void;
  scrollToSection: (targetHash: string) => void;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  triggerTransition: () => {},
  scrollToSection: () => {},
  isTransitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Universal Navigation Link Component
 * Automatically routes:
 * 1. Same-page hash links (#work, #contact) -> Smooth Section Scroll with cobalt accent
 * 2. Cross-page links (/work, /services) -> Ultra-fast 4-panel Geometric Transition
 * 3. Cross-page hash links (/work#selected-work) -> Transition -> Load Page -> Smooth Settle
 */
export function TransitionLink({
  href,
  children,
  className = "",
  onClick,
  ...props
}: TransitionLinkProps) {
  const { triggerTransition, isTransitioning } = usePageTransition();
  const router = useRouter();

  // Prefetch route on hover to maximize speed
  const handleMouseEnter = () => {
    if (href && href.startsWith("/")) {
      const urlPath = href.split("#")[0];
      if (urlPath) router.prefetch(urlPath);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    if (!isTransitioning) {
      triggerTransition(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * Dedicated Smooth Section Link Component for explicit hash targets
 */
export function SmoothSectionLink({
  target,
  children,
  className = "",
  onClick,
  ...props
}: {
  target: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <TransitionLink href={target} className={className} onClick={onClick} {...props}>
      {children}
    </TransitionLink>
  );
}

interface PanelConfig {
  id: number;
  width: string;
  left: string;
  color: string;
  clipPath: string;
  rotation: string;
  zIndex: number;
}

// 4 ULTRA-LIGHT GPU-FRIENDLY PANELS (3 TONES: #1677FF, #0B5FFF, #0057D9)
const PANELS_CONFIG: PanelConfig[] = [
  {
    id: 1,
    width: "34vw",
    left: "-6vw",
    color: "#0057D9",
    clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
    rotation: "-1deg",
    zIndex: 1,
  },
  {
    id: 2,
    width: "36vw",
    left: "20vw",
    color: "#0B5FFF",
    clipPath: "polygon(12% 0, 92% 0, 100% 100%, 0 100%)",
    rotation: "+1deg",
    zIndex: 2,
  },
  {
    id: 3,
    width: "36vw",
    left: "48vw",
    color: "#1677FF",
    clipPath: "polygon(0 0, 88% 0, 100% 100%, 14% 100%)",
    rotation: "-0.8deg",
    zIndex: 3,
  },
  {
    id: 4,
    width: "32vw",
    left: "76vw",
    color: "#0057D9",
    clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%)",
    rotation: "+1.2deg",
    zIndex: 4,
  },
];

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pendingHrefRef = useRef<string | null>(null);

  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  // Smooth Section Scroll Helper with Header Offset calculation
  const scrollToSection = useCallback(
    (targetHash: string) => {
      const cleanHash = targetHash.startsWith("#") ? targetHash.substring(1) : targetHash;
      if (!cleanHash) return;

      const element =
        document.getElementById(cleanHash) ||
        document.querySelector(`[name="${cleanHash}"]`);

      if (!element) return;

      // Calculate fixed header offset dynamically (standard desktop/mobile ~70px)
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      if (isReducedMotion) {
        window.scrollTo({ top: offsetPosition, behavior: "instant" });
        return;
      }

      // Lightweight 3px cobalt geometric streak line animation across top of viewport
      if (streakRef.current) {
        gsap.fromTo(
          streakRef.current,
          { xPercent: -100, opacity: 1 },
          {
            xPercent: 100,
            duration: 0.45,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(streakRef.current, { opacity: 0, xPercent: -100 });
            },
          }
        );
      }

      // Calculate distance-based smooth scroll duration (near: ~0.7s, far: ~1.0s)
      const distance = Math.abs(window.scrollY - offsetPosition);
      const scrollDuration = Math.min(1.1, Math.max(0.65, (distance / 2000) * 0.9));

      const startY = window.scrollY;
      const diff = offsetPosition - startY;
      let startTime: number | null = null;

      // Smooth custom requestAnimationFrame scroll with gentle cubic easeInOut
      const easeInOutCubic = (t: number): number =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min(1, (timestamp - startTime) / (scrollDuration * 1000));
        const easedProgress = easeInOutCubic(progress);

        window.scrollTo(0, startY + diff * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setIsTransitioning(false);
        }
      };

      setIsTransitioning(true);
      requestAnimationFrame(step);
    },
    [isReducedMotion]
  );

  // REVEAL PHASE: Triggered after destination route mounts
  useEffect(() => {
    if (!pendingHrefRef.current) return;
    const fullHref = pendingHrefRef.current;
    pendingHrefRef.current = null;

    const hashIndex = fullHref.indexOf("#");
    const targetHash = hashIndex !== -1 ? fullHref.substring(hashIndex) : null;

    if (!targetHash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    const validPanels = panelRefs.current.filter(Boolean);
    const container = containerRef.current;

    if (isReducedMotion) {
      if (container) {
        gsap.to(container, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(container, { display: "none" });
            setIsTransitioning(false);
            if (targetHash) scrollToSection(targetHash);
          },
        });
      } else {
        setIsTransitioning(false);
        if (targetHash) scrollToSection(targetHash);
      }
      return;
    }

    // Double requestAnimationFrame ensures Safari & Chrome parse new DOM before exit reveal
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gsap.to(validPanels, {
          xPercent: 220,
          duration: 0.42,
          stagger: 0.03,
          ease: "power3.inOut",
          onComplete: () => {
            if (container) gsap.set(container, { display: "none" });
            setIsTransitioning(false);
            if (targetHash) {
              setTimeout(() => {
                scrollToSection(targetHash);
              }, 50);
            }
          },
        });
      });
    });
  }, [pathname, isReducedMotion, scrollToSection]);

  // UNIFIED NAVIGATION CONTROLLER
  const triggerTransition = useCallback(
    (href: string) => {
      if (isTransitioning) return;

      // Extract target path and hash
      const [targetPath, targetHash] = href.split("#");
      const currentPath = pathname;

      // Scenario A: SAME PAGE HASH NAVIGATION (e.g. href="#work" or href="/#work" while on "/")
      const isSamePage =
        !targetPath || targetPath === currentPath || (targetPath === "/" && currentPath === "/");

      if (isSamePage && targetHash) {
        scrollToSection(targetHash);
        return;
      }

      // Scenario B: CROSS PAGE NAVIGATION (/work or /work#selected-work)
      setIsTransitioning(true);
      pendingHrefRef.current = href;

      const validPanels = panelRefs.current.filter(Boolean);
      const container = containerRef.current;

      if (isReducedMotion) {
        if (container) {
          gsap.set(container, { display: "block", opacity: 0 });
          gsap.to(container, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
              router.push(targetPath || "/");
            },
          });
        } else {
          router.push(targetPath || "/");
        }
        return;
      }

      if (container) gsap.set(container, { display: "block", opacity: 1 });

      // Hardware-accelerated GPU setup: xPercent -220%
      gsap.set(validPanels, { xPercent: -220 });

      // Fast 0.42s entry sweep
      gsap.to(validPanels, {
        xPercent: 0,
        duration: 0.42,
        stagger: 0.03,
        ease: "power3.inOut",
        onComplete: () => {
          router.push(targetPath || "/");
        },
      });
    },
    [isTransitioning, pathname, router, isReducedMotion, scrollToSection]
  );

  return (
    <PageTransitionContext.Provider
      value={{ triggerTransition, scrollToSection, isTransitioning }}
    >
      {children}

      {/* LIGHTWEIGHT GEOMETRIC STREAK ACCENT FOR SAME-PAGE SECTION SCROLL */}
      <div
        ref={streakRef}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#1677FF] z-[99998] pointer-events-none opacity-0"
        style={{
          transform: "translate3d(-100%, 0, 0)",
          willChange: "transform",
        }}
      />

      {/* GLOBAL GEOMETRIC SHAPE TRANSITION OVERLAY FOR PAGE NAVIGATION */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden hidden"
      >
        {PANELS_CONFIG.map((config, index) => (
          <div
            key={config.id}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            className="absolute top-0 bottom-0 h-full shadow-none border-none"
            style={{
              left: config.left,
              width: config.width,
              backgroundColor: config.color,
              clipPath: config.clipPath,
              transform: `translate3d(0, 0, 0) rotate(${config.rotation})`,
              willChange: "transform",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
              zIndex: config.zIndex,
            }}
          />
        ))}
      </div>
    </PageTransitionContext.Provider>
  );
}




