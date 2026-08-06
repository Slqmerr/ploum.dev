"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ClaudeSpark from "./ClaudeSpark";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The stack, told as five ways to say the same sentence. Each entry is one
// file in a macOS-style editor window: pick a tab, the snippet types itself
// out and prints its result. Keep snippets short (<= MAX ~6 lines) and lines
// under ~48 chars so nothing needs horizontal scrolling on a laptop.
const STACKS = [
  {
    id: "typescript",
    label: "TypeScript",
    file: "hello.ts",
    accent: "#3178C6",
    out: "Hello, world!",
    code: `// hello.ts
type Greeting = \`Hello, \${string}!\`;

const greet = (name: string): Greeting =>
  \`Hello, \${name}!\`;

console.log(greet("world"));`,
  },
  {
    id: "react",
    label: "React",
    file: "Hello.tsx",
    accent: "#61DAFB",
    out: "<h1>Hello, world!</h1>",
    code: `// Hello.tsx
export function Hello({ name }: Props) {
  return <h1>Hello, {name}!</h1>;
}

<Hello name="world" />`,
  },
  {
    id: "next",
    label: "Next.js",
    file: "app/page.tsx",
    accent: "#ffffff",
    out: "prerendered · app/page.tsx",
    code: `// app/page.tsx
export default async function Page() {
  const name = await getVisitor();

  return <main>Hello, {name}!</main>;
}`,
  },
  {
    id: "gsap",
    label: "GSAP",
    file: "hello.js",
    accent: "#0AE448",
    out: "H → He → Hel → Hello, world!",
    code: `// hello.js
gsap.to(".hello", {
  text: "Hello, world!",
  duration: 1.2,
  ease: "power4.out",
});`,
  },
  {
    id: "tailwind",
    label: "Tailwind",
    file: "hello.html",
    accent: "#38BDF8",
    out: "Hello, world!",
    code: `<!-- hello.html -->
<p class="text-4xl font-black tracking-tight">
  Hello, world!
</p>`,
  },
] as const;

// Tallest snippet decides the code area's height, so switching tabs never
// reflows the page underneath the window.
const MAX_LINES = Math.max(
  ...STACKS.map((s) => s.code.split("\n").length)
);

// Xcode-dark-ish palette — the Apple-editor look, warm pinks and salmons on
// near-black rather than the cooler VS Code default.
const COLORS: Record<string, string> = {
  cmt: "#7f8c98",
  str: "#ff8170",
  kw: "#ff7ab2",
  typ: "#dabaff",
  num: "#d9c97c",
  fn: "#6bdfff",
  tag: "#6bdfff",
  attr: "#b6a0ff",
  pn: "#a5abb4",
  "": "#e8e8ed",
};

