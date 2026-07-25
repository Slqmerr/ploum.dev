import AboutBand from "./components/AboutBand";
import CurtainFooter from "./components/CurtainFooter";
import GithubContributions from "./components/GithubContributions";
import HeroTitle from "./components/HeroTitle";
import ContactMarquee from "./components/ContactMarquee";
import Manifesto from "./components/Manifesto";
import WhatWeDo from "./components/WhatWeDo";
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
      <div id="page-content" className="relative flex min-h-svh flex-col">
        {/* Scroll-drawn line threading from What We Do down to the manifesto */}
        

        {/* First screen — holds the header + hero and fills exactly one
            viewport minus the main's top padding (pt-5 / md:pt-6), so the
            header's own height is counted automatically and the manifesto's
            top edge lands right at the fold on every device. */}
        <div className="flex min-h-[calc(100svh-1.25rem)] flex-col md:min-h-[calc(100svh-1.5rem)]">
          {/* Top header — strict four-column grid */}
          <TopHeader />

          {/* Primary hero — grows to fill the first screen so the heading +
              contribution graph land as one centered group, both horizontally
              and vertically, always within a single viewport (no scroll to
              reveal the graph). Social links stay pinned to the right edge. */}
          <section id="hero" className="relative flex flex-1 flex-col items-center justify-center gap-8 py-8 md:gap-12">
          <HeroTitle className="text-center text-[clamp(3.4rem,9.6vw,12rem)] leading-[0.85] font-black tracking-[-0.04em] uppercase select-none" />
          {/* A year of GitHub activity as a quiet monochrome pulse under the
              title. Async server component; renders nothing if the fetch
              fails. */}
          <GithubContributions />
          <SocialLinks className="absolute top-1/2 right-0 -translate-y-1/2 items-end" />
        </section>
        </div>

        <AboutBand />

        {/* Giant section title — lines slide in from alternating sides */}
        <WhatWeDo />

        {/* Pinned horizontal work showcase — vertical scroll pans the wall */}
      

        {/* Manifesto — black band; the scroll-drawn line lands here. Flips the
            difference-blend header white for the whole pass. */}
        <Manifesto />

      
        {/* Bottom CTA — a full-bleed "Contact us" marquee that flips to the
            black palette on hover. Grows to fill the last of the flex column;
            pb keeps room below it before the curtain footer (triggered at
            #page-content's bottom) reveals. */}
        <section className="mt-14 flex flex-1 flex-col justify-end pb-[28vh] md:pb-[36vh]">
          <ContactMarquee />
        </section>
      </div>



      {/* Frosted-glass curtain footer revealed at the end of the page */}
      <CurtainFooter />
    </main>
  );
}
