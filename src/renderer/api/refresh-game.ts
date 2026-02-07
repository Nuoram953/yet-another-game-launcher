import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteLibrary } from "@common/constant";

import * as RankingSchema from "@main/library/library.schema";
import { getGameQueryOptions } from "./get-game";
import { getGamesQueryOptions } from "./get-games";

export const refreshGame = (data: RankingSchema.RefreshGame) => {
  return window.library.refreshGame(data);
};

export const refreshGameQueryOptions = (data: RankingSchema.RefreshGame) => {
  return queryOptions({
    queryKey: [RouteLibrary.REFRESH_GAME],
    queryFn: () => refreshGame(data),
  });
};

type UseRefreshGameOptions = {
  mutationConfig?: MutationConfig<typeof refreshGame>;
};

export const useRefreshGame = ({ mutationConfig }: UseRefreshGameOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getGameQueryOptions(variables.gameId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getGamesQueryOptions().queryKey,
      });
    },
    ...restConfig,
    mutationFn: refreshGame,
  });
};
