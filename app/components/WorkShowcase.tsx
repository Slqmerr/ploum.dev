"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Statement words instead of cards: giant type drifts past as the section
// pins, alternating hollow (outlined) and filled — echoing the marquee.
const STATEMENTS = ["Design", "Motion", "Code", "Detail", "Craft"];

export default function WorkShowcase() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // motion-reduce:overflow-x-auto turns the section into a plain
        // horizontally scrollable strip instead.
        return;
      }

      const track = scope.current!.querySelector<HTMLElement>(
        ".showcase-track"
      )!;
      // Pin the inner viewport div, not the section: the section is a flex
      // item of #page-content with negative margins, and pinning it directly
      // leaves a pin-spacer that doesn't hold its space — everything after
      // it scrolls up over the pinned wall.
      const pinEl = scope.current!.querySelector<HTMLElement>(".showcase-pin")!;
      const travel = () => track.scrollWidth - window.innerWidth;

      // The viewport pins for the length of the track: vertical scroll
      // becomes horizontal travel. Scrolling back up drives it in reverse.
      gsap.to(track, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          start: "top top",
          end: () => "+=" + travel(),
          pin: pinEl,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            // "Steering": the strip banks a couple of degrees into the
            // direction of travel, then settles level when scrolling stops.
            // overwrite: "auto" kills only prior rotation tweens — never
            // the x scrub on the same element.
            const velocity = gsap.utils.clamp(-4000, 4000, self.getVelocity());
            if (Math.abs(velocity) < 80) return;
            gsap.to(track, {
              rotation: gsap.utils.clamp(-2.5, 2.5, velocity / 1500),
              duration: 0.3,
              ease: "power1.out",
              overwrite: "auto",
              onComplete: () => {
                gsap.to(track, {
                  rotation: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              },
            });
          },
        },
      });
    },
    { scope }
  );

  return (
    <section ref={scope} id="work" className="-mx-4 mt-14 md:-mx-8 md:mt-20">
      <div className="showcase-pin flex h-svh flex-col justify-center overflow-hidden motion-reduce:overflow-x-auto">
        <div className="flex items-center justify-between px-4 text-[0.65rem] font-bold tracking-[0.2em] uppercase md:px-8 md:text-xs">
          <p>(02) — What I do</p>
          <p aria-hidden>Scroll ⟶</p>
        </div>

        <div className="showcase-track mt-6 flex w-max items-center gap-[8vw] px-4 will-change-transform md:mt-10 md:gap-[10vw] md:px-8">
          {STATEMENTS.map((word, i) => (
            <span
              key={word}
              className={`shrink-0 text-[clamp(4rem,17vw,15rem)] leading-none font-black tracking-[-0.03em] uppercase ${
                i % 2 === 0 ? "text-outline" : ""
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
