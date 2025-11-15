import React from "react";
import { useGameLogo } from "@render/api/get-game-logo";
import { LoadingCenter } from "../new/loading/Loading";

type LogoProps = {
  gameId: string;
  imgAlt?: string;
  imgStatic?: boolean;
};

export const Logo = ({ gameId, imgStatic = false }: LogoProps) => {
  const logoQuery = useGameLogo({ gameId });

  return (
    <>
      {logoQuery.isPending ? (
        <LoadingCenter />
      ) : (
        <img
          src={logoQuery.data[0]}
          alt={`game name logo`}
          className={`${imgStatic ? "" : "animate-breathe"} object-contain hover:scale-105`}
        />
      )}
    </>
  );
};
