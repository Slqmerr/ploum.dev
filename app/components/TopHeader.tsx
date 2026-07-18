"use client";

import { useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const NAV_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

function Chars({ text }: { text: string }) {
  return (
    <>
      {[...text].map((char, i) => (
        <span key={i} className="roll-char inline-block will-change-transform">
          {char}
        </span>
      ))}
    </>
  );
}

export default function TopHeader() {
  const scope = useRef<HTMLElement>(null);

  const { contextSafe } = useGSAP(
    () => {
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
    },
    { scope }
  );

  const roll = contextSafe((e: MouseEvent<HTMLAnchorElement>, to: number) => {
    gsap.to(e.currentTarget.querySelectorAll(".roll-char"), {
      yPercent: to,
      duration: 0.4,
      ease: "power3.out",
      stagger: 0.025,
      overwrite: "auto",
    });
  });

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
              <a
                href={href}
                className="relative block overflow-hidden"
                onMouseEnter={(e) => roll(e, -100)}
                onMouseLeave={(e) => roll(e, 0)}
              >
                <span className="block">
                  <Chars text={label} />
                </span>
                <span aria-hidden className="absolute top-full left-0 block">
                  <Chars text={label} />
                </span>
              </a>
            </span>
          </span>
        ))}
      </nav>
    </header>
  );
}
