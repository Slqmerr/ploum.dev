"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The beats of the story, top to bottom. `side` only matters from md up —
// below that every card sits right of a single left-hand spine.
const STEPS: { n: string; title: string; body: string; side: "left" | "right" }[] =
  [
    {
      n: "01",
      title: "The brief",
      body: "We talk. I listen for the thing you actually need, which is rarely the thing on the wishlist.",
      side: "left",
    },
    {
      n: "02",
      title: "The grid",
      body: "Structure before decoration — type scale, spacing, hierarchy. If it works in black and white, it works.",
      side: "right",
    },
    {
      n: "03",
      title: "The motion",
      body: "Then it learns to move. Every easing curve is chosen, not defaulted, and every reveal answers the scroll.",
      side: "left",
    },
    {
      n: "04",
      title: "The build",
      body: "React, Next.js and TypeScript, end to end. Fast on a mid-range phone or it doesn't ship.",
      side: "right",
    },
    {
      n: "05",
      title: "The ship",
      body: "Deployed, measured, handed over — with the small details still intact. That's the whole point.",
      side: "left",
    },
  ];

// The heading, word by word — each one is its own animated inline-block.
// "actually" swaps to the italic serif, echoing the hero's artistic words.
const TITLE: { word: string; artistic?: boolean }[] = [
  { word: "How" },
  { word: "it" },
  { word: "actually", artistic: true },
  { word: "goes" },
];

// The viewport height fraction the drawing tip is pinned to — the reader's
// eye line. Cards resolve on it, the line arrives on it, markers ink on it.
const READ_LINE = 0.55;

type Point = { x: number; y: number };

