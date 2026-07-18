"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Reveal({
  lines,
  delay = 0,
  className = "",
}: {
  lines: string[];
  delay?: number;
  className?: string;
}) {
  const scope = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".reveal-char", { clearProps: "transform" });
        return;
      }

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
        }
      );
    },
    { scope }
  );

  return (
    <span ref={scope} className={`block ${className}`}>
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden">
          {line.split(" ").map((word, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {[...word].map((char, ci) => (
                <span
                  key={ci}
                  className="reveal-char inline-block will-change-transform"
                  style={{ transform: "translateY(115%)" }}
                >
                  {char}
                </span>
              ))}
              {wi < line.split(" ").length - 1 && " "}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
