"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ITEMS as ITEM_DATA, getItemImageUrl } from "@/data/items";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Difficulty = "Easy" | "Medium" | "Hard" | "Super Hard";

interface Matchup {
  champion: string;
  championKey: string;
  advice: string;
  runeAP: string;
  runeTank: string;
  itemsAP: string;
  itemsTank: string;
  difficultyAP: Difficulty;
  difficultyTank: Difficulty;
  abilityOrderAP: string;
  abilityOrderTank: string;
  startItems?: string[];
}

interface ChangelogEntry { date: string; items: string[]; }

interface TierItem { imgIndex: number; name: string; }
interface ItemTier { tier: string; items: TierItem[]; }

interface MatchupData { mid: Matchup[]; top: Matchup[]; changelog: ChangelogEntry[]; tankItems: ItemTier[]; apItems: ItemTier[]; }

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard", "Super Hard"];
const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: "bg-easy", Medium: "bg-medium", Hard: "bg-hard", "Super Hard": "bg-super-hard",
};

const START_ITEMS = [
  { id: "dorans-ring", name: "Doran's Ring", img: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/item/1056.png" },
  { id: "dorans-shield", name: "Doran's Shield", img: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/item/1054.png" },
  { id: "cull", name: "Cull", img: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/item/1083.png" },
];

const DDRAGON = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion";
const DDRAGON_SPELL = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/spell";

const RUNES = [
  { id: "Grasp", label: "Grasp", img: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png" },
  { id: "HoB", label: "HoB", img: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png" },
  { id: "Comet", label: "Comet", img: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png" },
  { id: "Electrocute", label: "Electro", img: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Electrocute/Electrocute.png" },
];

const CHO_SPELLS = [
  { key: "Q", img: `${DDRAGON_SPELL}/Rupture.png` },
  { key: "W", img: `${DDRAGON_SPELL}/FeralScream.png` },
  { key: "E", img: `${DDRAGON_SPELL}/VorpalSpikes.png` },
  { key: "R", img: `${DDRAGON_SPELL}/Feast.png` },
];

const COMMON_ORDERS = [
  "Q - W - R - E", "E - W - R - Q", "3 Points Q - Max W - Finish Q - R - E",
  "2 Points Q - 2 Points E-  Max W - Finish Q - R - E", "W - Q - R - E",
];

const ITEM_NAMES_FALLBACK = [
  "Zhonya's Hourglass","Force of Nature","Blade of the Ruined King","Boots of Swiftness",
  "Mercury's Treads","Plated Steelcaps","Warmog's Armor","Heartsteel","Banshee's Veil",
  "Luden's Companion","Rod of Ages","Kaenic Rookern","Dead Man's Plate","Frozen Heart",
  "Bramble Vest","Sunfire Aegis","Randuin's Omen","Eclipse","Fimbulwinter",
  "Shurelya's Battlesong","Rylai's Crystal Scepter","Warden's Mail","Negatron Cloak",
  "Horizon Focus","Dark Seal","Lost Chapter","Oblivion Orb","Liandry's Torment",
  "Riftmaker","Jak'Sho","Cosmic Drive","Wit's End","Abyssal Mask","Cull",
  "Malignance","Moonstone Renewer","Trinity Force","Nashor's Tooth","Hollow Radiance",
  "Unending Despair","Ionian Boots","Chain Vest","Spirit Visage","Iceborn Gauntlet",
  "Thornmail","Gargoyle Stoneplate","Rabadon's Deathcap","Void Staff","Shadowflame",
  "Stormsurge","Lich Bane","Seraph's Embrace","Cryptbloom","Morellonomicon",
  "Knight's Vow","Sterak's Gage","Titanic Hydra",
];

interface ItemNameEntry { name: string; id: number; }

function useItemData(): { names: string[]; idMap: Record<string, number> } {
  const [entries, setEntries] = useState<ItemNameEntry[]>([]);
  useEffect(() => {
    fetch("https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/item.json")
      .then((r) => r.json())
      .then((d) => {
        const seen = new Set<string>();
        const items: ItemNameEntry[] = [];
        for (const [id, item] of Object.entries(d.data as Record<string, { name: string; gold?: { purchasable?: boolean } }>)) {
          if (seen.has(item.name)) continue;
          if (item.gold?.purchasable === false) continue;
          seen.add(item.name);
          items.push({ name: item.name, id: parseInt(id) });
        }
        if (items.length > 0) setEntries(items.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {});
  }, []);
  const names = entries.length > 0 ? entries.map((e) => e.name) : ITEM_NAMES_FALLBACK;
  const idMap: Record<string, number> = {};
  for (const e of entries) idMap[e.name] = e.id;
  return { names, idMap };
}

const DDRAGON_ITEM = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/item";

const ALL_CHAMPIONS = [
  "Aatrox","Ahri","Akali","Akshan","Alistar","Ambessa","Amumu","Anivia","Annie","Aphelios",
  "Ashe","Aurelion Sol","Aurora","Azir","Bard","Bel'Veth","Blitzcrank","Brand","Braum",
  "Briar","Caitlyn","Camille","Cassiopeia","Cho'Gath","Corki","Darius","Diana","Dr. Mundo",
  "Draven","Ekko","Elise","Evelynn","Ezreal","Fiddlesticks","Fiora","Fizz","Galio",
  "Gangplank","Garen","Gnar","Gragas","Graves","Gwen","Hecarim","Heimerdinger","Hwei",
  "Illaoi","Irelia","Ivern","Janna","Jarvan IV","Jax","Jayce","Jhin","Jinx","K'Sante",
  "Kai'Sa","Kalista","Karma","Karthus","Kassadin","Katarina","Kayle","Kayn","Kennen",
  "Kha'Zix","Kindred","Kled","Kog'Maw","LeBlanc","Lee Sin","Leona","Lillia","Lissandra",
  "Lucian","Lulu","Lux","Malphite","Malzahar","Maokai","Master Yi","Mel","Miss Fortune",
  "Mordekaiser","Morgana","Naafiri","Nami","Nasus","Nautilus","Neeko","Nidalee","Nilah",
  "Nocturne","Nunu & Willump","Olaf","Orianna","Ornn","Pantheon","Poppy","Pyke","Qiyana",
  "Quinn","Rakan","Rammus","Rek'Sai","Rell","Renata Glasc","Renekton","Rengar","Riven",
  "Rumble","Ryze","Samira","Sejuani","Senna","Seraphine","Sett","Shaco","Shen","Shyvana",
  "Singed","Sion","Sivir","Skarner","Smolder","Sona","Soraka","Swain","Sylas","Syndra",
  "Tahm Kench","Taliyah","Talon","Taric","Teemo","Thresh","Tristana","Trundle","Tryndamere",
  "Twisted Fate","Twitch","Udyr","Urgot","Varus","Vayne","Veigar","Vel'Koz","Vex","Vi",
  "Viego","Viktor","Vladimir","Volibear","Warwick","Wukong","Xayah","Xerath","Xin Zhao",
  "Yasuo","Yone","Yorick","Yuumi","Zac","Zed","Zeri","Ziggs","Zilean","Zoe","Zyra",
];

const CHAMP_KEYS: Record<string, string> = {
  "Aurelion Sol": "AurelionSol", "Dr. Mundo": "DrMundo", "Twisted Fate": "TwistedFate",
  "LeBlanc": "Leblanc", "Vel'Koz": "Velkoz", "K'Sante": "KSante", "Tahm Kench": "TahmKench",
  "Wukong": "MonkeyKing", "Jarvan IV": "JarvanIV", "Lee Sin": "LeeSin", "Master Yi": "MasterYi",
  "Miss Fortune": "MissFortune", "Nunu & Willump": "Nunu", "Rek'Sai": "RekSai",
  "Renata Glasc": "Renata", "Xin Zhao": "XinZhao", "Bel'Veth": "Belveth",
  "Cho'Gath": "Chogath", "Kai'Sa": "Kaisa", "Kha'Zix": "Khazix", "Kog'Maw": "KogMaw",
};

function getChampKey(name: string): string {
  return CHAMP_KEYS[name] || name.replace(/[' ]/g, "");
}

function emptyMatchup(): Matchup {
  return {
    champion: "", championKey: "", advice: "",
    runeAP: "", runeTank: "", itemsAP: "", itemsTank: "",
    difficultyAP: "Medium", difficultyTank: "Medium",
    abilityOrderAP: "Q - W - R - E", abilityOrderTank: "Q - W - R - E",
  };
}

// ── Shared Components ──

function ChampImg({ champKey: ck, size = 32 }: { champKey: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!ck || err) return <div className="shrink-0 rounded bg-card-border" style={{ width: size, height: size }} />;
  return <Image src={`${DDRAGON}/${ck}.png`} alt="" width={size} height={size} className="shrink-0 rounded border border-card-border" style={{ width: size, height: size }} onError={() => setErr(true)} />;
}

function AutoTextarea({ value, onChange, placeholder, minRows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.max(ref.current.scrollHeight, minRows * 24) + "px";
    }
  }, [value, minRows]);
  return (
    <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full resize-none rounded-lg border border-card-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
      style={{ overflow: "hidden" }} />
  );
}

function RuneSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value.replace(/\(based on preference\)/gi, "").split("/").map((r) => r.trim()).filter(Boolean);
  function toggle(runeId: string) {
    let newSel: string[];
    if (selected.includes(runeId)) {
      newSel = selected.filter((r) => r !== runeId);
    } else {
      newSel = [...selected, runeId];
    }
    onChange(newSel.length > 1 ? `${newSel.join("/")} (based on preference)` : newSel.join(""));
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {RUNES.map((r) => {
        const active = selected.includes(r.id);
        return (
          <button key={r.id} type="button" onClick={() => toggle(r.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${active ? "border-accent bg-accent/20 text-accent-glow" : "border-card-border bg-background text-foreground/40 hover:text-foreground/70"}`}>
            <Image src={r.img} alt={r.label} width={20} height={20} className="h-5 w-5 rounded" />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function AbilityOrderEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isPreset = COMMON_ORDERS.includes(value);
  return (
    <div className="space-y-2">
      <select value={isPreset ? value : "__custom__"} onChange={(e) => { if (e.target.value !== "__custom__") onChange(e.target.value); }}
        className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none">
        {COMMON_ORDERS.map((order) => (
          <option key={order} value={order}>{order}</option>
        ))}
        <option value="__custom__">Custom...</option>
      </select>
      {!isPreset && (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
          placeholder="Type custom skill order..." />
      )}
    </div>
  );
}

function ChampionSearch({ value, onChange, exclude }: { value: string; onChange: (name: string, key: string) => void; exclude?: string[] }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [liveChamps, setLiveChamps] = useState<string[]>(ALL_CHAMPIONS);
  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    fetch("https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/champion.json")
      .then((r) => r.json())
      .then((d) => {
        const names = Object.values(d.data as Record<string, { name: string }>).map((c) => c.name).sort();
        if (names.length > 0) setLiveChamps(names);
      })
      .catch(() => {});
  }, []);
  const excludeSet = new Set(exclude?.map((e) => e.toLowerCase()) || []);
  const available = liveChamps.filter((c) => !excludeSet.has(c.toLowerCase()));
  const filtered = query
    ? available.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : available.slice(0, 12);
  return (
    <div className="relative">
      <input type="text" value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search champion..."
        className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none" />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-card-border bg-card py-1 shadow-xl">
          {filtered.map((name) => (
            <button key={name} type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(name, getChampKey(name)); setQuery(name); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition hover:bg-accent/20 ${name === value ? "text-accent-glow font-semibold" : "text-foreground/70"}`}>
              <ChampImg champKey={getChampKey(name)} size={20} />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemsField({ value, onChange, itemNames, itemIdMap }: { value: string; onChange: (v: string) => void; itemNames: string[]; itemIdMap?: Record<string, number> }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) { ref.current.style.height = "auto"; ref.current.style.height = Math.max(ref.current.scrollHeight, 72) + "px"; }
  }, [value]);
  const filtered = query.length > 0 ? itemNames.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  function itemImgUrl(name: string): string | null {
    const id = itemIdMap?.[name] ?? ITEM_DATA.find((i) => i.name === name || i.aliases.some((a) => a.toLowerCase() === name.toLowerCase()))?.id;
    return id ? `${DDRAGON_ITEM}/${id}.png` : null;
  }
  function insertItem(itemName: string) {
    const separator = value.trim() ? ", " : "";
    onChange(value + separator + itemName);
    setQuery("");
    setShowSuggestions(false);
    ref.current?.focus();
  }
  return (
    <div className="space-y-2">
      <div className="relative">
        <input type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="🔍 Quick-add item by name..."
          className="w-full rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none" />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-card-border bg-card py-1 shadow-xl">
            {filtered.map((name) => {
              const url = itemImgUrl(name);
              return (
                <button key={name} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertItem(name)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-foreground/70 transition hover:bg-accent/20 hover:text-foreground">
                  {url && <Image src={url} alt="" width={24} height={24} className="h-6 w-6 rounded border border-card-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Item recommendations..."
        className="w-full resize-none rounded-lg border border-card-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
        style={{ overflow: "hidden", minHeight: "72px" }} />
    </div>
  );
}

// ── Start Item Selector ──

function StartItemSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }
  return (
    <div className="flex gap-2">
      {START_ITEMS.map((item) => {
        const active = value.includes(item.id);
        return (
          <button key={item.id} type="button" onClick={() => toggle(item.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${active ? "border-amber-500 bg-amber-500/20 text-amber-300" : "border-card-border bg-background text-foreground/40 hover:text-foreground/70 opacity-40"}`}>
            <Image src={item.img} alt={item.name} width={24} height={24} className="h-6 w-6 rounded" />
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

// ── Tier Item Editor (Sortable) ──

function itemIdLookup(name: string): number | null {
  const match = ITEM_DATA.find((i) => i.name === name || i.aliases.some((a) => a.toLowerCase() === name.toLowerCase()));
  return match?.id ?? null;
}

function SortableTierItem({ item, id, onChange, onRemove, itemNames, itemIdMap }: {
  item: { imgIndex: number; name: string };
  id: string;
  onChange: (name: string) => void;
  onRemove: () => void;
  itemNames: string[];
  itemIdMap?: Record<string, number>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, transition: { duration: 150, easing: "ease" } });
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 50 : undefined };
  const [query, setQuery] = useState(item.name);
  const [open, setOpen] = useState(false);
  useEffect(() => { setQuery(item.name); }, [item.name]);
  const filtered = query
    ? itemNames.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : itemNames.slice(0, 8);

  const imgSrc = (() => {
    if (item.name && itemIdMap?.[item.name]) return `${DDRAGON_ITEM}/${itemIdMap[item.name]}.png`;
    const local = ITEM_DATA.find((i) => i.name === item.name);
    if (local) return `${DDRAGON_ITEM}/${local.id}.png`;
    return `/images/tierlist/item_${item.imgIndex}.jpg`;
  })();

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col items-center gap-1 w-[90px]">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <Image src={imgSrc} alt={item.name || ""} width={64} height={64}
          className="h-16 w-16 rounded border border-card-border transition hover:border-accent/60" />
      </div>
      <div className="relative w-full">
        <input type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={`#${item.imgIndex}`}
          className="w-full rounded border border-card-border bg-background px-1 py-0.5 text-center text-[10px] text-foreground focus:border-accent focus:outline-none" />
        {open && filtered.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-card-border bg-card py-1 shadow-xl">
            {filtered.map((name) => {
              const ddId = itemIdMap?.[name] ?? itemIdLookup(name);
              return (
                <button key={name} type="button" onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(name); setQuery(name); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition hover:bg-accent/20 ${name === item.name ? "text-accent-glow font-semibold" : "text-foreground/70"}`}>
                  {ddId && <Image src={`${DDRAGON_ITEM}/${ddId}.png`} alt="" width={20} height={20} className="h-5 w-5 rounded border border-card-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <button onClick={onRemove} className="rounded px-1.5 py-0.5 text-[10px] text-hard transition hover:bg-hard/20">Remove</button>
    </div>
  );
}

function AddItemModal({ onAdd, onClose, itemNames, itemIdMap }: { onAdd: (name: string) => void; onClose: () => void; itemNames: string[]; itemIdMap?: Record<string, number> }) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? itemNames.filter((n) => n.toLowerCase().includes(query.toLowerCase()))
    : itemNames;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-card-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-card-border px-5 py-4">
          <h2 className="flex-1 text-lg font-bold">Add Item</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/40 hover:text-foreground hover:bg-card-border">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items..." autoFocus
            className="mb-3 w-full rounded-lg border border-card-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none" />
          <div className="max-h-64 overflow-y-auto space-y-0.5">
            {filtered.map((name) => {
              const ddId = itemIdMap?.[name] ?? itemIdLookup(name);
              return (
                <button key={name} type="button" onClick={() => { onAdd(name); onClose(); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground/70 transition hover:bg-accent/20 hover:text-foreground">
                  {ddId && <Image src={`${DDRAGON_ITEM}/${ddId}.png`} alt="" width={28} height={28} className="h-7 w-7 rounded border border-card-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  {name}
                </button>
              );
            })}
            {filtered.length === 0 && <p className="py-4 text-center text-sm text-foreground/40">No items found</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Login ──

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (res.ok) onLogin(); else { const data = await res.json(); setError(data.error || "Invalid password"); }
    } catch { setError("Network error"); } finally { setLoading(false); }
  }
  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-6 text-center text-3xl font-bold text-accent-glow">Admin Login</h1>
      <form onSubmit={handleSubmit} className="rounded-xl border border-card-border bg-card p-6">
        <label className="mb-2 block text-sm font-medium text-foreground/70">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus
          className="mb-4 w-full rounded-lg border border-card-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none" placeholder="Enter admin password" />
        {error && <p className="mb-4 text-sm font-medium text-hard">{error}</p>}
        <button type="submit" disabled={loading || !password} className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-glow disabled:opacity-50">
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}

// ── Edit Modal ──

function EditModal({ matchup, onSave, onClose, isNew, excludeChampions, itemNames, itemIdMap }: {
  matchup: Matchup; onSave: (m: Matchup) => void; onClose: () => void; isNew?: boolean; excludeChampions?: string[]; itemNames: string[]; itemIdMap?: Record<string, number>;
}) {
  const [m, setM] = useState<Matchup>({ ...matchup });
  const [modalDirty, setModalDirty] = useState(false);

  function update<K extends keyof Matchup>(key: K, value: Matchup[K]) {
    setM((prev) => ({ ...prev, [key]: value }));
    setModalDirty(true);
  }

  function tryClose() {
    if (modalDirty) {
      if (!confirm("You have unsaved changes. Discard them?")) return;
    }
    onClose();
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; };
  }, []);

  const tryCloseRef = useRef(tryClose);
  tryCloseRef.current = tryClose;
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") tryCloseRef.current(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) tryClose(); }}>
      <div className="relative w-full max-w-6xl rounded-2xl border border-card-border bg-card shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-card-border px-6 py-4">
          <ChampImg champKey={m.championKey} size={48} />
          <h2 className="flex-1 text-xl font-bold">{isNew ? "Add New Matchup" : `Edit: ${m.champion}`}</h2>
          <button onClick={() => { onSave(m); }} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-glow">
            {isNew ? "Add" : "Done"}
          </button>
          <button onClick={tryClose} className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/40 transition hover:bg-card-border hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[80vh] overflow-y-auto">
          {/* Left: Champion + Advice */}
          <div className="flex-1 px-6 py-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">Champion</label>
              <ChampionSearch value={m.champion} onChange={(name, key) => { setM((prev) => ({ ...prev, champion: name, championKey: key })); setModalDirty(true); }} exclude={excludeChampions} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">Starting Items</label>
              <StartItemSelector value={m.startItems || []} onChange={(v) => { setM((prev) => ({ ...prev, startItems: v })); setModalDirty(true); }} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">Matchup Advice</label>
              <AutoTextarea value={m.advice} onChange={(v) => update("advice", v)} placeholder="Detailed matchup advice..." minRows={8} />
            </div>
          </div>

          {/* Right: AP and Tank side by side */}
          <div className="flex w-full flex-col gap-3 p-5 lg:w-[520px] lg:shrink-0">
            {/* AP */}
            <div className="rounded-xl border border-[#7b2ff2]/30 bg-[#7b2ff2]/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Image src="/images/mage-icon.webp" alt="AP" width={20} height={20} className="h-5 w-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-accent-glow">AP</h4>
                <div className="flex-1" />
                <select value={m.difficultyAP} onChange={(e) => update("difficultyAP", e.target.value as Difficulty)}
                  className={`rounded px-2 py-1 text-xs font-bold text-white ${DIFF_COLORS[m.difficultyAP]} border-0 mr-2`}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/50">Rune</label>
                <RuneSelector value={m.runeAP} onChange={(v) => update("runeAP", v)} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/50">Skill Order</label>
                <AbilityOrderEditor value={m.abilityOrderAP} onChange={(v) => update("abilityOrderAP", v)} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/50">Items</label>
                <ItemsField value={m.itemsAP} onChange={(v) => update("itemsAP", v)} itemNames={itemNames} itemIdMap={itemIdMap} />
              </div>
            </div>

            {/* Tank */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Image src="/images/tank-icon.png" alt="Tank" width={20} height={20} className="h-5 w-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400">Tank</h4>
                <div className="flex-1" />
                <select value={m.difficultyTank} onChange={(e) => update("difficultyTank", e.target.value as Difficulty)}
                  className={`rounded px-2 py-1 text-xs font-bold text-white ${DIFF_COLORS[m.difficultyTank]} border-0 mr-2`}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/50">Rune</label>
                <RuneSelector value={m.runeTank} onChange={(v) => update("runeTank", v)} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/50">Skill Order</label>
                <AbilityOrderEditor value={m.abilityOrderTank} onChange={(v) => update("abilityOrderTank", v)} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/50">Items</label>
                <ItemsField value={m.itemsTank} onChange={(v) => update("itemsTank", v)} itemNames={itemNames} itemIdMap={itemIdMap} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──

// ── Items Tier Admin ──

function ItemsTierAdmin({ data, setData, setDirty, itemNames, itemIdMap }: {
  data: MatchupData | null;
  setData: (d: MatchupData) => void;
  setDirty: (d: boolean) => void;
  itemNames: string[];
  itemIdMap?: Record<string, number>;
}) {
  const [addingTo, setAddingTo] = useState<{ key: "tankItems" | "apItems"; tierIndex: number } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(key: "tankItems" | "apItems", tierIndex: number, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !data) return;
    const items = data[key][tierIndex].items;
    const oldIndex = items.findIndex((_, i) => `${key}-${tierIndex}-${i}` === active.id);
    const newIndex = items.findIndex((_, i) => `${key}-${tierIndex}-${i}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newTiers = [...data[key]];
    newTiers[tierIndex] = { ...newTiers[tierIndex], items: arrayMove(items, oldIndex, newIndex) };
    setData({ ...data, [key]: newTiers });
    setDirty(true);
  }

  return (
    <>
      <div className="flex flex-col gap-10 lg:flex-row">
        {(["tankItems", "apItems"] as const).map((key) => {
          const label = key === "tankItems" ? "Tank" : "AP";
          const icon = key === "tankItems" ? "/images/tank-icon.png" : "/images/mage-icon.webp";
          const tiers: ItemTier[] = data?.[key] || [];
          return (
            <div key={key} className="flex-1 min-w-0">
              <div className="mb-4 flex items-center gap-2">
                <Image src={icon} alt="" width={24} height={24} className="h-6 w-6" />
                <h2 className="text-lg font-bold text-foreground">{label} Items</h2>
              </div>
              <div className="space-y-4">
                {tiers.map((tierRow, tierIndex) => {
                  const ids = tierRow.items.map((_, i) => `${key}-${tierIndex}-${i}`);
                  return (
                    <div key={tierRow.tier} className="rounded-xl border border-card-border bg-card p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded bg-card-border px-2 py-0.5 text-xs font-bold text-foreground">{tierRow.tier}</span>
                        <button onClick={() => setAddingTo({ key, tierIndex })}
                          className="ml-auto rounded border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-glow transition hover:bg-accent/20">
                          + Add Item
                        </button>
                      </div>
                      <DndContext sensors={sensors} collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(key, tierIndex, e)}>
                        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
                          <div className="flex flex-wrap gap-3">
                            {tierRow.items.map((item, itemIndex) => (
                              <SortableTierItem
                                key={`${key}-${tierIndex}-${itemIndex}`}
                                id={`${key}-${tierIndex}-${itemIndex}`}
                                item={item}
                                onChange={(name) => {
                                  if (!data) return;
                                  const newTiers = [...data[key]];
                                  const newItems = [...newTiers[tierIndex].items];
                                  newItems[itemIndex] = { ...newItems[itemIndex], name };
                                  newTiers[tierIndex] = { ...newTiers[tierIndex], items: newItems };
                                  setData({ ...data, [key]: newTiers }); setDirty(true);
                                }}
                                onRemove={() => {
                                  if (!data) return;
                                  if (!confirm(`Remove ${item.name || `item #${item.imgIndex}`}?`)) return;
                                  const newTiers = [...data[key]];
                                  const newItems = [...newTiers[tierIndex].items];
                                  newItems.splice(itemIndex, 1);
                                  newTiers[tierIndex] = { ...newTiers[tierIndex], items: newItems };
                                  setData({ ...data, [key]: newTiers }); setDirty(true);
                                }}
                                itemNames={itemNames}
                                itemIdMap={itemIdMap}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {addingTo && (
        <AddItemModal
          onAdd={(name) => {
            if (!data) return;
            const { key, tierIndex } = addingTo;
            const maxImg = Math.max(0, ...data[key].flatMap((t) => t.items.map((i) => i.imgIndex)));
            const newTiers = [...data[key]];
            newTiers[tierIndex] = { ...newTiers[tierIndex], items: [...newTiers[tierIndex].items, { imgIndex: maxImg + 1, name }] };
            setData({ ...data, [key]: newTiers }); setDirty(true);
          }}
          onClose={() => setAddingTo(null)}
          itemNames={itemNames}
          itemIdMap={itemIdMap}
        />
      )}
    </>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState<MatchupData | null>(null);
  const [sha, setSha] = useState("");
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"mid" | "top" | "changelog" | "items">("mid");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ lane: "mid" | "top"; index: number } | null>(null);
  const [adding, setAdding] = useState(false);
  const { names: itemNames, idMap: itemIdMap } = useItemData();

  const loadData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/matchups");
      if (res.status === 401) { setAuthed(false); setLoading(false); return; }
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to load"); setLoading(false); return; }
      const json = await res.json();
      const norm = (ms: Matchup[]) => ms.map((m) => ({
        ...m,
        difficultyAP: (m.difficultyAP === ("Super-Hard" as string) ? "Super Hard" : m.difficultyAP) as Difficulty,
        difficultyTank: (m.difficultyTank === ("Super-Hard" as string) ? "Super Hard" : m.difficultyTank) as Difficulty,
      }));
      setData({ mid: norm(json.data.mid), top: norm(json.data.top), changelog: json.data.changelog || [], tankItems: json.data.tankItems || [], apItems: json.data.apItems || [] });
      setSha(json.sha); setAuthed(true); setDirty(false);
    } catch { setError("Network error"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function handleSave() {
    if (!data || !sha) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/matchups", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, sha, message: `Update matchups via admin: ${new Date().toISOString()}` }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to save"); return; }
      const json = await res.json();
      setSha(json.sha); setDirty(false); setSuccess("Saved!"); setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Network error"); } finally { setSaving(false); }
  }

  if (!authed && !loading) return <LoginForm onLogin={() => { setAuthed(true); loadData(); }} />;

  const matchups: Matchup[] = data && activeTab !== "changelog" && activeTab !== "items" ? data[activeTab as "mid" | "top"] : [];
  const filtered = search ? matchups.filter((m) => m.champion.toLowerCase().includes(search.toLowerCase())) : matchups;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold">Matchup Admin</h1>
        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="text-xs text-medium font-semibold">Unsaved changes</span>}
          {success && <span className="text-xs text-easy font-semibold">{success}</span>}
          {error && <span className="text-xs text-hard font-semibold max-w-xs truncate">{error}</span>}
          <button onClick={handleSave} disabled={saving || !dirty}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-glow disabled:opacity-50">
            {saving ? "Saving..." : "Save to GitHub"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-foreground/40">Loading matchups...</p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-3">
            {(["mid", "top"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-accent text-white" : "bg-card text-foreground/50 hover:text-foreground"}`}>
                {tab === "mid" ? "Mid" : "Top"} ({data?.[tab].length || 0})
              </button>
            ))}
            <button onClick={() => setActiveTab("changelog")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === "changelog" ? "bg-accent text-white" : "bg-card text-foreground/50 hover:text-foreground"}`}>
              Changelog ({data?.changelog.length || 0})
            </button>
            <button onClick={() => setActiveTab("items")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === "items" ? "bg-accent text-white" : "bg-card text-foreground/50 hover:text-foreground"}`}>
              Items
            </button>
            {activeTab !== "changelog" && activeTab !== "items" && (
              <>
                <div className="relative ml-auto">
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search champion..."
                    className="w-48 rounded-lg border border-card-border bg-card px-3 py-2 pr-8 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none" />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-foreground/40 hover:text-foreground">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <button onClick={() => setAdding(true)}
                  className="rounded-lg bg-accent/20 border border-accent/40 px-3 py-2 text-sm font-semibold text-accent-glow transition hover:bg-accent/30">
                  + Add Matchup
                </button>
              </>
            )}
          </div>

          {activeTab === "changelog" ? (
            <div className="space-y-6">
              {/* Changes since last changelog */}
              {data && data.changelog.length > 0 && (() => {
                const lastDate = data.changelog[0]?.date || "";
                const parts = lastDate.split(".");
                const lastTs = parts.length === 3 ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime() : 0;
                const now = Date.now();
                const daysSince = lastTs ? Math.floor((now - lastTs) / (1000 * 60 * 60 * 24)) : null;
                return (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">Since last changelog ({lastDate})</h3>
                      {daysSince !== null && <span className="text-xs text-foreground/40">{daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince} days ago`}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
                      <span>{data.mid.length} mid matchups</span>
                      <span className="text-foreground/20">|</span>
                      <span>{data.top.length} top matchups</span>
                      <span className="text-foreground/20">|</span>
                      <span>{(data.tankItems?.reduce((n, t) => n + t.items.length, 0) || 0) + (data.apItems?.reduce((n, t) => n + t.items.length, 0) || 0)} items in tier list</span>
                    </div>
                    {daysSince !== null && daysSince > 7 && (
                      <p className="mt-2 text-xs text-amber-400/70">Consider adding a new changelog entry — it&apos;s been over a week.</p>
                    )}
                  </div>
                );
              })()}

              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">Entries</h3>
                <button onClick={() => {
                  if (!data) return;
                  const now = new Date();
                  const dd = String(now.getDate()).padStart(2, "0");
                  const mm = String(now.getMonth() + 1).padStart(2, "0");
                  const yyyy = now.getFullYear();
                  const todayStr = `${dd}.${mm}.${yyyy}`;
                  setData({ ...data, changelog: [{ date: todayStr, items: [""] }, ...data.changelog] });
                  setDirty(true);
                }} className="rounded-lg bg-accent/20 border border-accent/40 px-3 py-2 text-sm font-semibold text-accent-glow transition hover:bg-accent/30">
                  + New Entry
                </button>
              </div>

              {data?.changelog.length === 0 && (
                <p className="py-12 text-center text-foreground/40">No changelog entries yet.</p>
              )}

              {data?.changelog.map((entry, entryIndex) => (
                <div key={entryIndex} className="rounded-xl border border-card-border bg-card overflow-hidden">
                  <div className="flex items-center gap-3 bg-card-border/20 px-4 py-3">
                    <input type="text" value={entry.date}
                      onChange={(e) => {
                        if (!data) return;
                        const newChangelog = [...data.changelog];
                        newChangelog[entryIndex] = { ...newChangelog[entryIndex], date: e.target.value };
                        setData({ ...data, changelog: newChangelog }); setDirty(true);
                      }}
                      className="w-36 rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm font-semibold text-accent-glow focus:border-accent focus:outline-none"
                      placeholder="DD.MM.YYYY" />
                    <span className="text-xs text-foreground/30">{entry.items.length} item{entry.items.length !== 1 ? "s" : ""}</span>
                    <div className="flex-1" />
                    <button onClick={() => {
                      if (!data) return;
                      if (!confirm(`Delete entry for ${entry.date}?`)) return;
                      const newChangelog = [...data.changelog];
                      newChangelog.splice(entryIndex, 1);
                      setData({ ...data, changelog: newChangelog }); setDirty(true);
                    }} className="shrink-0 rounded px-2 py-1 text-xs text-hard transition hover:bg-hard/20">
                      Delete
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    {entry.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-2">
                        <span className="mt-2 text-xs text-foreground/30">{itemIndex + 1}.</span>
                        <div className="flex-1">
                          <AutoTextarea value={item}
                            onChange={(v) => {
                              if (!data) return;
                              const newChangelog = [...data.changelog];
                              const newItems = [...newChangelog[entryIndex].items];
                              newItems[itemIndex] = v;
                              newChangelog[entryIndex] = { ...newChangelog[entryIndex], items: newItems };
                              setData({ ...data, changelog: newChangelog }); setDirty(true);
                            }}
                            placeholder="Changelog item..."
                            minRows={1} />
                        </div>
                        <button onClick={() => {
                          if (!data) return;
                          const newChangelog = [...data.changelog];
                          const newItems = [...newChangelog[entryIndex].items];
                          newItems.splice(itemIndex, 1);
                          newChangelog[entryIndex] = { ...newChangelog[entryIndex], items: newItems };
                          setData({ ...data, changelog: newChangelog }); setDirty(true);
                        }} className="mt-1.5 shrink-0 rounded px-2 py-1 text-xs text-hard transition hover:bg-hard/20">
                          X
                        </button>
                      </div>
                    ))}
                    <button onClick={() => {
                      if (!data) return;
                      const newChangelog = [...data.changelog];
                      const newItems = [...newChangelog[entryIndex].items, ""];
                      newChangelog[entryIndex] = { ...newChangelog[entryIndex], items: newItems };
                      setData({ ...data, changelog: newChangelog }); setDirty(true);
                    }} className="rounded border border-card-border bg-background px-2 py-1 text-xs text-foreground/50 transition hover:border-accent/40 hover:text-foreground">
                      + Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "items" ? (
            <ItemsTierAdmin data={data} setData={setData} setDirty={setDirty} itemNames={itemNames} itemIdMap={itemIdMap} />
          ) : (
          <div className="space-y-1">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-foreground/40">No matchups found.</p>
            ) : filtered.map((m) => {
              const realIndex = matchups.indexOf(m);
              return (
                <div key={`${activeTab}-${realIndex}`}
                  className="flex items-center gap-3 rounded-lg border border-card-border bg-card px-4 py-2.5 transition hover:border-accent/40 cursor-pointer"
                  onClick={() => setEditing({ lane: activeTab as "mid" | "top", index: realIndex })}>
                  <ChampImg champKey={m.championKey} size={28} />
                  <span className="min-w-[120px] text-sm font-bold">{m.champion || "(unnamed)"}</span>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[m.difficultyAP]}`}>{m.difficultyAP}</span>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[m.difficultyTank]}`}>{m.difficultyTank}</span>
                  <span className="ml-auto text-xs text-foreground/30 truncate max-w-[200px]">{m.runeAP} / {m.runeTank}</span>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${m.champion}?`)) {
                    if (!data) return;
                    const lane = activeTab as "mid" | "top";
                    const newList = [...data[lane]]; newList.splice(realIndex, 1);
                    setData({ ...data, [lane]: newList }); setDirty(true);
                  }}} className="shrink-0 rounded px-2 py-1 text-xs text-hard transition hover:bg-hard/20">Delete</button>
                </div>
              );
            })}
          </div>
          )}
        </>
      )}

      {editing && data && (
        <EditModal
          matchup={data[editing.lane][editing.index]}
          onSave={(updated) => {
            const newList = [...data[editing.lane]]; newList[editing.index] = updated;
            setData({ ...data, [editing.lane]: newList }); setDirty(true); setEditing(null);
          }}
          onClose={() => setEditing(null)}
          itemNames={itemNames}
          itemIdMap={itemIdMap}
        />
      )}

      {adding && activeTab !== "changelog" && activeTab !== "items" && (
        <EditModal
          matchup={emptyMatchup()}
          isNew
          excludeChampions={data ? data[activeTab as "mid" | "top"].map((m) => m.champion) : []}
          itemNames={itemNames}
          itemIdMap={itemIdMap}
          onSave={(newM) => {
            if (!data) return;
            const lane = activeTab as "mid" | "top";
            setData({ ...data, [lane]: [...data[lane], newM] }); setDirty(true); setAdding(false);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}
