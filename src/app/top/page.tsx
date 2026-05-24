import { topMatchups } from "@/data/matchups";
import MatchupPage from "@/components/MatchupPage";

export const metadata = { title: "Top Matchups — Cho'Gath Feastament" };

export default function TopPage() {
  return <MatchupPage matchups={topMatchups} lane="Top" laneIcon="/images/top-lane.png" />;
}
