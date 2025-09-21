import { Button } from "@render/components/button/Button";
import { Card } from "@render/components/card/Card";
import Section from "@render/components/new/section";
import { Badge } from "@render/components/ui/badge";
import { useGames } from "@render/context/DatabaseContext";
import useGameStore from "@render/feature/detail/store/GameStore";
import { convertToHoursAndMinutes, unixToYYYYMMDD } from "@render/utils/util";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, ThumbsDown, ThumbsUp } from "lucide-react";
import React, { useState } from "react";

interface ModernUserReviewsProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function UserReviews({ currentPage, onPageChange }: ModernUserReviewsProps) {
  const { game } = useGameStore();
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  const reviewsPerPage = 3;
  const totalReviews = game.externalReviewMap.filter(
    (review) => !review.externalReview.isCritic && review.gameId == game.id,
  ).length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  const startIndex = currentPage * reviewsPerPage;
  const endIndex = Math.min(startIndex + reviewsPerPage, totalReviews);
  const currentReviews = game.externalReviewMap
    .filter((review) => !review.externalReview.isCritic && review.gameId == game.id)
    .slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
      setExpandedReviews(new Set());
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
      setExpandedReviews(new Set());
    }
  };

  const handleFirst = () => {
    onPageChange(0);
    setExpandedReviews(new Set());
  };

  const handleLast = () => {
    onPageChange(totalPages - 1);
    setExpandedReviews(new Set());
  };

  const toggleExpanded = (reviewIndex: number) => {
    const globalIndex = startIndex + reviewIndex;
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(globalIndex)) {
      newExpanded.delete(globalIndex);
    } else {
      newExpanded.add(globalIndex);
    }
    setExpandedReviews(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Section>
      <Section.Title title="User Reviews" />
      <Section.Content>
        <div className="space-y-4">
          {currentReviews.map((reviewData, index) => {
            const globalIndex = startIndex + index;
            const isExpanded = expandedReviews.has(globalIndex);

            return (
              <div key={globalIndex} className="min-h-[250px] rounded-lg border border-design-border p-6">
                <div className="item-center flex flex-row justify-between gap-4">
                  <div className="flex flex-row gap-4">
                    <img
                      src={reviewData.externalReview.iconUrl}
                      alt={reviewData.externalReview.author}
                      className="my-auto h-12 w-12 items-center rounded-full align-middle"
                    />

                    <div className="flex flex-col">
                      <div className="font-medium">{reviewData.externalReview.author}</div>
                      <div className="mt-1 flex flex-row gap-2 text-sm text-design-text-subtle">
                        <span>{unixToYYYYMMDD(Number(reviewData.externalReview.reviewedAt))}</span>
                        <span>•</span>
                        <span>{convertToHoursAndMinutes(reviewData.externalReview.timePlayed)}</span>
                        <span>•</span>
                        <span>
                          <Badge>{reviewData.externalReview.source}</Badge>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {reviewData.externalReview.isPositive ? (
                      <ThumbsUp className="text-green-400" />
                    ) : (
                      <ThumbsDown className="text-red-400" />
                    )}
                  </div>
                </div>

                <div className="my-4">
                  <p className="leading-relaxed">
                    {isExpanded ? reviewData.externalReview.review : truncateText(reviewData.externalReview.review)}
                  </p>
                  {reviewData.externalReview.review.length > 200 && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="mt-2 text-sm text-design-text-link transition-colors"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section.Content>
      <Section.Footer>
        <div className="flex items-center justify-between">
          <div className="flex flex-row">
            <Button intent="icon" onClick={handleFirst} disabled={currentPage === 0} icon={ChevronFirst} />
            <Button intent="icon" onClick={handlePrevious} disabled={currentPage === 0} icon={ChevronLeft} />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-design-text-subtle">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>

          <div className="flex flex-row">
            <Button intent="icon" onClick={handleNext} disabled={currentPage === totalPages - 1} icon={ChevronRight} />
            <Button intent="icon" onClick={handleLast} disabled={currentPage === totalPages - 1} icon={ChevronLast} />
          </div>
        </div>
      </Section.Footer>
    </Section>
  );
}
