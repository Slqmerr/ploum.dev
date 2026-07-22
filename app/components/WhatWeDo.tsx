"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Giant section title. Each line enters from an alternating side — left,
// right, left — converging onto the centered stack as it scrolls into view.
// "We" breaks the grid: an oversized artistic serif, italic, pulled with
// negative margins so it collides into the sans lines above and below. Solid
// white fill with mix-blend-difference inverts it against whatever is behind —
// black where it crosses the white/cream background, and it punches straight
// through the black What/Do where they overlap — maximum contrast.
const LINES = [
  {
    text: "What",
    dir: -1,
    className:
      "text-[clamp(4rem,17vw,16rem)] tracking-[-0.03em] uppercase",
  },
  {
    text: "We",
    dir: 1,
    className:
      "font-artistic relative z-10 -my-[0.34em] text-[clamp(6rem,23vw,28rem)] italic tracking-[-0.02em] text-white mix-blend-difference",
  },
  {
    text: "Do",
    dir: -1,
    className:
      "text-[clamp(4rem,17vw,16rem)] tracking-[-0.03em] uppercase",
  },
];

export default function WhatWeDo() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Leave the lines in their resting position — no slide.
        gsap.set(".wwd-line", { clearProps: "all" });
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
    },
    { scope }
  );

  return (
    <section
      ref={scope}
      className="flex h-svh flex-col items-center justify-center overflow-hidden"
    >
      <h2 className="wwd-title text-center leading-[0.85] font-black select-none">
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
    </section>
  );
}
