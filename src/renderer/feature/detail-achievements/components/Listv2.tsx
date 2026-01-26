import useGameStore from "@render/feature/detail/store/GameStore";
import { Award, Lock, Target, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getGameAchievements } from "../api/DetailAchievementsApi";
import { Tooltip } from "@render/components/new/tooltip";
import { unixToDate } from "@render/utils/util";
import { useParams } from "react-router-dom";
import { useGame } from "@render/api/get-game";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useGameFromParams } from "@render/hooks/useGameParam";
import { useMedia } from "@render/api/get-media-by-type";
import { MEDIA_TYPE } from "@common/constant";

export const Listv2 = () => {
  const { game, id } = useGameFromParams();

  const mediaQuery = useMedia({ data: { gameId: id, type: MEDIA_TYPE.ACHIEVEMENT } });

  if (mediaQuery.isPending) {
    return <LoadingCenter />;
  }

  const achivements = mediaQuery.data ?? [];

  const unlockedAchievements = game?.achievements?.filter((a) => a.isUnlocked) ?? [];

  const mostCommon =
    unlockedAchievements.length > 0
      ? unlockedAchievements.reduce((prev, current) => (current.rarity > prev.rarity ? current : prev))
      : null;

  const rarest =
    unlockedAchievements.length > 0
      ? unlockedAchievements.reduce((prev, current) => (current.rarity < prev.rarity ? current : prev))
      : null;

  const firstAchievement =
    unlockedAchievements.length > 0
      ? unlockedAchievements.reduce((prev, current) => {
          const prevTime = prev.unlockedAt ? Number(prev.unlockedAt) : Infinity;
          const currentTime = current.unlockedAt ? Number(current.unlockedAt) : Infinity;
          return currentTime < prevTime ? current : prev;
        })
      : null;

  const latestAchievement =
    unlockedAchievements.length > 0
      ? unlockedAchievements.reduce((prev, current) => {
          const prevTime = prev.unlockedAt ? Number(prev.unlockedAt) : 0;
          const currentTime = current.unlockedAt ? Number(current.unlockedAt) : 0;
          return currentTime > prevTime ? current : prev;
        })
      : null;
  return (
    <div className="mx-auto flex flex-wrap justify-center gap-4">
      {game.achievements.map((achievement) => (
        <Tooltip>
          <Tooltip.Trigger>
            {achievement.isUnlocked ? (
              <div className="relative inline-block">
                <img
                  src={achivements?.find((logo) => logo.includes(`achievement/${achievement.externalId}.`))}
                  alt={achievement.name}
                  className="h-24 w-24 rounded-md object-contain hover:border hover:border-white"
                />

                <div className="absolute right-0 top-0 m-1">
                  <div className="flex flex-col gap-2">
                    {firstAchievement.id === achievement.id && (
                      <Target className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    )}
                    {latestAchievement.id === achievement.id && (
                      <Trophy className="h-4 w-4 flex-shrink-0 text-green-500" />
                    )}

                    {mostCommon.id === achievement.id && <Trophy className="h-4 w-4 flex-shrink-0 text-yellow-500" />}

                    {rarest.id === achievement.id && <Award className="h-4 w-4 flex-shrink-0 text-purple-500" />}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-design-foreground flex h-24 w-24 items-center justify-center rounded-md hover:border hover:border-white">
                <Lock className="text-design-text-subtle h-6 w-6" />
              </div>
            )}
          </Tooltip.Trigger>
          <Tooltip.Content className="border-design-border border">
            <div className="flex flex-col gap-2">
              <span>{achievement.name}</span>
              {achievement.isUnlocked && (
                <span className="text-design-text-subtle">
                  Unlocked on {unixToDate(Number(achievement.unlockedAt))}
                </span>
              )}
              {firstAchievement && firstAchievement.id === achievement.id && (
                <div className="flex w-fit items-center gap-2 rounded border border-blue-500 p-1 text-blue-500">
                  <Target className="h-4 w-4 flex-shrink-0 text-blue-500" />
                  First achievement
                </div>
              )}

              {latestAchievement && latestAchievement.id === achievement.id && (
                <div className="flex w-fit items-center gap-2 rounded border border-green-500 p-1 text-green-500">
                  <Trophy className="h-4 w-4 flex-shrink-0 text-green-500" />
                  Most recent
                </div>
              )}

              {mostCommon && mostCommon.id === achievement.id && (
                <div className="flex w-fit items-center gap-2 rounded border border-yellow-500 p-1 text-yellow-500">
                  <Trophy className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                  Most common
                </div>
              )}

              {rarest && rarest.id === achievement.id && (
                <div className="flex w-fit items-center gap-2 rounded border border-purple-500 p-1 text-purple-500">
                  <Award className="h-4 w-4 flex-shrink-0 text-purple-500" />
                  Rarest achievement
                </div>
              )}

              {achievement.description && <span className="mt-4">{achievement.description}</span>}
            </div>
          </Tooltip.Content>
        </Tooltip>
      ))}
    </div>
  );
};
