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

const ITEM_INFO: Record<string, { gold: number; desc: string }> = {
  "Kaenic Rookern": { gold: 2900, desc: "400 HP, 80 MR. Spell shield after not taking magic damage for 15s." },
  "Warmog's Armor": { gold: 3100, desc: "1000 HP. Rapidly regenerate Health out of combat with 2000+ bonus HP." },
  "Jak'Sho": { gold: 2800, desc: "Armor and MR that increase in extended combat." },
  "Hollow Radiance": { gold: 2800, desc: "400 HP, 40 MR. Immolate burn + shield on immobilize." },
  "Unending Despair": { gold: 2800, desc: "400 HP, 25 Armor, 25 MR. Drain nearby enemies for Health every 4s." },
  "Heartsteel": { gold: 3000, desc: "900 HP. Charge up attacks to deal bonus damage and gain permanent max HP." },
  "Fimbulwinter": { gold: 2400, desc: "550 HP, 860 Mana. Shield when immobilizing or slowing enemies." },
  "Force of Nature": { gold: 2800, desc: "400 HP, 55 MR, 4% MS. Gain 70 bonus MR and 6% MS after taking magic damage." },
  "Abyssal Mask": { gold: 2650, desc: "350 HP, 45 MR. Nearby enemies take 12% more magic damage." },
  "Dead Man's Plate": { gold: 2900, desc: "350 HP, 55 Armor, 4% MS. Build momentum for bonus MS and empowered attack." },
  "Sunfire Aegis": { gold: 2700, desc: "350 HP, 50 Armor. Immolate deals magic damage per second to nearby enemies." },
  "Bramble Vest": { gold: 800, desc: "30 Armor. Attackers take magic damage and receive 40% Grievous Wounds." },
  "Frozen Heart": { gold: 2500, desc: "75 Armor, 400 Mana, 20 AH. Reduce nearby enemy Attack Speed by 20%." },
  "Randuin's Omen": { gold: 2700, desc: "350 HP, 75 Armor. 30% less crit damage. Activate to slow nearby enemies." },
  "Thornmail": { gold: 2450, desc: "150 HP, 75 Armor. Attackers take magic damage and 40% Grievous Wounds." },
  "Gargoyle Stoneplate": { gold: 3150, desc: "60 Armor, 60 MR. Gain stacking resistances in combat, activate for shield." },
  "Luden's Companion": { gold: 2750, desc: "100 AP, 600 Mana, 10 AH. Damaging abilities fire bonus magic damage shots." },
  "Shurelya's Battlesong": { gold: 2200, desc: "50 AP, 15 AH, 4% MS. Activate to speed up nearby allies." },
  "Rod of Ages": { gold: 2600, desc: "45 AP, 350 HP, 400 Mana. Gains stats every minute for 10 minutes." },
  "Malignance": { gold: 2700, desc: "90 AP, 600 Mana, 15 AH. +20 Ultimate AH. Ult creates a damage zone." },
  "Horizon Focus": { gold: 2900, desc: "110 AP, 25 AH. Lightning strikes champions hit at 600+ range or immobilized." },
  "Boots of Swiftness": { gold: 1000, desc: "55 MS. Reduce slow effectiveness by 25%." },
  "Void Staff": { gold: 3000, desc: "95 AP, 40% Magic Penetration." },
  "Cosmic Drive": { gold: 3000, desc: "70 AP, 350 HP, 25 AH, 4% MS. Gain bonus MS when dealing magic damage." },
  "Stormsurge": { gold: 2800, desc: "90 AP, 15 MPen, 6% MS. Dealing 25% max HP triggers a lightning proc." },
  "Banshee's Veil": { gold: 3000, desc: "105 AP, 40 MR. Grants a spell shield that blocks one enemy ability." },
  "Lich Bane": { gold: 2900, desc: "100 AP, 4% MS, 10 AH. After casting, next attack deals bonus magic damage." },
  "Shadowflame": { gold: 3200, desc: "110 AP, 15 MPen. Magic damage critically strikes enemies below 35% HP." },
  "Seraph's Embrace": { gold: 2900, desc: "70 AP, 1000 Mana, 25 AH. Gain AP from bonus Mana. Shield when low." },
  "Zhonya's Hourglass": { gold: 3250, desc: "105 AP, 50 Armor. Activate to enter invincible Stasis for 2.5s." },
  "Liandry's Torment": { gold: 3000, desc: "60 AP, 300 HP. Abilities burn for 2% max HP magic damage per second." },
  "Rylai's Crystal Scepter": { gold: 2600, desc: "65 AP, 400 HP. Damaging abilities slow enemies by 30% for 1s." },
  "Morellonomicon": { gold: 2850, desc: "75 AP, 350 HP, 15 AH. Magic damage applies 40% Grievous Wounds." },
  "Riftmaker": { gold: 3100, desc: "70 AP, 350 HP, 15 AH. Ramp up to convert excess damage to true damage." },
  "Nashor's Tooth": { gold: 2900, desc: "80 AP, 50% AS, 15 AH. Attacks deal bonus magic damage on-hit." },
  "Rabadon's Deathcap": { gold: 3500, desc: "130 AP. Increases total AP by 30%." },
  "Cryptbloom": { gold: 3000, desc: "75 AP, 30% MPen, 20 AH. Takedowns heal nearby allies." },
  "Oblivion Orb": { gold: 800, desc: "25 AP. Magic damage applies 40% Grievous Wounds for 3s." },
  "Dark Seal": { gold: 350, desc: "15 AP, 50 HP. Gain Glory on takedowns (up to 10), +4 AP per stack." },
};

