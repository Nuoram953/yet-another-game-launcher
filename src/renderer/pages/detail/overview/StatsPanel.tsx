import { useGames } from "@render//context/DatabaseContext";
import React from "react";
import { StatsCard } from "../StatsCard";
import { Calendar, Clock, TrendingUp, Trophy } from "lucide-react";
import { convertToHoursAndMinutes } from "@render//utils/util";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useTranslation } from "react-i18next";

export const StatsPanel = () => {
  const { selectedGame, games } = useGames();
  const { t } = useTranslation();
  if (!selectedGame) {
    return;
  }

  const calculateRankings = () => {
    if (!games || games.length === 0) return { storefrontRank: 0, libraryRank: 0, storefrontTotal: 0, libraryTotal: 0 };

    // Get all games sorted by playtime (descending)
    const allGamesSorted = [...games].sort((a, b) => (b.timePlayed || 0) - (a.timePlayed || 0));

    // Get games from the same storefront
    const currentStorefront = selectedGame.storefrontId; // Assuming storefront property exists
    const storefrontGames = games.filter((game) => game.storefrontId === currentStorefront);
    const storefrontGamesSorted = [...storefrontGames].sort((a, b) => (b.timePlayed || 0) - (a.timePlayed || 0));

    // Find positions (1-indexed)
    const libraryRank = allGamesSorted.findIndex((game) => game.id === selectedGame.id) + 1;
    const storefrontRank = storefrontGamesSorted.findIndex((game) => game.id === selectedGame.id) + 1;

    return {
      storefrontRank,
      libraryRank,
      storefrontTotal: storefrontGames.length,
      libraryTotal: games.length,
    };
  };

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const last7DaysSessions = selectedGame.activities.filter((session) => {
    const startedAt = typeof session.startedAt === "bigint" ? Number(session.startedAt) : session.startedAt;
    return startedAt >= sevenDaysAgo;
  });

  let detail = "Not played recently";
  const lastSession = selectedGame.activities[selectedGame.activities.length - 1];

  if (lastSession) {
    const endedAt = typeof lastSession.endedAt === "bigint" ? Number(lastSession.endedAt) : lastSession.endedAt;

    const diffInMs = now - endedAt;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours > 0) {
        detail = `Last played ${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      } else if (diffInMinutes > 0) {
        detail = `Last played ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
      } else {
        detail = "Last played just now";
      }
    } else {
      const lastPlayedDate = new Date(endedAt);
      detail = `Last played on ${lastPlayedDate.toLocaleDateString()}`;
    }
  }

  const { storefrontRank, libraryRank, libraryTotal } = calculateRankings();

  return (
    <div className="flex w-full flex-row justify-around gap-4">
      <StatsCard
        icon={Clock}
        label="Time Played"
        value={`${convertToHoursAndMinutes(selectedGame?.timePlayed)}`}
        detail={detail}
      />
      <StatsCard
        icon={Trophy}
        label="Achievements"
        value={`${selectedGame.achievements.filter((achievement) => achievement.isUnlocked).length}/${selectedGame.achievements.length}`}
        detail={`${((selectedGame.achievements.filter((achievement) => achievement.isUnlocked).length / selectedGame.achievements.length) * 100).toFixed(0)}% Complete`}
        hide={selectedGame.achievements.length === 0}
      />
      <StatsCard
        icon={Calendar}
        label="Activity"
        value={`${selectedGame.activities.length} Sessions`}
        detail={`${last7DaysSessions.length} sessions in the last 7 days`}
      />
      <StatsCard
        icon={TrendingUp}
        label="Playtime Rank"
        value={`#${storefrontRank} in ${t(`storefront.${selectedGame.storefront.name}`, { ns: LOCALE_NAMESPACE.COMMON }) || "Store"}`}
        detail={`#${libraryRank} in entire library`}
        hide={libraryTotal <= 1}
      />
    </div>
  );
};