// A snaking cubic through every anchor: each segment leaves and enters
// vertically, so the joins stay smooth and the curve reads as one thread.
// Control points never overshoot their segment, so the path stays monotonic
// in y — which is what lets `lengthAtY` binary-search it below.
function pathThrough(points: Point[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const bend = (b.y - a.y) * 0.45;
    d += ` C ${a.x.toFixed(1)} ${(a.y + bend).toFixed(1)} ${b.x.toFixed(
      1
    )} ${(b.y - bend).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

export default function StoryLine() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = scope.current!;
      const track = root.querySelector<HTMLElement>(".story-track")!;
      const svg = root.querySelector<SVGSVGElement>(".story-svg")!;
      const line = root.querySelector<SVGPathElement>(".story-line")!;
      const ghost = root.querySelector<SVGPathElement>(".story-ghost")!;
      const head = root.querySelector<SVGCircleElement>(".story-head")!;
      const cards = gsap.utils.toArray<HTMLElement>(".story-card", root);

      // Measure the anchors (which sit on the spine, outside the cards, so
      // they never move) in the track's own pixel space, then size the viewBox
      // 1:1 so the stroke never scales.
      const measure = () => {
        const box = track.getBoundingClientRect();
        svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);

        const points: Point[] = gsap.utils
          .toArray<HTMLElement>(".story-anchor", root)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              x: r.left - box.left + r.width / 2,
              y: r.top - box.top + r.height / 2,
            };
          });
        if (points.length === 0) return 0;

        // Lead-in from the top edge and a tail running off the bottom, so the
        // thread looks like it arrives from the section above and continues on.
        points.unshift({ x: points[0].x, y: 0 });
        points.push({ x: points[points.length - 1].x, y: box.height });

        const d = pathThrough(points);
        line.setAttribute("d", d);
        ghost.setAttribute("d", d);
        return box.height;
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Resting state: the whole thread drawn, everything in place, no head.
        // The heading needs no reset — it's authored at rest, so a skipped or
        // failed animation leaves a readable title.
        measure();
        gsap.set([...cards, ".story-word", ".story-eyebrow"], {
          clearProps: "all",
        });
        gsap.set(head, { autoAlpha: 0 });
        return;
      }

      // Heading — the same vocabulary as the hero title (rise out of a soft
      // blur, power2.out, staggered), scrubbed instead of timed so it reverses
      // on the way back up. Word by word: the eye reads it in the same order
      // the thread below is drawn. Geometry-independent, so unlike the track
      // it's built once and left to useGSAP's own cleanup.
      gsap.from(".story-eyebrow", {
        autoAlpha: 0,
        y: 16,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".story-heading",
          start: "top 92%",
          end: "top 70%",
          scrub: 1,
        },
      });

      gsap.from(".story-word", {
        autoAlpha: 0,
        yPercent: 40,
        filter: "blur(8px)",
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".story-heading",
          start: "top 88%",
          // Resolved by the time the heading hits the reader's eye line — the
          // same line the thread is drawn on below.
          end: `top ${READ_LINE * 100}%`,
          scrub: 1,
        },
      });

      let tweens: gsap.core.Tween[] = [];

      const build = () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
        tweens = [];

        const height = measure();
        if (!height) return;
        const total = line.getTotalLength();

        // Arc length ≠ vertical distance: the snake's curves are longer than
        // the drop they cover, so drawing at a constant rate would let the tip
        // fall behind the reader. Sample y at even arc-length steps once, then
        // look the length up by y — the tip stays welded to READ_LINE.
        const STEPS_ = 240;
        const ys: number[] = [];
        for (let i = 0; i <= STEPS_; i++) {
          ys.push(line.getPointAtLength((total * i) / STEPS_).y);
        }
        const lengthAtY = (y: number) => {
          if (y <= ys[0]) return 0;
          if (y >= ys[STEPS_]) return total;
          let lo = 0;
          let hi = STEPS_;
          while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (ys[mid] < y) lo = mid;
            else hi = mid;
          }
          const span = ys[hi] - ys[lo] || 1;
          return (total * (lo + (y - ys[lo]) / span)) / STEPS_;
        };

        // Partial stroke by dash pattern — no plugin, and it takes the exact
        // pixel length `lengthAtY` hands back.
        const drawTo = (len: number) => {
          line.style.strokeDasharray = `${len} ${total}`;
        };
        drawTo(0);
        gsap.set(head, { autoAlpha: 0 });

        // Scrubbed both ways: the thread draws on the way down and unwinds on
        // the way back up. `ease: none` because it's constant scroll-linked
        // motion, and the 0.4 scrub gives the tip a little glide under a flick.
        const state = { p: 0 };
        tweens.push(
          gsap.to(state, {
            p: 1,
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: `top ${READ_LINE * 100}%`,
              end: `bottom ${READ_LINE * 100}%`,
              scrub: 0.4,
            },
            onUpdate: () => {
              const len = lengthAtY(state.p * height);
              drawTo(len);
              const pt = line.getPointAtLength(len);
              // Transform, not cx/cy — it stays off the paint path. The tip
              // fades in and out at the extremes instead of parking on screen.
              gsap.set(head, {
                x: pt.x,
                y: pt.y,
                autoAlpha: gsap.utils.clamp(
                  0,
                  1,
                  Math.min(state.p / 0.03, (1 - state.p) / 0.03)
                ),
              });
            },
          })
        );

        // Cards assemble onto the thread: they drift in from their outer edge
        // (desktop) so the motion has a direction that matches the layout, and
        // land before the tip reaches them. ease-out — they're entering.
        const desktop = window.matchMedia("(min-width: 768px)").matches;
        cards.forEach((card) => {
          const outward = card.dataset.side === "left" ? -40 : 40;
          tweens.push(
            gsap.fromTo(
              card,
              { autoAlpha: 0, y: 32, x: desktop ? outward : 0 },
              {
                autoAlpha: 1,
                y: 0,
                x: 0,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 88%",
                  end: `top ${READ_LINE * 100 + 5}%`,
                  scrub: 1,
                },
              }
            )
          );

          // The marker inks as the tip passes it — a state change, so it gets
          // a tight window that reads as a snap rather than a slow fade, while
          // still reversing cleanly on the way back up.
          const marker = card.parentElement?.querySelector<HTMLElement>(
            ".story-marker"
          );
          if (!marker) return;
          tweens.push(
            gsap.fromTo(
              marker,
              // Literal, not var(--background) — GSAP's color parser can't
              // interpolate an unresolved custom property.
              { backgroundColor: "#efe9e3", scale: 1 },
              {
                backgroundColor: "#000000",
                scale: 1.35,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: `center ${READ_LINE * 100 + 1}%`,
                  end: `center ${READ_LINE * 100 - 5}%`,
                  scrub: 0.3,
                },
              }
            )
          );
        });
      };

      build();

      // Fonts land after first paint and change the card heights, so the path
      // is re-baked once they're in. Guarded: the promise can settle after the
      // component is gone, and tweens created then would never be cleaned up.
      let live = true;
      document.fonts?.ready.then(() => {
        if (live) build();
      });

      // Re-measure whenever the track resizes (breakpoint change, font swap,
      // reflow) — the path is baked from pixel positions, so it has to be
      // rebuilt rather than refreshed.
      let pending: number | undefined;
      const ro = new ResizeObserver(() => {
        window.clearTimeout(pending);
        pending = window.setTimeout(() => {
          build();
          ScrollTrigger.refresh();
        }, 150);
      });
      ro.observe(track);

      return () => {
        live = false;
        window.clearTimeout(pending);
        ro.disconnect();
      };
    },
    { scope }
  );

  return (
    <section ref={scope} id="process" className="mt-24 md:mt-36">
      {/* Heading block — one trigger for the eyebrow and the words below it */}
      <div className="story-heading">
          
        {/* Split by hand rather than by plugin — four words, and authoring them
            as spans keeps the title readable with JS off. The spaces stay
            outside the inline-blocks: they're the only break opportunities the
            heading has, so it can still wrap on a narrow screen. */}
        <h2 className="mt-6 max-w-4xl text-[clamp(2.4rem,8vw,7rem)] leading-[0.88] font-black tracking-[-0.03em] uppercase">
          {TITLE.map(({ word, artistic }, i) => (
            <Fragment key={word}>
              <span
                className={`story-word inline-block [will-change:transform,filter] ${
                  artistic ? "font-artistic lowercase italic" : ""
                }`}
              >
                {word}
              </span>
              {i < TITLE.length - 1 && " "}
            </Fragment>
          ))}
        </h2>
      </div>

      {/* The measured region: the SVG matches this box exactly, and the tail
          runs out through the bottom padding into the section below. */}
      <div className="story-track relative mt-[12vh] pb-[18vh]">
        <svg
          aria-hidden
          className="story-svg pointer-events-none absolute inset-0 h-full w-full overflow-visible text-black"
          fill="none"
        >
          {/* The route ahead, faint — then the ink that follows it */}
          <path
            className="story-ghost"
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeWidth="2"
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
          <path
            className="story-line"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle className="story-head" r="5" fill="currentColor" />
        </svg>

        <ol className="relative flex flex-col gap-[16vh] md:gap-[22vh]">
          {STEPS.map(({ n, title, body, side }) => {
            const left = side === "left";
            return (
              <li
                key={n}
                className="relative grid grid-cols-[2.5rem_1fr] md:grid-cols-[1fr_7rem_1fr]"
              >
                {/* The station the thread is drawn through. It lives on the
                    row, not the card, so it stays welded to the line while the
                    card slides into place beside it.

                    It sits beside the card, never on it: the 7rem gutter runs
                    ±3.5rem from centre and the anchors sit at ±1.75rem, which
                    leaves ~10px between the marker at its inked size (size-3
                    rotated 45° and scaled 1.35 ≈ 23px across) and the card's
                    edge — and clears the 6px hard shadow on the left card's
                    inner side too. Move these two values and the path re-bakes
                    around them; there is no matching constant in the JS. */}
                <span
                  aria-hidden
                  className={`story-anchor absolute top-1/2 left-5 z-10 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${
                    left
                      ? "md:left-[calc(50%-1.75rem)]"
                      : "md:left-[calc(50%+1.75rem)]"
                  }`}
                >
                  <span className="story-marker size-3 rotate-45 border-2 border-black bg-background" />
                </span>

                <article
                  data-side={side}
                  className={`story-card relative col-start-2 border-2 border-black bg-background p-6 shadow-[6px_6px_0_0_#000] will-change-transform md:p-8 ${
                    left ? "md:col-start-1" : "md:col-start-3"
                  }`}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[0.7rem] tabular-nums text-black/40">
                      {n}
                    </span>
                    <h3 className="text-2xl leading-none font-black tracking-[-0.02em] uppercase md:text-4xl">
                      {title}
                    </h3>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed font-medium text-black/70 md:text-base">
                    {body}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
