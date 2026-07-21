"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollProgress() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // The rail is scroll feedback (like a scrollbar), so it stays active
      // under reduced motion — only the catch-up smoothing is dropped.
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Fill tracks total page scroll: 0 at the top, full at max scroll.
      gsap.fromTo(
        ".progress-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: "max",
            scrub: reduced ? true : 0.3,
          },
        }
      );

      const count = scope.current?.querySelector(".progress-count");
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (count) {
            count.textContent = String(
              Math.round(self.progress * 100)
            ).padStart(3, "0");
          }
        },
      });
    },
    { scope }
  );

  return (
    // z-20 keeps it under the curtain footer (z-30) so the glass sheet
    // sweeps over it at the end of the page. Bottom-anchored to stay clear
    // of the hero's social links; tabular-nums keeps the vertical label a
    // constant length so counter ticks can't reflow the column.
    // mix-blend-difference (white base) matches the header/cursor: near-black
    // over the cream page, flipping white over the black about band —
    // requires no stacking context between here and main (see page.tsx).
    <div
      ref={scope}
      aria-hidden
      className="fixed right-3 bottom-6 z-20 hidden flex-col items-center gap-3 text-white mix-blend-difference select-none md:flex"
    >
      <span className="text-[0.6rem] font-bold tracking-[0.35em] uppercase tabular-nums [writing-mode:vertical-rl]">
        Scroll — <span className="progress-count">000</span>%
      </span>
      <span className="block h-[30vh] w-0.5 bg-white/20">
        <span className="progress-fill block h-full w-full origin-top scale-y-0 bg-white will-change-transform" />
      </span>
    </div>
  );
}
