"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// The label cycles on its own between these two, each swap a per-character
// staggered roll. No hover needed. The hover interaction is the shared
// cursor-following tag box (see AboutBand's `.about-hoverable` handling).
const REST = "Let's talk";
const HOVER = "Work With Us";

// Split into characters. Spaces become a fixed-width gap so the words read as
// clearly separated (letter-spacing alone doesn't widen the word break).
function chars(text: string) {
  return [...text].map((ch, i) =>
    ch === " " ? (
      <span key={i} className="cta-char inline-block w-[0.22em] will-change-transform" />
    ) : (
      <span key={i} className="cta-char inline-block will-change-transform">
        {ch}
      </span>
    )
  );
}

// Seconds each label holds before the next swap.
const HOLD = 2.2;
// How far the brackets squeeze inward on each swap, in px.
const NUDGE = 10;

// A framing bracket with chamfered (cut) corners. `flip` uses the mirrored
// path (not a CSS transform) so GSAP is free to drive x/y/rotation on the svg
// without clobbering the flip. Stroke inherits the CTA color via currentColor.
function Bracket({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 36 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={6}
      strokeLinejoin="miter"
      className="cta-bracket h-[clamp(2rem,7vw,5.5rem)] w-auto shrink-0 will-change-transform"
    >
      {/* arms point inward toward the text; both elbows sliced at 45° */}
      <path
        d={
          flip
            ? "M2 7 L21 7 L28 14 L28 86 L21 93 L2 93"
            : "M34 7 L15 7 L8 14 L8 86 L15 93 L34 93"
        }
      />
    </svg>
  );
}

export default function ContactCTA() {
  const scope = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const rest = gsap.utils.toArray<HTMLElement>(".cta-rest .cta-char", scope.current);
      const hover = gsap.utils.toArray<HTMLElement>(".cta-hover .cta-char", scope.current);
      const brackets = gsap.utils.toArray<HTMLElement>(".cta-bracket", scope.current);

      // Resting state: the hover label parked just below the clip.
      gsap.set(hover, { yPercent: 110 });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return; // hold on the resting label, no cycling
      }

      // Idle: the brackets breathe continuously — left and right drift in
      // opposite phase with a slight tilt, so the frame is always alive. Uses
      // y/rotation only, leaving x free for the swap squeeze below.
      gsap.to(brackets, {
        y: (i) => (i === 0 ? -8 : 8),
        rotation: (i) => (i === 0 ? -2.5 : 2.5),
        duration: 1.9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Squeeze the brackets inward, then release — left moves right, right
      // moves left. Called at each label swap so the frame reacts to it.
      const squeeze = () =>
        gsap.to(brackets, {
          x: (i) => (i === 0 ? NUDGE : -NUDGE),
          duration: 0.28,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1,
        });

      // Auto-cycling loop: hold REST, roll to HOVER, hold, roll back — forever.
      const tl = gsap.timeline({
        repeat: -1,
        defaults: { duration: 0.6, ease: "power3.inOut" },
      });
      tl.to({}, { duration: HOLD })
        .to(rest, { yPercent: -110, stagger: 0.03 }, ">")
        .to(hover, { yPercent: 0, stagger: 0.03 }, "<")
        .add(squeeze, "<")
        .to({}, { duration: HOLD })
        .to(rest, { yPercent: 0, stagger: 0.03 }, ">")
        .to(hover, { yPercent: 110, stagger: 0.03 }, "<")
        .add(squeeze, "<");
    },
    { scope }
  );

  return (
    <a
      ref={scope}
      href="#contact"
      aria-label="Get in touch"
      data-tag="Say hello →"
      className="about-hoverable relative mt-10 inline-flex cursor-pointer items-center justify-center gap-[clamp(0.75rem,2.5vw,2.5rem)] md:mt-14"
    >
      <Bracket />

      {/* Stacked labels: both share one grid cell; overflow clips the roll */}
      <span className="relative grid justify-items-center overflow-hidden font-black leading-[1.05]">
        <span className="cta-rest col-start-1 row-start-1 font-artistic text-[clamp(2.5rem,9vw,7rem)] tracking-[0.0em] whitespace-nowrap italic">
          {chars(REST)}
        </span>
        <span className="cta-hover col-start-1 row-start-1 font-artistic text-[clamp(2.5rem,9vw,7rem)] tracking-[0.0em] whitespace-nowrap italic">
          {chars(HOVER)}
        </span>
      </span>

      <Bracket flip />
    </a>
  );
}
