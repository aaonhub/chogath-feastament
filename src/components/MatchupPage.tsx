"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Matchup, Difficulty } from "@/data/matchups";
import { extractItems, getItemImageUrl, type ItemInfo } from "@/data/items";

const DDRAGON = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion";
const DDRAGON_SPELL = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/spell";

const CHO_ABILITIES: Record<string, { name: string; img: string }> = {
  Q: { name: "Rupture", img: `${DDRAGON_SPELL}/Rupture.png` },
  W: { name: "Feral Scream", img: `${DDRAGON_SPELL}/FeralScream.png` },
  E: { name: "Vorpal Spikes", img: `${DDRAGON_SPELL}/VorpalSpikes.png` },
  R: { name: "Feast", img: `${DDRAGON_SPELL}/Feast.png` },
};

const RUNE_IMAGES: Record<string, string> = {
  Comet:
    "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png",
  HoB: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png",
  Hob: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png",
  Grasp:
    "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png",
  Electrocute:
    "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Electrocute/Electrocute.png",
};

function parseRunes(raw: string): string[] {
  const cleaned = raw.replace(/\(based on preference\)/gi, "").trim();
  return cleaned
    .split("/")
    .map((r) => r.trim())
    .filter(Boolean);
}

const DIFF_COLORS: Record<string, string> = {
  Easy: "bg-easy",
  Medium: "bg-medium",
  Hard: "bg-hard",
  "Super Hard": "bg-super-hard",
  "Super-Hard": "bg-super-hard",
};

const DIFF_TEXT_COLORS: Record<string, string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
  "Super Hard": "text-super-hard",
  "Super-Hard": "text-super-hard",
};

const DIFF_BG_TINT: Record<string, string> = {
  Easy: "bg-[#22c55e]/8",
  Medium: "bg-[#f59e0b]/8",
  Hard: "bg-[#ef4444]/8",
  "Super Hard": "bg-[#991b1b]/12",
  "Super-Hard": "bg-[#991b1b]/12",
};

const DIFF_RANK: Record<string, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
  "Super Hard": 3,
  "Super-Hard": 3,
};

function preferredSide(ap: string, tank: string): "ap" | "tank" | "both" {
  const a = DIFF_RANK[ap] ?? 99;
  const t = DIFF_RANK[tank] ?? 99;
  if (a < t) return "ap";
  if (t < a) return "tank";
  return "both";
}

