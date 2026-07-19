"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Manifesto copy, word by word. Artistic words swap to the italic serif,
// echoing the hero's "Creative" hover.
const WORDS: { text: string; artistic?: boolean }[] = [
  { text: "I" },
  { text: "design" },
  { text: "and" },
  { text: "build" },
  { text: "playful,", artistic: true },
  { text: "precise" },
  { text: "interfaces" },
  { text: "—" },
  { text: "brutalist" },
  { text: "grids," },
  { text: "fluid", artistic: true },
  { text: "motion," },
  { text: "and" },
  { text: "type" },
  { text: "that" },
  { text: "misbehaves" },
  { text: "just" },
  { text: "enough.", artistic: true },
];

export default function AboutBand() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Scrubbed word-by-word reveal: each word brightens from a faint
      // ghost as the band scrolls through, like a sentence being read.
      gsap.fromTo(
        ".about-word",
        { opacity: 0.12 },
        {
          opacity: 1,
          duration: 0.6,
          ease: "none",
          stagger: 0.15,
          scrollTrigger: {
            trigger: scope.current,
            start: "top 78%",
            end: "center 40%",
            scrub: 0.4,
          },
        }
      );
    },
    { scope }
  );

  return (
    // Full-bleed black band: it also slides under the sticky header, whose
    // mix-blend-difference text flips to white for the whole pass.
    <section
      ref={scope}
      id="about"
      className="-mx-4 mt-14 bg-black px-4 py-20 text-background md:-mx-8 md:mt-20 md:px-8 md:py-28"
    >
      <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase md:text-xs">
        (03) — About
      </p>
      <p className="mt-8 max-w-5xl text-[clamp(1.5rem,3.6vw,3.4rem)] leading-[1.1] font-black tracking-[-0.02em] uppercase">
        {WORDS.map(({ text, artistic }, i) => (
          <Fragment key={i}>
            <span
              className={`about-word inline-block ${
                artistic ? "font-artistic lowercase italic" : ""
              }`}
            >
              {text}
            </span>
            {i < WORDS.length - 1 && " "}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
