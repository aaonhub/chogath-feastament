"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import matchupData from "../../../data/matchups.json";
import { ITEMS as LOCAL_ITEMS } from "@/data/items";

const DDRAGON_ITEM = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/item";

interface DDItem {
  id: number;
  gold: number;
  stats: string[];
  passive: string;
}

function useItemDb(): Record<string, DDItem> {
  const [db, setDb] = useState<Record<string, DDItem>>({});
  useEffect(() => {
    fetch("https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/item.json")
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, DDItem> = {};
        const seen = new Set<string>();
        for (const [id, item] of Object.entries(d.data as Record<string, {
          name: string; gold?: { total?: number }; description?: string; plaintext?: string;
        }>)) {
          if (seen.has(item.name)) continue;
          seen.add(item.name);
          const desc = item.description || "";
          const stripped = desc.replace(/<[^>]+>/g, "");
          const statLines: string[] = [];
          const passiveParts: string[] = [];
          for (const part of stripped.split(/(?<=\d)\s*(?=[A-Z])/)) {
            if (/^\d/.test(part.trim()) && part.length < 40) {
              statLines.push(part.trim());
            } else if (part.trim()) {
              passiveParts.push(part.trim());
            }
          }
          map[item.name] = {
            id: parseInt(id),
            gold: item.gold?.total || 0,
            stats: statLines.length > 0 ? statLines : (item.plaintext ? [item.plaintext] : []),
            passive: passiveParts.join(" ") || item.plaintext || "",
          };
        }
        setDb(map);
      })
      .catch(() => {});
  }, []);
  return db;
}

function getItemImgSrc(name: string | undefined, imgIndex: number, db: Record<string, DDItem>): string {
  if (name) {
    const ddId = db[name]?.id ?? LOCAL_ITEMS.find((i) => i.name === name)?.id;
    if (ddId) return `${DDRAGON_ITEM}/${ddId}.png`;
  }
  return `/images/tierlist/item_${imgIndex}.jpg`;
}

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#e06666]", A: "bg-[#e69138]", B: "bg-[#f1c232]",
  C: "bg-[#ffd966]", D: "bg-[#b1ba58]", SIT: "bg-[#cccccc] text-black",
};

interface ItemDetail {
  gold: number;
  stats: string[];
  passive: string;
  note?: string;
}

interface ItemEntry {
  imgIndex: number;
  name?: string;
  detail?: ItemDetail;
}

