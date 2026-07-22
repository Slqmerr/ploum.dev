"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ContactCTA from "./ContactCTA";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Manifesto copy, word by word. Artistic words swap to the italic serif,
// echoing the hero's "Creative" hover. Every artistic word reveals a
// cursor-following mini-box on hover; its label comes from `tag`. A word
// with `link` also becomes an anchor.
const WORDS: {
  text: string;
  artistic?: boolean;
  tag?: string;
  link?: string;
}[] = [
  { text: "I" },
  { text: "design" },
  { text: "and" },
  { text: "build" },
  { text: "playful,", artistic: true, tag: "See services ↗", link: "/services" },
  { text: "precise" },
  { text: "interfaces" },
  { text: "—" },
  { text: "brutalist" },
  { text: "grids," },
  { text: "fluid", artistic: true, tag: "See services ↗", link: "/services" },
  { text: "motion," },
  { text: "and" },
  { text: "type" },
  { text: "that" },
  { text: "misbehaves" },
  { text: "just" },
  { text: "enough.", artistic: true, tag: "About me →", link: "/about" },
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

      // Cursor-following tag box: while any artistic word is hovered, the
      // box trails the pointer with a soft lag, offset up-right so it never
      // sits under the cursor. Its label comes from the word's data-tag.
      const box = scope.current!.querySelector<HTMLElement>(".see-more-cursor");
      const words =
        scope.current!.querySelectorAll<HTMLElement>(".about-hoverable");
      if (!box || words.length === 0) return;

      const OFF_X = 18;
      const OFF_Y = -46;
      const xTo = gsap.quickTo(box, "x", { duration: 0.35, ease: "power3.out" });
      const yTo = gsap.quickTo(box, "y", { duration: 0.35, ease: "power3.out" });

      const move = (e: MouseEvent) => {
        xTo(e.clientX + OFF_X);
        yTo(e.clientY + OFF_Y);
      };
      const enter = (e: MouseEvent) => {
        const el = e.currentTarget as HTMLElement;
        box.textContent = el.dataset.tag ?? "See more →";
        gsap.set(box, { x: e.clientX + OFF_X, y: e.clientY + OFF_Y });
        gsap.to(box, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
        window.addEventListener("mousemove", move);
      };
      const leave = () => {
        gsap.to(box, { autoAlpha: 0, duration: 0.2 });
        window.removeEventListener("mousemove", move);
      };

      words.forEach((el) => {
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
      });

      return () => {
        words.forEach((el) => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
        window.removeEventListener("mousemove", move);
      };
    },
    { scope }
  );

  return (
    // Full-bleed black band: it also slides under the sticky header, whose
    // mix-blend-difference text flips to white for the whole pass.
    <section
      ref={scope}
      id="about"
      className="-mx-4 mt-14 bg-black px-4 pt-20 pb-28 text-background md:-mx-8 md:mt-20 md:px-8 md:pt-28 md:pb-40"
    >
      <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase md:text-xs">
        (03) — About
      </p>
      <p className="mt-8 max-w-5xl text-[clamp(1.5rem,3.6vw,3.4rem)] leading-[1.1] font-black tracking-[-0.02em] uppercase">
        {WORDS.map(({ text, artistic, tag, link }, i) => {
          // Artistic words become the italic serif and reveal the trailing
          // tag box on hover; `cursor-pointer` signals the interaction even
          // when the word isn't a link.
          const wordClass = `about-word inline-block ${
            artistic ? "font-artistic lowercase italic about-hoverable cursor-pointer" : ""
          }`;

          return (
            <Fragment key={i}>
              {link ? (
                // The anchor itself carries .about-word, so the scrub dims it
                // exactly like every other word — it only differs by being a
                // link (Tailwind preflight keeps color/decoration inherited).
                <a href={link} data-tag={tag} className={wordClass}>
                  {text}
                </a>
              ) : (
                <span data-tag={tag} className={wordClass}>
                  {text}
                </span>
              )}
              {i < WORDS.length - 1 && " "}
            </Fragment>
          );
        })}
      </p>

      {/* CTA — centred title + link to the contact curtain */}
      <div className="mt-28 flex flex-col items-center text-center md:mt-44">
        <h2 className="text-[clamp(2.6rem,10vw,9rem)] leading-[0.9] font-black tracking-[-0.03em] uppercase">
          Got a project?
        </h2>
        <ContactCTA />
      </div>

      {/* Cursor-following tag, shown only while the linked word is hovered.
          Fixed + GSAP-driven x/y, starts hidden via autoAlpha. */}
      <span
        aria-hidden
        className="see-more-cursor pointer-events-none invisible fixed top-0 left-0 z-50 border-2 border-background bg-background px-2 py-1 text-[0.5rem] font-bold tracking-[0.2em] text-black uppercase opacity-0 will-change-transform"
      >
        See more →
      </span>
    </section>
  );
}
