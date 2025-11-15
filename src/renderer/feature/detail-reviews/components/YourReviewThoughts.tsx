import Button from "@render/components/new/button/Button";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import Section from "@render/components/new/section";
import { useGameReview } from "../api/get-review";
import { useParams } from "@tanstack/react-router";
import { useCreateReviewThought } from "../api/create-review-thoughts";
import { useUpdateReviewThought } from "../api/update-review-thoughts";
import { useEffect, useRef, useState } from "react";
import { GameReviewThoughts } from "@prisma/client";
import { useDeleteReviewThought } from "../api/delete-review-thoughts";
import { debounce } from "lodash";
import { ThoughtCard } from "./ThoughtCard";

export const YourReviewThoughts = () => {
  const { id } = useParams({ from: "/game/$id" });
  const [localThoughts, setLocalThoughts] = useState<GameReviewThoughts[]>([]);
  const reviewQuery = useGameReview({ gameId: id });

  const createReviewThought = useCreateReviewThought({
    gameId: id,
  });

  const updateReviewThought = useUpdateReviewThought({
    data: { id, text: "" },
  });

  const deleteReviewThought = useDeleteReviewThought({
    data: { id },
  });

  const debouncedUpdaters = useRef<Record<string, (text: string) => void>>({});

  useEffect(() => {
    if (!reviewQuery.data?.thoughts) return;

    setLocalThoughts(reviewQuery.data.thoughts);

    reviewQuery.data.thoughts.forEach((note) => {
      if (!debouncedUpdaters.current[note.id]) {
        debouncedUpdaters.current[note.id] = debounce((text: string) => {
          updateReviewThought.mutate({ id: note.id, text });
        }, 1000);
      }
    });
  }, [reviewQuery.data, updateReviewThought]);

  if (reviewQuery.isLoading) return <LoadingCenter />;

  const handleCreateThought = () => {
    createReviewThought.mutate(id);
  };

  const handleDeleteThought = (id: string) => {
    deleteReviewThought.mutate({ id });
  };

  return (
    <Section>
      <Section.Title title={`Your Thoughts (${localThoughts.length})`} />
      <Section.Content>
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localThoughts.map((note) => (
            <ThoughtCard
              key={note.id}
              note={note}
              onDelete={handleDeleteThought}
              onUpdate={(data) => updateReviewThought.mutate(data)}
            />
          ))}

          <div className="flex">
            <Button
              intent="custom"
              onClick={handleCreateThought}
              className="h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
              text="+ Add thought"
            />
          </div>
        </div>
      </Section.Content>
    </Section>
  );
};
