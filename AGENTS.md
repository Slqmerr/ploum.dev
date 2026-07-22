<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Animation conventions

Scroll-triggered animations in this project are **reversible**: they play in on
scroll-down and **reverse (revert)** on scroll-up — the animation runs backwards
and the element returns to its pre-animation state. It must **not** replay
forward on scroll-back, and it must **not** be a one-shot (`once: true`).

Prefer **scrubbing** the reveal — tie its progress to scroll position with
`scrub: 1` and a real `start`/`end` window (e.g. `start: "top bottom"`,
`end: "center center"`), so the element animates in and cleanly reverses out as
the user scrolls either way, always on-screen. Note `toggleActions: "play none
none reverse"` is *not* reliably reversible for tall/centered sections: its
reverse only fires at a single threshold that is often off-screen by the time it
triggers. Only drop to a non-reversible one-shot when the user explicitly asks.

All GSAP components follow the same baseline:
- `"use client"`, a `scope` ref, and `useGSAP(() => {...}, { scope })`.
- A `prefers-reduced-motion: reduce` guard at the top that resolves elements to
  their resting state (e.g. `gsap.set(..., { clearProps: "all" })`) and returns
  before registering any tween/ScrollTrigger.
- `will-change-transform` on animated elements and `overflow-hidden` on
  containers whose children start off-screen.
- Register plugins once at module scope: `gsap.registerPlugin(useGSAP, ScrollTrigger)`.