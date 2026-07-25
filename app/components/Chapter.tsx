"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ChapterProps = {
  index: string;
  title: string;
  paragraphs: string[];
  imageSide?: "left" | "right";
  src?: string;
  alt?: string;
  /** Optional huge display number shown above the title (e.g. an age). */
  bigNumber?: string;
};

// A scrollytelling beat: a sticky image on one side that holds while the
// narrative on the other side scrolls past and reveals paragraph by
// paragraph. `imageSide` alternates the layout so chapters zig-zag.
export default function Chapter({
  index,
  title,
  paragraphs,
  imageSide = "left",
  src,
  alt,
  bigNumber,
}: ChapterProps) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Each block rises + fades in as it enters, like the story unfolding.
      gsap.utils.toArray<HTMLElement>(".chapter-reveal", scope.current).forEach(
        (el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 40 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 82%", once: true },
            }
          );
        }
      );

      // Subtle parallax: the media drifts slower than the scroll for depth.
      // The inner is oversized so the drift never exposes the frame edge.
      const media = scope.current!.querySelector<HTMLElement>(
        ".chapter-media-inner"
      );
      if (media) {
        gsap.fromTo(
          media,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: scope.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    },
    { scope }
  );

  const mediaFirst = imageSide === "left";

  return (
    <section
      ref={scope}
      className="mt-20 grid grid-cols-1 gap-x-10 md:mt-28 md:grid-cols-2"
    >
      {/* Media column — sticks while the narrative scrolls past it */}
      <div className={mediaFirst ? "md:order-1" : "md:order-2"}>
        <div className="md:sticky md:top-[15vh]">
          <figure className="relative aspect-[4/5] overflow-hidden border-2 border-black bg-[#e2d9cf]">
            <div className="chapter-media-inner absolute -inset-[8%]">
              {src && (
                <Image
                  src={src}
                  alt={alt ?? ""}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              )}
            </div>
            <span className="absolute top-4 left-4 text-[0.6rem] font-bold tracking-[0.35em] uppercase">
              {src ? title : `Image — ${index}`}
            </span>
          </figure>
        </div>
      </div>

      {/* Narrative column — big gaps give the sticky image room to hold */}
      <div
        className={`flex flex-col gap-[28vh] py-[14vh] ${
          mediaFirst ? "md:order-2" : "md:order-1"
        }`}
      >
        <div>
          {bigNumber && (
            <span className="chapter-reveal mb-4 block text-[clamp(6rem,15vw,14rem)] leading-[0.78] font-black tracking-[-0.05em] select-none">
              {bigNumber}
            </span>
          )}
          <p className="chapter-reveal text-[0.65rem] font-bold tracking-[0.2em] uppercase md:text-xs">
            ({index})
          </p>
          <h3 className="chapter-reveal mt-4 text-[clamp(2rem,4.5vw,4rem)] leading-[0.95] font-black tracking-[-0.02em] uppercase">
            {title}
          </h3>
        </div>

        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="chapter-reveal max-w-md text-sm leading-relaxed font-medium md:text-base"
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
