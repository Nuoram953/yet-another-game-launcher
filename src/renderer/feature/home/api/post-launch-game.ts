import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteLibrary } from "@common/constant";

import * as LibrarySchema from "@main/library/library.schema";

export const launchGame = (data: LibrarySchema.LaunchGame) => {
  return window.library.launch(data);
};

export const createRankingQueryOptions = (data: LibrarySchema.LaunchGame) => {
  return queryOptions({
    queryKey: [RouteLibrary.LAUNCH],
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
