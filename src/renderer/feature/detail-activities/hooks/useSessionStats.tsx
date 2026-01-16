import { useGameFromParams } from "@render/hooks/useGameParam";
import { useMemo } from "react";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function useGameActivityStats() {
  const { game, isLoading } = useGameFromParams();

  if (isLoading) {
    return {
      isLoading,

      totalPlaytime: "0h",
      totalPlaytimeTrend: undefined,
      isTotalPlaytimePositive: true,

      averageSessionLength: "0m",
      averageSessionLengthTrend: undefined,
      isAverageSessionLengthPositive: true,

      sessionsPlayed: "0 sessions",
      sessionsPlayedTrend: undefined,
      isSessionsPlayedPositive: true,

      longestSession: "0m",
      longestSessionTrend: undefined,
      isLongestSessionPositive: true,

      preferredPlaytime: "—",

      consistencyStreak: "0-day streak",
      consistencyStreakTrend: undefined,
      isConsistencyStreakPositive: true,
    };
  }

  const activities = game!.activities;

  return useMemo(() => {
    if (!activities.length) {
      return {
        totalPlaytime: "0h",
        totalPlaytimeTrend: undefined,
        isTotalPlaytimePositive: true,

        averageSessionLength: "0m",
        averageSessionLengthTrend: undefined,
        isAverageSessionLengthPositive: true,

        sessionsPlayed: "0 sessions",
        sessionsPlayedTrend: undefined,
        isSessionsPlayedPositive: true,

        longestSession: "0m",
        longestSessionTrend: undefined,
        isLongestSessionPositive: true,

        preferredPlaytime: "—",

        consistencyStreak: "0-day streak",
        consistencyStreakTrend: undefined,
        isConsistencyStreakPositive: true,
      };
    }

    const normalized = activities.map((a) => ({
      ...a,
      startedAtMs: Number(a.startedAt),
      endedAtMs: Number(a.endedAt),
    }));

    const safeDuration = (d: number) => (Number.isFinite(d) && d > 0 ? d : 0);

    const formatHours = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m === 0 ? `${h}h` : `${h}h ${m}m`;
    };

    const formatShort = (minutes: number) => {
      const rounded = Math.round(minutes / 5) * 5;
      const h = Math.floor(rounded / 60);
      const m = rounded % 60;
      return m === 0 ? `${h}h` : `${h}h ${m}m`;
    };

    const now = Date.now();
    const startCurrent = now - 14 * MS_IN_DAY;
    const startPrevious = now - 28 * MS_IN_DAY;
    const endPrevious = startCurrent;

    const current = normalized.filter((a) => a.startedAtMs >= startCurrent);
    const previous = normalized.filter((a) => a.startedAtMs >= startPrevious && a.startedAtMs < endPrevious);

    const totalMinutes = normalized.reduce((s, a) => s + safeDuration(a.duration), 0);
    const currentTotal = current.reduce((s, a) => s + safeDuration(a.duration), 0);
    const previousTotal = previous.reduce((s, a) => s + safeDuration(a.duration), 0);

    console.log(currentTotal, previousTotal);
    const totalTrend = currentTotal - previousTotal;
    console.log(totalTrend);

    const sessionsPlayed = normalized.length;
    const sessionsTrend = current.length - previous.length;

    const avgMinutes = Math.round(totalMinutes / sessionsPlayed);
    const avgCurrent = current.length
      ? Math.round(current.reduce((s, a) => s + safeDuration(a.duration), 0) / current.length)
      : 0;
    const avgPrevious = previous.length
      ? Math.round(previous.reduce((s, a) => s + safeDuration(a.duration), 0) / previous.length)
      : 0;

    console.log(avgCurrent, avgPrevious);
    const avgTrend = avgCurrent - avgPrevious;

    const longestMinutes = Math.max(...normalized.map((a) => safeDuration(a.duration)));
    const longestCurrent = current.length ? Math.max(...current.map((a) => safeDuration(a.duration))) : 0;
    const longestPrevious = previous.length ? Math.max(...previous.map((a) => safeDuration(a.duration))) : 0;
    const longestTrend = longestCurrent - longestPrevious;

    const buckets: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    normalized.forEach((a) => {
      const hour = new Date(a.startedAtMs).getHours();
      if (hour >= 6 && hour < 12) buckets.Morning++;
      else if (hour >= 12 && hour < 18) buckets.Afternoon++;
      else if (hour >= 18 && hour < 23) buckets.Evening++;
      else buckets.Night++;
    });
    const preferredPlaytime = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0];

    const activeDays = new Set(normalized.map((a) => Math.floor(a.startedAtMs / MS_IN_DAY)));
    let streak = 0;
    let day = Math.floor(Date.now() / MS_IN_DAY);
    while (activeDays.has(day)) {
      streak++;
      day--;
    }

    const previousActiveDays = new Set(previous.map((a) => Math.floor(a.startedAtMs / MS_IN_DAY)));
    let previousStreak = 0;
    let prevDay = Math.floor(startCurrent / MS_IN_DAY) - 1;
    while (previousActiveDays.has(prevDay)) {
      previousStreak++;
      prevDay--;
    }
    const streakTrend = streak - previousStreak;

    console.log(avgTrend);

    return {
      totalPlaytime: formatHours(totalMinutes),
      totalPlaytimeTrend: previousTotal === 0 ? undefined : formatShort(Math.abs(totalTrend)),
      isTotalPlaytimePositive: totalTrend >= 0,

      averageSessionLength: formatShort(avgMinutes),
      averageSessionLengthTrend: avgPrevious === 0 ? undefined : formatShort(Math.abs(avgTrend)),
      isAverageSessionLengthPositive: avgTrend >= 0,

      sessionsPlayed: `${sessionsPlayed} sessions`,
      sessionsPlayedTrend: previous.length === 0 ? undefined : Math.abs(sessionsTrend),
      isSessionsPlayedPositive: sessionsTrend >= 0,

      longestSession: formatHours(longestMinutes),
      longestSessionTrend: longestPrevious === 0 ? undefined : formatShort(Math.abs(longestTrend)),
      isLongestSessionPositive: longestTrend >= 0,

      preferredPlaytime: preferredPlaytime === "Evening" ? "Evening (7pm–11pm)" : preferredPlaytime,

      consistencyStreak: `${streak}-day streak`,
      consistencyStreakTrend: previousStreak === 0 ? undefined : Math.abs(streakTrend),
      isConsistencyStreakPositive: streakTrend >= 0,
    };
  }, [activities]);
}
