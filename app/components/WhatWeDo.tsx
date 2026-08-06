"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Giant section title. Each line enters from an alternating side — left,
// right, left — converging onto the centered stack as it scrolls into view.
// "We" breaks the grid: an oversized artistic serif, italic, pulled with
// negative margins so it collides into the sans lines above and below, and
// left-aligned inside a full-bleed row (the section cancels the page's side
// padding) so its left edge bleeds to the screen edge while "What"/"Do" stay
// centered. Solid
// white fill with mix-blend-difference inverts it against whatever is behind —
// black where it crosses the white/cream background, and it punches straight
// through the black What/Do where they overlap — maximum contrast.
const LINES = [
  {
    text: "What",
    dir: -1,
    className:
      "text-[clamp(3rem,13vw,12rem)] tracking-[-0.03em] uppercase",
  },
  {
    text: "We",
    dir: 1,
    className:
      "font-artistic relative z-10 -left-[0.08em] -my-[0.34em] text-left text-[clamp(4.5rem,18vw,21rem)] italic tracking-[-0.02em] text-white mix-blend-difference",
  },
  {
    text: "Do",
    dir: -1,
    className:
      "text-[clamp(3rem,13vw,12rem)] tracking-[-0.03em] uppercase",
  },
];

// The payoff to the title's question. Three disciplines mirror the /services
// chapters exactly (Development / Motion / Design) so the answer stays honest
// and links straight through. Each row's one-line description is inline on
// mobile and fades in on hover on desktop.
//
// `images` are the frames the hover preview flips through for that row — swap
// the files in /public/whatwedo (or point these paths elsewhere) and the cycle
// picks them up; any count works.
const CAPABILITIES = [
  {
    n: "01",
    label: "Development",
    desc: "React, Next.js & TypeScript, end to end.",
    images: [
      "/whatwedo/development-1.jpg",
      "/whatwedo/development-2.jpg",
      "/whatwedo/development-3.jpg",
    ],
  },
  {
    n: "02",
    label: "Motion",
    desc: "GSAP-driven interfaces that feel alive.",
    images: [
      "/whatwedo/motion-1.jpg",
      "/whatwedo/motion-2.jpg",
      "/whatwedo/motion-3.jpg",
    ],
  },
  {
    n: "03",
    label: "Brand Design",
    desc: "Type, timing & detail — accessible by default.",
    images: [
      "/whatwedo/brand-1.jpg",
      "/whatwedo/brand-2.jpg",
      "/whatwedo/brand-3.jpg",
    ],
  },
];

// Every frame of every row, flattened into one stack of layers so they are all
// in the DOM (and decoded) up front — the flip is an opacity swap between
// already-painted images, never a fresh network request mid-hover.
const FRAMES = CAPABILITIES.flatMap((cap, row) =>
  cap.images.map((src) => ({ src, row, label: cap.label }))
);

// How long each frame holds before the next one takes over.
const FRAME_MS = 200;

// Distance between the pointer and the near edge of the preview card.
const CARD_GAP = 28;

