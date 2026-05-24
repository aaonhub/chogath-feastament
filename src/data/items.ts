export interface ItemInfo {
  id: number;
  name: string;
  gold: number;
  desc: string;
  aliases: string[];
}

export const ITEMS: ItemInfo[] = [
  { id: 3157, name: "Zhonya's Hourglass", gold: 3250, desc: "Activate to become invincible but unable to take actions", aliases: ["hourglass", "zhonyas", "zhonya"] },
  { id: 4401, name: "Force of Nature", gold: 2800, desc: "Move Speed, Magic Resist, and Health Regeneration", aliases: ["force of nature", "fon"] },
  { id: 3153, name: "Blade of the Ruined King", gold: 3200, desc: "Deals damage based on target's max Health", aliases: ["blade of the ruined king", "botrk", "bork"] },
  { id: 3009, name: "Boots of Swiftness", gold: 1000, desc: "Move Speed +60, reduces slows by 40%", aliases: ["swifties", "swiftie", "boots of swiftness"] },
  { id: 3111, name: "Mercury's Treads", gold: 1250, desc: "Move Speed, Magic Resist, and Tenacity", aliases: ["mercs", "mercury", "mercury's treads"] },
  { id: 3047, name: "Plated Steelcaps", gold: 1200, desc: "Move Speed and reduced basic attack damage taken", aliases: ["tabi", "tabis", "plated steelcaps", "steelcaps"] },
  { id: 3083, name: "Warmog's Armor", gold: 3100, desc: "Massive Health and Health Regen", aliases: ["warmogs", "warmog"] },
  { id: 3084, name: "Heartsteel", gold: 3000, desc: "Gain permanent max Health by charging at champions", aliases: ["heartsteel"] },
  { id: 3102, name: "Banshee's Veil", gold: 3000, desc: "Periodically blocks an enemy ability", aliases: ["banshees", "banshee", "banshee's"] },
  { id: 6655, name: "Luden's Companion", gold: 2750, desc: "High burst damage, good against fragile foes", aliases: ["ludens", "luden"] },
  { id: 6657, name: "Rod of Ages", gold: 2600, desc: "Scales with time, granting Health, Mana, and AP", aliases: ["roa", "rod of ages"] },
  { id: 2504, name: "Kaenic Rookern", gold: 2900, desc: "Magic Resist and a spell shield", aliases: ["kaenic"] },
  { id: 3742, name: "Dead Man's Plate", gold: 2900, desc: "Build momentum then slam into enemies", aliases: ["deadmans", "dead man's plate", "dead mans", "deadman"] },
  { id: 3110, name: "Frozen Heart", gold: 2500, desc: "Massive Armor, slows enemy attack speed", aliases: ["frozen heart"] },
  { id: 3076, name: "Bramble Vest", gold: 800, desc: "Reflects damage and applies Grievous Wounds", aliases: ["bramble vest", "bramble"] },
  { id: 3068, name: "Sunfire Aegis", gold: 2700, desc: "Armor, Health, and burn damage to nearby enemies", aliases: ["sunfire"] },
  { id: 3143, name: "Randuin's Omen", gold: 2700, desc: "Armor, Health, activate to slow nearby enemies", aliases: ["randuins", "randuin"] },
  { id: 6692, name: "Eclipse", gold: 2900, desc: "Lethality and omnivamp, shield on proc", aliases: ["eclipse"] },
  { id: 3121, name: "Fimbulwinter", gold: 2400, desc: "Mana and a shield when immobilizing enemies", aliases: ["fimbulwinter", "fimbul"] },
  { id: 2065, name: "Shurelya's Battlesong", gold: 2200, desc: "Activate to speed up nearby allies", aliases: ["shurelyas", "shurelya"] },
  { id: 3116, name: "Rylai's Crystal Scepter", gold: 2600, desc: "Abilities slow enemies", aliases: ["rylais", "rylai"] },
  { id: 3082, name: "Warden's Mail", gold: 1000, desc: "Armor, reduces incoming attack damage", aliases: ["wardens mail", "wardens", "warden's mail", "warden's"] },
  { id: 1057, name: "Negatron Cloak", gold: 900, desc: "+50 Magic Resist", aliases: ["negatron"] },
  { id: 4628, name: "Horizon Focus", gold: 2900, desc: "Lightning strikes immobilized or distant champions", aliases: ["horizon focus", "horizon"] },
  { id: 1082, name: "Dark Seal", gold: 350, desc: "AP and Mana, increases in power as you kill enemies", aliases: ["dark-seal", "dark seal"] },
  { id: 3802, name: "Lost Chapter", gold: 1200, desc: "Restores Mana upon levelling up", aliases: ["lost chapter"] },
  { id: 3916, name: "Oblivion Orb", gold: 800, desc: "Increases magic damage, applies Grievous Wounds", aliases: ["oblivion orb"] },
  { id: 6653, name: "Liandry's Torment", gold: 3000, desc: "Burn damage over time, strong against durable enemies", aliases: ["liandrys", "liandry"] },
  { id: 4633, name: "Riftmaker", gold: 3100, desc: "Omnivamp, converts excess damage to true damage", aliases: ["riftmaker"] },
  { id: 6664, name: "Jak'Sho, The Protean", gold: 2800, desc: "Armor and MR that increase in extended combat", aliases: ["jak'sho", "jaksho"] },
  { id: 4629, name: "Cosmic Drive", gold: 3000, desc: "Massive Ability Haste and Move Speed", aliases: ["cosmic drive", "cosmic"] },
  { id: 3091, name: "Wit's End", gold: 2800, desc: "Attack Speed, MR, on-hit magic damage", aliases: ["wits end", "wit's end"] },
  { id: 8020, name: "Abyssal Mask", gold: 2650, desc: "MR, nearby enemies take more magic damage", aliases: ["abyssal mask", "abyssal"] },
  { id: 1083, name: "Cull", gold: 450, desc: "AD and Life Steal, killing minions grants bonus Gold", aliases: ["cull"] },
  { id: 3118, name: "Malignance", gold: 2700, desc: "AP and Ability Haste, ult creates a damage zone", aliases: ["malignance"] },
  { id: 6617, name: "Moonstone Renewer", gold: 2200, desc: "Heals and shields cool down faster for low health allies", aliases: ["moonstone"] },
  { id: 3078, name: "Trinity Force", gold: 3333, desc: "Tons of Damage", aliases: ["trinity force", "trinity"] },
  { id: 3115, name: "Nashor's Tooth", gold: 2900, desc: "Attack Speed, AP, and on-hit magic damage", aliases: ["nashors", "nashor"] },
  { id: 6664, name: "Hollow Radiance", gold: 2800, desc: "Shield on immobilize, activate to run faster at opponents", aliases: ["hollow radiance", "hollow"] },
  { id: 2502, name: "Unending Despair", gold: 2800, desc: "Drain nearby enemies for Health", aliases: ["unending despair", "unending"] },
  { id: 3158, name: "Ionian Boots of Lucidity", gold: 900, desc: "Move Speed and Ability Haste", aliases: ["ionian boots", "ionian"] },
  { id: 1031, name: "Chain Vest", gold: 800, desc: "+40 Armor", aliases: ["chain-vest", "chainvest", "chain vest"] },
];

