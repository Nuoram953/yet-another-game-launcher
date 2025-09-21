import useGameStore from "@render/feature/detail/store/GameStore";
import { useMemo } from "react";

export const useSessionStats = () => {
  const sessions = useGameStore((state) => state.game.activities) || [];
  const game = useGameStore((state) => state.game);

  const totalPlaytimeHours = useMemo(() => {
    if (!game) return 0;
    return (game.timePlayedWindows + game.timePlayedLinux + game.timePlayedMac + game.timePlayedSteamdeck) / 60;
  }, [game]);

  const totalSessions = useMemo(() => sessions.length, [sessions]);

  const averageSessionDuration = useMemo(() => {
    if (sessions.length === 0) return 0;
    const totalDuration = sessions.reduce((sum, session) => {
      const start = Number(session.startedAt);
      const end = Number(session.endedAt);
      return sum + (end - start) / (1000 * 60); // minutes
    }, 0);
    return totalDuration / sessions.length;
  }, [sessions]);

  const longestSessionDuration = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.max(
      ...sessions.map((session) => {
        const start = Number(session.startedAt);
        const end = Number(session.endedAt);
        return (end - start) / (1000 * 60); // minutes
      }),
    );
  }, [sessions]);

  const mostPlayedDay = useMemo(() => {
    if (sessions.length === 0) return null;
    const dayCounts: Record<string, number> = {};
    sessions.forEach((session) => {
      const day = new Date(Number(session.startedAt)).toISOString().split("T")[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostPlayed = Object.entries(dayCounts).reduce((max, entry) => (entry[1] > max[1] ? entry : max), ["", 0]);
    return mostPlayed[0];
  }, [sessions]);

  return {
    totalPlaytimeHours,
    totalSessions,
    averageSessionDuration,
    longestSessionDuration,
    mostPlayedDay,
  };
};
