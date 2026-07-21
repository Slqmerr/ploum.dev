"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Small studio-plate captions, cycling one at a time. Easy to edit later —
// swap these for real credentials/status as they firm up.
const LINES = [
  "Front End Engineer",
  "Based in Larissa, Greece",
  "React — Next.js — GSAP",
  "Currently available",
];

const HOLD = 2.4;
const FADE = 0.6;

export default function StudioStamp({ className = "" }: { className?: string }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>(
        ".studio-line",
        scope.current
      );
      const counter = scope.current!.querySelector(".studio-count");

      const setIndex = (i: number) => {
        if (!counter) return;
        counter.textContent = `${String(i + 1).padStart(2, "0")} / ${String(
          lines.length
        ).padStart(2, "0")}`;
      };

      gsap.set(lines[0], { autoAlpha: 1 });
      setIndex(0);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const tl = gsap.timeline({ repeat: -1 });
      lines.forEach((line, i) => {
        const next = (i + 1) % lines.length;
        tl.to({}, { duration: HOLD })
          .to(line, {
            autoAlpha: 0,
            y: -14,
            duration: FADE,
            ease: "power3.inOut",
          })
          .fromTo(
            lines[next],
            { y: 14 },
            { autoAlpha: 1, y: 0, duration: FADE, ease: "power3.out" },
            "<"
          )
          .call(() => setIndex(next));
      });

      return () => {
        tl.kill();
      };
    },
    { scope }
  );

  return (
    <div
      ref={scope}
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <span className="h-px w-10 bg-black/30" />
      <div className="relative flex h-5 items-center justify-center md:h-6">
        {LINES.map((text) => (
          <span
            key={text}
            className="studio-line absolute text-center text-[0.65rem] font-bold whitespace-nowrap tracking-[0.15em] uppercase opacity-0 md:text-xs"
          >
            {text}
          </span>
        ))}
      </div>
      <span className="h-px w-10 bg-black/30" />
      <span className="studio-count text-[0.55rem] font-bold tracking-[0.3em] text-black/40 tabular-nums">
        01 / {String(LINES.length).padStart(2, "0")}
      </span>
    </div>
  );
}
