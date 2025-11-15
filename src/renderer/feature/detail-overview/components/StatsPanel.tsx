import React from "react";
import { Calendar, Clock, TrendingUp, Trophy } from "lucide-react";
import { convertToHoursAndMinutes } from "@render//utils/util";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useTranslation } from "react-i18next";
import { StatsCard } from "./StatsCard";
import _ from "lodash";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useGameStats } from "../hooks/useGameStats";

export const StatsPanel = () => {
  const { t } = useTranslation();
  const { game, isLoading, rankings, lastPlayedDetail, last7DaysSessions, achievementProgress } = useGameStats();

  if (isLoading) {
    return <LoadingCenter />;
  }

  if (!game) return null;

  const { storefrontRank, libraryRank, libraryTotal } = rankings;
  const { unlockedCount, totalCount, percentage } = achievementProgress;

  return (
    <div className="flex h-full w-full items-center justify-between gap-4">
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
        detail={`${last7DaysSessions.length} sessions in the last 7 days`}
      />
      {game.storefront ? (
        <StatsCard
          icon={TrendingUp}
          label="Playtime Rank"
          value={`#${storefrontRank} in ${t(`storefront.${game.storefront.name}`, { ns: LOCALE_NAMESPACE.COMMON }) || "Store"}`}
          detail={`#${libraryRank} in entire library`}
          hide={libraryTotal <= 1 || (game.timePlayed || 0) === 0}
        />
      ) : (
        <StatsCard
          icon={TrendingUp}
          label="Playtime Rank"
          value={`#${libraryRank} in library`}
          detail={`Out of ${libraryTotal} games`}
          hide={libraryTotal <= 1 || (game.timePlayed || 0) === 0}
        />
      )}
    </div>
  );
};
