"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Alternating hollow/filled words. Even count per half keeps the pattern
// continuous across the seam between the two duplicated halves.
const WORDS = ["Front end", "Creative", "Developer", "Ploum"];

function Half() {
  return (
    <span className="flex shrink-0 items-baseline">
      {WORDS.map((word, i) => (
        <span key={word} className="flex shrink-0 items-baseline">
          <span className={i % 2 === 0 ? "text-outline" : ""}>{word}</span>
          <span className="px-5 md:px-8">—</span>
        </span>
      ))}
    </span>
  );
}

export default function Marquee() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const drift = gsap.to(".marquee-track", {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });

      // Scroll velocity feeds the drift: scrolling down accelerates it,
      // scrolling up drags it backwards, and the strip shears slightly in
      // the direction of travel before both settle back to the idle glide.
      ScrollTrigger.create({
        onUpdate(self) {
          const velocity = gsap.utils.clamp(-3000, 3000, self.getVelocity());
          if (Math.abs(velocity) < 60) return;

          gsap.to(drift, {
            timeScale: 1 + velocity / 350,
            duration: 0.25,
            ease: "power1.out",
            overwrite: true,
            onComplete: () => {
              gsap.to(drift, {
                timeScale: 1,
                duration: 1.4,
                ease: "power2.out",
                overwrite: true,
              });
            },
          });

          // overwrite: "auto" only kills prior skew tweens — never the
          // xPercent drift on the same element.
          gsap.to(".marquee-track", {
            skewX: gsap.utils.clamp(-6, 6, velocity / 400),
            duration: 0.25,
            ease: "power1.out",
            overwrite: "auto",
            onComplete: () => {
              gsap.to(".marquee-track", {
                skewX: 0,
                duration: 0.9,
                ease: "power2.out",
                overwrite: "auto",
              });
            },
          });
        },
      });
    },
    { scope }
  );

  return (
    // Decorative texture only — hidden from the accessibility tree.
    <aside
      ref={scope}
      aria-hidden
      className="-mx-4 mt-14 overflow-hidden border-y-2 border-black py-3 select-none md:-mx-8 md:mt-20"
    >
      <div className="marquee-track flex w-max text-[clamp(2.6rem,7vw,6.5rem)] leading-none font-black tracking-[-0.02em] whitespace-nowrap uppercase will-change-transform">
        <Half />
        <Half />
      </div>
    </aside>
  );
}
