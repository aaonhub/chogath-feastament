"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#e06666]",
  A: "bg-[#e69138]",
  B: "bg-[#f1c232]",
  C: "bg-[#ffd966]",
  D: "bg-[#b1ba58]",
};

const tiers = [
  { tier: "S", skins: [0, 1, 2] },
  { tier: "A", skins: [3, 4, 5, 6] },
  { tier: "B", skins: [7, 8] },
  { tier: "C", skins: [9] },
  { tier: "D", skins: [] as number[] },
];

function SkinLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt=""
          width={960}
          height={566}
          className="max-h-[85vh] w-auto rounded-xl border border-card-border object-contain"
        />
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-card-border text-foreground/60 hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function SkinsPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Skin Tier List</h1>
      <p className="mb-8 text-foreground/50">
        Sakuritou&apos;s Cho&apos;Gath skin rankings. Click to enlarge.
      </p>

      <div className="overflow-hidden rounded-xl border border-card-border">
        {tiers.map((row) => (
          <div
            key={row.tier}
            className="flex items-center border-b border-card-border last:border-b-0"
          >
            <div
              className={`flex w-16 shrink-0 items-center justify-center self-stretch text-2xl font-bold ${TIER_COLORS[row.tier]}`}
            >
              {row.tier}
            </div>
            <div className="flex flex-nowrap gap-2 bg-[#434343] px-2 py-1.5 flex-1 min-h-[140px]">
              {row.skins.length === 0 ? (
                <span className="text-sm text-foreground/30 self-center">—</span>
              ) : (
                row.skins.map((i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(`/images/tierlist/skin_${i}.jpg`)}
                    className="transition hover:scale-105 hover:brightness-110"
                  >
                    <Image
                      src={`/images/tierlist/skin_${i}.jpg`}
                      alt=""
                      width={320}
                      height={189}
                      className="h-[130px] w-auto rounded border border-card-border object-cover"
                    />
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {lightbox && <SkinLightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
