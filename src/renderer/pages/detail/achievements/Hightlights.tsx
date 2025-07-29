import { LOCALE_NAMESPACE } from "@common/constant";
import { unixToDate } from "@render/utils/util";
import { Award, Clock, Target, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AchievementHighlights = ({
  achievements,
  achievementLogos,
}: {
  achievements: any[];
  achievementLogos: string[];
}) => {
  const { t } = useTranslation();
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked && a.rarity);

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
    <div className="rounded-lg border border-design-border bg-design-foreground p-4 transition-colors hover:border-primary/50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <img
            src={achievementLogos.find((logo) => logo.includes(`achievement/${achievement.externalId}.`))}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AchievementCard
          achievement={rarest}
          title={t("achievements.highlights.rare.title", { ns: LOCALE_NAMESPACE.DETAIL })}
          subtitle={`Only ${rarest.rarity.toFixed(1)}% of players have this`}
          icon={<Award className="h-4 w-4 text-purple-500" />}
          iconColor="bg-purple-100 dark:bg-purple-900/30"
        />

        <AchievementCard
          achievement={mostCommon}
          title="Most Common"
          subtitle={`${mostCommon.rarity.toFixed(1)}% of players have this`}
          icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          iconColor="bg-yellow-100 dark:bg-yellow-900/30"
        />

        <AchievementCard
          achievement={firstAchievement}
          title="First Achievement"
          subtitle={`Unlocked on ${unixToDate(Number(firstAchievement.unlockedAt))}`}
          icon={<Target className="h-4 w-4 text-blue-500" />}
          iconColor="bg-blue-100 dark:bg-blue-900/30"
        />

        <AchievementCard
          achievement={latestAchievement}
          title="Latest Achievement"
          subtitle={`Unlocked on ${unixToDate(Number(latestAchievement.unlockedAt))}`}
          icon={<Clock className="h-4 w-4 text-green-500" />}
          iconColor="bg-green-100 dark:bg-green-900/30"
        />
      </div>

      <div className="flex flex-grow flex-row gap-4">
        <div className="grow rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-1 text-2xl font-bold text-design-text-normal">{maxStreak}</div>
          <div className="text-xs text-design-text-subtle">Max Daily Streak</div>
        </div>

        <div className="grow rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-1 text-2xl font-bold text-design-text-normal">
            {unlockedAchievements.filter((a) => a.rarity < 5).length}
          </div>
          <div className="text-xs text-design-text-subtle">Ultra Rare (&lt;5%)</div>
        </div>

        <div className="grow rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-1 text-2xl font-bold text-design-text-normal">
            {(unlockedAchievements.reduce((sum, a) => sum + (100 - a.rarity), 0) / unlockedAchievements.length).toFixed(
              0,
            )}
          </div>
          <div className="text-xs text-design-text-subtle">Avg. Rarity Score</div>
        </div>
      </div>
    </div>
  );
};
