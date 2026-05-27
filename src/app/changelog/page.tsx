import matchupData from "../../../data/matchups.json";

export const metadata = { title: "Changelog — Cho'Gath Feastament" };

const entries: { date: string; items: string[] }[] =
  (matchupData as { changelog?: { date: string; items: string[] }[] }).changelog || [];

function daysAgo(dateStr: string): string {
  const parts = dateStr.split(".");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 30) return `${diff} days ago`;
  if (diff < 365) {
    const months = Math.floor(diff / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(diff / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Changelog</h1>
      <p className="mb-8 text-foreground/50">
        All updates to the Cho&apos;Gath Feastament guide.
      </p>

      <div className="relative border-l-2 border-card-border pl-6">
        {entries.map((e) => (
          <div key={e.date} className="relative mb-8 last:mb-0">
            <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-accent bg-background" />
            <div className="mb-1 flex items-baseline gap-2">
              <time className="text-sm font-semibold text-accent-glow">
                {e.date}
              </time>
              <span className="text-xs text-foreground/30">{daysAgo(e.date)}</span>
            </div>
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