const D: Record<string, ItemDetail> = {
  "Kaenic Rookern": { gold: 2900, stats: ["400 Health", "80 Magic Resist", "100% Base Health Regen"], passive: "Magebane — After not taking magic damage for 15 seconds, gain a magic damage shield." },
  "Warmog's Armor": { gold: 3100, stats: ["1000 Health", "100% Base Health Regen"], passive: "Warmog's Heart — With 2000+ bonus Health and out of combat, rapidly regenerate max Health." },
  "Jak'Sho, The Protean": { gold: 2800, stats: ["400 Health", "30 Armor", "30 Magic Resist"], passive: "Voidborn Resilience — In combat, gain stacking Armor and MR. At max stacks, drain nearby enemies." },
  "Hollow Radiance": { gold: 2800, stats: ["400 Health", "40 Magic Resist", "10 Ability Haste", "100% Base Health Regen"], passive: "Immolate — Deal magic damage per second to nearby enemies. Immobilize enemies to gain a shield." },
  "Unending Despair": { gold: 2800, stats: ["400 Health", "25 Armor", "25 Magic Resist", "10 Ability Haste"], passive: "Anguish — Every 4 seconds in combat with champions, drain nearby enemies for Health." },
  "Heartsteel": { gold: 3000, stats: ["900 Health", "100% Base Health Regen"], passive: "Colossal Consumption — Charge up a powerful attack against a champion. Deals bonus damage and grants permanent max Health.", note: "Core stacking item for Tank Cho'Gath. Pairs well with Feast stacks." },
  "Fimbulwinter": { gold: 2400, stats: ["550 Health", "860 Mana", "15 Ability Haste"], passive: "Everlasting — Immobilizing or Slowing (melee) a champion consumes Mana to grant a shield." },
  "Force of Nature": { gold: 2800, stats: ["400 Health", "55 Magic Resist", "4% Move Speed"], passive: "Steadfast — After taking magic damage, gain stacking MR and MS. At max: +70 MR, +6% MS.", note: "Best anti-AP item. Shuts down mages completely." },
  "Abyssal Mask": { gold: 2650, stats: ["350 Health", "45 Magic Resist", "15 Ability Haste"], passive: "Unmake — Nearby enemy champions take 12% more magic damage." },
  "Dead Man's Plate": { gold: 2900, stats: ["350 Health", "55 Armor", "4% Move Speed"], passive: "Shipwrecker — While moving, build up to 20 bonus Move Speed. Next Attack discharges stacks as bonus damage.", note: "Great for gap-closing onto carries." },
  "Spirit Visage": { gold: 2500, stats: ["400 Health", "50 Magic Resist", "10 Ability Haste", "100% Base Health Regen"], passive: "Boundless Vitality — Increases all Healing and Shielding effectiveness on you by 25%." },
  "Sunfire Aegis": { gold: 2700, stats: ["350 Health", "50 Armor", "10 Ability Haste"], passive: "Immolate — Deal magic damage per second to nearby enemies. Immobilize to release a wave of flame." },
  "Frozen Heart": { gold: 2500, stats: ["75 Armor", "400 Mana", "20 Ability Haste"], passive: "Winter's Caress — Reduce Attack Speed of nearby enemies by 20%.", note: "Great vs Irelia, Yasuo, Yone, and other AS champions." },
  "Randuin's Omen": { gold: 2700, stats: ["350 Health", "75 Armor"], passive: "Resilience — Take 30% less damage from Critical Strikes.\nHumility — Activate to slow nearby enemies.", note: "Build if enemy has crit champions." },
  "Thornmail": { gold: 2450, stats: ["150 Health", "75 Armor"], passive: "Thorns — When struck by an Attack, deal magic damage to the attacker and apply 40% Grievous Wounds." },
  "Gargoyle Stoneplate": { gold: 3150, stats: ["60 Armor", "60 Magic Resist", "15 Ability Haste"], passive: "Fortify — Taking damage from a champion grants stacking Armor and MR.\nActivate for a large shield based on bonus Health." },
  "Bramble Vest": { gold: 800, stats: ["30 Armor"], passive: "Thorns — When hit by an Attack, deal magic damage and apply 40% Grievous Wounds for 3s.", note: "Rush vs healing laners like Warwick, Aatrox." },
  "Luden's Companion": { gold: 2750, stats: ["100 Ability Power", "600 Mana", "10 Ability Haste"], passive: "Fire — Damaging Abilities fire 6 shots dealing bonus magic damage, chaining to nearby enemies." },
  "Shurelya's Battlesong": { gold: 2200, stats: ["50 Ability Power", "15 Ability Haste", "4% Move Speed", "125% Base Mana Regen"], passive: "Inspiring Speech — Activate to grant nearby allies bonus Move Speed.", note: "Core for Roam'Gath build." },
  "Rod of Ages": { gold: 2600, stats: ["45 Ability Power", "350 Health", "400 Mana"], passive: "Timeless — Gains 10 Health, 20 Mana, and 3 AP every minute for 10 minutes. Level up to restore Health and Mana.", note: "Great scaling pick to match late-game champions." },
  "Malignance": { gold: 2700, stats: ["90 Ability Power", "600 Mana", "15 Ability Haste"], passive: "Scorn — Gain 20 Ultimate Ability Haste.\nHatefog — Damaging a champion with your ult creates a damage zone." },
  "Horizon Focus": { gold: 2900, stats: ["110 Ability Power", "25 Ability Haste"], passive: "Hypershot — Dealing ability damage at 600+ range or to immobilized enemies calls down lightning.", note: "Good for Haste and reveals targets hit by Q." },
  "Boots of Swiftness": { gold: 1000, stats: ["+55 Move Speed"], passive: "Fleetfooted — Reduce slow effectiveness by 25%.", note: "Best boots for most matchups. Dodge skillshots and escape ganks." },
  "Void Staff": { gold: 3000, stats: ["95 Ability Power", "40% Magic Penetration"], passive: "Pure magic penetration. No unique passive." },
  "Cosmic Drive": { gold: 3000, stats: ["70 Ability Power", "350 Health", "25 Ability Haste", "4% Move Speed"], passive: "Spelldance — Dealing magic or true damage to champions grants bonus Move Speed." },
  "Stormsurge": { gold: 2800, stats: ["90 Ability Power", "15 Magic Penetration", "6% Move Speed"], passive: "Stormraider — Dealing 25% of a champion's max Health triggers a lightning proc for bonus damage." },
  "Banshee's Veil": { gold: 3000, stats: ["105 Ability Power", "40 Magic Resist"], passive: "Annul — Periodically grants a Spell Shield that blocks the next enemy Ability.", note: "Removes engage threat from Syndra, Ahri, etc." },
  "Lich Bane": { gold: 2900, stats: ["100 Ability Power", "4% Move Speed", "10 Ability Haste"], passive: "Spellblade — After using an Ability, your next Attack deals bonus magic damage." },
  "Shadowflame": { gold: 3200, stats: ["110 Ability Power", "15 Magic Penetration"], passive: "Cinderbloom — Magic and true damage Critically Strikes enemies below 35% Health." },
  "Seraph's Embrace": { gold: 2900, stats: ["70 Ability Power", "1000 Mana", "25 Ability Haste"], passive: "Awe — Gain AP equal to 4% bonus Mana.\nLifeline — Shield when taking damage below 30% Health." },
  "Zhonya's Hourglass": { gold: 3250, stats: ["105 Ability Power", "50 Armor"], passive: "Time Stop — Activate to enter Stasis for 2.5 seconds. Invincible but unable to act.", note: "Essential vs assassins. Denies ult-reliant champions." },
  "Liandry's Torment": { gold: 3000, stats: ["60 Ability Power", "300 Health"], passive: "Torment — Damaging Abilities burn for 2% max Health magic damage per second for 3s.", note: "Strong vs durable/tank enemies." },
  "Rylai's Crystal Scepter": { gold: 2600, stats: ["65 Ability Power", "400 Health"], passive: "Rimefrost — Damaging Abilities Slow enemies by 30% for 1 second." },
  "Morellonomicon": { gold: 2850, stats: ["75 Ability Power", "350 Health", "15 Ability Haste"], passive: "Grievous Wounds — Dealing magic damage applies 40% Wounds to champions." },
  "Riftmaker": { gold: 3100, stats: ["70 Ability Power", "350 Health", "15 Ability Haste"], passive: "Void Corruption — For each second in combat, deal increasing bonus damage. At max stacks, excess damage converts to true damage." },
  "Nashor's Tooth": { gold: 2900, stats: ["80 Ability Power", "50% Attack Speed", "15 Ability Haste"], passive: "Icathian Bite — Attacks deal bonus magic damage On-Hit." },
  "Rabadon's Deathcap": { gold: 3500, stats: ["130 Ability Power"], passive: "Magical Opus — Increases your total Ability Power by 30%." },
  "Cryptbloom": { gold: 3000, stats: ["75 Ability Power", "30% Magic Pen", "20 Ability Haste"], passive: "Life from Death — When a champion you damaged recently dies, heal nearby allies." },
  "Oblivion Orb": { gold: 800, stats: ["25 Ability Power"], passive: "Grievous Wounds — Magic damage applies 40% Wounds for 3s.", note: "Cheap early anti-heal component." },
  "Dark Seal": { gold: 350, stats: ["15 Ability Power", "50 Health"], passive: "Glory — Takedowns grant stacks (up to 10). Gain 4 AP per stack. Lose 5 on death.", note: "Great snowball item for easy matchups." },
};

