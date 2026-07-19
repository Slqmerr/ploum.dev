"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

const NAV_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function TopHeader() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    (context, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".header-item", { clearProps: "transform" });
        gsap.set(".header-line", { clearProps: "transform" });
        return;
      }

      const tl = gsap.timeline({ delay: 0.15 });

      // y: 0 clears the inline no-flash fallback transforms.
      tl.fromTo(
        ".header-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: "power3.inOut" }
      ).fromTo(
        ".header-item",
        { yPercent: 115, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.09,
        },
        "-=0.55"
      );

      // Hover scrambles: the label flickers through random uppercase glyphs
      // and resolves back to itself. Only one tween per link is ever alive —
      // the previous one is killed before a new one starts — so rapid
      // re-hovers never fight.
      const cleanups = [...scope.current!.querySelectorAll("a")].map((link) => {
        const target = link.querySelector<HTMLElement>(".nav-label")!;
        const label = target.textContent ?? "";
        let tween: gsap.core.Tween | null = null;

        const enter = contextSafe!(() => {
          tween?.kill();
          tween = gsap.to(target, {
            duration: 0.6,
            scrambleText: { text: label, chars: "upperCase", speed: 0.5 },
          });
        });

        link.addEventListener("mouseenter", enter);

        return () => {
          link.removeEventListener("mouseenter", enter);
          tween?.kill();
          // A kill mid-flicker would otherwise strand random glyphs.
          target.textContent = label;
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope }
  );

  return (
    <header
      ref={scope}
      className="relative grid grid-cols-2 gap-x-6 gap-y-3 pb-4 text-[0.65rem] leading-tight font-bold tracking-[0.15em] uppercase md:grid-cols-4 md:text-xs"
    >
      <span
        aria-hidden
        className="header-line absolute bottom-0 left-0 h-0.5 w-full origin-left bg-black"
        style={{ transform: "scaleX(0)" }}
      />

      {["Ploum", "Currently front end engineer", "Based in Larissa, Greece"].map(
        (text) => (
          <p key={text} className="overflow-hidden">
            <span
              className="header-item block will-change-transform"
              style={{ transform: "translateY(115%)" }}
            >
              {text}
            </span>
          </p>
        )
      )}

      <nav aria-label="Main" className="flex gap-x-4">
        {NAV_LINKS.map(({ href, label }) => (
          <span key={href} className="overflow-hidden">
            <span
              className="header-item block will-change-transform"
              style={{ transform: "translateY(115%)" }}
            >
              <a href={href} aria-label={label} className="block">
                <span aria-hidden className="nav-label block">
                  {label}
                </span>
              </a>
            </span>
          </span>
        ))}
      </nav>
    </header>
  );
}
