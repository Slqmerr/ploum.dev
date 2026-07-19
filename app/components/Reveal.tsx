"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Sweep states for the selection overlay: hidden at the left edge,
// fully shown, and swept off past the right edge.
const CLIP_HIDDEN = "inset(0% 100% 0% 0%)";
const CLIP_SHOWN = "inset(0% 0% 0% 0%)";
const CLIP_EXITED = "inset(0% 0% 0% 100%)";

// How far the selection block bleeds past the glyphs, mimicking the
// native ::selection box.
const BLEED_Y = "0.07em";
const BLEED_X = "0.045em";

// Minimum time between hover-triggered sweeps on the same word, so
// waving the cursor around doesn't spam the effect. Keep this short:
// anything much longer makes deliberate re-hovers feel broken.
const SWEEP_COOLDOWN_MS = 600;

export default function Reveal({
  lines,
  delay = 0,
  className = "",
  highlight = false,
}: {
  lines: string[];
  delay?: number;
  className?: string;
  highlight?: boolean;
}) {
  const scope = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".reveal-char", { clearProps: "transform" });
        return;
      }

      const cleanups: (() => void)[] = [];

      const enableHighlight = () => {
        // The selection block bleeds past the line box, so drop the
        // reveal mask once the entrance animation is done.
        gsap.set(".reveal-line", { overflow: "visible" });

        const overlays = gsap.utils.toArray<HTMLElement>(
          ".sweep-overlay",
          scope.current
        );

        // One demo pass, like a selection dragged across the words.
        overlays.forEach((overlay, i) => {
          gsap
            .timeline({ delay: i * 0.28 })
            .fromTo(
              overlay,
              { clipPath: CLIP_HIDDEN },
              { clipPath: CLIP_SHOWN, duration: 0.35, ease: "power2.out" }
            )
            .to(overlay, {
              clipPath: CLIP_EXITED,
              duration: 0.35,
              ease: "power2.in",
              delay: 0.15,
            });
        });

        overlays.forEach((overlay) => {
          const word = overlay.parentElement;
          if (!word || !contextSafe) return;

          let lastSweep = -Infinity;
          let sweeping = false;

          const onEnter = contextSafe(() => {
            if (performance.now() - lastSweep < SWEEP_COOLDOWN_MS) return;
            lastSweep = performance.now();
            sweeping = true;
            gsap.fromTo(
              overlay,
              { clipPath: CLIP_HIDDEN },
              {
                clipPath: CLIP_SHOWN,
                duration: 0.4,
                ease: "power3.out",
                overwrite: true,
              }
            );
          });
          const onLeave = contextSafe(() => {
            if (!sweeping) return;
            sweeping = false;
            gsap.to(overlay, {
              clipPath: CLIP_EXITED,
              duration: 0.4,
              ease: "power2.inOut",
              overwrite: true,
            });
          });

          word.addEventListener("mouseenter", onEnter);
          word.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            word.removeEventListener("mouseenter", onEnter);
            word.removeEventListener("mouseleave", onLeave);
          });

          // The cursor may already be resting on the word — its mouseenter
          // fired before the reveal finished and listeners attached — so
          // arm the sweep for it immediately.
          if (word.matches(":hover")) onEnter();
        });
      };

      // y: 0 clears the inline translateY(115%) no-flash fallback, which GSAP
      // would otherwise parse as a lingering pixel offset.
      gsap.fromTo(
        ".reveal-char",
        { yPercent: 115, y: 0, x: -35 },
        {
          yPercent: 0,
          y: 0,
          x: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.04,
          delay,
          scrollTrigger: {
            trigger: scope.current,
            start: "top 92%",
            once: true,
          },
          onComplete: highlight ? enableHighlight : undefined,
        }
      );

      return () => cleanups.forEach((fn) => fn());
    },
    { scope }
  );

  return (
    <span ref={scope} className={`block ${className}`}>
      {lines.map((line) => (
        <span key={line} className="reveal-line block overflow-hidden">
          {line.split(" ").map((word, wi, words) => (
            <Fragment key={wi}>
              <span className="relative inline-block whitespace-nowrap">
                {[...word].map((char, ci) => (
                  <span
                    key={ci}
                    className="reveal-char inline-block will-change-transform"
                    style={{ transform: "translateY(115%)" }}
                  >
                    {char}
                  </span>
                ))}
                {highlight && (
                  <span
                    aria-hidden
                    className="sweep-overlay pointer-events-none absolute bg-black text-background select-none"
                    style={{
                      top: `-${BLEED_Y}`,
                      bottom: `-${BLEED_Y}`,
                      left: `-${BLEED_X}`,
                      right: `-${BLEED_X}`,
                      padding: `${BLEED_Y} ${BLEED_X}`,
                      clipPath: CLIP_HIDDEN,
                    }}
                  >
                    {/* Per-char spans mirror the original's markup: single-char
                        inline-blocks suppress kerning, so plain text here would
                        render narrower and drift left of the glyphs beneath. */}
                    {[...word].map((char, ci) => (
                      <span key={ci} className="inline-block">
                        {char}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              {wi < words.length - 1 && " "}
            </Fragment>
          ))}
        </span>
      ))}
    </span>
  );
}
