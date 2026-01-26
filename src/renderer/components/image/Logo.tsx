import React from "react";
import { LoadingCenter } from "../new/loading/Loading";
import { useMedia } from "@render/api/get-media-by-type";
import { MEDIA_TYPE } from "@common/constant";

type LogoProps = {
  gameId: string;
  imgAlt?: string;
  imgStatic?: boolean;
};

export const Logo = ({ gameId, imgStatic = false }: LogoProps) => {
  const logoQuery = useMedia({ data: { gameId, type: MEDIA_TYPE.LOGO } });

  if (logoQuery.isPending) return <LoadingCenter />;

  const logo = logoQuery.data?.[0];

  return (
    <img
      src={logo}
      alt={`game name logo`}
      className={`${imgStatic ? "" : "animate-breathe"} object-contain hover:scale-105`}
    />
  );
};