export default function WhatWeDo() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Leave the lines and rows in their resting position — no slide/fade.
        gsap.set(".wwd-line, .wwd-row", { clearProps: "all" });
        return;
      }

      const lines = gsap.utils.toArray<HTMLElement>(".wwd-line", scope.current);
      const title = scope.current!.querySelector<HTMLElement>(".wwd-title")!;

      // Scrubbed: the reveal's progress is tied to the scroll position, so it
      // plays in as the title rises to center and cleanly reverses back out as
      // you scroll up — genuinely reversible, not a one-way trigger.
      gsap.from(lines, {
        // Start fully off its own edge of the viewport, then settle to center.
        x: (_i, el) =>
          (el as HTMLElement).dataset.dir === "-1"
            ? -window.innerWidth
            : window.innerWidth,
        opacity: 0,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: title,
          start: "top bottom", // title's top enters from the bottom edge
          end: "center center", // fully assembled when centered in view
          scrub: 1,
        },
      });

      // The capabilities list gets its own reversible scrubbed reveal, anchored
      // lower in the section: rows rise and fade in on scroll-down and cleanly
      // reverse back out on scroll-up.
      const rows = gsap.utils.toArray<HTMLElement>(".wwd-row", scope.current);
      gsap.from(rows, {
        y: 44,
        opacity: 0,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".wwd-list",
          start: "top bottom",
          end: "center center",
          scrub: 1,
        },
      });
    },
    { scope }
  );

  // Hover preview: a card that trails the cursor over the capability list and
  // flips through that row's frames for as long as the pointer stays inside it.
  // Mouse-only — touch has no hover state, and reduced motion gets nothing.
  useGSAP(
    () => {
      if (
        !window.matchMedia("(pointer: fine)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const card = scope.current!.querySelector<HTMLElement>(".wwd-preview")!;
      const layers = gsap.utils.toArray<HTMLElement>(".wwd-frame", card);
      const rows = gsap.utils.toArray<HTMLElement>(".wwd-row", scope.current);

      // x is the card's left edge (no xPercent) — `place` decides which side of
      // the pointer that edge lands on. yPercent keeps it centred vertically.
      gsap.set(card, { yPercent: -50, autoAlpha: 0, scale: 0.9 });
      gsap.set(layers, { autoAlpha: 0 });

      const xTo = gsap.quickTo(card, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3.out" });

      let timer: ReturnType<typeof setInterval> | null = null;
      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      // Where the card sits relative to the pointer: off to its right, with a
      // gap, vertically centred on it. Flips to the pointer's left when there
      // isn't room, so it never runs off the viewport edge.
      const place = (e: MouseEvent) => {
        const w = card.offsetWidth;
        const right = e.clientX + CARD_GAP;
        const x =
          right + w > window.innerWidth - CARD_GAP
            ? e.clientX - CARD_GAP - w
            : right;
        return { x, y: e.clientY };
      };

      const cleanups = rows.map((row, i) => {
        const frames = layers.filter((el) => el.dataset.row === String(i));
        let frame = 0;

        // Called once on enter and then on every tick, so the first image is
        // already up before the cycle's first interval elapses. Clears *every*
        // layer, not just this row's — the stack is shared, and a frame left
        // visible by a previous hover would paint over this row's if it sits
        // later in DOM order.
        const show = () => {
          gsap.set(layers, { autoAlpha: 0 });
          gsap.set(frames[frame % frames.length], { autoAlpha: 1 });
          frame += 1;
        };

        const enter = (e: MouseEvent) => {
          stop();
          frame = 0;
          show();
          // Jump to the pointer before fading in, so the card doesn't fly
          // across the section from wherever the last hover left it.
          gsap.set(card, place(e));
          gsap.to(card, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
            ease: "power3.out",
            overwrite: "auto",
          });
          timer = setInterval(show, FRAME_MS);
        };

        const move = (e: MouseEvent) => {
          const { x, y } = place(e);
          xTo(x);
          yTo(y);
        };

        const leave = () => {
          stop();
          gsap.to(card, {
            autoAlpha: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        row.addEventListener("mouseenter", enter);
        row.addEventListener("mousemove", move);
        row.addEventListener("mouseleave", leave);

        return () => {
          row.removeEventListener("mouseenter", enter);
          row.removeEventListener("mousemove", move);
          row.removeEventListener("mouseleave", leave);
        };
      });

      return () => {
        stop();
        cleanups.forEach((fn) => fn());
      };
    },
    { scope }
  );

  return (
    <section
      ref={scope}
      id="what"
      className="-mx-4 flex min-h-svh flex-col items-center justify-start overflow-hidden pt-[10vh] pb-[12vh] md:-mx-8"
    >
      <h2 className="wwd-title w-full text-center leading-[0.85] font-black select-none">
        {LINES.map(({ text, dir, className }) => (
          <span
            key={text}
            data-dir={dir}
            className={`wwd-line block will-change-transform ${className}`}
          >
            {text}
          </span>
        ))}
      </h2>

      <ul className="wwd-list mt-[10vh] w-full max-w-3xl border-b border-black/15 px-6">
        {CAPABILITIES.map(({ n, label, desc }) => (
          <li
            key={label}
            className="wwd-row group border-t border-black/15 will-change-transform"
          >
            <a
              href="/services"
              className="flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:justify-between md:gap-8"
            >
              <span className="flex items-baseline gap-3 md:shrink-0 md:gap-5">
                <span className="font-mono text-[0.7rem] tabular-nums text-black/40">
                  {n}
                </span>
                {/* nowrap so two-word labels ("Brand Design") stay on the
                    baseline instead of stacking when the row gets tight. */}
                <span className="text-3xl leading-none font-black tracking-[-0.02em] whitespace-nowrap uppercase md:text-5xl">
                  {label}
                </span>
              </span>
              <span className="flex items-center gap-2 text-sm text-black/55 md:min-w-0 md:text-right md:opacity-0 md:transition-opacity md:duration-500 md:group-hover:opacity-100">
                {desc}
                <span className="transition-transform duration-500 group-hover:translate-x-1">
                  ↗
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Cursor-trailing preview. Fixed (not absolute) so the section's
          overflow-hidden — needed for the title's off-screen slide-in — can't
          clip it near the list's edges. Under the cursor dot's z-50. */}
      <div
        aria-hidden
        className="wwd-preview pointer-events-none fixed top-0 left-0 z-40 hidden aspect-[3/2] w-80 overflow-hidden opacity-0 will-change-transform md:block lg:w-96"
      >
        {FRAMES.map(({ src, row, label }, i) => (
          <div
            key={src}
            className="wwd-frame absolute inset-0 opacity-0"
            data-row={row}
          >
            <Image
              src={src}
              alt={`${label} — frame ${i + 1}`}
              fill
              sizes="(min-width: 1024px) 24rem, 20rem"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
