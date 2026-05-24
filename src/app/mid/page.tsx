import { midMatchups } from "@/data/matchups";
import MatchupPage from "@/components/MatchupPage";

export const metadata = { title: "Mid Matchups — Cho'Gath Feastament" };

export default function MidPage() {
  return <MatchupPage matchups={midMatchups} lane="Mid" laneIcon="/images/mid-lane.webp" />;
}
