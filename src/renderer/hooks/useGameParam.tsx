import { useParams } from "@tanstack/react-router";
import { useGame } from "@render/api/get-game";

export function useGameFromParams() {
  const { id } = useParams({ from: "/game/$id" });

  const gameQuery = useGame({ gameId: id });

  if (gameQuery.isLoading) {
    return { game: null, isLoading: true, query: gameQuery, id };
  }

  return { game: gameQuery.data, isLoading: false, query: gameQuery, id };
}
