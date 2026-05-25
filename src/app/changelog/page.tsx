import matchupData from "../../../data/matchups.json";

export const metadata = { title: "Changelog — Cho'Gath Feastament" };

const entries: { date: string; items: string[] }[] =
  (matchupData as { changelog?: { date: string; items: string[] }[] }).changelog || [];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Changelog</h1>
      <p className="mb-8 text-foreground/50">
        All updates to the Cho&apos;Gath Feastament guide.
      </p>

      <div className="relative border-l-2 border-card-border pl-6">
        {entries.map((e) => (
          <div key={e.date} className="relative mb-8 last:mb-0">
            <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-accent bg-background" />
            <time className="mb-1 block text-sm font-semibold text-accent-glow">
              {e.date}
            </time>
            <ul className="space-y-1 text-sm text-foreground/70">
              {e.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
