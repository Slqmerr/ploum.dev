"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Momentum smooth-scroll driven through GSAP's ticker, so Lenis and every
// ScrollTrigger (the pinned work wall, about-band scrub, curtain footer,
// progress rail) share one loop and stay in sync.
export default function SmoothScroll() {
  useEffect(() => {
    // Respect reduced motion: keep native (instant) scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      // expo-out: quick take-off, long glide to a stop.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Lenis feeds real time; disable GSAP's frame-skip compensation so
    // ScrollTrigger never lags behind the smoothed position.
    gsap.ticker.lagSmoothing(0);

    // Route same-page anchor clicks through Lenis — native jumps would be
    // instant and bypass the easing. Handles both "#x" and "/#x" (the latter
    // only when already on that path); cross-page links navigate normally.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || !href.includes("#")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
