"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/", label: "Instagram" },
  { href: "https://www.linkedin.com/", label: "Linkedin" },
  { href: "https://github.com/", label: "Github" },
];

function Chars({ text }: { text: string }) {
  return (
    <>
      {[...text].map((char, i) => (
        <span key={i} className="roll-char inline-block will-change-transform">
          {char}
        </span>
      ))}
    </>
  );
}

export default function SocialLinks({ className = "" }: { className?: string }) {
  const scope = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".social-item", { clearProps: "transform" });
        return;
      }

      // y: 0 clears the inline no-flash fallback transforms.
      gsap.fromTo(
        ".social-item",
        { yPercent: 115, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.09,
          delay: 0.5,
        }
      );

      // One paused roll per link, replayed via play()/reverse(). Creating a
      // fresh staggered tween per hover event let an old leave tween and a
      // new enter tween run on the same chars at once.
      const links = scope.current!.querySelectorAll("a");
      const cleanups = [...links].map((link) => {
        const roll = gsap.to(link.querySelectorAll(".roll-char"), {
          yPercent: -100,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.025,
          paused: true,
        });
        const enter = () => roll.play();
        const leave = () => roll.reverse();
        link.addEventListener("mouseenter", enter);
        link.addEventListener("mouseleave", leave);
        return () => {
          link.removeEventListener("mouseenter", enter);
          link.removeEventListener("mouseleave", leave);
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope }
  );

  return (
    <ul
      ref={scope}
      aria-label="Social links"
      className={`flex flex-col gap-1.5 text-[0.65rem] leading-tight font-bold tracking-[0.15em] uppercase md:text-xs ${className}`}
    >
      {SOCIAL_LINKS.map(({ href, label }) => (
        <li key={label} className="overflow-hidden">
          <span
            className="social-item block will-change-transform"
            style={{ transform: "translateY(115%)" }}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block overflow-hidden"
            >
              <span className="block">
                <Chars text={label} />
              </span>
              <span aria-hidden className="absolute top-full left-0 block">
                <Chars text={label} />
              </span>
            </a>
          </span>
        </li>
      ))}
    </ul>
  );
}