function toEntry(raw: { imgIndex: number; name: string }): ItemEntry {
  const name = raw.name || undefined;
  return { imgIndex: raw.imgIndex, name, detail: name ? D[name] : undefined };
}

function toTierRows(tiers: Array<{ tier: string; items: Array<{ imgIndex: number; name: string }> }>) {
  return tiers.map((row) => ({ tier: row.tier, label: row.tier, items: row.items.map(toEntry) }));
}

const tankTiers = toTierRows(matchupData.tankItems);
const apTiers = toTierRows(matchupData.apItems);

function ItemIcon({ entry, onClick, db }: { entry: ItemEntry; onClick: () => void; db: Record<string, DDItem> }) {
  const src = getItemImgSrc(entry.name, entry.imgIndex, db);
  const info = entry.name ? db[entry.name] : undefined;
  return (
    <div className="group/item relative">
      <button onClick={onClick}>
        <Image src={src} alt={entry.name || ""} width={72} height={72}
          className="h-[72px] w-[72px] rounded border border-card-border transition group-hover/item:border-amber-500/60 group-hover/item:scale-110" />
      </button>
      {entry.name && (
        <div className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 rounded-lg border border-card-border bg-[#010409] px-3 py-2 shadow-xl w-48 opacity-0 group-hover/item:opacity-100 transition">
          <p className="text-xs font-bold text-white">{entry.name}</p>
          {(info || entry.detail) && <p className="text-[10px] font-semibold text-amber-400">{(info?.gold || entry.detail?.gold) ?? ""}g</p>}
        </div>
      )}
    </div>
  );
}

function ItemModal({ entry, onClose, db }: { entry: ItemEntry; onClose: () => void; db: Record<string, DDItem> }) {
  const hardcoded = entry.detail;
  const live = entry.name ? db[entry.name] : undefined;
  const src = getItemImgSrc(entry.name, entry.imgIndex, db);
  const gold = hardcoded?.gold ?? live?.gold;
  const stats = hardcoded?.stats ?? live?.stats ?? [];
  const passive = hardcoded?.passive ?? live?.passive ?? "";
  const note = hardcoded?.note;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-2xl border border-card-border bg-card shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start gap-5 p-6 pb-0">
          <Image src={src} alt={entry.name || ""} width={80} height={80}
            className="h-20 w-20 shrink-0 rounded-lg border border-card-border" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{entry.name || "Unknown Item"}</h2>
            {gold != null && gold > 0 && <p className="mt-1 text-lg font-semibold text-amber-400">{gold} gold</p>}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:text-foreground hover:bg-card-border">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {stats.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Stats</h3>
              <div className="flex flex-wrap gap-2">
                {stats.map((s, i) => (
                  <span key={i} className="rounded bg-card-border/50 px-2.5 py-1 text-sm font-medium text-foreground/80">{s}</span>
                ))}
              </div>
            </div>
          )}

          {passive && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Passive</h3>
              {passive.split("\n").map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/70 mb-1 last:mb-0">{line}</p>
              ))}
            </div>
          )}

          {note && (
            <div className="rounded-lg bg-accent/10 border border-accent/20 px-4 py-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-glow mb-1">Cho&apos;Gath Note</h3>
              <p className="text-sm leading-relaxed text-foreground/70">{note}</p>
            </div>
          )}

          {!passive && stats.length === 0 && (
            <p className="text-sm text-foreground/40">Item details loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TierList({ title, tiers, icon, onItemClick, db }: {
  title: string;
  tiers: { tier: string; label: string; items: ItemEntry[] }[];
  icon: string;
  onItemClick: (entry: ItemEntry) => void;
  db: Record<string, DDItem>;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4 flex items-center gap-2">
        <Image src={icon} alt="" width={24} height={24} className="h-6 w-6" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="overflow-visible rounded-xl border border-card-border">
        {tiers.map((row) => (
          <div key={row.tier} className="flex items-center border-b border-card-border last:border-b-0">
            <div className={`flex w-12 shrink-0 items-center justify-center self-stretch text-sm font-bold ${TIER_COLORS[row.tier]}`}>
              {row.label}
            </div>
            <div className="flex flex-wrap gap-2 bg-[#434343] px-2 py-1.5 flex-1 min-h-[80px]">
              {row.items.map((entry) => (
                <ItemIcon key={entry.imgIndex} entry={entry} onClick={() => onItemClick(entry)} db={db} />
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
  const db = useItemDb();
  return (
    <div className="mx-auto px-4 py-8" style={{ maxWidth: "1600px" }}>
      <h1 className="mb-1 text-3xl font-bold">Item Tier List</h1>
      <p className="mb-8 text-foreground/50">
        Sakuritou&apos;s item rankings for Cho&apos;Gath. Click for details. Order within tiers doesn&apos;t matter.
      </p>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
        <TierList title="Tank" tiers={tankTiers} icon="/images/tank-icon.png" onItemClick={setSelected} db={db} />
        <TierList title="AP" tiers={apTiers} icon="/images/mage-icon.webp" onItemClick={setSelected} db={db} />
      </div>
      {selected && <ItemModal entry={selected} onClose={() => setSelected(null)} db={db} />}
    </div>
  );
}
