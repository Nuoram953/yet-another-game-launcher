import React from "react";
import useGameStore from "../store/GameStore";
import { useQuery } from "@tanstack/react-query";
import { getGameLogo } from "../api/DetailApi";

export const Logo = () => {
  const game = useGameStore((state) => state.game);
  const id = game?.id;

  const { data, isPending } = useQuery({
    queryKey: ["logo", id],
    queryFn: () => getGameLogo(id),
    enabled: !!id,
  });

  return (
    <>
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <img
          src={data[0]}
          alt={`game name logo`}
          className="mb-4 transform object-contain transition-transform duration-300 hover:scale-105"
        />
      )}
    </>
  );
};
