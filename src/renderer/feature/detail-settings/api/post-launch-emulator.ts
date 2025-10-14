import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@render/lib/react-query";
import { getGame } from "@render/api/electron";
import { GameLaunchEmulation } from "@prisma/client";

export const postLaunchEmulator = (data: Partial<GameLaunchEmulation>): Promise<GameLaunchEmulation> => {
  return getGame().addLaunchEmulator(data);
};

export const postLaunchEmulatorQueryOptions = (data: Partial<GameLaunchEmulation>) => {
  return queryOptions({
    queryKey: ["launch-emulator", data.gameId, data.name],
    queryFn: () => postLaunchEmulator(data),
  });
};

type UseLaunchEmulatorOptions = {
  data: Partial<GameLaunchEmulation>;
  mutationConfig?: MutationConfig<typeof postLaunchEmulator>;
};

export const useLaunchEmulator = ({ data, mutationConfig }: UseLaunchEmulatorOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: postLaunchEmulator,
  });
};
