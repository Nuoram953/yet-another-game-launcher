import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRankingQueryOptions } from "./get-ranking";

type UpdateGameOrderData = {
  rankingId: number;
  gameOrders: Array<{
    gameId: string;
    rank: number;
  }>;
};

type UseUpdateGameOrderOptions = {
  data: UpdateGameOrderData;
  mutationConfig?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  };
};

export const useUpdateGameOrder = ({ data, mutationConfig }: UseUpdateGameOrderOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => window.ranking.updateGameOrder(data),
    onSuccess: () => {
      // Invalidate and refetch the ranking to get updated order
      queryClient.invalidateQueries(getRankingQueryOptions(data.rankingId));
      mutationConfig?.onSuccess?.();
    },
    onError: mutationConfig?.onError,
  });
};
