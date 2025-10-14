import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { getGame } from "@render/api/electron";
import { LaunchType } from "@common/types";

export const deleteLaunch = (type: LaunchType, id: number): Promise<void> => {
  return getGame().deleteLaunch(type, id);
};

export const deleteLaunchQueryOptions = (type: LaunchType, id: number) => {
  return queryOptions({
    queryKey: ["launch-app-delete", type, id],
    queryFn: () => deleteLaunch(type, id),
  });
};

type UseLaunchOptions = {
  type: LaunchType;
  id: number;
  mutationConfig?: MutationConfig<typeof deleteLaunch>;
};

export const useLaunch = ({ type, id, mutationConfig }: UseLaunchOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: () => deleteLaunch(type, id),
  });
};
