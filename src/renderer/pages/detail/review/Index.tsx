import React, { useEffect, useMemo, useRef, useState } from "react";
import { GameReview } from "@prisma/client";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";
import { Input } from "@/components/input/Input";
import { useNotifications } from "@/components/NotificationSystem";
import OpenCriticReviews from "./OpenCritic";

export function SectionReview() {
  const { selectedGame } = useGames();
  const { addNotification } = useNotifications();
  const isFirstRender = useRef(true);
  const lastSentData = useRef<Partial<GameReview> | null>(null);
  const [reviewText, setReviewText] = useState(
    selectedGame?.review?.review ?? "",
  );

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

  const overallScore = useMemo(
    () => calculateOverallScore(),
    [categoryRatings],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
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
  }, [selectedGame, categoryRatings, reviewText, overallScore]);

  const handleCategoryChange = (category: string, value: number) => {
    setCategoryRatings({
      ...categoryRatings,
      [category]: value,
    });
  };

  const getCategoryColor = (value: number) => {
    if (value <= 2) return "bg-red-500";
    if (value <= 4) return "bg-yellow-500";
    if (value <= 7) return "bg-blue-500";
    return "bg-green-500";
  };

  const getCategoryLabel = (value: number) => {
    if (value <= 2) return "Poor";
    if (value <= 4) return "Fair";
    if (value <= 7) return "Good";
    if (value <= 9) return "Great";
    return "Excellent";
  };

  return (
    <div className="mx-auto w-full space-y-4 py-4">
      <Card title={"Review"}>
        <div className="p-6">
          <div className="mb-6">
            {Object.entries({
              graphics: "Graphics",
              gameplay: "Gameplay",
              story: "Story",
              sound: "Sound",
              content: "Content",
            }).map(([key, label]) => (
              <div key={key} className="mb-4">
                <div className="mb-1 flex justify-between">
                  <label className="font-medium">{label}</label>
                  <span
                    className={`rounded-md px-2 py-1 text-xs text-white ${getCategoryColor(categoryRatings[key as keyof typeof categoryRatings])}`}
                  >
                    {categoryRatings[key as keyof typeof categoryRatings]}/10 -{" "}
                    {getCategoryLabel(
                      categoryRatings[key as keyof typeof categoryRatings],
                    )}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={categoryRatings[key as keyof typeof categoryRatings]}
                  onChange={(e) =>
                    handleCategoryChange(key, parseInt(e.target.value))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
                />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <Input
              label="Summary"
              color="dark"
              type="text"
              className="h-[250px]"
              textarea={true}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <OpenCriticReviews />
    </div>
  );
}
