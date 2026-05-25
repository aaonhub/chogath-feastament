import matchupData from "../../../data/matchups.json";
import MatchupPage from "@/components/MatchupPage";
import type { Matchup } from "@/data/matchups";

export const metadata = { title: "Top Matchups — Cho'Gath Feastament" };

export default function TopPage() {
  return <MatchupPage matchups={matchupData.top as Matchup[]} lane="Top" laneIcon="/images/top-lane.png" />;
}
