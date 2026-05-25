import matchupData from "../../../data/matchups.json";
import MatchupPage from "@/components/MatchupPage";
import type { Matchup } from "@/data/matchups";

export const metadata = { title: "Mid Matchups — Cho'Gath Feastament" };

export default function MidPage() {
  return <MatchupPage matchups={matchupData.mid as Matchup[]} lane="Mid" laneIcon="/images/mid-lane.webp" />;
}
