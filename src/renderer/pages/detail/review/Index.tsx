import React, { useEffect, useMemo, useRef, useState } from "react";
import { GameReview } from "@prisma/client";
import { useGames } from "@render//context/DatabaseContext";
import { Card } from "@render//components/card/Card";
import { Input } from "@render//components/input/Input";
import { useNotifications } from "@render//components/NotificationSystem";
import { Button } from "@render/components/button/Button";
import { Pencil, Trash } from "lucide-react";
import { UserReviews } from "./UserReview";
import { Overview } from "./Overview";
import { CriticReviews } from "./CriticReview";
import { useConfig } from "@render/components/ConfigProvider";
import { GameStatus, LOCALE_NAMESPACE } from "@common/constant";
import { getGame } from "@render/api/electron";
import { useTranslation } from "react-i18next";

export function SectionReview() {
  const { t } = useTranslation();
  const { getConfigValueSync } = useConfig();
  const { selectedGame } = useGames();
  const { addNotification } = useNotifications();
  const isFirstRender = useRef(true);
  const lastSentData = useRef<Partial<GameReview> | null>(null);
  const [reviewText, setReviewText] = useState(selectedGame?.review?.review ?? "");
  const [currentUserReviewPage, setCurrentUserReviewPage] = useState<number>(0);
  const [currentCriticReviewPage, setCurrentCriticReviewPage] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState(
    [GameStatus.COMPLETED, GameStatus.DROPPED].includes(selectedGame.gameStatusId),
  );
  const [showYourReview, setShowYourReview] = useState(selectedGame.review !== null);

  const [categoryRatings, setCategoryRatings] = useState({
    graphics: selectedGame?.review?.scoreGraphic ?? 5,
    gameplay: selectedGame?.review?.scoreGameplay ?? 5,
    story: selectedGame?.review?.scoreStory ?? 5,
    sound: selectedGame?.review?.scoreSound ?? 5,
    content: selectedGame?.review?.scoreContent ?? 5,
  });

  const calculateOverallScore = () => {
    let total = 0;

    Object.values(categoryRatings).forEach((value) => {
      total += value;
    });

    return total * 2;
  };

  const overallScore = useMemo(() => calculateOverallScore(), [categoryRatings]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!showYourReview) {
      return;
    }

    const data: Partial<GameReview> = {
      gameId: selectedGame!.id,
      score: overallScore,
      isAdvanceReview: true,
      scoreGameplay: categoryRatings.gameplay,
      scoreContent: categoryRatings.content,
      scoreSound: categoryRatings.sound,
      scoreStory: categoryRatings.story,
      scoreGraphic: categoryRatings.graphics,
      review: reviewText,
    };

    if (JSON.stringify(lastSentData.current) === JSON.stringify(data)) {
      return;
    }

    const saveTimeout = setTimeout(() => {
      window.game.setReview(data);
      lastSentData.current = data;
      addNotification({
        title: "Saved",
        message: "Your review has been saved.",
        type: "success",
        duration: 2000,
      });
    }, 1500);

    return () => clearTimeout(saveTimeout);
  }, [categoryRatings, reviewText, overallScore]);

  const handleCategoryChange = (category: string, value: number) => {
    setCategoryRatings({
      ...categoryRatings,
      [category]: value,
    });
  };

  const getCategoryColor = (value: number) => {
    if (value <= 2) return "bg-design-error";
    if (value <= 4) return "bg-yellow-500";
    if (value <= 7) return "bg-blue-500";
    return "bg-green-500";
  };

  const getCategoryLabel = (value: number) => {
    if (value <= 2) return t("review.category.poor", { ns: LOCALE_NAMESPACE.DETAIL });
    if (value <= 4) return t("review.category.fair", { ns: LOCALE_NAMESPACE.DETAIL });
    if (value <= 7) return t("review.category.good", { ns: LOCALE_NAMESPACE.DETAIL });
    if (value <= 9) return t("review.category.great", { ns: LOCALE_NAMESPACE.DETAIL });
    return t("review.category.excellent", { ns: LOCALE_NAMESPACE.DETAIL });
  };

  return (
    <div className="mx-auto w-full space-y-4 py-4">
      <Card
        title={t("review.titleCard.yourReview", { ns: LOCALE_NAMESPACE.DETAIL })}
        actions={[
          {
            icon: Trash,
            name: t("review.yourReview.action.reset", { ns: LOCALE_NAMESPACE.DETAIL }),
            onClick: () => {
              setShowYourReview(false);
              getGame().resetReview(selectedGame.id);
            },
          },
        ]}
      >
        {showYourReview ? (
          <div className="p-6">
            <div className="mb-6">
              {Object.entries({
                graphics: t("review.yourReview.category.graphics", { ns: LOCALE_NAMESPACE.DETAIL }),
                gameplay: t("review.yourReview.category.gameplay", { ns: LOCALE_NAMESPACE.DETAIL }),
                story: t("review.yourReview.category.story", { ns: LOCALE_NAMESPACE.DETAIL }),
                sound: t("review.yourReview.category.sound", { ns: LOCALE_NAMESPACE.DETAIL }),
                content: t("review.yourReview.category.content", { ns: LOCALE_NAMESPACE.DETAIL }),
              }).map(([key, label]) => (
                <div key={key} className="mb-4">
                  <div className="mb-1 flex justify-between">
                    <label className="font-medium">{label}</label>
                    <span
                      className={`rounded-md px-2 py-1 text-xs text-design-text-normal ${getCategoryColor(categoryRatings[key as keyof typeof categoryRatings])}`}
                    >
                      {categoryRatings[key as keyof typeof categoryRatings]}/10 -{" "}
                      {getCategoryLabel(categoryRatings[key as keyof typeof categoryRatings])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={categoryRatings[key as keyof typeof categoryRatings]}
                    onChange={(e) => handleCategoryChange(key, parseInt(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <Input
                label={t("review.yourReview.yourThoughts.label", { ns: LOCALE_NAMESPACE.DETAIL })}
                color="dark"
                type="text"
                className="h-[150px]"
                textarea={true}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={t("review.yourReview.yourThoughts.placeholder", { ns: LOCALE_NAMESPACE.DETAIL })}
              />
            </div>
          </div>
        ) : (
          <div className="my-4 flex justify-center">
            <Button
              intent="primary"
              icon={Pencil}
              iconColor="black"
              text={t("review.yourReview.startReview", { ns: LOCALE_NAMESPACE.DETAIL })}
              onClick={() => setShowYourReview((prev) => !prev)}
            />
          </div>
        )}
      </Card>
      <div className="relative">
        <div
          className={`${isRevealed || !getConfigValueSync("page.detail.review.blurExternalReviews") ? "" : "blur-md"} flex flex-col gap-4`}
        >
          <Overview />
          <UserReviews currentPage={currentUserReviewPage} onPageChange={setCurrentUserReviewPage} />
          <CriticReviews currentPage={currentCriticReviewPage} onPageChange={setCurrentCriticReviewPage} />
        </div>
        {!isRevealed && getConfigValueSync("page.detail.review.blurExternalReviews") && (
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-opacity-50"
            onClick={() => setIsRevealed(true)}
          >
            <div className="text-center">
              <p className="mb-2 text-xl font-semibold">{t("review.reveal.title", { ns: LOCALE_NAMESPACE.DETAIL })}</p>
              <p className="text-sm text-design-text-subtle">
                {t("review.reveal.subTitle", { ns: LOCALE_NAMESPACE.DETAIL })}
              </p>
              <p className="text-sm text-design-text-subtle">
                {t("review.reveal.subTitle2", { ns: LOCALE_NAMESPACE.DETAIL })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