const DDRAGON_ITEM = "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/item";

export function getItemImageUrl(id: number): string {
  return `${DDRAGON_ITEM}/${id}.png`;
}

export function extractItems(text: string): ItemInfo[] {
  const lower = text.toLowerCase();
  const matches: { item: ItemInfo; pos: number }[] = [];
  const seen = new Set<number>();

  const sorted = [...ITEMS].sort(
    (a, b) =>
      Math.max(...b.aliases.map((x) => x.length)) -
      Math.max(...a.aliases.map((x) => x.length)),
  );

  for (const item of sorted) {
    if (seen.has(item.id)) continue;
    for (const alias of item.aliases) {
      const idx = lower.indexOf(alias);
      if (idx !== -1) {
        const before = idx > 0 ? lower[idx - 1] : " ";
        const after =
          idx + alias.length < lower.length
            ? lower[idx + alias.length]
            : " ";
        const boundaryChars = /[\s,./();\-:!?'"]/;
        if (
          (idx === 0 || boundaryChars.test(before)) &&
          (idx + alias.length === lower.length || boundaryChars.test(after))
        ) {
          matches.push({ item, pos: idx });
          seen.add(item.id);
          break;
        }
      }
    }
  }
  return matches.sort((a, b) => a.pos - b.pos).map((m) => m.item);
}
