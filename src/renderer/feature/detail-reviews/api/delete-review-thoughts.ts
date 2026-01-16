import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { getGame } from "@render/api/electron";
import { RouteGame } from "@common/constant";
import { getGameReviewQueryOptions } from "./get-review";

export const deleteReviewThought = (data: { id: string }) => {
  return getGame().deleteReviewThought(data.id);
};

export const deleteReviewThoughtQueryOptions = (data: { id: string }) => {
  return queryOptions({
    queryKey: [RouteGame.DELETE_REVIEW_THOUGHT, data.id],
    queryFn: () => deleteReviewThought(data),
  });
};

type UseDeleteReviewThoughtOptions = {
  data: { id: string };
  mutationConfig?: MutationConfig<typeof deleteReviewThought>;
};

export const useDeleteReviewThought = ({ data, mutationConfig }: UseDeleteReviewThoughtOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getGameReviewQueryOptions(data.id).queryKey,
      });
    },
    ...restConfig,
    mutationFn: deleteReviewThought,
  });
};
