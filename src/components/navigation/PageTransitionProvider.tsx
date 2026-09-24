"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface PageTransitionContextType {
  triggerTransition: (href: string) => void;
  scrollToSection: (targetHash: string) => boolean;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  triggerTransition: () => {},
  scrollToSection: () => false,
  isTransitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const TransitionLink = React.forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, children, onClick, ...props }, ref) {
    const pathname = usePathname();
    const { triggerTransition } = usePageTransition();
    const [targetPath, hash] = href.split("#");

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        props.target === "_blank" ||
        props.download
      ) return;

      // Link still prefetches visible routes; navigation begins on this click
      // rather than waiting for the old page's exit animation.
      event.preventDefault();
      triggerTransition(!targetPath && hash ? `${pathname}#${hash}` : href);
    };

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        scroll={hash ? false : undefined}
        {...props}
      >
        {children}
      </Link>
    );
  }
);
TransitionLink.displayName = "TransitionLink";

export function SmoothSectionLink({
  target,
  children,
  ...props
}: Omit<TransitionLinkProps, "href"> & { target: string }) {
  return <TransitionLink href={target} {...props}>{children}</TransitionLink>;
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pendingHashRef = useRef<string | null>(null);

  const scrollToSection = useCallback((targetHash: string) => {
    const id = decodeURIComponent(targetHash.replace(/^#/, ""));
    const target = document.getElementById(id);
    if (!target) return false;

    const headerOffset = window.innerWidth <= 768 ? 56 : 70;
    window.scrollTo({
      top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset),
      behavior: "instant",
    });
    return true;
  }, []);

  // The destination can mount a frame after the layout. Wait for the anchor,
  // never for an animation before starting the route change.
  useEffect(() => {
    const hash = pendingHashRef.current ?? window.location.hash;
    if (!hash) return;

    let frame = 0;
    let attempts = 0;
    const settle = () => {
      if (scrollToSection(hash)) {
        pendingHashRef.current = null;
      } else if (attempts++ < 60) {
        frame = requestAnimationFrame(settle);
      }
    };
    frame = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(frame);
  }, [pathname, scrollToSection]);

  useEffect(() => {
    const restoreHash = () => {
      if (window.location.hash) {
        requestAnimationFrame(() => scrollToSection(window.location.hash));
      }
    };
    window.addEventListener("popstate", restoreHash);
    window.addEventListener("hashchange", restoreHash);
    return () => {
      window.removeEventListener("popstate", restoreHash);
      window.removeEventListener("hashchange", restoreHash);
    };
  }, [scrollToSection]);

  const triggerTransition = useCallback((href: string) => {
    const [targetPath, hash] = href.split("#");
    if (!targetPath || targetPath === pathname) {
      window.history.pushState(window.history.state, "", href);
      if (hash) scrollToSection(hash);
      else window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    pendingHashRef.current = hash ? `#${hash}` : null;
    router.push(href, { scroll: !hash });
  }, [pathname, router, scrollToSection]);

  return (
    <PageTransitionContext.Provider
      value={{ triggerTransition, scrollToSection, isTransitioning: false }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}
