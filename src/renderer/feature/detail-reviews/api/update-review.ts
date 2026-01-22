import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { getGame } from "@render/api/electron";
import { RouteGame } from "@common/constant";
import { GameReview } from "@prisma/client";
import { getGameQueryOptions } from "@render/api/get-game";

export const updateReview = (data: Partial<GameReview>) => {
  return getGame().setReview(data);
};

export const updateReviewQueryOptions = (data: Partial<GameReview>) => {
  return queryOptions({
    queryKey: [RouteGame.SET_REVIEW, data.id],
    queryFn: () => updateReview(data),
  });
};

type UseUpdateReviewOptions = {
  data: Partial<GameReview>;
  mutationConfig?: MutationConfig<typeof updateReview>;
};

export const useUpdateReview = ({ data, mutationConfig }: UseUpdateReviewOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getGameQueryOptions(data.gameId!).queryKey,
      });
    },
    ...restConfig,
    mutationFn: updateReview,
  });
};
