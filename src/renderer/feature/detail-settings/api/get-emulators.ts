import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getLibrary } from "@render/api/electron";
import { Emulator } from "@prisma/client";

export const getEmulators = (): Promise<Emulator[]> => {
  return getLibrary().getEmulators();
};

export const getEmulatorQueryOptions = () => {
  return queryOptions({
    queryKey: ["emulators"],
    queryFn: () => getEmulators(),
  });
};

type UseEmulatorOptions = {
  queryConfig?: QueryConfig<typeof getEmulatorQueryOptions>;
};

export const useEmulator = () => {
  return useQuery({
    ...getEmulatorQueryOptions(),
  });
};
