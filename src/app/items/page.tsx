"use client";

import { useState } from "react";
import Image from "next/image";
import { ITEMS, getItemImageUrl } from "@/data/items";

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#e06666]",
  A: "bg-[#e69138]",
  B: "bg-[#f1c232]",
  C: "bg-[#ffd966]",
  D: "bg-[#b1ba58]",
  SIT: "bg-[#cccccc] text-black",
};

interface ItemEntry {
  imgIndex: number;
  name?: string;
  gold?: number;
  desc?: string;
  ddId?: number;
}

function findItem(name: string) {
  return ITEMS.find(
    (i) => i.name.toLowerCase() === name.toLowerCase() ||
    i.aliases.some((a) => a.toLowerCase() === name.toLowerCase())
  );
}

function item(imgIndex: number, name?: string): ItemEntry {
  const data = name ? findItem(name) : undefined;
  return { imgIndex, name, gold: data?.gold, desc: data?.desc, ddId: data?.id };
}

const tankTiers = [
  { tier: "S", label: "S", items: [item(0, "Kaenic Rookern"), item(1, "Warmog's Armor"), item(2, "Jak'Sho"), item(3, "Hollow Radiance"), item(4, "Unending Despair")] },
  { tier: "A", label: "A", items: [item(5, "Heartsteel"), item(6, "Fimbulwinter"), item(7, "Force of Nature")] },
  { tier: "B", label: "B", items: [item(9, "Abyssal Mask"), item(10, "Dead Man's Plate"), item(11, "Sunfire Aegis"), item(12, "Bramble Vest")] },
  { tier: "C", label: "C", items: [item(13, "Frozen Heart"), item(14, "Randuin's Omen"), item(15)] },
  { tier: "D", label: "D", items: [item(16, "Thornmail"), item(17)] },
  { tier: "SIT", label: "SIT", items: [item(19, "Gargoyle Stoneplate"), item(20)] },
];

const apTiers = [
  { tier: "S", label: "S", items: [item(21, "Luden's Companion"), item(22, "Shurelya's Battlesong"), item(23, "Rod of Ages"), item(24, "Malignance")] },
  { tier: "A", label: "A", items: [item(25, "Horizon Focus"), item(26, "Boots of Swiftness"), item(27, "Void Staff"), item(28, "Cosmic Drive"), item(29, "Stormsurge"), item(30, "Banshee's Veil"), item(31, "Lich Bane")] },
  { tier: "B", label: "B", items: [item(32, "Shadowflame"), item(33, "Seraph's Embrace"), item(34, "Zhonya's Hourglass"), item(35, "Liandry's Torment"), item(36, "Rylai's Crystal Scepter"), item(37)] },
  { tier: "C", label: "C", items: [item(38, "Morellonomicon"), item(39, "Riftmaker"), item(40, "Nashor's Tooth"), item(41, "Rabadon's Deathcap")] },
  { tier: "D", label: "D", items: [item(42, "Cryptbloom")] },
  { tier: "SIT", label: "SIT", items: [item(44, "Oblivion Orb"), item(45, "Dark Seal")] },
];

function ItemIcon({ entry }: { entry: ItemEntry }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="group/item relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Image
        src={`/images/tierlist/item_${entry.imgIndex}.jpg`}
        alt={entry.name || ""}
        width={72}
        height={72}
        className="h-[72px] w-[72px] rounded border border-card-border transition group-hover/item:border-amber-500/60 group-hover/item:scale-110"
      />
      {hover && entry.name && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg border border-card-border bg-[#010409] px-4 py-3 shadow-xl w-56">
          <p className="text-sm font-bold text-white">{entry.name}</p>
          {entry.gold != null && <p className="mt-0.5 text-xs font-semibold text-amber-400">{entry.gold} gold</p>}
          {entry.desc && <p className="mt-1.5 text-xs leading-snug text-foreground/60">{entry.desc}</p>}
        </div>
      )}
    </div>
  );
}

function TierList({
  title,
  tiers,
  icon,
}: {
  title: string;
  tiers: { tier: string; label: string; items: ItemEntry[] }[];
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
            <div className="flex flex-wrap gap-2 bg-[#434343] px-2 py-1.5 flex-1 min-h-[80px]">
              {row.items.map((entry) => (
                <ItemIcon key={entry.imgIndex} entry={entry} />
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Item Tier List</h1>
      <p className="mb-8 text-foreground/50">
        Sakuritou&apos;s item rankings for Cho&apos;Gath. Hover for details. Order within tiers
        doesn&apos;t matter.
      </p>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
        <TierList title="Tank" tiers={tankTiers} icon="/images/tank-icon.png" />
        <TierList title="AP" tiers={apTiers} icon="/images/mage-icon.webp" />
      </div>
    </div>
  );
}
