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
// Once the intro settles, "Ploum" becomes hoverable: each letter hops, swaps
// its brutalist sans for the italic serif at the apex, and lands with a small
// bounce — cascading left to right. Leaving runs the same cascade back. This
// mirrors the artistic-word hover used elsewhere on the site (see Reveal).
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
        onComplete: enablePloumHover,
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

      function enablePloumHover() {
        const word = el.querySelector<HTMLElement>(".ploum-word");
        if (!word || !contextSafe) return;
        const chars = word.querySelectorAll<HTMLElement>(".ploum-letter");
        let hoverTl: gsap.core.Timeline | null = null;

        // Each letter hops, swaps typeface at the apex, and lands with a small
        // bounce — cascading left to right. Leaving runs the same cascade back
        // to the sans. Killing the previous timeline lets a mid-cascade
        // reversal pick up from wherever each letter is.
        const cascade = contextSafe((artistic: boolean) => {
          hoverTl?.kill();
          hoverTl = gsap.timeline();
          chars.forEach((char, i) => {
            const at = i * 0.04;
            hoverTl!
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

        // Debounce hover intent: a short dwell must pass, and only the final
        // enter/leave state runs a cascade. This kills the spam from rapid
        // in-out swaps. The word span is a stable hit-area — the letters hop
        // inside it, so its box never slips out from under the cursor.
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

        word.addEventListener("mouseenter", onEnter);
        word.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          word.removeEventListener("mouseenter", onEnter);
          word.removeEventListener("mouseleave", onLeave);
          if (timer !== null) window.clearTimeout(timer);
          hoverTl?.kill();
        });

        if (word.matches(":hover")) onEnter();
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
              isPloum
                ? "ploum-word inline-block cursor-pointer motion-reduce:hover:font-artistic motion-reduce:hover:italic motion-reduce:hover:normal-case"
                : "inline-block"
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
