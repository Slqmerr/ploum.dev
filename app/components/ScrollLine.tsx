"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// A single thin diagonal that draws itself across the viewport as you scroll
// from the "What We Do" title down to the manifesto band, then fades as the
// manifesto passes on. It's *fixed* to the viewport, so the stroke visibly
// travels across the screen instead of scrolling past with the page — that's
// what makes the draw readable. Scrubbed, so it reverses cleanly on scroll-up.
// White stroke + mix-blend-difference so it reads on both the cream page and
// the black bands it crosses.
export default function ScrollLine() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current!;
      const svg = svgRef.current!;
      const path = pathRef.current!;
      const startEl = document.getElementById("what");
      const endEl = document.getElementById("manifesto");
      if (!startEl || !endEl) return;

      let len = 0;

      // Rebuild the diagonal in real viewport pixels so the stroke keeps one
      // uniform width and the dash-based draw renders as a single unbroken
      // line. A long descending slash, out from the left edge down to the
      // lower right — kept off the exact corners so it reads as a deliberate
      // stroke, not a border rule.
      const build = () => {
        const W = window.innerWidth;
        const H = window.innerHeight;
        path.setAttribute("d", `M 0 ${H * 0.22} L ${W * 0.66} ${H * 0.9}`);
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len });
      };
      build();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(path, { strokeDashoffset: 0 }); // resting state: fully drawn
        return;
      }

      gsap.set(path, { strokeDashoffset: len }); // start empty

      // Draw in across the what → manifesto stretch.
      gsap.fromTo(
        path,
        { strokeDashoffset: () => len },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: startEl,
            start: "top top",
            endTrigger: endEl,
            end: "top top",
            scrub: 1,
            invalidateOnRefresh: true,
            onRefreshInit: build, // rebuild before the tween re-reads len
          },
        }
      );

      // Fade the whole thing out as the manifesto scrolls up and away, so the
      // line never lingers over the sections below. Reverses on scroll-up.
      gsap.fromTo(
        wrap,
        { autoAlpha: 1 },
        {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: endEl,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: wrapRef }
  );

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 mix-blend-difference"
    >
      <svg
        ref={svgRef}
        className="h-full w-full"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          ref={pathRef}
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
