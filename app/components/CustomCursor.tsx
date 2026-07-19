"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Mouse-driven cursor only: touch devices and reduced-motion users keep
    // the native cursor (the dot stays hidden via its opacity-0 class).
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const dot = dotRef.current!;
    document.documentElement.classList.add("custom-cursor");
    gsap.set(dot, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.set(dot, { x: e.clientX, y: e.clientY, autoAlpha: 1 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    // Grows over anything interactive; mouseover fires on every target
    // change, so this also shrinks back on leaving.
    const over = (e: MouseEvent) => {
      const interactive = (e.target as Element).closest?.(
        "a, button, [data-cursor]"
      );
      gsap.to(dot, {
        scale: interactive ? 2.6 : 1,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const hide = () => gsap.to(dot, { autoAlpha: 0, duration: 0.2 });
    const show = () => {
      if (shown) gsap.to(dot, { autoAlpha: 1, duration: 0.2 });
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.documentElement.addEventListener("mouseleave", hide);
    document.documentElement.addEventListener("mouseenter", show);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.documentElement.removeEventListener("mouseenter", show);
      document.documentElement.classList.remove("custom-cursor");
    };
  });

  return (
    // White + difference: the dot renders as ink over the cream page and
    // flips to white over the black band / dark imagery, like the header.
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 h-3 w-3 rounded-full bg-white opacity-0 mix-blend-difference will-change-transform"
    />
  );
}
