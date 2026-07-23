"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Per-letter "bottom-sideways" reveal, scrubbed to scroll: each glyph flies up
// from below and swings in from the left corner, rocking upright, one after
// another as the band scrolls through — and reverses on scroll-up. Movement-led
// (unlike the About band, a flat in-place opacity brighten with no motion).
//
// The letters render solid by default and are only hidden once GSAP takes over
// in a layout effect (before paint, so there's no flash) — so they can never
// get stuck invisible, and no clip mask can eat the glyphs. autoAlpha hides the
// off-position letters during their approach; the large transform sells the
// "rising from the bottom" read.
const FROM = {
  yPercent: 125, // rise up from well below the line
  xPercent: -40, // slide in sideways from the left
  rotation: 10, // rock upright, pivoting on the bottom-left corner
  autoAlpha: 0,
  transformOrigin: "0% 100%",
};

export default function ManifestoReveal({
  lines,
  artisticWords = [],
}: {
  lines: string[];
  /** Words permanently set in the italic serif — no hover, still revealed. */
  artisticWords?: string[];
}) {
  const scope = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const chars = gsap.utils.toArray<HTMLElement>(".m-char", scope.current);
      if (chars.length === 0) return;

      // Reduced motion: leave the letters at their resting state (their default
      // render) and register nothing.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Scrubbed so it reverses on scroll-up; the stagger spreads the letters
      // across the window so they resolve one after another as you scroll.
      // The window runs from the moment the band edges into view (top bottom)
      // until the text's TOP edge reaches the upper-middle (top 45%). Anchoring
      // the finish to the top edge — not the block's center — matters: this
      // tall four-line block only gets its center high on screen well after the
      // band has already framed itself, so a "center" end left the last words
      // still resolving and needing extra scroll. Ending at "top 45%" completes
      // the whole message as the band settles into its framed reading position,
      // so the full text is already visible once it fills the viewport.
      // scrub 1.5 gives the glyphs extra glide, easing into place after the
      // scroll stops rather than snapping to the pointer.
      //
      // stagger (0.85) is kept just under the per-letter duration (1) so the
      // reveal reads clearly letter-by-letter: the next glyph begins its rise a
      // little before the current one lands (~15% overlap), instead of a whole
      // cluster moving together (which is what a small stagger like 0.3 gives).
      gsap.fromTo(chars, FROM, {
        yPercent: 0,
        xPercent: 0,
        rotation: 0,
        autoAlpha: 1,
        ease: "none",
        duration: 1,
        stagger: 0.7,
        scrollTrigger: {
          trigger: scope.current,
          start: "top bottom",
          end: "top 45%",
          scrub: 1.5,
        },
      });
    },
    { scope }
  );

  return (
    <span ref={scope} className="block">
      {lines.map((line) => (
        <span key={line} className="block">
          {line.split(" ").map((word, wi, words) => (
            <Fragment key={wi}>
              <span
                // Artistic words stay in the italic serif for good — the hover
                // swap is gone; they still ride the same per-letter reveal.
                className={`inline-block whitespace-nowrap ${
                  artisticWords.includes(word)
                    ? "font-artistic lowercase italic"
                    : ""
                }`}
              >
                {[...word].map((char, ci) => (
                  <span
                    key={ci}
                    className="m-char inline-block will-change-transform"
                  >
                    {char}
                  </span>
                ))}
              </span>
              {wi < words.length - 1 && " "}
            </Fragment>
          ))}
        </span>
      ))}
    </span>
  );
}
