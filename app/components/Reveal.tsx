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

// Horizontal slide-in distance for the entrance, in px.
const ENTRANCE_X = 35;

// Entrance mask for each line, applied as a clip-path so it never affects
// layout: tight at the bottom (chars rise out of it), generous everywhere
// else so nothing is chopped mid-flight — top covers the hover hop and the
// italic serif's ascenders (the "i" dot), left covers the x slide-in, right
// covers hover rotation. clip-path instead of overflow because Safari keeps
// stale layer clips on transform-animated chars when an ancestor's overflow
// is toggled, leaving glyphs sliced long after the mask is gone.
const LINE_MASK = `inset(-0.35em -0.15em 0 -${ENTRANCE_X}px)`;

// Minimum time between hover-triggered sweeps on the same word, so
// waving the cursor around doesn't spam the effect. Keep this short:
// anything much longer makes deliberate re-hovers feel broken.
const SWEEP_COOLDOWN_MS = 600;

export default function Reveal({
  lines,
  delay = 0,
  className = "",
  highlight = false,
  artisticWords = [],
}: {
  lines: string[];
  delay?: number;
  className?: string;
  highlight?: boolean;
  /** Words that swap to the artistic italic serif while hovered */
  artisticWords?: string[];
}) {
  const scope = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".reveal-char", { clearProps: "transform" });
        gsap.set(".reveal-line", { clipPath: "none" });
        return;
      }

      const cleanups: (() => void)[] = [];

      // The mask has done its job once the letters have landed, and the
      // sweep-overlay selection block bleeds past even LINE_MASK's bottom
      // edge — so remove it entirely, and demote the chars: clearing the
      // landed transforms and will-change drops their composited layers, so
      // no stale layer clip can outlive the mask (Safari especially).
      const dropMask = () => {
        gsap.set(".reveal-line", { clipPath: "none" });
        gsap.set(".reveal-char", { clearProps: "transform" });
        gsap.set(".reveal-char", { willChange: "auto" });
      };

      const enableHighlight = () => {
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

      const enableArtisticHover = () => {
        const words = gsap.utils.toArray<HTMLElement>(
          ".artistic-word",
          scope.current
        );

        words.forEach((word) => {
          if (!contextSafe) return;
          const chars = word.querySelectorAll<HTMLElement>(".reveal-char");
          // Listen on the non-moving hit-area, not the animating word.
          const hit =
            word.querySelector<HTMLElement>(".artistic-hit") ?? word;
          let tl: gsap.core.Timeline | null = null;

          // Each letter hops, swaps typeface at the apex, and lands with a
          // small bounce — cascading left to right. Leaving runs the same
          // cascade back to the sans. Killing the previous timeline lets a
          // mid-cascade reversal pick up from wherever each letter is.
          const cascade = contextSafe((artistic: boolean) => {
            tl?.kill();
            tl = gsap.timeline();
            chars.forEach((char, i) => {
              const at = i * 0.04;
              tl!
                .to(
                  char,
                  {
                    yPercent: -18,
                    rotation: artistic ? -8 : 8,
                    duration: 0.12,
                    ease: "power2.out",
                    onComplete: () =>
                      char.classList.toggle("artistic-char", artistic),
                  },
                  at
                )
                .to(
                  char,
                  {
                    yPercent: 0,
                    rotation: 0,
                    duration: 0.25,
                    ease: "back.out(2.5)",
                  },
                  at + 0.12
                );
            });
          });

          // Debounce hover intent: a short dwell must pass, and only the
          // final enter/leave state runs a cascade. This kills the spam when
          // a letter's hop momentarily slips out from under the cursor
          // (enter/leave oscillation) and the jitter of rapid in-out swaps.
          const DWELL_MS = 160;
          let applied = false;
          let desired = false;
          let timer: number | null = null;

          const settle = () => {
            timer = null;
            if (desired !== applied) {
              applied = desired;
              cascade(applied);
            }
          };
          const schedule = () => {
            if (timer === null) timer = window.setTimeout(settle, DWELL_MS);
          };

          const onEnter = () => {
            desired = true;
            schedule();
          };
          const onLeave = () => {
            desired = false;
            schedule();
          };

          hit.addEventListener("mouseenter", onEnter);
          hit.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            hit.removeEventListener("mouseenter", onEnter);
            hit.removeEventListener("mouseleave", onLeave);
            if (timer !== null) window.clearTimeout(timer);
            tl?.kill();
          });

          if (hit.matches(":hover")) onEnter();
        });
      };

      // y: 0 clears the inline translateY(115%) no-flash fallback, which GSAP
      // would otherwise parse as a lingering pixel offset.
      gsap.fromTo(
        ".reveal-char",
        { yPercent: 115, y: 0, x: -ENTRANCE_X },
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
          onComplete: () => {
            dropMask();
            if (highlight) enableHighlight();
            enableArtisticHover();
          },
        }
      );

      return () => cleanups.forEach((fn) => fn());
    },
    { scope }
  );

  return (
    <span ref={scope} className={`block ${className}`}>
      {lines.map((line) => (
        <span
          key={line}
          className="reveal-line block"
          style={{ clipPath: LINE_MASK }}
        >
          {line.split(" ").map((word, wi, words) => (
            <Fragment key={wi}>
              <span
                className={`relative inline-block whitespace-nowrap ${
                  artisticWords.includes(word)
                    ? "artistic-word motion-reduce:hover:font-artistic motion-reduce:hover:normal-case motion-reduce:hover:italic"
                    : ""
                }`}
              >
                {[...word].map((char, ci) => (
                  <span
                    key={ci}
                    className="reveal-char inline-block will-change-transform"
                    style={{ transform: "translateY(115%)" }}
                  >
                    {char}
                  </span>
                ))}
                {/* Artistic words trade the selection sweep for the italic
                    serif swap alone — no block behind the glyphs. */}
                {highlight && !artisticWords.includes(word) && (
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
                {/* Stable hover hit-area: the letters hop underneath it, so
                    what's under the cursor never moves — no enter/leave
                    oscillation at the edges. */}
                {artisticWords.includes(word) && (
                  <span
                    aria-hidden
                    className="artistic-hit absolute z-10"
                    style={{ inset: `-${BLEED_Y} -${BLEED_X}` }}
                  />
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
