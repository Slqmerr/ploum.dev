"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Opening beat, mirroring the curtain footer in reverse: two black curtains
// split apart — top lifts up, bottom drops down — to reveal the page. The
// header/hero entrance delays are timed to start as the curtains clear them.
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
        .to(".intro-label", {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.in",
          delay: 0.3,
        })
        .to(
          ".intro-curtain-top",
          {
            yPercent: -100,
            duration: 0.7,
            ease: "power4.inOut",
          },
          "<"
        )
        .to(
          ".intro-curtain-bottom",
          {
            yPercent: 100,
            duration: 0.7,
            ease: "power4.inOut",
          },
          "<"
        )
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
      className="fixed inset-0 z-[60] overflow-hidden select-none"
    >
      <div className="intro-curtain-top absolute inset-x-0 top-0 h-1/2 bg-black will-change-transform" />
      <div className="intro-curtain-bottom absolute inset-x-0 bottom-0 h-1/2 bg-black will-change-transform" />

      <div className="intro-label pointer-events-none absolute inset-0 flex items-center justify-center text-background">
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
    </div>
  );
}
