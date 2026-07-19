"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SocialLinks from "./SocialLinks";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CurtainFooter() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Tailwind motion-reduce classes put the footer back in flow;
        // clear the inline no-flash transform so it isn't shifted.
        gsap.set(".curtain-footer", { clearProps: "transform" });
        return;
      }

      // Plays the moment the page content's bottom reaches the viewport
      // bottom, covering the current screen; reverses on scroll back up.
      // y: 0 clears the inline translateY(100%) no-flash fallback.
      gsap
        .timeline({
          defaults: { duration: 0.9, ease: "power3.inOut" },
          scrollTrigger: {
            trigger: document.getElementById("page-content"),
            start: "bottom bottom",
            toggleActions: "play none none reverse",
          },
        })
        .fromTo(
          ".curtain-footer",
          { yPercent: 100, y: 0 },
          { yPercent: 0, y: 0 }
        )
        // Content lags behind the glass sheet for a slight unrolling depth.
        .fromTo(".curtain-inner", { yPercent: -30 }, { yPercent: 0 }, "<");
    },
    { scope }
  );

  return (
    <div ref={scope} id="contact">
      <footer
        className="curtain-footer fixed inset-0 z-30 min-h-svh overflow-hidden bg-background/40 backdrop-blur-xl will-change-transform motion-reduce:static"
        style={{ transform: "translateY(100%)" }}
      >
        <div className="curtain-inner flex h-full min-h-svh flex-col justify-between px-4 pt-5 pb-4 md:px-8 md:pt-6 md:pb-6">
          {/* my-auto centers the email block in the space the sticky
              TopHeader (which floats above the glass) leaves free. */}
          <div className="my-auto flex flex-col gap-4">
            <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase md:text-xs">
              (02) — Have an idea? Let&apos;s talk.
            </p>
            <a
              href="mailto:gploumakis24@gmail.com"
              className="w-fit max-w-full text-[clamp(1.4rem,4.6vw,5.5rem)] leading-[0.95] font-black tracking-[-0.03em] break-all uppercase"
            >
              gploumakis24@gmail.com
            </a>
          </div>

          <div className="flex items-end justify-between text-[0.65rem] font-bold tracking-[0.15em] uppercase md:text-xs">
            <SocialLinks />
            <p className="hidden sm:block">© 2026</p>
            <a href="#top" className="hover:underline">
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
