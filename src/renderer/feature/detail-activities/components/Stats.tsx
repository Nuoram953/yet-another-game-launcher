import { TrendingCard } from "@render/components/new/card/TrendingCard";
import { Info } from "lucide-react";
import { useGameActivityStats } from "../hooks/useSessionStats";

export const Stats = () => {
  const {
    totalPlaytime,
    totalPlaytimeTrend,
    isTotalPlaytimePositive,
    averageSessionLength,
    averageSessionLengthTrend,
    isAverageSessionLengthPositive,
    sessionsPlayed,
    sessionsPlayedTrend,
    isSessionsPlayedPositive,
    longestSession,
    longestSessionTrend,
    isLongestSessionPositive,
    preferredPlaytime,
    consistencyStreak,
    consistencyStreakTrend,
    isConsistencyStreakPositive,
  } = useGameActivityStats();

  return (
    <>
      <div className="flex gap-4">
        <div className="grid grid-cols-2 sm:w-full lg:grid-cols-3">
          <TrendingCard
            label={"Total Session Playtime "}
            value={totalPlaytime}
            isPositive={isTotalPlaytimePositive}
            trendValue={totalPlaytimeTrend}
          />
          <TrendingCard
            label={"Average Session Length"}
            value={averageSessionLength}
            isPositive={isAverageSessionLengthPositive}
            trendValue={averageSessionLengthTrend}
          />
          <TrendingCard
            label={"Sessions played"}
            value={sessionsPlayed}
            isPositive={isSessionsPlayedPositive}
            trendValue={sessionsPlayedTrend}
          />
          <TrendingCard
            label={"Longuest Session"}
            value={longestSession}
            isPositive={isLongestSessionPositive}
            trendValue={longestSessionTrend}
          />
          <TrendingCard label={"Preferred Playtime"} value={preferredPlaytime} />
          <TrendingCard
            label={"Consistency Streak"}
            isPositive={isConsistencyStreakPositive}
            value={consistencyStreak}
            trendValue={consistencyStreakTrend}
          />
        </div>
      </div>
    </>
  );
};
