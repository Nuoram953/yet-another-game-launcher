import { useMemo } from "react";
import { useGames } from "@render/api/get-games";
import { useGameFromParams } from "@render/hooks/useGameParam";

export const useGameStats = () => {
  const { game, isLoading: isGameLoading } = useGameFromParams();
  const gamesQuery = useGames({});

  const isLoading = isGameLoading || gamesQuery.isPending;
  const games = gamesQuery.data ?? [];

  const rankings = useMemo(() => {
    if (!game || games.length === 0) {
      return {
        storefrontRank: 0,
        libraryRank: 0,
        storefrontTotal: 0,
        libraryTotal: 0,
      };
    }

    const allGamesSorted = [...games].sort((a, b) => (b.timePlayed || 0) - (a.timePlayed || 0));

    const storefrontGames = games.filter((g) => g.storefrontId === game.storefrontId);

    const storefrontGamesSorted = [...storefrontGames].sort((a, b) => (b.timePlayed || 0) - (a.timePlayed || 0));

    return {
      libraryRank: allGamesSorted.findIndex((g) => g.id === game.id) + 1,
      storefrontRank: storefrontGamesSorted.findIndex((g) => g.id === game.id) + 1,
      libraryTotal: games.length,
      storefrontTotal: storefrontGames.length,
    };
  }, [games, game]);

  const lastPlayedDetail = useMemo(() => {
    if (!game?.activities?.length) {
      return "Not played recently";
    }

    const lastSession = game.activities[game.activities.length - 1];
    if (!lastSession?.endedAt) {
      return "Not played recently";
    }

    const endedAt = typeof lastSession.endedAt === "bigint" ? Number(lastSession.endedAt) : lastSession.endedAt;

    const now = Date.now();
    const diffMs = now - endedAt;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      if (diffHours > 0) {
        return `Last played ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      }
      if (diffMinutes > 0) {
        return `Last played ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      }
      return "Last played just now";
    }

    return `Last played on ${new Date(endedAt).toLocaleDateString()}`;
  }, [game]);

  const last7DaysSessions = useMemo(() => {
    if (!game?.activities?.length) return [];

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return game.activities.filter((session) => {
      const startedAt = typeof session.startedAt === "bigint" ? Number(session.startedAt) : session.startedAt;

      return startedAt >= sevenDaysAgo;
    });
  }, [game]);

  const achievementProgress = useMemo(() => {
    if (!game?.achievements?.length) {
      return { unlockedCount: 0, totalCount: 0, percentage: 0 };
    }

    const unlockedCount = game.achievements.filter((a) => a.isUnlocked).length;

    const totalCount = game.achievements.length;

    return {
      unlockedCount,
      totalCount,
      percentage: Math.round((unlockedCount / totalCount) * 100),
    };
  }, [game]);

  return {
    game,
    isLoading,
    rankings,
    lastPlayedDetail,
    last7DaysSessions,
    achievementProgress,
  };
};
