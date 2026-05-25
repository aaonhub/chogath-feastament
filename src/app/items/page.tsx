import Image from "next/image";

export const metadata = { title: "Item Tier List — Cho'Gath Feastament" };

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#e06666]",
  A: "bg-[#e69138]",
  B: "bg-[#f1c232]",
  C: "bg-[#ffd966]",
  D: "bg-[#b1ba58]",
  Situational: "bg-[#cccccc] text-black",
};

interface TierRow {
  tier: string;
  items: number[];
}

const tankTiers: TierRow[] = [
  { tier: "S", items: [0, 1, 2, 3, 4] },
  { tier: "A", items: [5, 6, 7] },
  { tier: "B", items: [9, 10, 11, 12] },
  { tier: "C", items: [13, 14, 15] },
  { tier: "D", items: [16, 17] },
  { tier: "Situational", items: [19, 20] },
];

const apTiers: TierRow[] = [
  { tier: "S", items: [21, 22, 23, 24] },
  { tier: "A", items: [25, 26, 27, 28, 29, 30, 31] },
  { tier: "B", items: [32, 33, 34, 35, 36, 37] },
  { tier: "C", items: [38, 39, 40, 41] },
  { tier: "D", items: [42] },
  { tier: "Situational", items: [44, 45] },
];

function TierList({ title, tiers }: { title: string; tiers: TierRow[] }) {
  return (
    <div className="mb-10">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="overflow-hidden rounded-xl border border-card-border">
        {tiers.map((row) => (
          <div
            key={row.tier}
            className="flex items-center border-b border-card-border last:border-b-0"
          >
            <div
              className={`flex w-24 shrink-0 items-center justify-center self-stretch text-xl font-bold ${TIER_COLORS[row.tier]}`}
            >
              {row.tier}
            </div>
            <div className="flex flex-wrap gap-2 bg-[#434343] p-3 flex-1 min-h-[72px]">
              {row.items.map((i) => (
                <Image
                  key={i}
                  src={`/images/tierlist/item_${i}.jpg`}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded border border-card-border"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-foreground/40">
        The order of items within each tier does not indicate ranking.
      </p>
    </div>
  );
}

export default function ItemsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Item Tier List</h1>
      <p className="mb-8 text-foreground/50">
        Sakuritou&apos;s item rankings for Cho&apos;Gath — Tank and AP builds.
      </p>
      <TierList title="Tank Items" tiers={tankTiers} />
      <TierList title="AP Items" tiers={apTiers} />
    </div>
  );
}
