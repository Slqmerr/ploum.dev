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
// How far the arrows jab inward on each swap, in px.
const NUDGE = 10;
// How far the arrows spread outward while the CTA is hovered, in px.
const HOVER_SPREAD = 22;

// A chevron arrow pointing inward at the label. `flip` uses the mirrored path
// (not a CSS transform) so GSAP is free to drive x/y/rotation on the svg
// without clobbering the flip. Stroke inherits the CTA color via currentColor.
// The 44x60 box puts both arms at ~45°, so it reads as an arrowhead rather
// than the steep near-vertical wedge a text-height box would force.
function Arrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 44 60"
      fill="none"
      stroke="currentColor"
      strokeWidth={6}
      strokeLinejoin="miter"
      className="cta-arrow h-[clamp(1.5rem,5vw,3.75rem)] w-auto shrink-0 will-change-transform"
    >
      <path d={flip ? "M32 6 L8 30 L32 54" : "M12 6 L36 30 L12 54"} />
    </svg>
  );
}

export default function ContactCTA() {
  const scope = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const rest = gsap.utils.toArray<HTMLElement>(".cta-rest .cta-char", scope.current);
      const hover = gsap.utils.toArray<HTMLElement>(".cta-hover .cta-char", scope.current);
      const arrows = gsap.utils.toArray<HTMLElement>(".cta-arrow", scope.current);

      // Resting state: the hover label parked just below the clip.
      gsap.set(hover, { yPercent: 110 });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return; // hold on the resting label, no cycling
      }

      // Idle: the arrows breathe continuously — left and right drift in
      // opposite phase with a slight tilt, so the pair is always alive. Uses
      // y/rotation only, leaving x free for the swap jab below.
      gsap.to(arrows, {
        y: (i) => (i === 0 ? -8 : 8),
        rotation: (i) => (i === 0 ? -2.5 : 2.5),
        duration: 1.9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Jab the arrows inward, then release — left moves right, right moves
      // left. Called at each label swap so the pair reacts to it.
      const squeeze = () =>
        gsap.to(arrows, {
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

      // Hover: the arrows throw themselves open — spreading outward and
      // scaling up — so the whole CTA reads as one big target opening up to
      // the pointer. Overshoots on the way out via `back`, settles on the way
      // back. Driven on the wrappers, so the idle breathe underneath keeps
      // running and the swap jab still lands normally mid-hover.
      const wraps = gsap.utils.toArray<HTMLElement>(".cta-arrow-wrap", scope.current);
      const onEnter = () =>
        gsap.to(wraps, {
          x: (i) => (i === 0 ? -HOVER_SPREAD : HOVER_SPREAD),
          scale: 1.22,
          duration: 0.5,
          ease: "back.out(2.2)",
        });
      const onLeave = () =>
        gsap.to(wraps, { x: 0, scale: 1, duration: 0.4, ease: "power3.out" });

      const el = scope.current!;
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);

      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      };
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
      {/* Each arrow sits in its own wrapper: the wrapper is the hover channel
          (spread + scale), the svg inside is the idle/swap channel (y/rotation
          + x jab). Separate elements means the two never fight over the same
          transform, so a swap landing mid-hover doesn't reset the hover pose. */}
      <span className="cta-arrow-wrap inline-flex shrink-0 will-change-transform">
        <Arrow />
      </span>

      {/* Stacked labels: both share one grid cell; overflow clips the roll */}
      <span className="relative grid justify-items-center overflow-hidden font-black leading-[1.05]">
        <span className="cta-rest col-start-1 row-start-1 font-artistic text-[clamp(2.5rem,9vw,7rem)] tracking-[0.0em] whitespace-nowrap italic">
          {chars(REST)}
        </span>
        <span className="cta-hover col-start-1 row-start-1 font-artistic text-[clamp(2.5rem,9vw,7rem)] tracking-[0.0em] whitespace-nowrap italic">
          {chars(HOVER)}
        </span>
      </span>

      <span className="cta-arrow-wrap inline-flex shrink-0 will-change-transform">
        <Arrow flip />
      </span>
    </a>
  );
}
