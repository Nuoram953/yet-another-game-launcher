import { useGames } from "@/context/DatabaseContext";
import React from "react";
import { StatsPanelCard } from "./StatsPanelCard";
import { Activity, Calendar, Clock, Trophy } from "lucide-react";
import { convertToHoursAndMinutes } from "@/utils/util";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export const StatsPanel = () => {
  const { selectedGame } = useGames();
  const { t } = useTranslation("GameStatus");

  console.log(selectedGame);

  const now = Date.now();
  const sevenDaysAgo = BigInt(now - 7 * 24 * 60 * 60 * 1000);

  const last7DaysSessions = selectedGame.activities.filter(
    (session) => session.startedAt >= sevenDaysAgo,
  );
    let detail;
  const lastSession = selectedGame.activities[selectedGame.activities.length - 1];

  if (lastSession) {
    const now = Date.now();
    const endedAt = Number(lastSession.endedAt); // Convert BigInt to Number for compatibility
    const diffInMs = now - endedAt;
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
      const lastPlayedDate = new Date(endedAt);
      detail = `Last played on ${lastPlayedDate.toLocaleDateString()}`;
    }

    console.log(detail);
  } else {
    console.log("No sessions found");
  }

  return (
    <div className="bg-gray-850 border-b border-gray-700">
      <div className=" mx-auto py-4">
        <div className="flex flex-row justify-around gap-4 w-full">
          <StatsPanelCard
            icon={Clock}
            label="Time Played"
            value={`${convertToHoursAndMinutes(selectedGame?.timePlayed)}`}
            detail={detail}
          />
          <StatsPanelCard
            icon={Trophy}
            label="Achievements"
            value={`3/15`}
            detail={`33% Complete`}
            hide={selectedGame.achievements.length === 0}
          />
          <StatsPanelCard
            icon={Calendar}
            label="Activity"
            value={`${selectedGame.activities.length} Sessions`}
            detail={`${last7DaysSessions.length} sessions in the last 7 days`}
          />
          <StatsPanelCard
            icon={Activity}
            label="Status"
            value={t(selectedGame.gameStatus.name)}
            detail=""
            hide={true}
          />
        </div>
      </div>
    </div>
  );
};
