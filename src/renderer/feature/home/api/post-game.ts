import { queryOptions, useMutation } from "@tanstack/react-query";

import { MutationConfig } from "@render/lib/react-query";
import { getLibrary } from "@render/api/electron";
import { Game } from "@prisma/client";
import { GameWithRelations } from "@common/types";

export const postGame = (data: Partial<Game>): Promise<GameWithRelations> => {
  return getLibrary().addGame(data);
};

export const postGameQueryOptions = (data: Partial<Game>) => {
  return queryOptions({
    queryKey: ["game", data.name],
    queryFn: () => postGame(data),
  });
};

type UseGameOptions = {
  data: Partial<Game>;
  mutationConfig?: MutationConfig<typeof postGame>;
};

export const useAddGame = ({ mutationConfig }: UseGameOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: postGame,
  });
};
