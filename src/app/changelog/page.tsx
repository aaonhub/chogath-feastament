export const metadata = { title: "Changelog — Cho'Gath Feastament" };

const entries = [
  {
    date: "23.05.2025",
    items: ["Some general edits + working on ADC"],
  },
  {
    date: "14.05.2025",
    items: [
      "Changes to Item Tier list (AP Items), will be updating more as more games are played on the patch",
      'Cho\'Gath "changes" makes E stronger — looking to try 3 Points Q into E max. Will be adding an "Ability-Skill-Order" section soon',
    ],
  },
  {
    date: "01.05.2025",
    items: [
      "Will be updated once enough games are played in new season, added some extra tips + did some more ADC stuff",
    ],
  },
  {
    date: "12.04.2025",
    items: [
      "Added some extra advices on some matchups + early work on ADC has started",
    ],
  },
  {
    date: "21.03.2025",
    items: [
      'Naafiri rework: AP difficulty changed from "Easy" to "Medium" (text adjusted)',
      'Gwen early game buffs made the lane harder. AP difficulty changed from "Hard" to "Super Hard"',
    ],
  },
  {
    date: "08.03.2025",
    items: [
      "After trying out new patch, the Cho nerfs don't really do anything — nothing changes :P",
    ],
  },
  {
    date: "01.03.2025",
    items: ["Added more advices"],
  },
  {
    date: "22.02.2025",
    items: [
      "Patch 25.04 changes (Tank Items)",
      "Added current patch in introduction",
    ],
  },
  {
    date: "17.02.2025",
    items: ["Added some extra advices for some matchups"],
  },
  {
    date: "09.02.2025",
    items: [
      'Was really sick so haven\'t been making changes recently, added "latest" YT video into introduction area',
    ],
  },
  {
    date: "04.02.2025",
    items: [
      "Added Ctrl+F names — you can now search for any champion name and find the matchup instantly",
    ],
  },
  {
    date: "02.02.2025",
    items: ["Typos"],
  },
  {
    date: "01.02.2025",
    items: ["Added text on the difficulty indicators"],
  },
  {
    date: "31.01.2025",
    items: [
      "Removed double Fimbulwinter from Item Tier List (mistake)",
      "Added order hint in Item Tier List",
      "Added Shurelya into AP Item Tier List",
    ],
  },
  {
    date: "13.10.2025",
    items: [
      "Still working on official guide, had some hardships IRL so haven't been active lately, adjusted some matchups",
    ],
  },
  {
    date: "03.09.2025",
    items: ["Matchups changed in difficulty due to new changes"],
  },
  {
    date: "13.08.2025",
    items: ["Will be adding Viego (mid/top) soon"],
  },
  {
    date: "01.08.2025",
    items: ["Still working on ADC Page"],
  },
  {
    date: "07.07.2025",
    items: ["Updated Tank Items on stream again, as meta changed"],
  },
  {
    date: "13.06.2025",
    items: ["Updated the item tierlist (tank items)"],
  },
  {
    date: "10.06.2025",
    items: [
      "Back from vacation, worked more on ADC Matchups, release will be approx. end of June",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Changelog</h1>
      <p className="mb-8 text-foreground/50">
        All updates to the Cho&apos;Gath Feastament guide.
      </p>

      <div className="relative border-l-2 border-card-border pl-6">
        {entries.map((e) => (
          <div key={e.date} className="relative mb-8 last:mb-0">
            <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-accent bg-background" />
            <time className="mb-1 block text-sm font-semibold text-accent-glow">
              {e.date}
            </time>
            <ul className="space-y-1 text-sm text-foreground/70">
              {e.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
