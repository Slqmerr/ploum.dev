"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const WORDS = ["Meet", "Ploum"];

// Slow, elegant hero heading: letters ease up out of a soft blur while the
// whole word gently contracts its letter-spacing into place — long smooth
// easing, generous stagger, then it settles and stays still. Letters render
// visible by default so a JS failure leaves a readable static title.
//
// Once the intro settles, "Ploum" swaps typefaces on its own, on a loop: every
// few seconds each letter hops, swaps its brutalist sans for the italic serif
// at the apex, and lands with a small bounce — cascading left to right — then
// after a beat cascades back to the sans. No hover, no pointer; it just cycles.
export default function HeroTitle({ className = "" }: { className?: string }) {
  const scope = useRef<HTMLHeadingElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = scope.current!;
      const letters = gsap.utils.toArray<HTMLElement>(".hero-letter", el);
      if (!letters.length) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return; // stay visible & static; CSS handles the reduced-motion hover
      }

      const cleanups: (() => void)[] = [];

      // Hide on mount (client only); the intro curtain covers the instant.
      gsap.set(letters, { opacity: 0, yPercent: 22, filter: "blur(10px)" });

      // Starts as the intro clears. Both tweens share the same slow ease.
      const tl = gsap.timeline({
        delay: 1.5,
        defaults: { ease: "power2.out" },
        onComplete: startPloumCycle,
      });
      tl.to(
        letters,
        {
          opacity: 1,
          yPercent: 0,
          filter: "blur(0px)",
          duration: 1.6,
          stagger: 0.08,
        },
        0
      );
      tl.fromTo(
        el,
        { letterSpacing: "0.14em" },
        { letterSpacing: "-0.04em", duration: 1.7 },
        0
      );

      function startPloumCycle() {
        const word = el.querySelector<HTMLElement>(".ploum-word");
        if (!word || !contextSafe) return;
        const chars = word.querySelectorAll<HTMLElement>(".ploum-letter");
        let cascadeTl: gsap.core.Timeline | null = null;

        // Each letter hops, swaps typeface at the apex, and lands with a small
        // bounce — cascading left to right. Killing the previous timeline lets
        // a mid-cascade reversal pick up from wherever each letter is.
        const cascade = contextSafe((artistic: boolean) => {
          cascadeTl?.kill();
          cascadeTl = gsap.timeline();
          chars.forEach((char, i) => {
            const at = i * 0.04;
            cascadeTl!
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

        // Cycle the typeface on its own: hold the serif for a beat, then swap
        // back to the sans, and repeat. The interval toggles state so each tick
        // runs the opposite cascade of the last.
        const HOLD_MS = 2600;
        let artistic = false;
        const interval = window.setInterval(() => {
          artistic = !artistic;
          cascade(artistic);
        }, HOLD_MS);

        cleanups.push(() => {
          window.clearInterval(interval);
          cascadeTl?.kill();
        });
      }

      return () => cleanups.forEach((fn) => fn());
    },
    { scope }
  );

  return (
    <h1 ref={scope} className={className}>
      {WORDS.map((word, wi) => {
        const isPloum = word === "Ploum";
        return (
          <span
            key={wi}
            className={
              isPloum ? "ploum-word inline-block" : "inline-block"
            }
          >
            {[...word].map((char, ci) => (
              <span
                key={ci}
                className={`hero-letter inline-block will-change-transform${
                  isPloum ? " ploum-letter" : ""
                }`}
              >
                {char}
              </span>
            ))}
            {wi < WORDS.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        );
      })}
    </h1>
  );
}
