"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import LocalClock from "./LocalClock";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

// Section links point at the home route so they work from any page;
// SmoothScroll intercepts them for a smooth in-page scroll when already home.
const NAV_LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function TopHeader() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    (context, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".header-item", { clearProps: "transform" });
        return;
      }

      // y: 0 clears the inline no-flash fallback transforms.
      gsap.fromTo(
        ".header-item",
        { yPercent: 115, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.09,
          // Waits for the intro sheet to clear the top of the viewport.
          delay: 1.5,
        }
      );

      // The header is fixed to the viewport and stays visible the whole way
      // down — no scroll-driven hide. It reveals once on load (above) and then
      // just floats there, inverting against whatever scrolls beneath it via
      // mix-blend-difference.

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
    // Fixed to the viewport (left/right insets mirror main's px-4/md:px-8,
    // which it no longer inherits now that it's out of flow); z-40 keeps it
    // painting above the curtain footer (z-30) so the nav floats on the glass
    // at the end. mix-blend-difference + white text inverts against whatever
    // scrolls beneath: near-black over the cream page, flipping to white where
    // the dark hero type passes under. Requires no stacking context between
    // here and the root — #page-content is position:relative with no z-index,
    // so it establishes none and never traps this fixed element (see main in
    // page.tsx).
    <header
      ref={scope}
      className="fixed top-5 right-4 left-4 z-40 grid grid-cols-2 gap-x-6 gap-y-3 text-[0.65rem] leading-tight font-bold tracking-[0.15em] text-white uppercase mix-blend-difference md:top-6 md:right-8 md:left-8 md:grid-cols-4 md:text-xs"
    >
      {["Ploum", "Currently front end engineer"].map((text) => (
        <p key={text} className="overflow-hidden">
          <span
            className="header-item block will-change-transform"
            style={{ transform: "translateY(115%)" }}
          >
            <span className="liquid-text">{text}</span>
          </span>
        </p>
      ))}

      {/* Live local clock replaces the static location line */}
      <p className="overflow-hidden">
        <span
          className="header-item block will-change-transform"
          style={{ transform: "translateY(115%)" }}
        >
          <LocalClock />
        </span>
      </p>

      <nav aria-label="Main" className="flex gap-x-4">
        {NAV_LINKS.map(({ href, label }) => (
          <span key={href} className="overflow-hidden">
            <span
              className="header-item block will-change-transform"
              style={{ transform: "translateY(115%)" }}
            >
              <a href={href} aria-label={label} className="block">
                <span aria-hidden className="nav-label liquid-text block">
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
