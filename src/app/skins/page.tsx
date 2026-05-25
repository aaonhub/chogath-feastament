import Image from "next/image";

export const metadata = { title: "Skin Tier List — Cho'Gath Feastament" };

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#e06666]",
  A: "bg-[#e69138]",
  B: "bg-[#f1c232]",
  C: "bg-[#ffd966]",
  D: "bg-[#b1ba58]",
};

const tiers = [
  { tier: "S", skins: [0, 1, 2] },
  { tier: "A", skins: [3, 4, 5, 6] },
  { tier: "B", skins: [7, 8] },
  { tier: "C", skins: [9] },
  { tier: "D", skins: [] as number[] },
];

export default function SkinsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Skin Tier List</h1>
      <p className="mb-8 text-foreground/50">
        Sakuritou&apos;s Cho&apos;Gath skin rankings.
      </p>

      <div className="overflow-hidden rounded-xl border border-card-border">
        {tiers.map((row) => (
          <div
            key={row.tier}
            className="flex items-center border-b border-card-border last:border-b-0"
          >
            <div
              className={`flex w-16 shrink-0 items-center justify-center self-stretch text-2xl font-bold ${TIER_COLORS[row.tier]}`}
            >
              {row.tier}
            </div>
            <div className="flex flex-nowrap gap-2 bg-[#434343] px-2 py-1.5 flex-1 min-h-[140px]">
              {row.skins.length === 0 ? (
                <span className="text-sm text-foreground/30 self-center">—</span>
              ) : (
                row.skins.map((i) => (
                  <Image
                    key={i}
                    src={`/images/tierlist/skin_${i}.jpg`}
                    alt=""
                    width={320}
                    height={189}
                    className="h-[130px] w-auto rounded border border-card-border object-cover"
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
