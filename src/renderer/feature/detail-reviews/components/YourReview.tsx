import Section from "@render/components/new/section";
import { useUpdateReview } from "../api/update-review";
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "@render/hooks/useDebounce";
import { useGameFromParams } from "@render/hooks/useGameParam";
import { LoadingCenter } from "@render/components/new/loading/Loading";

export const YourReview = () => {
  const { id, game, isLoading } = useGameFromParams();

  const [local, setLocal] = useState<string>(game?.review?.review ?? "");

  const debounceLocal = useDebounce(local, 1000);

  const updateReview = useUpdateReview({
    data: { gameId: id, review: "" },
  });

  if (isLoading) {
    return <LoadingCenter />;
  }

  useEffect(() => {
    updateReview.mutate({
      gameId: id,
      review: debounceLocal,
    });
  }, [debounceLocal]);

  return (
    <Section>
      <Section.Title title="Your Review" />
      <Section.Content>
        <textarea
          onChange={(e) => {
            setLocal(e.target.value);
          }}
          value={local}
          placeholder="Write a short thought…"
          className="w-full flex-1 rounded-md bg-foreground p-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={8}
        />
      </Section.Content>
    </Section>
  );
};