function item(imgIndex: number, name?: string): ItemEntry {
  const info = name ? ITEM_INFO[name] : undefined;
  const dataItem = name ? ITEMS.find(i => i.name === name) : undefined;
  return { imgIndex, name, gold: info?.gold ?? dataItem?.gold, desc: info?.desc ?? dataItem?.desc, ddId: dataItem?.id };
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

function ItemIcon({ entry, onClick }: { entry: ItemEntry; onClick: () => void }) {
  return (
    <div className="group/item relative">
      <button onClick={onClick}>
        <Image
          src={`/images/tierlist/item_${entry.imgIndex}.jpg`}
          alt={entry.name || ""}
          width={72}
          height={72}
          className="h-[72px] w-[72px] rounded border border-card-border transition group-hover/item:border-amber-500/60 group-hover/item:scale-110"
        />
      </button>
      {entry.name && (
        <div className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 rounded-lg border border-card-border bg-[#010409] px-3 py-2 shadow-xl w-48 opacity-0 group-hover/item:opacity-100 transition">
          <p className="text-xs font-bold text-white">{entry.name}</p>
          {entry.gold != null && <p className="text-[10px] font-semibold text-amber-400">{entry.gold}g</p>}
        </div>
      )}
    </div>
  );
}

function ItemModal({ entry, onClose }: { entry: ItemEntry; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="rounded-2xl border border-card-border bg-card p-8 shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-5">
          <Image
            src={`/images/tierlist/item_${entry.imgIndex}.jpg`}
            alt={entry.name || ""}
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-lg border border-card-border"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{entry.name || "Unknown Item"}</h2>
            {entry.gold != null && <p className="mt-1 text-base font-semibold text-amber-400">{entry.gold} gold</p>}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:text-foreground hover:bg-card-border">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {entry.desc && (
          <p className="mt-4 text-sm leading-relaxed text-foreground/70">{entry.desc}</p>
        )}
      </div>
    </div>
  );
}

function TierList({
  title,
  tiers,
  icon,
  onItemClick,
}: {
  title: string;
  tiers: { tier: string; label: string; items: ItemEntry[] }[];
  icon: string;
  onItemClick: (entry: ItemEntry) => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4 flex items-center gap-2">
        <Image src={icon} alt="" width={24} height={24} className="h-6 w-6" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="overflow-visible rounded-xl border border-card-border">
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
                <ItemIcon key={entry.imgIndex} entry={entry} onClick={() => onItemClick(entry)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ItemsPage() {
  const [selected, setSelected] = useState<ItemEntry | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Item Tier List</h1>
      <p className="mb-8 text-foreground/50">
        Sakuritou&apos;s item rankings for Cho&apos;Gath. Click for details. Order within tiers
        doesn&apos;t matter.
      </p>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
        <TierList title="Tank" tiers={tankTiers} icon="/images/tank-icon.png" onItemClick={setSelected} />
        <TierList title="AP" tiers={apTiers} icon="/images/mage-icon.webp" onItemClick={setSelected} />
      </div>
      {selected && <ItemModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
