import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { getGame } from "@render/api/electron";
import { RouteGame } from "@common/constant";
import { getGameReviewQueryOptions } from "./get-review";
import { GameReviewThoughts } from "@prisma/client";

export const updateReviewThought = (data: Partial<GameReviewThoughts>) => {
  return getGame().updateReviewThought(data);
};

export const updateReviewThoughtQueryOptions = (data: Partial<GameReviewThoughts>) => {
  return queryOptions({
    queryKey: [RouteGame.UPDATE_REVIEW_THOUGHT, data.id],
    queryFn: () => updateReviewThought(data),
  });
};

type UseUpdateReviewThoughtOptions = {
  data: Partial<GameReviewThoughts>;
  mutationConfig?: MutationConfig<typeof updateReviewThought>;
};

export const useUpdateReviewThought = ({ data, mutationConfig }: UseUpdateReviewThoughtOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getGameReviewQueryOptions(data.id).queryKey,
      });
    },
    ...restConfig,
    mutationFn: updateReviewThought,
  });
};
