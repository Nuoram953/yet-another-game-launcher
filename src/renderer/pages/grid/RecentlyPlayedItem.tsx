import React, { useEffect } from "react";
import { useState } from "react";
import { Game } from "@prisma/client";
import { useNavigate } from "react-router-dom";
import { Image } from "@render//components/image/Image";
import { Clock, Trophy } from "lucide-react";
import { convertToHoursAndMinutes } from "@render//utils/util";
import { GameWithRelations } from "src/common/types";
import { Skeleton } from "@render/components/ui/skeleton";

interface Props {
  index: number;
  game: GameWithRelations;
}

export const RecentlyPlayedCarouselItem = ({ index, game }: Props) => {
  const [backgroundPicture, setBackgroundPicture] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.media.getBackgrounds(game.id);
        setBackgroundPicture(data[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  const handleOnClick = () => {
    navigate(`/game/${game.id}`, { replace: true });
  };

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div
      key={game.id}
      className="absolute h-full w-full transform cursor-pointer transition-transform duration-700 hover:scale-105"
      style={{ left: `${index * 100}%` }}
      onClick={handleOnClick}
    >
      <Image src={backgroundPicture} alt={game.name} className="h-full w-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
        <h2 className="mb-2 text-4xl font-bold text-white">{game.name}</h2>
        <div className="flex flex-row gap-8">
          <div className="flex flex-row items-center justify-center gap-1 text-gray-300">
            <Clock className="mr-1" size={16} />
            <p>{convertToHoursAndMinutes(game.timePlayed)}</p>
          </div>
          {game.hasAchievements && (
            <div className="flex flex-row items-center justify-center gap-1 text-gray-300">
              <Trophy className="mr-1" size={16} />
              <p>{game.achievements.filter((achievement) => achievement.isUnlocked).length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
