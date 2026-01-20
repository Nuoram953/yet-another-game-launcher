import { LOCALE_NAMESPACE } from "@common/constant";
import { GameWithRelations } from "../../../../common/types";
import { Star, Heart, ThumbsUp, ThumbsDown, Clock, CheckCircle, Play, Pause, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface GameInfoProps {
  game: GameWithRelations;
}

export const GameInfo = ({ game }: GameInfoProps) => {
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);
  const { t } = useTranslation();

  const positiveThoughts = game.reviewToughts?.filter((thought) => thought.isPositive).length || 0;
  const negativeThoughts = game.reviewToughts?.filter((thought) => thought.isNegative).length || 0;
  const totalThoughts = game.reviewToughts?.length || 0;

  const status = game.gameStatus;
  const getStatusIcon = () => {
    if (!status) return null;

    switch (status.name.toLowerCase()) {
      case "playing":
      case "currently playing":
        return <Play className="h-4 w-4 text-green-500" />;
      case "completed":
      case "finished":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "paused":
      case "on hold":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "dropped":
      case "abandoned":
        return <X className="h-4 w-4 text-red-500" />;
      case "plan to play":
      case "backlog":
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const reviewText = game.review?.review;
  const shouldShowReviewToggle = reviewText && reviewText.length > 150;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-4 text-xs">
        {status && (
          <div className="flex items-center gap-1.5">
            {getStatusIcon()}
            <span className="text-gray-300">{t(status.name, { ns: LOCALE_NAMESPACE.GAME_STATUS })}</span>
          </div>
        )}

        {game.isFavorite && (
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span className="text-red-400">Favorite</span>
          </div>
        )}

        {game.scoreUser && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-yellow-400">{game.scoreUser}/10</span>
          </div>
        )}

        {game.scoreCommunity && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Community:</span>
            <span className="text-blue-400">{game.scoreCommunity}/100</span>
          </div>
        )}

        {game.scoreCritic && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Critics:</span>
            <span className="text-green-400">{game.scoreCritic}/100</span>
          </div>
        )}
      </div>

      {totalThoughts > 0 && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400">Thoughts:</span>
          {positiveThoughts > 0 && (
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-400">{positiveThoughts}</span>
            </div>
          )}
          {negativeThoughts > 0 && (
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
              <span className="text-red-400">{negativeThoughts}</span>
            </div>
          )}
          {totalThoughts > positiveThoughts + negativeThoughts && (
            <span className="text-gray-400">+{totalThoughts - positiveThoughts - negativeThoughts} neutral</span>
          )}
        </div>
      )}

      {reviewText && (
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Review:</div>
          <div
            className={`leading-relaxed text-gray-200 ${
              !isReviewExpanded && shouldShowReviewToggle ? "overflow-hidden text-ellipsis" : ""
            }`}
            style={
              !isReviewExpanded && shouldShowReviewToggle
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical" as const,
                  }
                : undefined
            }
          >
            {reviewText}
          </div>
          {shouldShowReviewToggle && (
            <button
              onClick={() => setIsReviewExpanded(!isReviewExpanded)}
              className="text-xs text-blue-400 transition-colors hover:text-blue-300"
            >
              {isReviewExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
