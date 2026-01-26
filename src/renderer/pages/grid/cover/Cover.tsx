import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { convertToHoursAndMinutes } from "@render//utils/util";
import { Clock } from "lucide-react";
import { SkeletonCover } from "./skeleton";
import BadgeDropdown from "../../../components/dropdown/StatusSelection";
import { FavoriteBadge } from "./favoriteBadge";
import { GameWithRelations } from "src/common/types";
import { Image } from "../../../components/image/Image";
import _ from "lodash";
import { useMedia } from "@render/api/get-media-by-type";
import { MEDIA_TYPE } from "@common/constant";
import { LoadingCenter } from "@render/components/new/loading/Loading";

interface CoverProps {
  game: GameWithRelations;
}

const Cover = ({ game }: CoverProps) => {
  const navigate = useNavigate();

  const coverQuery = useMedia({ data: { gameId: game.id, type: MEDIA_TYPE.COVER } });

  if (coverQuery.isPending) return <LoadingCenter />;

  const cover = coverQuery.data?.[0] ?? "";

  const handleMouseMove = (e: React.MouseEvent, cardElement: HTMLElement) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    cardElement.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.05, 1.05, 1.05)
    `;
  };

  const handleMouseLeave = (cardElement: HTMLElement) => {
    cardElement.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  };

  const handleRunCommand = async () => {
    try {
      navigate({
        to: "/game/$id",
        params: { id: game.id },
      });
    } catch (err) {}
  };

  const launchEnabled = [
    ...game.launchApp.filter((app) => app.isEnabled),
    ...game.launchStorefront.filter((app) => app.isEnabled && game.isInstalled),
    ...game.launchEmulation.filter((app) => app.isEnabled && !_.isNil(app.path) && !_.isEmpty(app.path)),
  ];

  return (
    <div
      className="text-design-text-normal relative w-full"
      onClick={handleRunCommand}
      onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
      onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
      style={{
        transition: "transform 0.1s ease",
        transformStyle: "preserve-3d",
      }}
    >
      <Image src={cover} alt={""} intent={"cover"} installed={launchEnabled.length > 0} allowFade={true} />

      <div className="absolute left-2 top-2">
        <BadgeDropdown game={game} />
      </div>

      {game.isFavorite && <FavoriteBadge />}
      <div className="w-wull flex flex-col truncate text-left">
        <p className="text-design-text-normal w-full truncate">{game.name}</p>
        <div className="flex flex-row items-center text-gray-300">
          <Clock className="mr-1" size={16} />
          <p>{convertToHoursAndMinutes(game.timePlayed)}</p>
        </div>
      </div>
    </div>
  );
};

export default Cover;
