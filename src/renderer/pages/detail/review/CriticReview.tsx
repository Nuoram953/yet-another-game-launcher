import { Button } from "@render/components/button/Button";
import { Card } from "@render/components/card/Card";
import { Badge } from "@render/components/ui/badge";
import { useGames } from "@render/context/DatabaseContext";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import React, { useState } from "react";

interface ModernUserReviewsProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function CriticReviews({ currentPage, onPageChange }: ModernUserReviewsProps) {
  const { selectedGame } = useGames();
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  const reviewsPerPage = 3;
  const totalReviews = selectedGame.externalReviewMap.filter(
    (review) => review.externalReview.isCritic && review.gameId === selectedGame.id,
  ).length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  const startIndex = currentPage * reviewsPerPage;
  const endIndex = Math.min(startIndex + reviewsPerPage, totalReviews);
  const currentReviews = selectedGame.externalReviewMap
    .filter((review) => review.externalReview.isCritic && review.gameId === selectedGame.id)
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

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-design-score-none";
    if (score >= 80) return "bg-design-score-masterpiece";
    if (score >= 60) return "bg-design-score-positive";
    if (score >= 40) return "bg-design-score-mixed";
    return "bg-design-score-disappointing";
  };

  return (
    <Card title="Critic Reviews">
      <div className="space-y-6">
        {currentReviews.map((reviewData, index) => {
          const globalIndex = startIndex + index;
          const isExpanded = expandedReviews.has(globalIndex);

          return (
            <div key={globalIndex} className="flex gap-6 rounded-lg border border-design-border p-6">
              <div className="w-48 flex-shrink-0">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={reviewData.externalReview.iconUrl}
                    alt={reviewData.externalReview.author}
                    className="mb-3 h-16 w-16"
                  />
                  <h4 className="mb-1 font-semibold">{reviewData.externalReview.author}</h4>
                  <Badge className="mb-2">{reviewData.externalReview.source}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-3 flex flex-col">
                  <p className="text-lg leading-relaxed">
                    {isExpanded ? reviewData.externalReview.review : truncateText(reviewData.externalReview.review)}
                  </p>
                  {reviewData.externalReview.review.length > 200 && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="mt-3 self-start text-sm font-medium text-design-text-link transition-colors"
                    >
                      {isExpanded ? "Show less" : "Continue reading →"}
                    </button>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Globe />
                    <a href={reviewData.externalReview.sourceUrl} className="text-design-text-link">
                      Full review
                    </a>
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${getScoreColor(reviewData.externalReview.score)} transform shadow-lg transition-all duration-300`}
                  >
                    <span className="text-lg font-bold text-design-text-normal">
                      {reviewData.externalReview.score || "--"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-design-border pt-4">
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
    </Card>
  );
}
