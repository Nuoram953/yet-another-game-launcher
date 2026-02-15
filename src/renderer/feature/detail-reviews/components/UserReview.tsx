import Button from "@render/components/new/button/Button";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import Section from "@render/components/new/section";
import { useGameFromParams } from "@render/hooks/useGameParam";
import { Globe, User } from "lucide-react";
import React, { useState, useMemo } from "react";

export function UserReviews() {
  const [expanded, setExpanded] = useState(false);

  const INITIAL_COUNT = 3;

  const { game, isLoading } = useGameFromParams();

  if (isLoading) {
    return <LoadingCenter />;
  }

  const userReviews = useMemo(() => {
    const reviews = game.externalReviewMap.filter((r) => !r.externalReview.isCritic && r.gameId === game.id);
    for (let i = reviews.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reviews[i], reviews[j]] = [reviews[j], reviews[i]];
    }
    return reviews;
  }, [game.id]);

  const visibleReviews = expanded ? userReviews : userReviews.slice(0, INITIAL_COUNT);

  if (!visibleReviews.length) return;

  return (
    <Section>
      <Section.Title title="User Reviews" />

      <Section.Content>
        <div className="flex flex-col gap-4 space-y-4">
          {visibleReviews.map(({ externalReview }, index) => (
            <div key={externalReview.id ?? index} className="rounded-md p-2 shadow-inner transition-shadow">
              <div className="flex items-center gap-2">
                <User className="text-design-text-subtle h-5 w-5" />
                <span className="text-design-text-normal font-medium">{externalReview.author || "Anonymous"}</span>
                {externalReview.reviewedAt && (
                  <span className="text-design-text-subtle ml-auto text-xs">
                    {new Date(externalReview.reviewedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p className="text-design-text-muted mt-2 text-sm leading-relaxed">“{externalReview.review}”</p>

              {externalReview.sourceUrl && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Globe className="text-design-text-subtle h-3 w-3" />
                  <a href={externalReview.sourceUrl} target="_blank" className="text-design-text-link hover:underline">
                    Read full post
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section.Content>

      {userReviews.length > INITIAL_COUNT && (
        <Section.Footer>
          <div className="flex justify-center">
            <Button
              intent="secondary"
              onClick={() => setExpanded((v) => !v)}
              text={expanded ? "Collapse" : `Expand (${userReviews.length - INITIAL_COUNT} more)`}
            />
          </div>
        </Section.Footer>
      )}
    </Section>
  );
}
