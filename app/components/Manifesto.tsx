import Reveal from "./Reveal";

// Full-bleed black manifesto band — the line drawn from #what lands here. It
// slides under the sticky header, whose mix-blend-difference text flips white
// for the whole pass (same as the About band). Cream type on black.
export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="-mx-4 mt-14 bg-black px-4 pt-24 pb-28 text-background md:-mx-8 md:mt-20 md:px-8 md:pt-36 md:pb-40"
    >
      <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase md:text-xs">
        (04) — Manifesto
      </p>

      <h2 className="mt-10 max-w-6xl text-[clamp(2.2rem,7vw,6.5rem)] leading-[0.95] font-black tracking-[-0.03em] uppercase">
        <Reveal
          lines={["We build", "the web like", "it should", "misbehave."]}
          artisticWords={["misbehave."]}
        />
      </h2>
    </section>
  );
}
