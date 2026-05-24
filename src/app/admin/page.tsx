"use client";

import { useState, useEffect, useCallback } from "react";

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

function emptyMatchup(): Matchup {
  return {
    champion: "",
    championKey: "",
    advice: "",
    runeAP: "",
    runeTank: "",
    itemsAP: "",
    itemsTank: "",
    difficultyAP: "Medium",
    difficultyTank: "Medium",
    abilityOrderAP: "Q - W - R - E",
    abilityOrderTank: "Q - W - R - E",
  };
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

      if (res.ok) {
        onLogin();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-6 text-center text-3xl font-bold text-accent-glow">
        Admin Login
      </h1>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-card-border bg-card p-6"
      >
        <label className="mb-2 block text-sm font-medium text-foreground/70">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-card-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
          placeholder="Enter admin password"
          autoFocus
        />
        {error && (
          <p className="mb-4 text-sm font-medium text-hard">{error}</p>
        )}
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
function MatchupRow({
  matchup,
  onChange,
  onDelete,
}: {
  matchup: Matchup;
  onChange: (updated: Matchup) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function update<K extends keyof Matchup>(key: K, value: Matchup[K]) {
    onChange({ ...matchup, [key]: value });
  }

  return (
    <div className="rounded-xl border border-card-border bg-card">
      {/* Header row - always visible */}
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-card-border/30"
        onClick={() => setExpanded(!expanded)}
      >
        <svg
          className={`h-4 w-4 shrink-0 text-foreground/40 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>

        <span className="min-w-[140px] text-sm font-bold">
          {matchup.champion || "(unnamed)"}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/40">AP:</span>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[matchup.difficultyAP]}`}
          >
            {matchup.difficultyAP}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/40">Tank:</span>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${DIFF_COLORS[matchup.difficultyTank]}`}
          >
            {matchup.difficultyTank}
          </span>
        </div>

        <div className="ml-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (
                confirm(`Delete ${matchup.champion || "this matchup"}?`)
              ) {
                onDelete();
              }
            }}
            className="rounded px-2 py-1 text-xs text-hard transition hover:bg-hard/20"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-card-border px-4 py-4">
          {/* Champion info */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Champion Name"
              value={matchup.champion}
              onChange={(v) => update("champion", v)}
              placeholder="e.g. Ahri"
            />
            <Field
              label="Champion Key (DDragon)"
              value={matchup.championKey}
              onChange={(v) => update("championKey", v)}
              placeholder="e.g. Ahri, AurelionSol"
            />
          </div>

          {/* Advice */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Advice
            </label>
            <textarea
              value={matchup.advice}
              onChange={(e) => update("advice", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
              placeholder="Matchup advice..."
            />
          </div>

          {/* AP section */}
          <h4 className="mb-2 text-sm font-bold text-accent-glow">
            AP Cho&apos;Gath
          </h4>
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-card-border/50 bg-background/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Rune (AP)"
              value={matchup.runeAP}
              onChange={(v) => update("runeAP", v)}
              placeholder="e.g. Comet"
            />
            <SelectField
              label="Difficulty (AP)"
              value={matchup.difficultyAP}
              options={DIFFICULTIES}
              onChange={(v) => update("difficultyAP", v as Difficulty)}
            />
            <Field
              label="Ability Order (AP)"
              value={matchup.abilityOrderAP}
              onChange={(v) => update("abilityOrderAP", v)}
              placeholder="Q - W - R - E"
            />
            <Field
              label="Items (AP)"
              value={matchup.itemsAP}
              onChange={(v) => update("itemsAP", v)}
              placeholder="Item recommendations..."
            />
          </div>

          {/* Tank section */}
          <h4 className="mb-2 text-sm font-bold text-blue-400">
            Tank Cho&apos;Gath
          </h4>
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-card-border/50 bg-background/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Rune (Tank)"
              value={matchup.runeTank}
              onChange={(v) => update("runeTank", v)}
              placeholder="e.g. Grasp"
            />
            <SelectField
              label="Difficulty (Tank)"
              value={matchup.difficultyTank}
              options={DIFFICULTIES}
              onChange={(v) => update("difficultyTank", v as Difficulty)}
            />
            <Field
              label="Ability Order (Tank)"
              value={matchup.abilityOrderTank}
              onChange={(v) => update("abilityOrderTank", v)}
              placeholder="E - W - R - Q"
            />
            <Field
              label="Items (Tank)"
              value={matchup.itemsTank}
              onChange={(v) => update("itemsTank", v)}
              placeholder="Item recommendations..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
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

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/matchups");
      if (res.status === 401) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to load");
        setLoading(false);
        return;
      }
      const json = await res.json();
      // Normalize any "Super-Hard" to "Super Hard"
      const normalize = (matchups: Matchup[]) =>
        matchups.map((m) => ({
          ...m,
          difficultyAP: (
            m.difficultyAP === ("Super-Hard" as string)
              ? "Super Hard"
              : m.difficultyAP
          ) as Difficulty,
          difficultyTank: (
            m.difficultyTank === ("Super-Hard" as string)
              ? "Super Hard"
              : m.difficultyTank
          ) as Difficulty,
        }));
      setData({
        mid: normalize(json.data.mid),
        top: normalize(json.data.top),
      });
      setSha(json.sha);
      setAuthed(true);
      setDirty(false);
    } catch {
      setError("Network error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load on mount
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const res = await fetch("/api/matchups");
      if (cancelled) return;
      if (res.status === 401) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        if (!cancelled) {
          setError(errData.error || "Failed to load");
          setLoading(false);
        }
        return;
      }
      const json = await res.json();
      if (cancelled) return;
      const normalize = (matchups: Matchup[]) =>
        matchups.map((m) => ({
          ...m,
          difficultyAP: (
            m.difficultyAP === ("Super-Hard" as string)
              ? "Super Hard"
              : m.difficultyAP
          ) as Difficulty,
          difficultyTank: (
            m.difficultyTank === ("Super-Hard" as string)
              ? "Super Hard"
              : m.difficultyTank
          ) as Difficulty,
        }));
      setData({
        mid: normalize(json.data.mid),
        top: normalize(json.data.top),
      });
      setSha(json.sha);
      setAuthed(true);
      setDirty(false);
      setLoading(false);
    }
    init().catch(() => {
      if (!cancelled) {
        setError("Network error loading data");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Warn on unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  // Save handler
  async function handleSave() {
    if (!data || !sha) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/matchups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          sha,
          message: `Update matchups via admin: ${new Date().toISOString()}`,
        }),
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
    } catch {
      setError("Network error saving data");
    } finally {
      setSaving(false);
    }
  }

  // Matchup update handlers
  function updateMatchup(
    lane: "mid" | "top",
    index: number,
    updated: Matchup
  ) {
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
    const newList = [...data[lane], emptyMatchup()];
    setData({ ...data, [lane]: newList });
    setDirty(true);
  }

  // Not authed - show login
  if (!authed && !loading) {
    return (
      <LoginForm
        onLogin={() => {
          setAuthed(true);
          loadData();
        }}
      />
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-foreground/50">Loading...</div>
      </div>
    );
  }

  const matchups = data ? data[activeTab] : [];
  const filtered = search
    ? matchups.filter((m) =>
        m.champion.toLowerCase().includes(search.toLowerCase())
      )
    : matchups;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-accent-glow">Matchup</span> Admin
          </h1>
          <p className="text-sm text-foreground/50">
            {data ? `${data.mid.length} mid + ${data.top.length} top matchups` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs font-medium text-medium">
              Unsaved changes
            </span>
          )}
          {success && (
            <span className="text-xs font-medium text-easy">{success}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-white transition hover:bg-accent-glow disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save to GitHub"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-hard/30 bg-hard/10 px-4 py-3 text-sm text-hard">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1">
          <button
            onClick={() => {
              setActiveTab("mid");
              setSearch("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              activeTab === "mid"
                ? "bg-accent text-white"
                : "bg-card text-foreground/60 hover:text-foreground"
            }`}
          >
            Mid ({data?.mid.length ?? 0})
          </button>
          <button
            onClick={() => {
              setActiveTab("top");
              setSearch("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              activeTab === "top"
                ? "bg-accent text-white"
                : "bg-card text-foreground/60 hover:text-foreground"
            }`}
          >
            Top ({data?.top.length ?? 0})
          </button>
        </div>

        <input
          type="text"
          placeholder="Search champion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-card-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
        />

        <button
          onClick={() => addMatchup(activeTab)}
          className="rounded-lg border border-accent/50 px-4 py-2 text-sm font-bold text-accent-glow transition hover:bg-accent/10"
        >
          + Add Matchup
        </button>
      </div>

      {/* Matchup List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-foreground/40">
            {search ? "No matchups match your search." : "No matchups yet."}
          </p>
        ) : (
          filtered.map((m) => {
            // Find actual index in the full array
            const actualIdx = matchups.indexOf(m);
            return (
              <MatchupRow
                key={`${activeTab}-${actualIdx}`}
                matchup={m}
                onChange={(updated) =>
                  updateMatchup(activeTab, actualIdx, updated)
                }
                onDelete={() => deleteMatchup(activeTab, actualIdx)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
