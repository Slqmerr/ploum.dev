import Chapter from "../components/Chapter";
import CurtainFooter from "../components/CurtainFooter";
import TopHeader from "../components/TopHeader";

export const metadata = {
  title: "Services — Ploum",
  description: "What Ioannis Ploumakis does: development, motion, design.",
};

export default function Services() {
  return (
    <main
      id="top"
      className="relative flex-1 px-4 pt-5 pb-4 selection:bg-black selection:text-background md:px-8 md:pt-6 md:pb-6"
    >
      <div id="page-content" className="flex min-h-svh flex-col">
        <TopHeader />

        <h1 className="mt-14 text-[clamp(3rem,9vw,10rem)] leading-[0.85] font-black tracking-[-0.04em] uppercase select-none md:mt-20">
          Services
        </h1>

        {/* Storytelling chapters — sticky image + revealing narrative, zig-zag */}
        <Chapter
          index="01"
          title="DEVELOPMENT"
          imageSide="left"
          paragraphs={[
            "I'm Ploum — a 21-year-old front-end developer based in Larissa, Greece, currently studying Digital Systems.",
            "I got into the web because I wanted to make things that move: interfaces that feel alive rather than static screens.",
            "When I'm not studying, I'm freelancing and building side projects — always chasing the next detail worth obsessing over.",
          ]}
        />

        <Chapter
          index="02"
          title="MOTION"
          imageSide="right"
          paragraphs={[
            "I design and build front-ends end to end — from the first grid sketch to the last easing curve.",
            "My toolkit is React, Next.js and TypeScript, with GSAP and Tailwind for motion and craft.",
            "The goal is always the same: interfaces that are fast, expressive, and a little bit playful.",
          ]}
        />

        <Chapter
          index="03"
          title="DESIGN"
          imageSide="left"
          paragraphs={[
            "I sweat the details most people skip: the timing of a transition, the weight of a typeface, the way a page answers your scroll.",
            "Performance and accessibility matter as much as aesthetics — motion should feel effortless and work for everyone.",
            "Every project is a story. I try to make each one worth reading to the end.",
          ]}
        />

        {/* Spacer so the last chapter breathes before the curtain footer */}
        <div className="pb-[20vh] md:pb-[28vh]" />
      </div>

      <CurtainFooter />
    </main>
  );
}
