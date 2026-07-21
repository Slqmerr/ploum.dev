"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Services, not projects — honest content for the wall until real work ships.
const SERVICES = [
  {
    index: "01",
    title: "Web Design",
    desc: "Brand-driven, grid-based interfaces with a point of view.",
  },
  {
    index: "02",
    title: "Frontend Development",
    desc: "Production React, Next.js and TypeScript — clean and fast.",
  },
  {
    index: "03",
    title: "Motion & Interaction",
    desc: "GSAP-powered animation and scroll-driven experiences.",
  },
  {
    index: "04",
    title: "Performance & A11y",
    desc: "Responsive, accessible, quick on every screen.",
  },
];

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
          <p>(02) — Services</p>
          <p aria-hidden>Scroll ⟶</p>
        </div>

        <div className="showcase-track mt-10 flex w-max items-center gap-6 px-4 will-change-transform md:gap-10 md:px-8">
          {SERVICES.map(({ index, title, desc }, i) => (
            <figure
              key={index}
              className={`group relative flex aspect-[3/4] w-[72vw] shrink-0 flex-col justify-between border-2 border-black bg-[#e2d9cf] p-6 transition-colors duration-300 hover:bg-black hover:text-background sm:w-[48vw] md:w-[34vw] md:p-8 lg:w-[28vw] ${
                i % 2 === 0
                  ? "-translate-y-4 md:-translate-y-8"
                  : "translate-y-4 md:translate-y-8"
              }`}
            >
              <span className="text-[0.6rem] font-bold tracking-[0.35em] uppercase">
                ({index})
              </span>
              <div>
                <h3 className="text-[clamp(1.6rem,2.4vw,2.6rem)] leading-[0.95] font-black tracking-[-0.02em] uppercase">
                  {title}
                </h3>
                <p className="mt-3 max-w-[24ch] text-xs leading-relaxed font-medium tracking-wide">
                  {desc}
                </p>
              </div>
            </figure>
          ))}

          {/* Closing CTA panel — inverted, links to contact */}
          <a
            href="#contact"
            className="group flex aspect-[3/4] w-[72vw] shrink-0 translate-y-4 flex-col justify-between border-2 border-black bg-black p-6 text-background transition-colors duration-300 hover:bg-background hover:text-black sm:w-[48vw] md:w-[34vw] md:translate-y-8 md:p-8 lg:w-[28vw]">
            <span className="text-[0.6rem] font-bold tracking-[0.35em] uppercase">
              (05)
            </span>
            <h3 className="text-[clamp(1.6rem,2.4vw,2.6rem)] leading-[0.95] font-black tracking-[-0.02em] uppercase">
              Let&apos;s build
              <br />
              something →
            </h3>
          </a>
        </div>
      </div>
    </section>
  );
}
