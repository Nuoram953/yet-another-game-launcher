import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@render/lib/react-query";
import { GameLaunchApp } from "@prisma/client";
import { getGame } from "@render/api/electron";

export const postLaunchApp = (data: Partial<GameLaunchApp>): Promise<GameLaunchApp> => {
  return getGame().addLaunchApp(data);
};

export const postLaunchAppQueryOptions = (data: Partial<GameLaunchApp>) => {
  return queryOptions({
    queryKey: ["launch-app", data.name],
    queryFn: () => postLaunchApp(data),
  });
};

type UseLaunchAppOptions = {
  gameId: string;
  mutationConfig?: MutationConfig<typeof postLaunchApp>;
};

export const useLaunchApp = ({ gameId, mutationConfig }: UseLaunchAppOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: postLaunchApp,
  });
};
