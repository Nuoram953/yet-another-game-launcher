import React, { useEffect, useState } from "react";
import { Card, CardFooter } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { IGame } from "src/common/types";
import { convertToHoursAndMinutes } from "@/utils/util";
import { Skeleton } from "./ui/skeleton";
import { Game, Prisma } from "@prisma/client";

const SkeletonCover =() =>{
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="rounded-xl h-[400px]" />
    </div>
  )
}

const Cover: React.FC<{ game: Prisma.GameGetPayload<{
    include: { gameStatus: true; storefront: true; gameTimePlayed: true };
  }> }> = ({ game }) => {
  const [picturePath, setPicturePath] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        console.log(game)
        const directory = await window.api.getStoredPicturesDirectory(game.id);
        setPicturePath(`${directory}/cover/cover_1.jpg`);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, []);

  const handleRunCommand = async () => {
    try {
      navigate(`/game/${game.id}`);
    } catch (err) {}
  };

  if (!picturePath) {
    return <SkeletonCover />;
  }

  return (
    <Card onClick={handleRunCommand} className="w-full">
      <ImageWithFallback
        src={`file://${picturePath}`}
      />
      <CardFooter className="flex flex-row align-middle py-2 justify-around">
        <div className="flex flex-col truncate w-wull text-center">
          <p className="truncate w-full text-center">{game.name}</p>
          <p>
            {`${game.gameTimePlayed?.timePlayed??0 > 0 ? convertToHoursAndMinutes(game.gameTimePlayed?.timePlayed??0) + " • " : ""} ${game.gameStatus.name}`}
          </p>
        </div>
      </CardFooter>
    </Card>
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
          className="rounded-xl rounded-b-none w-full"
        />
      )}
    </div>
  );
};

export default Cover;
