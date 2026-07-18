"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

function ArrowGlyph({ clone = false }: { clone?: boolean }) {
  return (
    <span
      className="absolute inset-0 grid place-items-center"
      style={clone ? { transform: "translateY(-100%)" } : undefined}
    >
      <svg
        className="h-1/2 w-1/2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
        aria-hidden="true"
      >
        <line x1="12" y1="4" x2="12" y2="17" />
        <polyline points="5.5,11.5 12,18 18.5,11.5" />
      </svg>
    </span>
  );
}

export default function ArrowButton({
  className = "",
  targetId,
}: {
  className?: string;
  targetId?: string;
}) {
  const scope = useRef<HTMLButtonElement>(null);

  useGSAP(
    (context, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Circular label spins forever; the arrow periodically drops through
      // the inner circle, its clone falling in from above for a seamless loop.
      const spin = gsap.to(".ring-label", {
        rotation: 360,
        duration: 14,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });

      const drop = gsap
        .timeline({ repeat: -1, repeatDelay: 1.4 })
        .to(".track", { yPercent: 100, duration: 0.7, ease: "power3.inOut" })
        .set(".track", { yPercent: 0 });

      const xTo = gsap.quickTo(scope.current, "x", {
        duration: 0.5,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(scope.current, "y", {
        duration: 0.5,
        ease: "power3.out",
      });

      const onMove = contextSafe!((e: Event) => {
        const { clientX, clientY } = e as MouseEvent;
        const r = scope.current!.getBoundingClientRect();
        xTo((clientX - (r.left + r.width / 2)) * 0.35);
        yTo((clientY - (r.top + r.height / 2)) * 0.35);
      });

      const onEnter = contextSafe!(() => {
        gsap.to([spin, drop], { timeScale: 3.5, duration: 0.4 });
      });

      const onLeave = contextSafe!(() => {
        gsap.to([spin, drop], { timeScale: 1, duration: 0.6 });
        gsap.to(scope.current, {
          x: 0,
          y: 0,
          duration: 0.9,
          ease: "elastic.out(1, 0.35)",
        });
      });

      const el = scope.current!;
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope }
  );

  return (
    <button
      ref={scope}
      type="button"
      aria-label="Scroll down"
      onClick={() => {
        if (targetId) {
          document
            .getElementById(targetId)
            ?.scrollIntoView({ behavior: "smooth" });
        }
      }}
      className={`group block h-24 w-24 md:h-28 md:w-28 ${className}`}
    >
      {/* Rotating circular label */}
      <svg
        className="ring-label absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <path
            id="ring-path"
            d="M 50,50 m -39,0 a 39,39 0 1,1 78,0 a 39,39 0 1,1 -78,0"
          />
        </defs>
        <text
          className="fill-black uppercase"
          fontSize="8.4"
          fontWeight="700"
          letterSpacing="0.12em"
        >
          <textPath
            href="#ring-path"
            textLength="245"
            lengthAdjust="spacingAndGlyphs"
          >
            Scroll down — Stay creative —{" "}
          </textPath>
        </text>
      </svg>

      {/* Inner circle: arrow conveyor */}
      <span className="absolute inset-[24%] block overflow-hidden rounded-full border-2 border-black text-black transition-colors duration-300 group-hover:bg-black group-hover:text-background">
        <span className="track absolute inset-0 block">
          <ArrowGlyph />
          <ArrowGlyph clone />
        </span>
      </span>
    </button>
  );
}
