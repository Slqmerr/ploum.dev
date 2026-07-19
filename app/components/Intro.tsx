"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Opening beat, mirroring the curtain footer in reverse: a black sheet
// stamped "PLOUM©" lifts away to reveal the page. The header/hero entrance
// delays are timed to start as the sheet clears them.
export default function Intro() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(scope.current, { display: "none" });
        return;
      }

      const tl = gsap
        .timeline()
        .fromTo(
          ".intro-char",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.5,
            ease: "power4.out",
            stagger: 0.05,
          }
        )
        .to(scope.current, {
          yPercent: -100,
          duration: 0.65,
          ease: "power4.inOut",
          delay: 0.3,
        })
        .set(scope.current, { display: "none" });

      // A click anywhere jumps straight to the revealed page.
      const skip = () => tl.progress(1);
      const sheet = scope.current!;
      sheet.addEventListener("click", skip);
      return () => sheet.removeEventListener("click", skip);
    },
    { scope }
  );

  return (
    <div
      ref={scope}
      aria-hidden
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black text-background select-none"
    >
      <span className="block overflow-hidden text-[clamp(3rem,10vw,9rem)] leading-none font-black tracking-[-0.04em] uppercase">
        {[..."Ploum©"].map((char, i) => (
          <span
            key={i}
            className="intro-char inline-block will-change-transform"
            style={{ transform: "translateY(115%)" }}
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  );
}
