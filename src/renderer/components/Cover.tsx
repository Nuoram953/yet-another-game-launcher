import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertToHoursAndMinutes } from "@/utils/util";
import { Skeleton } from "./ui/skeleton";
import { Prisma } from "@prisma/client";
import { Clock } from "lucide-react";
import { Badge } from "./ui/badge";

const SkeletonCover = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="rounded-xl h-[400px]" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[75px]" />
      </div>
    </div>
  );
};

const Cover: React.FC<{
  game: Prisma.GameGetPayload<{
    include: { gameStatus: true; storefront: true };
  }>;
}> = ({ game }) => {
  const [picturePath, setPicturePath] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        console.log(game);
        const directory = await window.api.getStoredPicturesDirectory(game.id);
        setPicturePath(`${directory}/cover/cover_1.jpg`);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      PLAYING: "bg-blue-500",
      PLAYED: "bg-yellow-500",
      PLAN: "bg-purple-500",
      DROPPED: "bg-red-500",
      COMPLETED: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const handleMouseMove = (e, cardElement) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 degrees
    const rotateY = ((x - centerX) / centerX) * 10; // Max 10 degrees

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
      navigate(`/game/${game.id}`);
    } catch (err) {}
  };

  if (!picturePath) {
    return <SkeletonCover />;
  }

  return (
    <div
      className="w-full relative"
      onClick={handleRunCommand}
      onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
      onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
      style={{
        transition: "transform 0.1s ease",
        transformStyle: "preserve-3d",
      }}
    >
      <ImageWithFallback src={`file://${picturePath}`} />
      <div className="absolute top-2 left-2">
        <Badge
          variant={"default"}
          className={`${getStatusColor(game.gameStatus.name)} text-white shadow-md`}
        >
          {game.gameStatus.name}
        </Badge>
      </div>
      <div className="flex flex-col truncate w-wull text-left">
        <p className="truncate w-full">{game.name}</p>
        <div className="flex flex-row items-center">
          <Clock className="mr-1" size={16} />
          <p>{convertToHoursAndMinutes(game.timePlayed)}</p>
        </div>
      </div>
    </div>
  );
};

const ImageWithFallback = ({ src, alt, style }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        ...style,
        display: "inline-block",
        backgroundColor: hasError ? "grey" : "transparent",
      }}
      className="rounded-xl rounded-b-none w-full"
    >
      {!hasError && (
        <img
          src={src}
          alt={alt}
          style={{ display: "block", ...style }}
          onError={() => setHasError(true)}
          className="rounded-xl w-full"
        />
      )}
    </div>
  );
};

export default Cover;
