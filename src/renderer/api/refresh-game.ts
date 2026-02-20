import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteGame } from "@common/constant";

import { getGameQueryOptions } from "./get-game";
import { getGamesQueryOptions } from "./get-games";
import { RefreshGameSchema } from "@main/game/game.schema";

export const refreshGame = (data: RefreshGameSchema) => {
  return window.gameApi.refresh(data);
};

export const refreshGameQueryOptions = (data: RefreshGameSchema) => {
  return queryOptions({
    queryKey: [RouteGame.REFRESH],
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
    onSuccess: (data, variables, ...args) => {
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
