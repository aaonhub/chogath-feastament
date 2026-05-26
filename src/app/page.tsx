"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import matchupData from "../../data/matchups.json";

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <Image src={src} alt="" width={1200} height={1200} className="max-h-[95vh] max-w-[95vw] object-contain" style={{ minWidth: "50vw" }} />
    </div>
  );
}

function ClickableImage({ src, alt, width, height, className, style }: {
  src: string; alt: string; width: number; height: number; className?: string; style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="transition hover:brightness-110 hover:scale-[1.02]">
        <Image src={src} alt={alt} width={width} height={height} className={className} style={style} />
      </button>
      {open && <ImageLightbox src={src} onClose={() => setOpen(false)} />}
    </>
  );
}

const socials = [
  {
    label: "Twitch",
    href: "https://www.twitch.tv/Sakuritou",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/c/sakuritou",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com/sakuritou",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@sakuritou",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    label: "Mobafire",
    href: "https://www.mobafire.com/league-of-legends/build/season-14-sakuritou-challenger-rank-1-chogath-world-guide-609864",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 flex justify-start">
        <div className="text-left">
          <h1 className="mb-2 text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span className="text-accent-glow">Cho&apos;Gath</span> Feastament
          </h1>
          <p className="text-lg text-foreground/50">
            The definitive matchup guide &mdash; Makkro approved
          </p>
        </div>
      </div>

      {/* Author */}
      <section className="mb-12 overflow-hidden rounded-xl border border-card-border bg-card">
        <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <ClickableImage
              src="/images/saku-profile.jpg"
              alt="Sakuritou's Challenger profile"
              width={452}
              height={438}
              className="rounded-lg border border-card-border"
              style={{ width: "520px", height: "auto" }}
            />
            <div className="mt-3 flex gap-3">
              <ClickableImage
                src="/images/challenger.jpg"
                alt="Promoted to Challenger"
                width={320}
                height={431}
                className="rounded-lg border border-card-border"
                style={{ height: "340px", width: "auto" }}
              />
              <ClickableImage
                src="/images/saku-opgg.jpg"
                alt="Sakuritou's OP.GG stats"
                width={454}
                height={431}
                className="rounded-lg border border-card-border"
                style={{ height: "340px", width: "auto" }}
              />
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-3xl font-bold">Sakuritou</h2>
            <p className="mb-3 text-base leading-relaxed text-foreground/70">
              Multi-season Challenger Cho&apos;Gath player and one-trick. Rank 1
              Cho&apos;Gath worldwide, peaked 1465 LP Rank 25 on EUW in Season
              14. Holds the record for highest LP ever achieved by a Cho&apos;Gath
              main.
            </p>
            <p className="mb-4 text-base leading-relaxed text-foreground/70">
              Made with help from{" "}
              <span className="text-foreground/90 font-semibold">Cramble</span>,{" "}
              <span className="text-foreground/90 font-semibold">Captain Orb</span>, and{" "}
              <span className="text-foreground/90 font-semibold">Swaggy</span>. All matchups
              are based on GM+ experience.
            </p>
            <ClickableImage
              src="/images/saku-rank1.jpg"
              alt="Rank 1 All Time"
              width={434}
              height={147}
              style={{ width: "auto", height: "auto" }}
              className="mb-4 rounded-lg border border-card-border"
            />
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-background px-3 py-2 text-sm font-medium text-foreground/70 transition hover:border-accent hover:text-accent-glow"
                >
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lane cards */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold">Matchup Guides</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <LaneCard
            href="/mid"
            title="Mid Lane"
            count={matchupData.mid.length}
            icon="/images/mid-lane.webp"
            description="All mid lane matchups with runes, items, and ability order for both AP and Tank."
          />
          <LaneCard
            href="/top"
            title="Top Lane"
            count={matchupData.top.length}
            icon="/images/top-lane.png"
            description="All top lane matchups with runes, items, and ability order for both AP and Tank."
          />
        </div>
      </section>

      {/* How to read */}
      <section className="mb-12 rounded-xl border border-card-border bg-card p-6">
        <h2 className="mb-4 text-xl font-bold">How to Read This Guide</h2>
        <ul className="space-y-2 text-sm text-foreground/70">
          <li>
            Each matchup includes advice, ideal runes, item recommendations, and
            skill order for both <strong className="text-foreground/90">AP</strong> and{" "}
            <strong className="text-foreground/90">Tank</strong> Cho&apos;Gath.
          </li>
          <li className="flex items-center gap-2">
            Difficulty is color-coded:
            <span className="rounded bg-easy px-2 py-0.5 text-xs font-semibold text-white">
              Easy
            </span>
            <span className="rounded bg-medium px-2 py-0.5 text-xs font-semibold text-white">
              Medium
            </span>
            <span className="rounded bg-hard px-2 py-0.5 text-xs font-semibold text-white">
              Hard
            </span>
            <span className="rounded bg-super-hard px-2 py-0.5 text-xs font-semibold text-white">
              Super Hard
            </span>
          </li>
          <li>
            Use the search bar and difficulty filters on each page to find what
            you need.
          </li>
        </ul>
        <p className="mt-4 text-xs text-foreground/40">
          Current Patch: 25.18 &middot; Disclaimer: All matchups are based on GM+
          experience.
        </p>
      </section>
    </div>
  );
}

function LaneCard({
  href,
  title,
  count,
  icon,
  description,
}: {
  href: string;
  title: string;
  count: number;
  icon?: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-card-border bg-card p-6 transition hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5"
    >
      <h3 className="mb-1 flex items-center gap-2 text-lg font-bold group-hover:text-accent-glow">
        {icon && <Image src={icon} alt="" width={24} height={24} className="h-6 w-6" />}
        {title}
      </h3>
      <p className="mb-3 text-2xl font-extrabold text-accent-glow">{count}</p>
      <p className="text-sm text-foreground/50">{description}</p>
    </Link>
  );
}
