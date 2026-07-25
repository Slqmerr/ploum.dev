"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

// Cream (#efe9e3) in cobe's 0–1 linear RGB — matches the page's --background so
// the landmass dots and markers read as the same off-white as the type.
const CREAM: [number, number, number] = [0.937, 0.914, 0.89];

// A few markers so the globe has some life. [lat, lng].
const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [37.9838, 23.7275], size: 0.06 }, // Athens
  { location: [51.5074, -0.1278], size: 0.045 }, // London
  { location: [40.7128, -74.006], size: 0.05 }, // New York
  { location: [35.6762, 139.6503], size: 0.045 }, // Tokyo
  { location: [37.7749, -122.4194], size: 0.04 }, // San Francisco
];

// Spinnable dotted globe (cobe v2). cobe has no internal render loop in v2, so
// we drive it from our own rAF via globe.update(). It auto-rotates when idle and
// follows a horizontal drag; the drag offset is eased in (manual lerp) so
// releasing glides to a stop instead of snapping. Sits beside the manifesto on
// the black band, themed cream-on-black to match the palette.
export default function Globe({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // clientX where the current drag started, pre-offset by prior movement so
  // successive drags accumulate; null whenever the pointer isn't held down.
  const pointerInteracting = useRef<number | null>(null);
  // Total horizontal drag distance so far (px); target for the eased rotation.
  const pointerMovement = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // Reduced motion: no idle auto-spin. The globe resolves to a still resting
    // state and only moves when the user drags it (user-initiated motion).
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = wrap.clientWidth;
    let needResize = false;

    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth;
      if (w && w !== width) {
        width = w;
        needResize = true;
      }
    });
    ro.observe(wrap);

    let phi = 0; // idle auto-rotation angle
    let rCurrent = 0; // eased drag offset, lerps toward pointerMovement
    let frame = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width,
      height: width,
      phi: 0,
      theta: 0.25, // slight tilt so the northern hemisphere faces us
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.32, 0.31, 0.29], // warm dark grey landmass
      markerColor: CREAM,
      glowColor: [0.44, 0.43, 0.4], // soft cream atmosphere halo
      markers: MARKERS,
    });

    const render = () => {
      if (pointerInteracting.current === null && !reduceMotion) phi += 0.004;
      // Ease the live drag distance into the rotation; /200 tunes drag speed.
      rCurrent += (pointerMovement.current / 200 - rCurrent) * 0.12;

      globe.update({
        phi: phi + rCurrent,
        // Only re-pass size on an actual resize — passing width/height every
        // frame would reallocate the drawing buffer and flicker.
        ...(needResize ? { width, height: width } : {}),
      });
      needResize = false;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    // Fade in once the first frame has painted, so there's no black square flash.
    const reveal = requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(reveal);
      ro.disconnect();
      globe.destroy();
    };
  }, []);

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = null;
    e.currentTarget.style.cursor = "grab";
  };

  return (
    <div ref={wrapRef} className={className}>
      {/* Square stage; the canvas fills it. aspect-square keeps a 1:1 buffer. */}
      <div className="relative aspect-square w-full">
        <canvas
          ref={canvasRef}
          aria-label="Interactive globe — drag to spin"
          role="img"
          // touch-pan-y: vertical swipes still scroll the page; horizontal drags
          // spin the globe instead of being swallowed by the browser.
          className="h-full w-full cursor-grab opacity-0 transition-opacity duration-700 touch-pan-y [contain:layout_paint_size]"
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX - pointerMovement.current;
            e.currentTarget.setPointerCapture(e.pointerId);
            e.currentTarget.style.cursor = "grabbing";
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerMove={(e) => {
            if (pointerInteracting.current !== null) {
              pointerMovement.current = e.clientX - pointerInteracting.current;
            }
          }}
        />
      </div>
    </div>
  );
}
