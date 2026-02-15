import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteGame } from "@common/constant";

import { LaunchGameSchema } from "@main/game/game.schema";

export const launchGame = (data: LaunchGameSchema) => {
  return window.game.launch(data);
};

export const createRankingQueryOptions = (data: LaunchGameSchema) => {
  return queryOptions({
    queryKey: [RouteGame.LAUNCH],
    queryFn: () => launchGame(data),
  });
};

type UseLaunchGameOptions = {
  mutationConfig?: MutationConfig<typeof launchGame>;
};

export const useLaunchGame = ({ mutationConfig }: UseLaunchGameOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {},
    ...restConfig,
    mutationFn: launchGame,
  });
};
