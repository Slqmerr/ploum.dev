import ArrowButton from "./components/ArrowButton";
import Reveal from "./components/Reveal";
import TopHeader from "./components/TopHeader";

export default function Home() {
  return (
    <main className="relative z-10 flex min-h-svh flex-1 flex-col px-4 pt-5 pb-4 selection:bg-black selection:text-background md:px-8 md:pt-6 md:pb-6">
      {/* Top header — strict four-column grid */}
      <TopHeader />

      {/* Primary hero */}
      <h1 className="mt-8 text-[clamp(3.4rem,11.9vw,13.5rem)] leading-[0.85] font-black tracking-[-0.04em] uppercase md:mt-10">
        <Reveal lines={["Stay Creative"]} delay={0.2} />
      </h1>

      {/* Middle section — asymmetrical */}
      <section
        id="work"
        className="mt-10 grid grid-cols-12 items-end gap-4 md:mt-16"
      >
        <figure className="relative col-span-12 aspect-[4/5] border-2 border-black bg-[#e2d9cf] sm:col-span-8 md:col-span-5 md:aspect-[3/4] lg:col-span-4">
          <span className="absolute top-4 left-4 text-[0.6rem] font-bold tracking-[0.35em] uppercase">
            Portrait — 01
          </span>
          <ArrowButton targetId="about" className="absolute bottom-4 left-4" />
        </figure>

        <div className="col-span-12 self-end sm:col-span-6 md:col-span-3 md:col-start-8 lg:col-start-7">
          <p className="border-t-2 border-black pt-3 text-xs font-bold tracking-[0.2em] uppercase">
            (01) — I love pizza.
          </p>
        </div>
      </section>

      {/* Bottom typography */}
      <section id="about" className="mt-14 flex flex-1 items-end justify-end">
        <h2 className="text-right text-[clamp(2.8rem,9.6vw,10.5rem)] leading-[0.85] font-black tracking-[-0.04em] uppercase">
          <Reveal lines={["Ioannis", "Ploumakis"]} />
        </h2>
      </section>

      {/* Contact footer */}
      <footer
        id="contact"
        className="mt-10 grid grid-cols-2 border-t-2 border-black pt-4 text-[0.65rem] font-bold tracking-[0.15em] uppercase md:grid-cols-4 md:text-xs"
      >
        <p>Contact</p>
        <a
          href="mailto:gploumakis24@gmail.com"
          className="break-all hover:underline"
        >
          gploumakis24@gmail.com
        </a>
        <p className="hidden md:block">Larissa, Greece</p>
        <p className="text-right md:text-left">© 2026</p>
      </footer>
    </main>
  );
}
