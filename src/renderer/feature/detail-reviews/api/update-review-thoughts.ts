import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteGame } from "@common/constant";
import { getGameReviewQueryOptions } from "./get-review";
import { UpdateReviewThoughtSchema } from "@main/game/game.schema";
import { getGameQueryOptions } from "@render/api/get-game";

export const updateReviewThought = (data: UpdateReviewThoughtSchema) => {
  return window.game.updateReviewThought(data);
};

export const updateReviewThoughtQueryOptions = (data: UpdateReviewThoughtSchema) => {
  return queryOptions({
    queryKey: [RouteGame.UPDATE_REVIEW_THOUGHT, data.id],
    queryFn: () => updateReviewThought(data),
  });
};

type UseUpdateReviewThoughtOptions = {
  mutationConfig?: MutationConfig<typeof updateReviewThought>;
};

export const useUpdateReviewThought = ({ mutationConfig }: UseUpdateReviewThoughtOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: getGameQueryOptions(variables.gameId).queryKey,
      });
    },
    ...restConfig,
    mutationFn: updateReviewThought,
  });
};
