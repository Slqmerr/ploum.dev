import AboutBand from "./components/AboutBand";
import CurtainFooter from "./components/CurtainFooter";
import Marquee from "./components/Marquee";
import WorkShowcase from "./components/WorkShowcase";
import HoverSpots from "./components/HoverSpots";
import PizzaEasterEgg from "./components/PizzaEasterEgg";
import Reveal from "./components/Reveal";
import ScrollProgress from "./components/ScrollProgress";
import SocialLinks from "./components/SocialLinks";
import TopHeader from "./components/TopHeader";

export default function Home() {
  return (
    // No z-index here: a stacking context on main would isolate the sticky
    // header's mix-blend-difference from the page backdrop, breaking the
    // inverted-text effect. Paint order vs the grain overlay and the fixed
    // layers is already guaranteed by tree order and their own z-indexes.
    <main
      id="top"
      className="relative flex-1 px-4 pt-5 pb-4 selection:bg-black selection:text-background md:px-8 md:pt-6 md:pb-6"
    >
      {/* Counter-scrolled by CurtainFooter so it holds still under the glass */}
      <div id="page-content" className="flex min-h-svh flex-col">
        {/* Top header — strict four-column grid */}
        <TopHeader />

        {/* Primary hero */}
        <section className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:gap-8">
          <h1 className="text-[clamp(3.4rem,9.6vw,12rem)] leading-[0.85] font-black tracking-[-0.04em] uppercase select-none">
            <Reveal
              lines={["Meet Ploum"]}
              delay={1.6}
              highlight
              artisticWords={["Ploum"]}
            />
          </h1>
          <SocialLinks className="md:ml-auto md:items-end md:pb-2" />
        </section>

        {/* Subtitle + bio on the left, hover spots aligned to the same top */}
        <section className="mt-4 grid grid-cols-12 items-start gap-4 md:mt-6">
          <div className="col-span-12 md:col-span-6 md:col-start-1">
            {/* Hero subtitle */}
            <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase md:text-xs">
              Web Design &amp; Development
            </p>

            {/* Bio blurb — template copy, replace with real bio */}
            <p className="mt-4 max-w-xl text-xs leading-relaxed font-medium md:text-sm">
              I build fast, expressive interfaces where design and engineering
              meet. Fluent in React, Next.js, and motion design — and endlessly
              curious about typography, interaction, and the small details that
              make the web feel alive.
            </p>
          </div>

          {/* Invisible hover spots on the right, top-aligned with the text */}
          <HoverSpots className="hidden md:col-span-5 md:col-start-8 md:row-start-1 md:grid md:aspect-[16/9] lg:col-span-6 lg:col-start-7" />
        </section>

        {/* Middle section — asymmetrical */}
        <section className="mt-10 grid grid-cols-12 items-end gap-4 md:mt-16">
          {/* Pizza caption on the left */}
          <div className="col-span-12 self-end sm:col-span-6 md:col-span-3 md:col-start-1">
            <PizzaEasterEgg />
          </div>
        </section>

        {/* Pinned horizontal work showcase — vertical scroll pans the wall */}
        <WorkShowcase />

        {/* Manifesto — black band; flips the difference-blend header white */}
        <AboutBand />

        {/* Scroll-velocity marquee divider */}
        <Marquee />

        {/* Bottom typography */}
        <section className="mt-14 flex flex-1 items-end justify-end">
          <h2 className="text-right text-[clamp(2.8rem,9.6vw,10.5rem)] leading-[0.85] font-black tracking-[-0.04em] uppercase select-none">
            <Reveal lines={["Ioannis", "Ploumakis"]} />
          </h2>
        </section>
      </div>

      {/* Scroll-progress rail pinned to the right edge of the viewport */}
      <ScrollProgress />

      {/* Frosted-glass curtain footer revealed at the end of the page */}
      <CurtainFooter />
    </main>
  );
}
