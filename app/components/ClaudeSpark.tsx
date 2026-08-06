"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The official Claude mark, single path on a 24×24 grid (source: the
// simple-icons distribution of Anthropic's logo). Inlined rather than loaded
// from /public so it can inherit color and be animated directly.
const CLAUDE_PATH =
  "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z";

// Anthropic's clay, so the mark reads as itself against the cream paper.
const CLAY = "#d97757";
const ORIGIN = "12 12";

// The mark fills its 24×24 grid edge to edge, so its longest ray tips sit ~17
// units out at the corners. Spin it and those tips sweep to the middle of an
// edge — outside the box — and the scale pop adds another 14%. An SVG clips at
// its viewBox, so the box is padded by PAD on every side and the element is
// scaled up to match, keeping the mark the same apparent size with room to
// turn. PAD ≈ 17 × 1.14 − 12.
const PAD = 8;
const BOX = 24 + PAD * 2;
const BOX_SCALE = BOX / 24;

// Hover: the burst swings round and overshoots before settling — the springy
// turn the logo does on claude.ai, not a linear spin.
const SPIN_DEG = 150;
const SPIN_DURATION = 1.1;
// Idle drift, slow enough to read as "alive" rather than "spinning".
const IDLE_ROTATION_S = 48;

export default function ClaudeSpark({
  size = "0.4em",
  className = "",
  scrollSpin,
}: {
  /** Visual width of the mark itself — the spin padding is added on top. */
  size?: string;
  className?: string;
  /**
   * Wind the mark up and unwind it as `trigger` crosses the viewport, on its
   * own layer so it stacks with the idle drift and the hover spin instead of
   * fighting them.
   */
  scrollSpin?: {
    trigger: React.RefObject<HTMLElement | null>;
    degrees?: number;
    start?: string;
    end?: string;
  };
}) {
  const scope = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".spark-mark, .spark-idle, .spark-scroll", {
          clearProps: "all",
        });
        return;
      }

      const idle = scope.current!.querySelector<SVGGElement>(".spark-idle")!;
      const mark = scope.current!.querySelector<SVGPathElement>(".spark-mark")!;
      const scroll = scope.current!.querySelector<SVGGElement>(".spark-scroll")!;

      // Scrubbed wind-up: starts a full turn back and lands square as the
      // heading assembles, reversing cleanly on the way back up.
      if (scrollSpin?.trigger.current) {
        gsap.fromTo(
          scroll,
          { rotation: -(scrollSpin.degrees ?? 360) },
          {
            rotation: 0,
            svgOrigin: ORIGIN,
            ease: "none",
            scrollTrigger: {
              trigger: scrollSpin.trigger.current,
              start: scrollSpin.start ?? "top bottom",
              end: scrollSpin.end ?? "center center",
              scrub: 1,
            },
          }
        );
      }

      // Two nested groups so the two motions never fight: the outer one drifts
      // forever, the inner one takes the hover spin and its scale pop.
      gsap.to(idle, {
        rotation: 360,
        svgOrigin: ORIGIN,
        duration: IDLE_ROTATION_S,
        ease: "none",
        repeat: -1,
      });

      const spin = () => {
        gsap.to(mark, {
          rotation: `+=${SPIN_DEG}`,
          svgOrigin: ORIGIN,
          duration: SPIN_DURATION,
          ease: "elastic.out(1, 0.62)",
          overwrite: "auto",
        });
        gsap.fromTo(
          mark,
          { scale: 1 },
          {
            scale: 1.14,
            svgOrigin: ORIGIN,
            duration: 0.26,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          }
        );
      };

      // Hover target is whatever the mark is pinned to — the letter it sits on
      // — so the whole glyph is the hit area, not this ~20px logo.
      const hit = scope.current!.parentElement ?? scope.current!;
      hit.addEventListener("mouseenter", spin);

      // One pass on the way in, so it performs without needing a hover.
      const st = ScrollTrigger.create({
        trigger: scope.current,
        start: "top 85%",
        once: true,
        onEnter: spin,
      });

      return () => {
        hit.removeEventListener("mouseenter", spin);
        st.kill();
      };
    },
    { scope }
  );

  return (
    <svg
      ref={scope}
      viewBox={`${-PAD} ${-PAD} ${BOX} ${BOX}`}
      aria-hidden
      focusable="false"
      className={`pointer-events-none overflow-visible ${className}`}
      // The negative margin cancels the padded box, so callers position
      // against the visible mark and never have to know about the headroom.
      style={{
        width: `calc(${size} * ${BOX_SCALE})`,
        margin: `calc(${size} * ${(1 - BOX_SCALE) / 2})`,
      }}
    >
      {/* One group per motion — scroll wind-up, idle drift, hover spin — so
          three rotations compose instead of overwriting each other. */}
      <g className="spark-scroll will-change-transform">
        <g className="spark-idle will-change-transform">
          <path
            className="spark-mark will-change-transform"
            d={CLAUDE_PATH}
            fill={CLAY}
          />
        </g>
      </g>
    </svg>
  );
}
