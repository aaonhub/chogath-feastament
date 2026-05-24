"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

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

interface MatchupData {
  mid: Matchup[];
  top: Matchup[];
}

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard", "Super Hard"];
const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: "bg-easy",
  Medium: "bg-medium",
  Hard: "bg-hard",
  "Super Hard": "bg-super-hard",
};

const DDRAGON = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion";
const DDRAGON_SPELL = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/spell";

const RUNES = [
  { id: "Comet", label: "Comet", img: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png" },
  { id: "HoB", label: "HoB", img: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png" },
  { id: "Grasp", label: "Grasp", img: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png" },
  { id: "Electrocute", label: "Electro", img: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Electrocute/Electrocute.png" },
];

const CHO_SPELLS = [
  { key: "Q", name: "Rupture", img: `${DDRAGON_SPELL}/Rupture.png` },
  { key: "W", name: "Feral Scream", img: `${DDRAGON_SPELL}/FeralScream.png` },
  { key: "E", name: "Vorpal Spikes", img: `${DDRAGON_SPELL}/VorpalSpikes.png` },
  { key: "R", name: "Feast", img: `${DDRAGON_SPELL}/Feast.png` },
];

const COMMON_ORDERS = [
  "Q - W - R - E",
  "Q - W - E - R",
  "E - W - R - Q",
  "E - W - Q - R",
  "W - Q - R - E",
  "3 Points Q - Max W - Finish Q - R - E",
  "2 Points Q - 2 Points E-  Max W - Finish Q - R - E",
  "W - Q - R - E",
];

const ITEM_NAMES = [
  "Zhonya's Hourglass", "Force of Nature", "Blade of the Ruined King", "Boots of Swiftness",
  "Mercury's Treads", "Plated Steelcaps", "Warmog's Armor", "Heartsteel", "Banshee's Veil",
  "Luden's Companion", "Rod of Ages", "Kaenic Rookern", "Dead Man's Plate", "Frozen Heart",
  "Bramble Vest", "Sunfire Aegis", "Randuin's Omen", "Eclipse", "Fimbulwinter",
  "Shurelya's Battlesong", "Rylai's Crystal Scepter", "Warden's Mail", "Negatron Cloak",
  "Horizon Focus", "Dark Seal", "Lost Chapter", "Oblivion Orb", "Liandry's Torment",
  "Riftmaker", "Jak'Sho", "Cosmic Drive", "Wit's End", "Abyssal Mask", "Cull",
  "Malignance", "Moonstone Renewer", "Trinity Force", "Nashor's Tooth", "Hollow Radiance",
  "Unending Despair", "Ionian Boots", "Chain Vest", "Rocketbelt",
];

const CHAMPION_KEYS: Record<string, string> = {
  "Aurelion Sol": "AurelionSol", "Dr. Mundo": "DrMundo", "Twisted Fate": "TwistedFate",
  "LeBlanc": "Leblanc", "Vel'Koz": "Velkoz", "K'Sante": "KSante",
  "Tahm Kench": "TahmKench", "Wukong": "MonkeyKing",
};

function champKey(name: string): string {
  return CHAMPION_KEYS[name] || name.replace(/[' ]/g, "");
}

function emptyMatchup(): Matchup {
  return {
    champion: "", championKey: "", advice: "",
    runeAP: "", runeTank: "", itemsAP: "", itemsTank: "",
    difficultyAP: "Medium", difficultyTank: "Medium",
    abilityOrderAP: "Q - W - R - E", abilityOrderTank: "Q - W - R - E",
  };
}

// --- Components ---

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
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-none rounded-lg border border-card-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
      style={{ overflow: "hidden" }}
    />
  );
}

function RuneSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value
    .replace(/\(based on preference\)/gi, "")
    .split("/")
    .map((r) => r.trim())
    .filter(Boolean);

  function toggle(runeId: string) {
    const newSel = selected.includes(runeId)
      ? selected.filter((r) => r !== runeId)
      : [...selected, runeId];
    const formatted = newSel.length > 1
      ? `${newSel.join("/")} (based on preference)`
      : newSel.join("/");
    onChange(formatted);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {RUNES.map((r) => {
        const active = selected.includes(r.id);
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => toggle(r.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-accent bg-accent/20 text-accent-glow"
                : "border-card-border bg-background text-foreground/40 hover:text-foreground/70"
            }`}
          >
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
      <div className="flex flex-wrap gap-1">
        {COMMON_ORDERS.map((order) => (
          <button
            key={order}
            type="button"
            onClick={() => onChange(order)}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${
              value === order
                ? "border-accent bg-accent/20 text-accent-glow"
                : "border-card-border bg-background text-foreground/40 hover:text-foreground/70"
            }`}
          >
            {order.match(/[QWER]/g)?.map((letter, i) => {
              const spell = CHO_SPELLS.find((s) => s.key === letter);
              return spell ? (
                <Image key={i} src={spell.img} alt={letter} width={16} height={16} className="h-4 w-4 rounded" />
              ) : null;
            })}
            <span className="ml-0.5">{order.length > 15 ? order.slice(0, 12) + "…" : order}</span>
          </button>
        ))}
      </div>
      {!isPreset && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Custom order..."
          className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-card-border/50 bg-transparent px-2 py-1 text-xs text-foreground/50 focus:border-accent focus:outline-none"
        placeholder="Or type custom..."
      />
    </div>
  );
}

function ItemsField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.max(ref.current.scrollHeight, 72) + "px";
    }
  }, [value]);

  const filtered = query.length > 0
    ? ITEM_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  function insertItem(itemName: string) {
    const separator = value.trim() ? ", " : "";
    onChange(value + separator + itemName);
    setQuery("");
    setShowSuggestions(false);
    ref.current?.focus();
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Item recommendations..."
        className="w-full resize-none rounded-lg border border-card-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
        style={{ overflow: "hidden", minHeight: "72px" }}
      />
      <div className="mt-1 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search items to add..."
          className="w-full rounded-lg border border-dashed border-card-border bg-transparent px-3 py-1.5 text-xs text-foreground/60 placeholder:text-foreground/30 focus:border-accent focus:outline-none"
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-card-border bg-card py-1 shadow-xl">
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertItem(name)}
                className="w-full px-3 py-1.5 text-left text-sm text-foreground/70 transition hover:bg-accent/20 hover:text-foreground"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChampImg({ champKey: ck, size = 32 }: { champKey: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!ck || err) {
    return <div className="shrink-0 rounded bg-card-border" style={{ width: size, height: size }} />;
  }
  return (
    <Image
      src={`${DDRAGON}/${ck}.png`}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded border border-card-border"
      style={{ width: size, height: size }}
      onError={() => setErr(true)}
    />
  );
}

