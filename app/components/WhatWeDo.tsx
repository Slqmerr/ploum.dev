"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Giant section title. Each line enters from an alternating side — left,
// right, left — converging onto the centered stack as it scrolls into view.
// "We" breaks the grid: an oversized artistic serif, italic, pulled with
// negative margins so it collides into the sans lines above and below, and
// left-aligned inside a full-bleed row (the section cancels the page's side
// padding) so its left edge bleeds to the screen edge while "What"/"Do" stay
// centered. Solid
// white fill with mix-blend-difference inverts it against whatever is behind —
// black where it crosses the white/cream background, and it punches straight
// through the black What/Do where they overlap — maximum contrast.
const LINES = [
  {
    text: "What",
    dir: -1,
    className:
      "text-[clamp(3rem,13vw,12rem)] tracking-[-0.03em] uppercase",
  },
  {
    text: "We",
    dir: 1,
    className:
      "font-artistic relative z-10 -left-[0.08em] -my-[0.34em] text-left text-[clamp(4.5rem,18vw,21rem)] italic tracking-[-0.02em] text-white mix-blend-difference",
  },
  {
    text: "Do",
    dir: -1,
    className:
      "text-[clamp(3rem,13vw,12rem)] tracking-[-0.03em] uppercase",
  },
];

// The payoff to the title's question. Three disciplines mirror the /services
// chapters exactly (Development / Motion / Design) so the answer stays honest
// and links straight through. Each row's one-line description is inline on
// mobile and fades in on hover on desktop.
const CAPABILITIES = [
  {
    n: "01",
    label: "Development",
    desc: "React, Next.js & TypeScript, end to end.",
  },
  {
    n: "02",
    label: "Motion",
    desc: "GSAP-driven interfaces that feel alive.",
  },
  {
    n: "03",
    label: "Brand Design",
    desc: "Type, timing & detail — accessible by default.",
  },
];

export default function WhatWeDo() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Leave the lines and rows in their resting position — no slide/fade.
        gsap.set(".wwd-line, .wwd-row", { clearProps: "all" });
        return;
      }

      const lines = gsap.utils.toArray<HTMLElement>(".wwd-line", scope.current);
      const title = scope.current!.querySelector<HTMLElement>(".wwd-title")!;

      // Scrubbed: the reveal's progress is tied to the scroll position, so it
      // plays in as the title rises to center and cleanly reverses back out as
      // you scroll up — genuinely reversible, not a one-way trigger.
      gsap.from(lines, {
        // Start fully off its own edge of the viewport, then settle to center.
        x: (_i, el) =>
          (el as HTMLElement).dataset.dir === "-1"
            ? -window.innerWidth
            : window.innerWidth,
        opacity: 0,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: title,
          start: "top bottom", // title's top enters from the bottom edge
          end: "center center", // fully assembled when centered in view
          scrub: 1,
        },
      });

      // The capabilities list gets its own reversible scrubbed reveal, anchored
      // lower in the section: rows rise and fade in on scroll-down and cleanly
      // reverse back out on scroll-up.
      const rows = gsap.utils.toArray<HTMLElement>(".wwd-row", scope.current);
      gsap.from(rows, {
        y: 44,
        opacity: 0,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".wwd-list",
          start: "top bottom",
          end: "center center",
          scrub: 1,
        },
      });
    },
    { scope }
  );

  return (
    <section
      ref={scope}
      id="what"
      className="-mx-4 flex min-h-svh flex-col items-center justify-start overflow-hidden pt-[10vh] pb-[12vh] md:-mx-8"
    >
      <h2 className="wwd-title w-full text-center leading-[0.85] font-black select-none">
        {LINES.map(({ text, dir, className }) => (
          <span
            key={text}
            data-dir={dir}
            className={`wwd-line block will-change-transform ${className}`}
          >
            {text}
          </span>
        ))}
      </h2>

      <ul className="wwd-list mt-[10vh] w-full max-w-3xl border-b border-black/15 px-6">
        {CAPABILITIES.map(({ n, label, desc }) => (
          <li
            key={label}
            className="wwd-row group border-t border-black/15 will-change-transform"
          >
            <a
              href="/services"
              className="flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:justify-between md:gap-8"
            >
              <span className="flex items-baseline gap-3 md:shrink-0 md:gap-5">
                <span className="font-mono text-[0.7rem] tabular-nums text-black/40">
                  {n}
                </span>
                {/* nowrap so two-word labels ("Brand Design") stay on the
                    baseline instead of stacking when the row gets tight. */}
                <span className="text-3xl leading-none font-black tracking-[-0.02em] whitespace-nowrap uppercase md:text-5xl">
                  {label}
                </span>
              </span>
              <span className="flex items-center gap-2 text-sm text-black/55 md:min-w-0 md:text-right md:opacity-0 md:transition-opacity md:duration-500 md:group-hover:opacity-100">
                {desc}
                <span className="transition-transform duration-500 group-hover:translate-x-1">
                  ↗
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
