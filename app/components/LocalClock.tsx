"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

// Always Larissa's local time, regardless of the viewer's timezone.
function greekTime() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Athens",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

// Poll every second; getSnapshot returns the same string within a minute, so
// React only re-renders (and the roll only fires) when the label changes.
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

export default function LocalClock() {
  // Empty server snapshot avoids a hydration mismatch; the client fills it in.
  const time = useSyncExternalStore(subscribe, greekTime, () => "");
  const timeRef = useRef<HTMLSpanElement>(null);

  // Split "10:30 AM" into hour / minute+meridiem so the colon can blink alone.
  const colon = time.indexOf(":");
  const hour = colon === -1 ? time : time.slice(0, colon);
  const rest = colon === -1 ? "" : time.slice(colon + 1);

  // Roll the new time up as it changes.
  useEffect(() => {
    if (!time || !timeRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      timeRef.current,
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, [time]);

  return (
    <span className="inline-flex items-baseline gap-x-1.5">
      <span className="liquid-text">Larissa, Greece</span>
      {/* overflow-hidden clips the incoming time for the roll */}
      <span className="inline-block overflow-hidden">
        <span
          ref={timeRef}
          suppressHydrationWarning
          className="inline-block tabular-nums will-change-transform"
        >
          {colon === -1 ? (
            time
          ) : (
            <>
              {hour}
              <span className="clock-colon">:</span>
              {rest}
            </>
          )}
        </span>
      </span>
    </span>
  );
}
