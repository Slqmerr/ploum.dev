// Server component: pulls a year of public GitHub contribution data straight
// from GitHub's own public contributions page (no auth, no third-party proxy —
// a proxy's own cache lagged behind GitHub and served a stale total) and
// renders it as a quiet monochrome grid at the base of the hero screen. The
// palette is ink-on-paper — black at rising opacity per level — so it reads as
// part of the brutalist site rather than a bolted-on GitHub-green widget.
// Whatever GitHub shows publicly (private contributions included only if the
// user enabled that on their profile) is exactly what renders here. Parse
// failures render nothing: the hero must never break on a flaky third party.

const USERNAME = "Slqmerr";

type Day = { date: string; level: number; label: string };
type Contributions = { total: number; days: Day[] };

// Ink fills per contribution level (0 = empty). Opaque black stepped up so
// even the darkest cell stays a hair under pure #000, matching the type.
const LEVEL_FILL = [
  "rgba(0,0,0,0.05)",
  "rgba(0,0,0,0.24)",
  "rgba(0,0,0,0.45)",
  "rgba(0,0,0,0.68)",
  "rgba(0,0,0,0.9)",
];

async function getContributions(): Promise<Contributions | null> {
  try {
    const res = await fetch(
      `https://github.com/users/${USERNAME}/contributions`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (ploum.dev contribution graph)" },
        next: { revalidate: 21600 }, // 6h — the graph moves at most once a day
      }
    );
    if (!res.ok) return null;
    const html = await res.text();

    // Header: "…>\n  144\n  contributions\n    in the last year". Grab the
    // number GitHub prints, so the total always matches the profile exactly.
    const totalMatch = html.match(
      /js-contribution-activity-description[^>]*>\s*([\d,]+)\s*contribution/i
    );
    const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : 0;

    // Human tooltip per cell, keyed by the cell's element id — reused verbatim
    // as each square's title ("7 contributions on July 21st.").
    const labels = new Map<string, string>();
    for (const m of html.matchAll(
      /for="(contribution-day-component-[^"]+)"[^>]*>([^<]*)<\/tool-tip>/g
    )) {
      labels.set(m[1], m[2].trim());
    }

    // One cell per day: attribute order on GitHub's <td> is data-date, id,
    // then data-level. Defensive — if the markup shifts and nothing matches,
    // days stays empty and the component renders nothing.
    const days: Day[] = [];
    for (const m of html.matchAll(
      /data-date="(\d{4}-\d{2}-\d{2})"\s+id="(contribution-day-component-[^"]+)"[^>]*?data-level="(\d)"/g
    )) {
      days.push({
        date: m[1],
        level: Number(m[3]),
        label: labels.get(m[2]) ?? "",
      });
    }
    if (!days.length) return null;

    // GitHub emits cells row-major (all Sundays, then Mondays…); we need them
    // in date order to bucket into week columns.
    days.sort((a, b) => a.date.localeCompare(b.date));
    return { total, days };
  } catch {
    return null;
  }
}

export default async function GithubContributions({
  className = "",
}: {
  className?: string;
}) {
  const data = await getContributions();
  if (!data?.days?.length) return null;

  const days = data.days;
  // Pad the front so the first real day lands on its own weekday row; the grid
  // then fills column-by-column, one column per week (Sun→Sat, top→bottom).
  const leadPad = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells: (Day | null)[] = [...Array(leadPad).fill(null), ...days];

  return (
    <section
      aria-label={`GitHub contributions over the last year (${data.total} total)`}
      className={`contrib-rise flex flex-col items-center gap-2.5 ${className}`}
    >
      <div className="flex w-full max-w-[46rem] items-baseline justify-between text-[0.6rem] leading-tight font-bold tracking-[0.15em] uppercase md:text-[0.65rem]">
        <span>Contributions</span>
        <a
          href={`https://github.com/${USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 transition-opacity hover:opacity-100"
        >
          {data.total} in the last year
        </a>
      </div>

      <div className="w-full max-w-[46rem] overflow-x-auto">
        <div
          className="grid grid-flow-col gap-[3px]"
          style={{
            gridTemplateRows: "repeat(7, minmax(0, 1fr))",
            gridAutoColumns: "minmax(0, 1fr)",
          }}
          role="img"
          aria-hidden
        >
          {cells.map((cell, i) =>
            cell ? (
              <span
                key={cell.date}
                title={cell.label || cell.date}
                className="aspect-square min-w-[9px] rounded-[2px]"
                style={{ backgroundColor: LEVEL_FILL[cell.level] ?? LEVEL_FILL[0] }}
              />
            ) : (
              <span key={`pad-${i}`} className="aspect-square min-w-[9px]" />
            )
          )}
        </div>
      </div>
    </section>
  );
}
