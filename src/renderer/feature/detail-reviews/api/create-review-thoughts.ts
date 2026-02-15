import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { getGame } from "@render/api/electron";
import { RouteGame } from "@common/constant";
import { getGameReviewQueryOptions } from "./get-review";

export const createReviewThought = (gameId: string) => {
  return window.game.createReviewThought({ gameId });
};

export const createReviewThoughtQueryOptions = (gameId: string) => {
  return queryOptions({
    queryKey: [RouteGame.CREATE_REVIEW_THOUGHT, gameId],
    queryFn: () => createReviewThought(gameId),
  });
};

type UseCreateReviewThoughtOptions = {
  gameId: string;
  mutationConfig?: MutationConfig<typeof createReviewThought>;
};

export const useCreateReviewThought = ({ gameId, mutationConfig }: UseCreateReviewThoughtOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getGameReviewQueryOptions(gameId).queryKey,
      });
    },
    ...restConfig,
    mutationFn: createReviewThought,
  });
};