function DiffBadge({ diff }: { diff: Difficulty }) {
  const label = diff === "Super-Hard" ? "Super Hard" : diff;
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[diff] ?? "bg-card-border"}`}
    >
      {label}
    </span>
  );
}

function RuneIcons({ raw }: { raw: string }) {
  const runes = parseRunes(raw);
  return (
    <div className="flex items-center gap-1">
      {runes.map((r) => {
        const src = RUNE_IMAGES[r];
        if (!src) return <span key={r} className="text-xs text-foreground/50">{r}</span>;
        return (
          <Image
            key={r}
            src={src}
            alt={r}
            width={24}
            height={24}
            className="h-6 w-6 rounded"
            title={r}
          />
        );
      })}
    </div>
  );
}

function ItemThumbnails({ text }: { text: string }) {
  const items = extractItems(text);
  if (items.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <ItemIcon key={item.id} item={item} />
      ))}
    </div>
  );
}

function ItemIcon({ item }: { item: ItemInfo }) {
  const [error, setError] = useState(false);
  if (error) return null;
  return (
    <div className="group/item relative">
      <Image
        src={getItemImageUrl(item.id)}
        alt={item.name}
        width={36}
        height={36}
        className="h-9 w-9 rounded-md border border-card-border transition group-hover/item:border-amber-500/60"
        onError={() => setError(true)}
      />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg border border-card-border bg-[#010409] px-4 py-3 opacity-0 shadow-xl transition group-hover/item:opacity-100 w-56">
        <p className="text-sm font-bold text-white">{item.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-amber-400">{item.gold} gold</p>
        {item.desc && <p className="mt-1.5 text-xs leading-snug text-foreground/60">{item.desc}</p>}
      </div>
    </div>
  );
}

function SkillOrderIcons({ order }: { order: string }) {
  const letters = order.match(/[QWER]/g);
  if (!letters) return <span className="text-base font-mono text-foreground/70">{order}</span>;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {order.split(/([QWER])/).map((part, i) => {
          const ability = CHO_ABILITIES[part];
          if (ability) {
            return (
              <div key={i} className="group/spell relative inline-flex">
                <Image src={ability.img} alt={ability.name} width={32} height={32} className="h-8 w-8 rounded border border-card-border" />
                <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded bg-black/80 text-[10px] font-bold text-white">{part}</span>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/95 px-3 py-1.5 text-sm font-semibold text-white opacity-0 shadow-lg transition group-hover/spell:opacity-100">
                  {part}: {ability.name}
                </div>
              </div>
            );
          }
          const trimmed = part.trim();
          if (!trimmed) return null;
          return <span key={i} className="text-sm text-foreground/40">{trimmed}</span>;
        })}
      </div>
    </div>
  );
}

function ChampionImage({
  champKey,
  name,
  size = 48,
}: {
  champKey: string;
  name: string;
  size?: number;
}) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-card-border text-lg font-bold text-foreground/60"
        style={{ width: size, height: size }}
      >
        {name[0]}
      </div>
    );
  }
  return (
    <Image
      src={`${DDRAGON}/${champKey}.png`}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-lg border border-card-border"
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}

function GridCard({ m, onClick }: { m: Matchup; onClick: () => void }) {
  const pref = preferredSide(m.difficultyAP, m.difficultyTank);
  const prefBorder = "border-2 border-amber-500/50";
  const noBorder = "border border-transparent";

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center rounded-xl border border-card-border bg-card p-4 text-center transition hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
    >
      <ChampionImage champKey={m.championKey} name={m.champion} size={64} />
      <h3 className="mt-2 text-sm font-bold group-hover:text-accent-glow">
        {m.champion}
      </h3>

      <div className="mt-3 grid w-full grid-cols-2 gap-1 text-xs">
        <div className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 ${DIFF_BG_TINT[m.difficultyAP] ?? ""} ${pref === "ap" || pref === "both" ? prefBorder : noBorder}`}>
          <span className="font-semibold text-foreground/40">AP</span>
          {m.difficultyAP && <DiffBadge diff={m.difficultyAP} />}
          {m.runeAP && <RuneIcons raw={m.runeAP} />}
        </div>
        <div className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 ${DIFF_BG_TINT[m.difficultyTank] ?? ""} ${pref === "tank" || pref === "both" ? prefBorder : noBorder}`}>
          <span className="font-semibold text-foreground/40">Tank</span>
          {m.difficultyTank && <DiffBadge diff={m.difficultyTank} />}
          {m.runeTank && <RuneIcons raw={m.runeTank} />}
        </div>
      </div>
    </button>
  );
}

function Lightbox({ m, onClose }: { m: Matchup; onClose: () => void }) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const [focus, setFocus] = useState<"none" | "ap" | "tank">("none");
  const normDiff = (d: string) => (d === "Super-Hard" ? "Super Hard" : d);
  const pref = preferredSide(m.difficultyAP, m.difficultyTank);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl rounded-2xl border border-card-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-5 border-b border-card-border px-8 py-5">
          <ChampionImage
            champKey={m.championKey}
            name={m.champion}
            size={72}
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold">{m.champion}</h2>
            <div className="mt-1.5 flex gap-3">
              {m.difficultyAP && (
                <span className="text-sm">
                  AP:{" "}
                  <span className={`font-bold ${DIFF_TEXT_COLORS[m.difficultyAP]}`}>
                    {normDiff(m.difficultyAP)}
                  </span>
                </span>
              )}
              {m.difficultyTank && (
                <span className="text-sm">
                  Tank:{" "}
                  <span className={`font-bold ${DIFF_TEXT_COLORS[m.difficultyTank]}`}>
                    {normDiff(m.difficultyTank)}
                  </span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/40 transition hover:bg-card-border hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: Advice left, AP/Tank right */}
        <div className="flex flex-col lg:flex-row">
          {/* Advice — left column */}
          <div className="flex-1 border-b border-card-border px-8 py-6 lg:border-b-0 lg:border-r">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground/40">
              Matchup Advice
            </h3>
            <p className="text-base leading-relaxed text-foreground/80">
              {m.advice}
            </p>
          </div>

          {/* AP & Tank — right column, stacked */}
          <div className="flex w-full flex-col lg:w-[420px] lg:shrink-0">
            {/* AP */}
            <div
              className={`cursor-pointer border-b border-card-border p-6 transition-all duration-200 ${DIFF_BG_TINT[m.difficultyAP] ?? ""} ${pref === "ap" || pref === "both" ? "ring-2 ring-inset ring-amber-500/40" : ""} ${focus === "tank" ? "opacity-25 scale-[0.97]" : ""} ${focus === "ap" ? "scale-[1.02] shadow-lg shadow-accent/10 z-10 relative" : ""}`}
              onClick={() => setFocus(focus === "ap" ? "none" : "ap")}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded-full bg-[#7b2ff2]" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  AP Cho&apos;Gath
                </h3>
                {m.difficultyAP && <DiffBadge diff={m.difficultyAP} />}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {m.runeAP && (
                  <DetailRow label="Keystone">
                    <div className="flex items-center gap-2">
                      <RuneIcons raw={m.runeAP} />
                      <span className="text-sm text-foreground/70">{m.runeAP}</span>
                    </div>
                  </DetailRow>
                )}
                {m.abilityOrderAP && (
                  <DetailRow label="Skill Order">
                    <SkillOrderIcons order={m.abilityOrderAP} />
                  </DetailRow>
                )}
              </div>
              {m.itemsAP && (
                <div className="mt-3">
                  <DetailRow label="Items">
                    <p className="text-sm leading-relaxed text-foreground/70">{m.itemsAP}</p>
                    <ItemThumbnails text={m.itemsAP} />
                  </DetailRow>
                </div>
              )}
            </div>

            {/* Tank */}
            <div
              className={`cursor-pointer p-6 transition-all duration-200 ${DIFF_BG_TINT[m.difficultyTank] ?? ""} ${pref === "tank" || pref === "both" ? "ring-2 ring-inset ring-amber-500/40" : ""} ${focus === "ap" ? "opacity-25 scale-[0.97]" : ""} ${focus === "tank" ? "scale-[1.02] shadow-lg shadow-accent/10 z-10 relative" : ""}`}
              onClick={() => setFocus(focus === "tank" ? "none" : "tank")}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded-full bg-[#3b82f6]" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Tank Cho&apos;Gath
                </h3>
                {m.difficultyTank && <DiffBadge diff={m.difficultyTank} />}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {m.runeTank && (
                  <DetailRow label="Keystone">
                    <div className="flex items-center gap-2">
                      <RuneIcons raw={m.runeTank} />
                      <span className="text-sm text-foreground/70">{m.runeTank}</span>
                    </div>
                  </DetailRow>
                )}
                {m.abilityOrderTank && (
                  <DetailRow label="Skill Order">
                    <SkillOrderIcons order={m.abilityOrderTank} />
                  </DetailRow>
                )}
              </div>
              {m.itemsTank && (
                <div className="mt-3">
                  <DetailRow label="Items">
                    <p className="text-sm leading-relaxed text-foreground/70">{m.itemsTank}</p>
                    <ItemThumbnails text={m.itemsTank} />
                  </DetailRow>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-accent-glow/70">
        {label}
      </span>
      {children}
    </div>
  );
}

type FilterDiff = "All" | "Easy" | "Medium" | "Hard" | "Super Hard";

export default function MatchupPage({
  matchups,
  lane,
  laneIcon,
}: {
  matchups: Matchup[];
  lane: string;
  laneIcon?: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterDiff>("All");
  const [selected, setSelected] = useState<Matchup | null>(null);

  const filtered = matchups.filter((m) => {
    const q = search.toLowerCase();
    if (q && !m.champion.toLowerCase().includes(q)) return false;
    if (filter !== "All") {
      const norm = (d: string) => (d === "Super-Hard" ? "Super Hard" : d);
      if (norm(m.difficultyAP) !== filter && norm(m.difficultyTank) !== filter)
        return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    a.champion.localeCompare(b.champion),
  );

  const difficulties: FilterDiff[] = [
    "All",
    "Easy",
    "Medium",
    "Hard",
    "Super Hard",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 flex items-center gap-3 text-3xl font-bold">
        {laneIcon && <Image src={laneIcon} alt={`${lane} lane`} width={32} height={32} className="h-8 w-8" />}
        {lane} Matchups
      </h1>
      <p className="mb-6 text-foreground/50">
        {matchups.length} matchups &middot; Based on GM+ experience
      </p>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search champion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-card-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filter === d
                  ? d === "All"
                    ? "bg-accent text-white"
                    : `${DIFF_COLORS[d]} text-white`
                  : "bg-card text-foreground/50 hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-foreground/40">
          No matchups found.
        </p>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map((m) => (
            <GridCard
              key={m.champion}
              m={m}
              onClick={() => setSelected(m)}
            />
          ))}
        </div>
      )}

      {selected && (
        <Lightbox m={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
