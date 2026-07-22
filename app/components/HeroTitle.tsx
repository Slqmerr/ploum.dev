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
export default function HeroTitle({ className = "" }: { className?: string }) {
  const scope = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = scope.current!;
      const letters = gsap.utils.toArray<HTMLElement>(".hero-letter", el);
      if (!letters.length) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return; // stay visible & static
      }

      // Hide on mount (client only); the intro curtain covers the instant.
      gsap.set(letters, { opacity: 0, yPercent: 22, filter: "blur(10px)" });

      // Starts as the intro clears. Both tweens share the same slow ease.
      const tl = gsap.timeline({ delay: 1.5, defaults: { ease: "power2.out" } });
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
    },
    { scope }
  );

  return (
    <h1 ref={scope} className={className}>
      {WORDS.map((word, wi) => (
        <span key={wi} className="inline-block">
          {[...word].map((char, ci) => (
            <span
              key={ci}
              className="hero-letter inline-block will-change-transform"
            >
              {char}
            </span>
          ))}
          {wi < WORDS.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
}
