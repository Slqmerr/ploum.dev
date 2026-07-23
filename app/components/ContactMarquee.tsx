"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Repeated enough that a single half already overflows the widest viewport,
// so the seam between the two duplicated halves never scrolls into view.
const REPEAT = 4;

function Half() {
  return (
    // Decorative repetition — the accessible name lives on the parent link.
    <span aria-hidden className="flex shrink-0 items-center">
      {Array.from({ length: REPEAT }).map((_, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="px-6 md:px-10">Contact us</span>
          
        </span>
      ))}
    </span>
  );
}

export default function ContactMarquee() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const drift = gsap.to(".contact-marquee-track", {
        xPercent: -50,
        duration: 24,
        ease: "none",
        repeat: -1,
      });

      // Scroll velocity nudges the glide: scrolling down speeds it up,
      // scrolling up drags it back, then it eases to the idle pace.
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
        },
      });
    },
    { scope }
  );

  return (
    <aside ref={scope} className="-mx-4 overflow-hidden md:-mx-8">
      {/* The whole band is the call to action: hovering anywhere on it flips
          the cream palette to its inverse (black fill, cream ink). border-y
          stays black so it melts into the filled state, leaving a clean bar. */}
      <a
        href="#contact"
        aria-label="Contact us"
        className="block border-y-2 border-black py-3 uppercase transition-colors duration-500 select-none hover:bg-foreground hover:text-background md:py-5"
      >
        <span className="contact-marquee-track flex w-max text-[clamp(2.6rem,7vw,6.5rem)] leading-none font-black tracking-[-0.02em] whitespace-nowrap will-change-transform">
          <Half />
          <Half />
        </span>
      </a>
    </aside>
  );
}
