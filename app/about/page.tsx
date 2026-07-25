import CurtainFooter from "../components/CurtainFooter";
import TopHeader from "../components/TopHeader";

export const metadata = {
  title: "About — Ploum",
  description: "About Ioannis Ploumakis — front-end developer in Larissa, Greece.",
};

export default function About() {
  return (
    <main
      id="top"
      className="relative flex-1 px-4 pt-5 pb-4 selection:bg-black selection:text-background md:px-8 md:pt-6 md:pb-6"
    >
      <div id="page-content" className="flex min-h-svh flex-col">
        <TopHeader />

        {/* Info — huge age left, details middle-right, tall image right */}
        <section
          id="info"
          className="mt-14 grid grid-cols-12 items-start gap-x-4 gap-y-8 md:mt-20"
        >
          {/* Age */}
          <span className="col-span-8 text-[clamp(7rem,24vw,20rem)] leading-[0.78] font-black tracking-[-0.05em] select-none md:col-span-6 md:row-start-1">
            21
          </span>

          {/* Tall vertical image — swap the placeholder for the real image */}
          <figure className="relative col-span-6 col-start-7 aspect-[9/16] overflow-hidden border-2 border-black bg-[#e2d9cf] sm:col-span-4 sm:col-start-9 md:col-span-3 md:col-start-10 md:row-span-2 md:row-start-1">
            <span className="absolute top-4 left-4 text-[0.6rem] font-bold tracking-[0.35em] uppercase">
              Portrait — soon
            </span>
            {/*
              When the image is ready, drop it in with next/image:
              <Image src="/me.jpg" alt="Ioannis Ploumakis" fill className="object-cover" />
            */}
          </figure>

          {/* Info block — under the age, middle-right */}
          <div className="col-span-12 md:col-span-5 md:col-start-4 md:row-start-2">
            <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase md:text-xs">
              Info
            </p>
            <p className="mt-4 max-w-md text-xs leading-relaxed font-medium md:text-sm">
              Front-end developer based in Larissa, Greece. I build clean,
              motion-driven interfaces with an eye for detail — currently
              studying Digital Systems and freelancing on the side.
            </p>
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase md:text-xs">
              <dt className="text-black/50">Stack</dt>
              <dd>React · Next.js · TypeScript · GSAP · Tailwind</dd>
              <dt className="text-black/50">Based</dt>
              <dd>Larissa, Greece</dd>
              <dt className="text-black/50">Studying</dt>
              <dd>Digital Systems</dd>
              <dt className="text-black/50">Focus</dt>
              <dd>Motion, detail, craft</dd>
            </dl>
          </div>
        </section>

        {/* Room for more about content later */}
        <div className="pb-[20vh] md:pb-[28vh]" />
      </div>

      <CurtainFooter />
    </main>
  );
}
