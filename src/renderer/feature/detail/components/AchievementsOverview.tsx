import { LOCALE_NAMESPACE } from "@common/constant";
import { Progress } from "@render/components/ui/progress";
import { Lock, Award, EyeOff, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OverviewProps {
  achievementStats: {
    completionPercentage: number;
    unlocked: number;
    total: number;
    rare: number;
    hidden: number;
  };
}

export const AchievementOverview = ({ achievementStats }: OverviewProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t("achievements.overview.title", { ns: LOCALE_NAMESPACE.DETAIL })}
          </h3>
          <span className="text-2xl font-bold text-primary">{achievementStats.completionPercentage.toFixed(0)}%</span>
        </div>
        <Progress value={achievementStats.completionPercentage} className="h-3" />
        <div className="text-sm text-design-text-subtle">
          {t("achievements.overview.unlocked", {
            ns: LOCALE_NAMESPACE.DETAIL,
            unlocked: achievementStats.unlocked,
            total: achievementStats.total,
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-xl font-bold text-design-text-normal">{achievementStats.unlocked}</div>
          <div className="text-xs text-design-text-subtle">
            {t("achievements.overview.stats.unlocked", {
              ns: LOCALE_NAMESPACE.DETAIL,
            })}
          </div>
        </div>
        <div className="rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Lock className="h-5 w-5 text-design-text-subtle" />
          </div>
          <div className="text-xl font-bold text-design-text-normal">
            {achievementStats.total - achievementStats.unlocked}
          </div>
          <div className="text-xs text-design-text-subtle">
            {t("achievements.overview.stats.remaining", {
              ns: LOCALE_NAMESPACE.DETAIL,
            })}
          </div>
        </div>
        <div className="rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Award className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-design-text-normal">{achievementStats.rare}</div>
          <div className="text-xs text-design-text-subtle">
            {t("achievements.overview.stats.rare", {
              ns: LOCALE_NAMESPACE.DETAIL,
            })}
          </div>
        </div>
        <div className="rounded-lg border border-design-border bg-design-foreground p-3 text-center">
          <div className="mb-2 flex items-center justify-center">
            <EyeOff className="h-5 w-5 text-design-text-subtle" />
          </div>
          <div className="text-xl font-bold text-design-text-normal">{achievementStats.hidden}</div>
          <div className="text-xs text-design-text-subtle">
            {t("achievements.overview.stats.hidden", {
              ns: LOCALE_NAMESPACE.DETAIL,
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
