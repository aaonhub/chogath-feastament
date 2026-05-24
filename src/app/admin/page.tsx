"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ITEMS as ITEM_DATA, getItemImageUrl } from "@/data/items";

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
}

interface MatchupData { mid: Matchup[]; top: Matchup[]; }

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard", "Super Hard"];
const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: "bg-easy", Medium: "bg-medium", Hard: "bg-hard", "Super Hard": "bg-super-hard",
};

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

const ITEM_NAMES = [
  "Zhonya's Hourglass","Force of Nature","Blade of the Ruined King","Boots of Swiftness",
  "Mercury's Treads","Plated Steelcaps","Warmog's Armor","Heartsteel","Banshee's Veil",
  "Luden's Companion","Rod of Ages","Kaenic Rookern","Dead Man's Plate","Frozen Heart",
  "Bramble Vest","Sunfire Aegis","Randuin's Omen","Eclipse","Fimbulwinter",
  "Shurelya's Battlesong","Rylai's Crystal Scepter","Warden's Mail","Negatron Cloak",
  "Horizon Focus","Dark Seal","Lost Chapter","Oblivion Orb","Liandry's Torment",
  "Riftmaker","Jak'Sho","Cosmic Drive","Wit's End","Abyssal Mask","Cull",
  "Malignance","Moonstone Renewer","Trinity Force","Nashor's Tooth","Hollow Radiance",
  "Unending Despair","Ionian Boots","Chain Vest","Rocketbelt",
];

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
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {COMMON_ORDERS.map((order) => (
          <button key={order} type="button" onClick={() => onChange(order)}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${value === order ? "border-accent bg-accent/20 text-accent-glow" : "border-card-border bg-background text-foreground/40 hover:text-foreground/70"}`}>
            {order.match(/[QWER]/g)?.map((letter, i) => {
              const spell = CHO_SPELLS.find((s) => s.key === letter);
              return spell ? <Image key={i} src={spell.img} alt={letter} width={16} height={16} className="h-4 w-4 rounded" /> : null;
            })}
            <span className="ml-0.5">{order.length > 20 ? order.slice(0, 18) + "…" : order}</span>
          </button>
        ))}
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
        placeholder="Custom order..." />
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

function ItemsField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) { ref.current.style.height = "auto"; ref.current.style.height = Math.max(ref.current.scrollHeight, 72) + "px"; }
  }, [value]);
  const filtered = query.length > 0 ? ITEM_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  function itemId(name: string): number | null {
    const match = ITEM_DATA.find((i) => i.name === name || i.aliases.some((a) => a.toLowerCase() === name.toLowerCase()));
    return match?.id ?? null;
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
              const id = itemId(name);
              return (
                <button key={name} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertItem(name)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-foreground/70 transition hover:bg-accent/20 hover:text-foreground">
                  {id && <Image src={getItemImageUrl(id)} alt="" width={24} height={24} className="h-6 w-6 rounded border border-card-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
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

function EditModal({ matchup, onSave, onClose, isNew, excludeChampions }: {
  matchup: Matchup; onSave: (m: Matchup) => void; onClose: () => void; isNew?: boolean; excludeChampions?: string[];
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
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") tryClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, modalDirty]);

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
                <ItemsField value={m.itemsAP} onChange={(v) => update("itemsAP", v)} />
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
                <ItemsField value={m.itemsTank} onChange={(v) => update("itemsTank", v)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState<MatchupData | null>(null);
  const [sha, setSha] = useState("");
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"mid" | "top">("mid");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ lane: "mid" | "top"; index: number } | null>(null);
  const [adding, setAdding] = useState(false);

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
      setData({ mid: norm(json.data.mid), top: norm(json.data.top) });
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

  const matchups = data ? data[activeTab] : [];
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
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search champion..."
              className="ml-auto rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none" />
            <button onClick={() => setAdding(true)}
              className="rounded-lg bg-accent/20 border border-accent/40 px-3 py-2 text-sm font-semibold text-accent-glow transition hover:bg-accent/30">
              + Add Matchup
            </button>
          </div>

          <div className="space-y-1">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-foreground/40">No matchups found.</p>
            ) : filtered.map((m) => {
              const realIndex = matchups.indexOf(m);
              return (
                <div key={`${activeTab}-${realIndex}`}
                  className="flex items-center gap-3 rounded-lg border border-card-border bg-card px-4 py-2.5 transition hover:border-accent/40 cursor-pointer"
                  onClick={() => setEditing({ lane: activeTab, index: realIndex })}>
                  <ChampImg champKey={m.championKey} size={28} />
                  <span className="min-w-[120px] text-sm font-bold">{m.champion || "(unnamed)"}</span>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[m.difficultyAP]}`}>{m.difficultyAP}</span>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[m.difficultyTank]}`}>{m.difficultyTank}</span>
                  <span className="ml-auto text-xs text-foreground/30 truncate max-w-[200px]">{m.runeAP} / {m.runeTank}</span>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${m.champion}?`)) {
                    if (!data) return;
                    const newList = [...data[activeTab]]; newList.splice(realIndex, 1);
                    setData({ ...data, [activeTab]: newList }); setDirty(true);
                  }}} className="shrink-0 rounded px-2 py-1 text-xs text-hard transition hover:bg-hard/20">Delete</button>
                </div>
              );
            })}
          </div>
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
        />
      )}

      {adding && (
        <EditModal
          matchup={emptyMatchup()}
          isNew
          excludeChampions={data ? data[activeTab].map((m) => m.champion) : []}
          onSave={(newM) => {
            if (!data) return;
            setData({ ...data, [activeTab]: [...data[activeTab], newM] }); setDirty(true); setAdding(false);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}