// Deliberately tiny tokenizer: these five snippets are the only input it will
// ever see, so ordered longest-match-first rules beat pulling in a highlighter.
const RULES: { re: RegExp; c: string }[] = [
  { re: /^\s+/, c: "" },
  { re: /^<!--[\s\S]*?-->/, c: "cmt" },
  { re: /^\/\/.*/, c: "cmt" },
  { re: /^(?:`(?:\\.|[^`])*`|"(?:\\.|[^"])*"|'(?:\\.|[^'])*')/, c: "str" },
  { re: /^(?:<\/?[A-Za-z][\w.-]*|\/?>)/, c: "tag" },
  {
    re: /^\b(?:const|let|var|function|return|export|default|async|await|import|from|type|interface|class|new|if|else)\b/,
    c: "kw",
  },
  { re: /^\b(?:string|number|boolean|void|Props)\b/, c: "typ" },
  { re: /^\d[\d_.]*/, c: "num" },
  { re: /^[a-z-]+(?=\s*=\s*")/, c: "attr" },
  { re: /^[A-Za-z_$][\w$]*(?=\s*\()/, c: "fn" },
  { re: /^[A-Z][\w$]*/, c: "typ" },
  { re: /^[A-Za-z_$][\w$]*/, c: "" },
  { re: /^[^\sA-Za-z0-9_$]/, c: "pn" },
];

function tokenize(line: string) {
  const out: { t: string; c: string }[] = [];
  let rest = line;
  while (rest) {
    const hit = RULES.find(({ re }) => re.test(rest));
    // Unreachable in practice — the last rule matches any single character —
    // but bail rather than spin if a snippet ever contains something exotic.
    if (!hit) {
      out.push({ t: rest, c: "" });
      break;
    }
    const [match] = hit.re.exec(rest)!;
    out.push({ t: match, c: hit.c });
    rest = rest.slice(match.length);
  }
  return out;
}

// Typing is a left-to-right clip on each line (stepped, one step per
// character) rather than per-character DOM — the syntax colors stay intact
// and there is exactly one animated element per line.
const CLIP_HIDDEN = "inset(0 100% 0 0)";
const CLIP_SHOWN = "inset(0 0% 0 0)";
const SECONDS_PER_CHAR = 0.022;
const BLANK_LINE_PAUSE = 0.12;
const CARET_NUDGE = 3;

// Heading, one masked line per entry. Letters rise out of the mask on scroll.
const HEAD_LINES = ["My", "Stack"];
// Bottom edge does the hiding; the other three bleed outward so nothing that
// legitimately overhangs a line gets shaved — most of all the Claude burst
// perched above and right of the final K, mid-spin.
const LINE_MASK = "inset(-1em -1.2em 0 -0.25em)";
const CHAR_HIDDEN_Y = 118;
// Dwell on a finished snippet before the carousel moves on.
const DWELL_MS = 2400;

export default function StackWindow() {
  const scope = useRef<HTMLElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  // Once you pick a tab, the auto-cycle stops for good — it's your window now.
  const [pinned, setPinned] = useState(false);

  const stack = STACKS[active];
  const lines = stack.code.split("\n");

  // Reveal + first-view trigger. Scrubbed and reversible per house style: the
  // window rises into place on the way down and cleanly backs out on the way up.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".stack-window, .sw-char", { clearProps: "all" });
        gsap.set(".sw-line", { clipPath: "none" });
        setStarted(true);
        return;
      }

      // Heading: letters rise out of their mask, staggered, tied to the scroll
      // position rather than fired once — so it assembles on the way down and
      // takes itself apart on the way back up.
      gsap.from(".sw-char", {
        yPercent: CHAR_HIDDEN_Y,
        ease: "power3.out",
        stagger: 0.05,
        scrollTrigger: {
          trigger: headRef.current,
          start: "top bottom",
          end: "center center",
          scrub: 1,
        },
      });

      gsap.from(".stack-window", {
        y: 90,
        opacity: 0,
        scale: 0.98,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".stack-window",
          start: "top bottom",
          end: "center center",
          scrub: 1,
        },
      });

      // Typing starts the first time the window is properly on screen, not on
      // mount — otherwise the whole show is over before you scroll to it.
      ScrollTrigger.create({
        trigger: scope.current,
        start: "top 70%",
        once: true,
        onEnter: () => setStarted(true),
      });
    },
    { scope }
  );

  // The typing pass itself. Re-runs per tab; revertOnUpdate hands each new
  // snippet a clean slate.
  useGSAP(
    () => {
      if (!started) return;

      const lineEls = gsap.utils.toArray<HTMLElement>(
        ".stack-line",
        codeRef.current
      );
      const caret = codeRef.current!.querySelector<HTMLElement>(".stack-caret")!;
      const output = scope.current!.querySelector<HTMLElement>(".stack-out")!;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(lineEls, { clipPath: CLIP_SHOWN });
        gsap.set(caret, { opacity: 0 });
        gsap.set(output, { opacity: 1 });
        return;
      }

      let advance: number | undefined;

      const tl = gsap.timeline({
        onComplete: () => {
          // Idle caret blink once the file is "written".
          gsap.to(caret, {
            opacity: 0,
            duration: 0.5,
            ease: "steps(1)",
            repeat: -1,
            yoyo: true,
          });
          if (!pinned) {
            advance = window.setTimeout(
              () => setActive((i) => (i + 1) % STACKS.length),
              DWELL_MS
            );
          }
        },
      });

      tl.set(lineEls, { clipPath: CLIP_HIDDEN })
        .set(caret, { opacity: 1 })
        .set(output, { opacity: 0 });

      lineEls.forEach((el) => {
        const chars = (el.textContent ?? "").length;
        const width = el.scrollWidth;
        // Caret is 1.2em tall inside a 1.7em line box — nudge it onto the
        // text's own baseline band instead of the top of the row.
        const top = el.offsetTop + CARET_NUDGE;
        const left = el.offsetLeft;

        if (chars === 0) {
          // Blank line: nothing to type, just move the caret down a row.
          tl.set(caret, { x: left, y: top }).to({}, { duration: BLANK_LINE_PAUSE });
          return;
        }

        const duration = chars * SECONDS_PER_CHAR;
        tl.set(caret, { x: left, y: top })
          .to(el, {
            clipPath: CLIP_SHOWN,
            duration,
            ease: `steps(${chars})`,
          })
          .to(
            caret,
            { x: left + width, duration, ease: `steps(${chars})` },
            "<"
          );
      });

      tl.to(output, { opacity: 1, duration: 0.35, ease: "power2.out" }, "+=0.15");

      return () => {
        if (advance) window.clearTimeout(advance);
      };
    },
    { scope, dependencies: [active, started, pinned], revertOnUpdate: true }
  );

  return (
    <section
      ref={scope}
      id="stack"
      className="flex min-h-svh flex-col items-center justify-center gap-10 py-[12vh]"
    >
      <div className="w-full max-w-3xl">
        
        <h2
          ref={headRef}
          className="sw-head mt-3 text-[clamp(2.6rem,9vw,7rem)] leading-[0.85] font-black tracking-[-0.03em] uppercase"
        >
          {HEAD_LINES.map((line, li) => (
            <span
              key={line}
              // pb widens the clip box past the baseline so glyph bottoms are
              // never shaved at leading-[0.85]; the matching -mb keeps the two
              // lines as tight as they look. Letters sit ~1em lower than this
              // while hidden, so the extra room leaks nothing.
              className="sw-line block pb-[0.14em] -mb-[0.14em]"
              style={{ clipPath: LINE_MASK }}
            >
              {[...line].map((char, ci) => {
                // The burst rides the final K itself, not a static wrapper, so
                // it rises with the letter instead of hovering over its ghost.
                const carriesSpark =
                  li === HEAD_LINES.length - 1 && ci === line.length - 1;
                return (
                  <span
                    key={ci}
                    className={`sw-char inline-block will-change-transform ${
                      carriesSpark ? "relative" : ""
                    }`}
                  >
                    {char}
                    {carriesSpark && (
                      <ClaudeSpark
                        size="0.4em"
                        className="absolute -top-[0.1em] -right-[0.26em]"
                        scrollSpin={{ trigger: headRef, degrees: 360 }}
                      />
                    )}
                  </span>
                );
              })}
            </span>
          ))}
        </h2>
        <p className="mt-5 max-w-md text-sm text-black/55">
          Five tools, one sentence. Pick a tab — the file writes itself.
        </p>
      </div>

      {/* macOS editor window: chrome, tab bar, gutter, console strip. */}
      <div className="stack-window w-full max-w-3xl overflow-hidden rounded-[14px] border border-black/10 bg-[#1c1c1f] shadow-[0_40px_80px_-32px_rgba(0,0,0,0.55)] will-change-transform">
        <div className="relative flex items-center gap-2 border-b border-white/[0.08] bg-[#2a2a2e] px-4 py-3">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span
              key={c}
              aria-hidden
              className="h-[11px] w-[11px] rounded-full"
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="absolute inset-x-0 text-center font-mono text-[11px] text-white/45">
            {stack.file}
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Stack"
          className="flex overflow-x-auto border-b border-white/[0.08] bg-[#232326]"
        >
          {STACKS.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls="stack-panel"
              onClick={() => {
                setActive(i);
                setPinned(true);
              }}
              className={`shrink-0 border-b-2 px-4 py-2.5 font-mono text-[11px] whitespace-nowrap transition-colors duration-300 ${
                i === active
                  ? "bg-[#1c1c1f] text-white/90"
                  : "border-b-transparent text-white/40 hover:text-white/70"
              }`}
              style={
                i === active ? { borderBottomColor: s.accent } : undefined
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        <div
          id="stack-panel"
          role="tabpanel"
          aria-label={`${stack.label} — hello world`}
          ref={codeRef}
          className="relative overflow-x-auto px-4 py-5 font-mono text-[13px] leading-[1.7]"
          style={{ minHeight: `calc(${MAX_LINES * 1.7}em + 2.5rem)` }}
        >
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="w-4 shrink-0 text-right text-white/20 select-none">
                {i + 1}
              </span>
              <span
                className="stack-line whitespace-pre will-change-[clip-path]"
                style={{ clipPath: CLIP_HIDDEN }}
              >
                {tokenize(line).map((tok, ti) => (
                  <span key={ti} style={{ color: COLORS[tok.c] }}>
                    {tok.t}
                  </span>
                ))}
              </span>
            </div>
          ))}
          <span
            aria-hidden
            className="stack-caret pointer-events-none absolute top-0 left-0 h-[1.2em] w-[1.5px] bg-white/75 opacity-0 will-change-transform"
          />
        </div>

        <div className="flex items-center gap-3 border-t border-white/[0.08] bg-[#151517] px-4 py-3 font-mono text-[11px]">
          <span className="text-white/30 select-none">output</span>
          <span
            className="stack-out truncate opacity-0"
            style={{ color: stack.accent }}
          >
            {stack.out}
          </span>
        </div>
      </div>
    </section>
  );
}
