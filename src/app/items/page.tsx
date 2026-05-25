import Image from "next/image";

export const metadata = { title: "Item Tier List — Cho'Gath Feastament" };

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#e06666]",
  A: "bg-[#e69138]",
  B: "bg-[#f1c232]",
  C: "bg-[#ffd966]",
  D: "bg-[#b1ba58]",
  SIT: "bg-[#cccccc] text-black",
};

interface TierRow {
  tier: string;
  label: string;
  items: number[];
}

const tankTiers: TierRow[] = [
  { tier: "S", label: "S", items: [0, 1, 2, 3, 4] },
  { tier: "A", label: "A", items: [5, 6, 7] },
  { tier: "B", label: "B", items: [9, 10, 11, 12] },
  { tier: "C", label: "C", items: [13, 14, 15] },
  { tier: "D", label: "D", items: [16, 17] },
  { tier: "SIT", label: "SIT", items: [19, 20] },
];

const apTiers: TierRow[] = [
  { tier: "S", label: "S", items: [21, 22, 23, 24] },
  { tier: "A", label: "A", items: [25, 26, 27, 28, 29, 30, 31] },
  { tier: "B", label: "B", items: [32, 33, 34, 35, 36, 37] },
  { tier: "C", label: "C", items: [38, 39, 40, 41] },
  { tier: "D", label: "D", items: [42] },
  { tier: "SIT", label: "SIT", items: [44, 45] },
];

function TierList({
  title,
  tiers,
  icon,
}: {
  title: string;
  tiers: TierRow[];
  icon: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4 flex items-center gap-2">
        <Image src={icon} alt="" width={24} height={24} className="h-6 w-6" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="overflow-hidden rounded-xl border border-card-border">
        {tiers.map((row) => (
          <div
            key={row.tier}
            className="flex items-center border-b border-card-border last:border-b-0"
          >
            <div
              className={`flex w-12 shrink-0 items-center justify-center self-stretch text-sm font-bold ${TIER_COLORS[row.tier]}`}
            >
              {row.label}
            </div>
            <div className="flex flex-wrap gap-1.5 bg-[#434343] p-2 flex-1 min-h-[56px]">
              {row.items.map((i) => (
                <Image
                  key={i}
                  src={`/images/tierlist/item_${i}.jpg`}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded border border-card-border"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ItemsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Item Tier List</h1>
      <p className="mb-8 text-foreground/50">
        Sakuritou&apos;s item rankings for Cho&apos;Gath. Order within tiers
        doesn&apos;t matter.
      </p>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
        <TierList
          title="Tank"
          tiers={tankTiers}
          icon="/images/tank-icon.png"
        />
        <TierList
          title="AP"
          tiers={apTiers}
          icon="/images/mage-icon.webp"
        />
      </div>
    </div>
  );
}
