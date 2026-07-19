import Image from "next/image";

// Drop image paths in here as they become available (e.g. "/hover/01.jpg").
const SPOTS: { id: string; src: string | null; alt: string }[] = [
  { id: "01", src: null, alt: "" },
  { id: "02", src: null, alt: "" },
  { id: "03", src: null, alt: "" },
  { id: "04", src: null, alt: "" },
];

export default function HoverSpots({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`grid-cols-2 grid-rows-2 gap-4 select-none ${className}`}
    >
      {SPOTS.map(({ id, src, alt }) => (
        <div key={id} className="group relative">
          {/* invisible/visible only — reveal must stay instant, no transitions */}
          <div className="invisible absolute inset-0 overflow-hidden border-2 border-black bg-[#e2d9cf] group-hover:visible">
            {src ? (
              <Image src={src} alt={alt} fill className="object-cover" />
            ) : (
              <span className="absolute top-4 left-4 text-[0.6rem] font-bold tracking-[0.35em] uppercase">
                Image — {id}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