// --- Login Form ---
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { onLogin(); }
      else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-6 text-center text-3xl font-bold text-accent-glow">Admin Login</h1>
      <form onSubmit={handleSubmit} className="rounded-xl border border-card-border bg-card p-6">
        <label className="mb-2 block text-sm font-medium text-foreground/70">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-card-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
          placeholder="Enter admin password"
          autoFocus
        />
        {error && <p className="mb-4 text-sm font-medium text-hard">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-glow disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}

// --- Matchup Editor Row ---
function MatchupRow({ matchup, onChange, onDelete }: {
  matchup: Matchup;
  onChange: (updated: Matchup) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function update<K extends keyof Matchup>(key: K, value: Matchup[K]) {
    const updated = { ...matchup, [key]: value };
    if (key === "champion") {
      updated.championKey = champKey(value as string);
    }
    onChange(updated);
  }

  return (
    <div className="rounded-xl border border-card-border bg-card">
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-card-border/30"
        onClick={() => setExpanded(!expanded)}
      >
        <svg
          className={`h-4 w-4 shrink-0 text-foreground/40 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        <ChampImg champKey={matchup.championKey} size={28} />

        <span className="min-w-[120px] text-sm font-bold">
          {matchup.champion || "(unnamed)"}
        </span>

        <div className="flex items-center gap-1">
          <span className="text-xs text-foreground/40">AP:</span>
          <span className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[matchup.difficultyAP]}`}>
            {matchup.difficultyAP}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-foreground/40">Tank:</span>
          <span className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[matchup.difficultyTank]}`}>
            {matchup.difficultyTank}
          </span>
        </div>

        <span className="ml-auto text-xs text-foreground/30 truncate max-w-[200px]">
          {matchup.runeAP} / {matchup.runeTank}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete ${matchup.champion || "this matchup"}?`)) onDelete();
          }}
          className="shrink-0 rounded px-2 py-1 text-xs text-hard transition hover:bg-hard/20"
        >
          Delete
        </button>
      </div>

      {expanded && (
        <div className="border-t border-card-border px-5 py-5 space-y-5">
          {/* Champion info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Champion Name
              </label>
              <input
                type="text"
                value={matchup.champion}
                onChange={(e) => update("champion", e.target.value)}
                placeholder="e.g. Ahri"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Champion Key (DDragon)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={matchup.championKey}
                  onChange={(e) => update("championKey", e.target.value)}
                  placeholder="e.g. AurelionSol"
                  className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                />
                <ChampImg champKey={matchup.championKey} size={36} />
              </div>
            </div>
            <div className="flex items-end">
              <p className="text-xs text-foreground/30">
                Key auto-fills from name. Override for special cases (AurelionSol, DrMundo, etc.)
              </p>
            </div>
          </div>

          {/* Advice */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Matchup Advice
            </label>
            <AutoTextarea
              value={matchup.advice}
              onChange={(v) => update("advice", v)}
              placeholder="Detailed matchup advice..."
              minRows={4}
            />
          </div>

          {/* AP Section */}
          <div className="rounded-xl border border-[#7b2ff2]/30 bg-[#7b2ff2]/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#7b2ff2]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-accent-glow">AP Cho&apos;Gath</h4>
              <select
                value={matchup.difficultyAP}
                onChange={(e) => update("difficultyAP", e.target.value as Difficulty)}
                className={`ml-auto rounded px-2 py-1 text-xs font-bold text-white ${DIFF_COLORS[matchup.difficultyAP]} border-0`}
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Keystone Rune
              </label>
              <RuneSelector value={matchup.runeAP} onChange={(v) => update("runeAP", v)} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Skill Order
              </label>
              <AbilityOrderEditor value={matchup.abilityOrderAP} onChange={(v) => update("abilityOrderAP", v)} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Items
              </label>
              <ItemsField value={matchup.itemsAP} onChange={(v) => update("itemsAP", v)} />
            </div>
          </div>

          {/* Tank Section */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400">Tank Cho&apos;Gath</h4>
              <select
                value={matchup.difficultyTank}
                onChange={(e) => update("difficultyTank", e.target.value as Difficulty)}
                className={`ml-auto rounded px-2 py-1 text-xs font-bold text-white ${DIFF_COLORS[matchup.difficultyTank]} border-0`}
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Keystone Rune
              </label>
              <RuneSelector value={matchup.runeTank} onChange={(v) => update("runeTank", v)} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Skill Order
              </label>
              <AbilityOrderEditor value={matchup.abilityOrderTank} onChange={(v) => update("abilityOrderTank", v)} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Items
              </label>
              <ItemsField value={matchup.itemsTank} onChange={(v) => update("itemsTank", v)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Admin Page ---
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/matchups");
      if (res.status === 401) { setAuthed(false); setLoading(false); return; }
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to load");
        setLoading(false);
        return;
      }
      const json = await res.json();
      const normalize = (matchups: Matchup[]) =>
        matchups.map((m) => ({
          ...m,
          difficultyAP: (m.difficultyAP === ("Super-Hard" as string) ? "Super Hard" : m.difficultyAP) as Difficulty,
          difficultyTank: (m.difficultyTank === ("Super-Hard" as string) ? "Super Hard" : m.difficultyTank) as Difficulty,
        }));
      setData({ mid: normalize(json.data.mid), top: normalize(json.data.top) });
      setSha(json.sha);
      setAuthed(true);
      setDirty(false);
    } catch { setError("Network error loading data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const res = await fetch("/api/matchups");
      if (cancelled) return;
      if (res.status === 401) { setAuthed(false); setLoading(false); return; }
      if (!res.ok) {
        const errData = await res.json();
        if (!cancelled) { setError(errData.error || "Failed to load"); setLoading(false); }
        return;
      }
      const json = await res.json();
      if (cancelled) return;
      const normalize = (matchups: Matchup[]) =>
        matchups.map((m) => ({
          ...m,
          difficultyAP: (m.difficultyAP === ("Super-Hard" as string) ? "Super Hard" : m.difficultyAP) as Difficulty,
          difficultyTank: (m.difficultyTank === ("Super-Hard" as string) ? "Super Hard" : m.difficultyTank) as Difficulty,
        }));
      setData({ mid: normalize(json.data.mid), top: normalize(json.data.top) });
      setSha(json.sha);
      setAuthed(true);
      setDirty(false);
      setLoading(false);
    }
    init().catch(() => { if (!cancelled) { setError("Network error"); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  async function handleSave() {
    if (!data || !sha) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/matchups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, sha, message: `Update matchups via admin: ${new Date().toISOString()}` }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to save");
        return;
      }
      const json = await res.json();
      setSha(json.sha);
      setDirty(false);
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Network error saving"); }
    finally { setSaving(false); }
  }

  function updateMatchup(lane: "mid" | "top", index: number, updated: Matchup) {
    if (!data) return;
    const newList = [...data[lane]];
    newList[index] = updated;
    setData({ ...data, [lane]: newList });
    setDirty(true);
  }

  function deleteMatchup(lane: "mid" | "top", index: number) {
    if (!data) return;
    const newList = [...data[lane]];
    newList.splice(index, 1);
    setData({ ...data, [lane]: newList });
    setDirty(true);
  }

  function addMatchup(lane: "mid" | "top") {
    if (!data) return;
    setData({ ...data, [lane]: [...data[lane], emptyMatchup()] });
    setDirty(true);
  }

  if (!authed && !loading) {
    return <LoginForm onLogin={() => { setAuthed(true); loadData(); }} />;
  }

  const matchups = data ? data[activeTab] : [];
  const filtered = search
    ? matchups.filter((m) => m.champion.toLowerCase().includes(search.toLowerCase()))
    : matchups;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold">Matchup Admin</h1>
        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="text-xs text-medium font-semibold">Unsaved changes</span>}
          {success && <span className="text-xs text-easy font-semibold">{success}</span>}
          {error && <span className="text-xs text-hard font-semibold">{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-glow disabled:opacity-50"
          >
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
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  activeTab === tab
                    ? "bg-accent text-white"
                    : "bg-card text-foreground/50 hover:text-foreground"
                }`}
              >
                {tab === "mid" ? "Mid" : "Top"} ({data?.[tab].length || 0})
              </button>
            ))}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search champion..."
              className="ml-auto rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
            />
            <button
              onClick={() => addMatchup(activeTab)}
              className="rounded-lg border border-dashed border-card-border px-3 py-2 text-sm font-semibold text-foreground/50 transition hover:border-accent hover:text-accent-glow"
            >
              + Add Matchup
            </button>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-foreground/40">No matchups found.</p>
            ) : (
              filtered.map((m, i) => {
                const realIndex = matchups.indexOf(m);
                return (
                  <MatchupRow
                    key={`${activeTab}-${realIndex}-${m.champion}`}
                    matchup={m}
                    onChange={(updated) => updateMatchup(activeTab, realIndex, updated)}
                    onDelete={() => deleteMatchup(activeTab, realIndex)}
                  />
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
