import { useGames } from "@render//context/DatabaseContext";
import React from "react";
import { Calendar, Clock, TrendingUp, Trophy } from "lucide-react";
import { convertToHoursAndMinutes } from "@render//utils/util";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useTranslation } from "react-i18next";
import { StatsCard } from "@render/components/card/StatsCard";
import useGameStore from "../store/GameStore";

export const StatsPanel = () => {
  // Use a selector to get both game and loading state if available
  const game = useGameStore((state) => state.game);

  const { games } = useGames();
  const { t } = useTranslation();

  // Early return if game is not loaded yet
  if (!game) {
    return (
      <div className="flex justify-around gap-4">
        {/* Loading skeleton or placeholder */}
        <div className="h-20 animate-pulse rounded bg-gray-200"></div>
        <div className="h-20 animate-pulse rounded bg-gray-200"></div>
        <div className="h-20 animate-pulse rounded bg-gray-200"></div>
        <div className="h-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  console.log(game, games);

  const calculateRankings = () => {
    if (!games || games.length === 0 || !game) {
      return { storefrontRank: 0, libraryRank: 0, storefrontTotal: 0, libraryTotal: 0 };
    }

    const allGamesSorted = [...games].sort((a, b) => (b.timePlayed || 0) - (a.timePlayed || 0));
    const currentStorefront = game.storefrontId;
    const storefrontGames = games.filter((g) => g.storefrontId === currentStorefront);
    const storefrontGamesSorted = [...storefrontGames].sort((a, b) => (b.timePlayed || 0) - (a.timePlayed || 0));

    // Fixed the bug: was using game.id === game.id (always true)
    const libraryRank = allGamesSorted.findIndex((g) => g.id === game.id) + 1;
    const storefrontRank = storefrontGamesSorted.findIndex((g) => g.id === game.id) + 1;

    return {
      storefrontRank,
      libraryRank,
      storefrontTotal: storefrontGames.length,
      libraryTotal: games.length,
    };
  };

  const calculateLastPlayedDetail = () => {
    if (!game.activities || game.activities.length === 0) {
      return "Not played recently";
    }

    const now = Date.now();
    const lastSession = game.activities[game.activities.length - 1];

    if (!lastSession || !lastSession.endedAt) {
      return "Not played recently";
    }

    const endedAt = typeof lastSession.endedAt === "bigint" ? Number(lastSession.endedAt) : lastSession.endedAt;
    const diffInMs = now - endedAt;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours > 0) {
        return `Last played ${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      } else if (diffInMinutes > 0) {
        return `Last played ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
      } else {
        return "Last played just now";
      }
    } else {
      const lastPlayedDate = new Date(endedAt);
      return `Last played on ${lastPlayedDate.toLocaleDateString()}`;
    }
  };

  const calculateLast7DaysSessions = () => {
    if (!game.activities || game.activities.length === 0) return [];

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return game.activities.filter((session) => {
      const startedAt = typeof session.startedAt === "bigint" ? Number(session.startedAt) : session.startedAt;
      return startedAt >= sevenDaysAgo;
    });
  };

  const calculateAchievementProgress = () => {
    if (!game.achievements || game.achievements.length === 0) {
      return { unlockedCount: 0, totalCount: 0, percentage: 0 };
    }

    const unlockedCount = game.achievements.filter((achievement) => achievement.isUnlocked).length;
    const totalCount = game.achievements.length;
    const percentage = totalCount > 0 ? ((unlockedCount / totalCount) * 100).toFixed(0) : 0;

    return { unlockedCount, totalCount, percentage };
  };

  // Calculate all values
  const { storefrontRank, libraryRank, libraryTotal } = calculateRankings();
  const lastPlayedDetail = calculateLastPlayedDetail();
  const last7DaysSessions = calculateLast7DaysSessions();
  const { unlockedCount, totalCount, percentage } = calculateAchievementProgress();

  return (
    <div className="flex h-full items-center justify-around gap-4 px-4">
      <StatsCard
        icon={Clock}
        label="Time Played"
        value={`${convertToHoursAndMinutes(game?.timePlayed || 0)}`}
        detail={lastPlayedDetail}
      />

      <StatsCard
        icon={Trophy}
        label="Achievements"
        value={`${unlockedCount}/${totalCount}`}
        detail={`${percentage}% Complete`}
        hide={totalCount === 0}
      />

      <StatsCard
        icon={Calendar}
        label="Activity"
        value={`${game.activities?.length || 0} Sessions`}
        detail={`${last7DaysSessions.length} in the last 7 days`}
      />

      <StatsCard
        icon={TrendingUp}
        label="Playtime Rank"
        value={`#${storefrontRank} in ${t(`storefront.${game.storefront?.name}`, { ns: LOCALE_NAMESPACE.COMMON }) || "Store"}`}
        detail={`#${libraryRank} in entire library`}
        hide={libraryTotal <= 1 || (game.timePlayed || 0) === 0}
      />
    </div>
  );
};
