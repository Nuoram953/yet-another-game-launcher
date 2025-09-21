import { LOCALE_NAMESPACE } from "@common/constant";
import { Card } from "@render/components/card/Card";
import useGameStore from "@render/feature/detail/store/GameStore";
import { unixToDate } from "@render/utils/util";
import { useQuery } from "@tanstack/react-query";
import { Award, Clock, Target, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getGameAchievements } from "../api/DetailAchievementsApi";

export const Highlight = () => {
  const { t } = useTranslation();
  const { game } = useGameStore();

  if (!game?.achievements) return null;

  const { data, isPending } = useQuery({
    queryKey: ["game", game?.id, "achievements"],
    queryFn: () => getGameAchievements(game!.id),
  });

  if (isPending) {
    return null;
  }

  const unlockedAchievements = game?.achievements?.filter((a) => a.isUnlocked);

  const mostCommon = unlockedAchievements.reduce((prev, current) => (current.rarity > prev.rarity ? current : prev));
  const rarest = unlockedAchievements.reduce((prev, current) => (current.rarity < prev.rarity ? current : prev));
  const firstAchievement = unlockedAchievements.reduce((prev, current) => {
    const prevTime = prev.unlockedAt ? Number(prev.unlockedAt) : Infinity;
    const currentTime = current.unlockedAt ? Number(current.unlockedAt) : Infinity;
    return currentTime < prevTime ? current : prev;
  });
  const latestAchievement = unlockedAchievements.reduce((prev, current) => {
    const prevTime = prev.unlockedAt ? Number(prev.unlockedAt) : 0;
    const currentTime = current.unlockedAt ? Number(current.unlockedAt) : 0;
    return currentTime > prevTime ? current : prev;
  });

  const sortedByTime = unlockedAchievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => Number(a.unlockedAt) - Number(b.unlockedAt));

  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedByTime.length; i++) {
    const timeDiff = Number(sortedByTime[i].unlockedAt) - Number(sortedByTime[i - 1].unlockedAt);
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff <= 24) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }
  maxStreak = Math.max(maxStreak, currentStreak);

  const AchievementCard = ({ achievement, title, subtitle, icon, iconColor }: any) => (
    <div className="rounded-lg border border-design-border p-4 transition-colors hover:border-primary/50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <img
            src={data.find((item) => item.includes(achievement.externalId))}
            alt={achievement.name}
            className="h-12 w-12 rounded-md object-contain"
          />
        </div>
        <div className="min-w-0 flex-grow">
          <div className="mb-1 flex items-center gap-2">
            <div className={`rounded-full p-1 ${iconColor}`}>{icon}</div>
            <span className="text-xs font-medium uppercase tracking-wide text-design-text-subtle">{title}</span>
          </div>
          <h4 className="truncate font-semibold text-design-text-normal">{achievement.name}</h4>
          <p className="text-sm text-design-text-subtle">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Card title="Highlights">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AchievementCard
            achievement={rarest}
            title={t("achievements.highlights.rare.title", { ns: LOCALE_NAMESPACE.DETAIL })}
            subtitle={t("achievements.highlights.rare.subTitle", {
              ns: LOCALE_NAMESPACE.DETAIL,
              percentage: 100,
            })}
            icon={<Award className="h-4 w-4 text-purple-500" />}
            iconColor="bg-purple-100 dark:bg-purple-900/30"
          />

          <AchievementCard
            achievement={mostCommon}
            title={t("achievements.highlights.common.title", { ns: LOCALE_NAMESPACE.DETAIL })}
            subtitle={t("achievements.highlights.common.subTitle", {
              ns: LOCALE_NAMESPACE.DETAIL,
              percentage: 100,
            })}
            icon={<Trophy className="h-4 w-4 text-yellow-500" />}
            iconColor="bg-yellow-100 dark:bg-yellow-900/30"
          />

          <AchievementCard
            achievement={firstAchievement}
            title={t("achievements.highlights.first.title", { ns: LOCALE_NAMESPACE.DETAIL })}
            subtitle={t("achievements.highlights.first.subTitle", {
              ns: LOCALE_NAMESPACE.DETAIL,
              date: unixToDate(Number(firstAchievement.unlockedAt)),
            })}
            icon={<Target className="h-4 w-4 text-blue-500" />}
            iconColor="bg-blue-100 dark:bg-blue-900/30"
          />

          <AchievementCard
            achievement={latestAchievement}
            title={t("achievements.highlights.last.title", { ns: LOCALE_NAMESPACE.DETAIL })}
            subtitle={t("achievements.highlights.last.subTitle", {
              ns: LOCALE_NAMESPACE.DETAIL,
              date: unixToDate(Number(latestAchievement.unlockedAt)),
            })}
            icon={<Clock className="h-4 w-4 text-green-500" />}
            iconColor="bg-green-100 dark:bg-green-900/30"
          />
        </div>
      </div>
    </Card>
  );
};
