import { useQuery } from "@tanstack/react-query";
import { getGameCover } from "../api/DetailApi";

export const useGameCover = (id) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["cover", id],
    queryFn: async () => {
      return getGameCover(id);
    },
    enabled: !!id,
  });

  return { data, isPending, error };
};
