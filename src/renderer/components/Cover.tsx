import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertToHoursAndMinutes } from "@/utils/util";
import { Prisma } from "@prisma/client";
import { Clock } from "lucide-react";
import { SkeletonCover } from "./cover/skeleton";
import { InstallBadge } from "./cover/installBadge";
import { StatusBadge } from "./cover/statusBadge";
import { ImageWithFallback } from "./cover/cover";
import BadgeDropdown from "./dropdown/StatusSelection";
import { FavoriteBadge } from "./cover/favoriteBadge";

const Cover: React.FC<{
  game: Prisma.GameGetPayload<{
    include: { gameStatus: true; storefront: true };
  }>;
}> = ({ game }) => {
  const [coverPicture, setCoverPicture] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const cover = await window.media.getCovers(game.id, 1);
        setCoverPicture(cover[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, [game]);

  const handleOnInstall = (e) => {
    e.stopPropagation();
    window.game.install(game.id);
  };

  const handleMouseMove = (e, cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation based on mouse position
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

  const handleMouseLeave = (cardElement) => {
    cardElement.style.transform =
      "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  };

  const handleRunCommand = async () => {
    try {
      navigate(`/game/${game.id}`, { replace: true });
    } catch (err) {}
  };

  if (loading) {
    return <SkeletonCover />;
  }

  return (
    <div
      className="relative w-full text-white"
      onClick={handleRunCommand}
      onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
      onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
      style={{
        transition: "transform 0.1s ease",
        transformStyle: "preserve-3d",
      }}
    >
      <ImageWithFallback src={coverPicture} />

      <div className="absolute left-2 top-2">
        <BadgeDropdown game={game} />
      </div>

      {!game.isInstalled && <InstallBadge handleOnClick={handleOnInstall} />}

      {game.isFavorite && <FavoriteBadge />}
      <div className="w-wull flex flex-col truncate text-left">
        <p className="w-full truncate text-white">{game.name}</p>
        <div className="flex flex-row items-center text-gray-300">
          <Clock className="mr-1" size={16} />
          <p>{convertToHoursAndMinutes(game.timePlayed)}</p>
        </div>
      </div>
    </div>
  );
};

export default Cover;
