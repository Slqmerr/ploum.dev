import ManifestoReveal from "./ManifestoReveal";
import Globe from "./Globe";

// Full-bleed black manifesto band — the line drawn from #what lands here. It
// slides up as the sticky header slides back out (see TopHeader), so the band
// gets the screen to itself. Cream type on black; each line reveals letter by
// letter, rocking up from the bottom as the section is scrolled through.
export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="-mx-4 mt-14 bg-black px-4 pt-24 pb-28 text-background md:-mx-8 md:mt-20 md:px-8 md:pt-36 md:pb-40"
    >
      

      {/* Type on the left, spinnable globe on the right. Stacks (globe below,
          centred) up to lg so the big type never gets squeezed into wrapping;
          side-by-side only once there's room. */}
      <div className="mt-10 flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <h2 className="max-w-6xl text-[clamp(2.2rem,7vw,6.5rem)] leading-[0.95] font-black tracking-[-0.03em] uppercase">
          <ManifestoReveal
            lines={["We build", "the web like", "it should", "misbehave."]}
            artisticWords={["misbehave."]}
          />
        </h2>

        <Globe className="w-[min(85vw,23rem)] shrink-0 lg:w-[clamp(17rem,28vw,26rem)]" />
      </div>
    </section>
  );
}
