import { useGames } from "@/context/DatabaseContext";
import React from "react";
import { StatsCard } from "../StatsCard";
import { Activity, Calendar, Clock, Trophy } from "lucide-react";
import { convertToHoursAndMinutes } from "@/utils/util";
import { useTranslation } from "react-i18next";

export const StatsPanel = () => {
  const { selectedGame } = useGames();
  if (!selectedGame) {
    return;
  }
  const { t } = useTranslation("GameStatus");

  const now = Date.now();
  const sevenDaysAgo = BigInt(now - 7 * 24 * 60 * 60 * 1000);

  const last7DaysSessions = selectedGame.activities.filter(
    (session) => session.startedAt >= sevenDaysAgo,
  );
  let detail = "Not played recently";
  const lastSession =
    selectedGame.activities[selectedGame.activities.length - 1];

  if (lastSession) {
    const now = Date.now();
    const endedAt = Number(lastSession.endedAt); // Convert BigInt to Number for compatibility
    const diffInMs = now - endedAt * 1000;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      // Format as "Last played X hours ago"
      detail =
        diffInHours > 0
          ? `Last played ${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
          : `Last played ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else {
      // Format as "Last played on dd/mm/yyyy"
      const lastPlayedDate = new Date(Number(endedAt) * 1000);
      detail = `Last played on ${lastPlayedDate.toLocaleDateString()}`;
    }
  }

  const formatTimespan = (start: bigint, end: bigint): string => {
    const now = BigInt(Date.now()) / BigInt(1000); // Current time in seconds
    const endTimeSeconds = end;
    const startTimeSeconds = start;

    // Calculate time difference in hours
    const hoursSinceEnd =
      Number(((now - endTimeSeconds) * BigInt(100)) / BigInt(60) / BigInt(60)) /
      100;

    if (hoursSinceEnd < 24) {
      // If less than 24 hours ago, calculate the duration of the activity
      const durationHours = Math.round(
        Number(
          ((endTimeSeconds - startTimeSeconds) * BigInt(100)) /
            BigInt(60) /
            BigInt(60),
        ) / 100,
      );

      console.log(hoursSinceEnd);

      // Make sure we have a positive duration
      const positiveDuration = Math.max(0, durationHours);
      return `Last played ${positiveDuration} hour${positiveDuration !== 1 ? "s" : ""}`;
    } else {
      // For dates more than 24 hours ago, create Date objects and format
      const endTime = new Date(Number(end) * 1000);
      const day = endTime.getDate().toString().padStart(2, "0");
      const month = (endTime.getMonth() + 1).toString().padStart(2, "0");
      const year = endTime.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  return (
    <div className="flex w-full flex-row justify-around gap-4">
      <StatsCard
        icon={Clock}
        label="Time Played"
        value={`${convertToHoursAndMinutes(selectedGame?.timePlayed)}`}
        // detail={formatTimespan(lastSession.startedAt, lastSession.endedAt)}
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
        icon={Activity}
        label="Status"
        value={t(selectedGame.gameStatus.name)}
        detail=""
        hide={true}
      />
    </div>
  );
};
