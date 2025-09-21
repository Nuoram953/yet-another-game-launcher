import { LOCALE_NAMESPACE } from "@common/constant";
import { Card } from "@render/components/card/Card";
import { useGames } from "@render/context/DatabaseContext";
import useGameStore from "@render/feature/detail/store/GameStore";
import { Meh, ThumbsDown, ThumbsUp, Trophy, Users, User, Award } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export const Overview = () => {
  const { t } = useTranslation();
  const { game } = useGameStore();
  const [hoveredScore, setHoveredScore] = useState<string | null>(null);

  const getTierInfo = (score: number) => {
    if (score >= 90) {
      return {
        name: t("review.score.masterpiece.name", { ns: LOCALE_NAMESPACE.DETAIL }),
        shortName: t("review.score.masterpiece.shortName", { ns: LOCALE_NAMESPACE.DETAIL }),
        solidColor: "bg-design-score-masterpiece",
        textColor: "text-design-score-masterpiece",
        icon: Trophy,
        description: t("review.score.masterpiece.description", { ns: LOCALE_NAMESPACE.DETAIL }),
      };
    } else if (score >= 75) {
      return {
        name: t("review.score.positive.name", { ns: LOCALE_NAMESPACE.DETAIL }),
        shortName: t("review.score.positive.shortName", { ns: LOCALE_NAMESPACE.DETAIL }),
        solidColor: "bg-design-score-positive",
        textColor: "text-design-score-positive",
        icon: ThumbsUp,
        description: t("review.score.positive.description", { ns: LOCALE_NAMESPACE.DETAIL }),
      };
    } else if (score >= 50) {
      return {
        name: t("review.score.mixed.name", { ns: LOCALE_NAMESPACE.DETAIL }),
        shortName: t("review.score.mixed.shortName", { ns: LOCALE_NAMESPACE.DETAIL }),
        solidColor: "bg-design-score-mixed",
        textColor: "text-design-score-mixed",
        icon: Meh,
        description: t("review.score.mixed.description", { ns: LOCALE_NAMESPACE.DETAIL }),
      };
    } else {
      return {
        name: t("review.score.disappointing.name", { ns: LOCALE_NAMESPACE.DETAIL }),
        shortName: t("review.score.disappointing.shortName", { ns: LOCALE_NAMESPACE.DETAIL }),
        solidColor: "bg-design-score-disappointing",
        textColor: "text-design-score-disappointing",
        icon: ThumbsDown,
        description: t("review.score.disappointing.description", { ns: LOCALE_NAMESPACE.DETAIL }),
      };
    }
  };

  const validScores = [game.scoreCritic, game.scoreCommunity, game.review?.score].filter(
    (score) => score !== null && score !== undefined && score > 0,
  );

  const overallScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : Math.round((game.scoreCritic + game.scoreCommunity) / 2);

  const overallTier = getTierInfo(overallScore);
  const OverallIcon = overallTier.icon;

  const scores = [
    {
      id: "critic",
      label: t("review.overview.critics.label", { ns: LOCALE_NAMESPACE.DETAIL }),
      sublabel: t("review.overview.critics.subLabel", { ns: LOCALE_NAMESPACE.DETAIL }),
      value: game.scoreCritic,
      icon: Award,
    },
    {
      id: "community",
      label: t("review.overview.community.label", { ns: LOCALE_NAMESPACE.DETAIL }),
      sublabel: t("review.overview.community.subLabel", { ns: LOCALE_NAMESPACE.DETAIL }),
      value: game.scoreCommunity,
      icon: Users,
    },
    {
      id: "user",
      label: t("review.overview.user.label", { ns: LOCALE_NAMESPACE.DETAIL }),
      sublabel: t("review.overview.user.subLabel", { ns: LOCALE_NAMESPACE.DETAIL }),
      value: game.review?.score,
      icon: User,
    },
  ];

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-design-score-none";
    if (score >= 80) return "bg-design-score-masterpiece";
    if (score >= 60) return "bg-design-score-positive";
    if (score >= 40) return "bg-design-score-mixed";
    return "bg-design-score-disappointing";
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="mx-auto flex flex-col items-center justify-center">
        <div
          className={`h-32 w-32 rounded-full ${overallTier.solidColor} hover:shadow-3xl flex transform items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105`}
        >
          <div className="text-center">
            <div className="mb-1 text-4xl font-bold text-design-text-normal">{overallScore}</div>
            <OverallIcon className="mx-auto h-8 w-8 text-design-text-normal" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className={`text-center text-2xl font-bold ${overallTier.textColor} mb-2`}>{overallTier.shortName}</h3>
          <p className="mx-auto max-w-md text-center text-design-text-subtle">{overallTier.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {scores.map((score) => {
          const ScoreIcon = score.icon;
          const isHovered = hoveredScore === score.id;
          const scoreColor = getScoreColor(score.value);

          return (
            <div
              key={score.id}
              className={`group relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
                isHovered ? "scale-105 transform shadow-xl" : "hover:shadow-lg"
              }`}
              onMouseEnter={() => setHoveredScore(score.id)}
              onMouseLeave={() => setHoveredScore(null)}
            >
              <div className="absolute inset-0 rounded-lg">
                <div className="h-full w-full rounded-lg border border-design-border" />
              </div>

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <ScoreIcon
                    className={`h-6 w-6 transition-colors duration-300 ${isHovered ? "text-design-text-normal" : "text-design-text-subtle"}`}
                  />

                  <div
                    className={`h-12 w-12 rounded-full ${scoreColor} flex transform items-center justify-center shadow-lg transition-all duration-300 ${
                      isHovered ? "scale-110" : ""
                    }`}
                  >
                    <span className="text-lg font-bold text-design-text-normal">{score.value || "--"}</span>
                  </div>
                </div>

                <div>
                  <div className={"mb-1 font-semibold text-design-text-normal transition-colors duration-300"}>
                    {score.label}
                  </div>
                  <div
                    className={`text-sm transition-colors duration-300 ${
                      isHovered ? "text-design-text-normal text-opacity-80" : "text-design-text-subtle"
                    }`}
                  >
                    {score.sublabel}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-design-text-subtle">
        {t("review.ratingBased", { ns: LOCALE_NAMESPACE.DETAIL, count: validScores.length })}
      </div>
    </div>
  );
};
