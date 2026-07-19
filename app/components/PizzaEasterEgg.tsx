"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const SLICES = 16;

// The "(01) — I love pizza." annotation, secretly a button: clicking it
// rains tumbling pizza slices down the viewport. Slices are spawned
// imperatively and remove themselves on landing, so repeat clicks stack.
export default function PizzaEasterEgg() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const button = scope.current!.querySelector("button")!;
      const layer = scope.current!.querySelector<HTMLElement>(".pizza-layer")!;

      const rain = contextSafe!(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          return;

        for (let i = 0; i < SLICES; i++) {
          const slice = document.createElement("span");
          slice.textContent = "🍕";
          slice.className = "absolute top-0 left-0 will-change-transform";
          slice.style.fontSize = `${gsap.utils.random(1.2, 3)}rem`;
          layer.appendChild(slice);

          const startX = gsap.utils.random(0, window.innerWidth);
          gsap.fromTo(
            slice,
            {
              x: startX,
              y: -80,
              rotation: gsap.utils.random(-90, 90),
            },
            {
              y: window.innerHeight + 80,
              x: startX + gsap.utils.random(-140, 140),
              rotation: gsap.utils.random(-540, 540),
              duration: gsap.utils.random(1.1, 2.4),
              delay: gsap.utils.random(0, 0.45),
              ease: "power1.in",
              onComplete: () => slice.remove(),
            }
          );
        }
      });

      button.addEventListener("click", rain);
      return () => button.removeEventListener("click", rain);
    },
    { scope }
  );

  return (
    <div ref={scope}>
      <button
        type="button"
        aria-label="I love pizza — make it rain"
        className="w-full border-t-2 border-black pt-3 text-left text-xs font-bold tracking-[0.2em] uppercase"
      >
        (01) — I love pizza.
      </button>

      {/* Above the header (z-40), below the intro sheet (z-60) */}
      <div
        aria-hidden
        className="pizza-layer pointer-events-none fixed inset-0 z-[55] overflow-hidden"
      />
    </div>
  );
}
