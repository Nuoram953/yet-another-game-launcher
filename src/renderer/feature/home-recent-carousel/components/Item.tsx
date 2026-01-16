import { GameWithRelations } from "@common/types";
import { Clock, Trophy } from "lucide-react";
import { Image } from "@component/new/Image/Image";
import { convertToHoursAndMinutes } from "@render/utils/util";
import { useBackground } from "../api/get-background";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useNavigate } from "@tanstack/react-router";

interface ItemProps extends React.PropsWithChildren {
  index: number;
  game: GameWithRelations;
}

export const Item = ({ game, index }: ItemProps) => {
  const navigate = useNavigate();
  const backgroundQuery = useBackground({ id: game.id, count: 1 });

  const handleOnClick = () => {
    navigate({
      to: "/game/$id",
      params: { id: game.id },
      replace: true,
    });
  };

  if (backgroundQuery.isFetching) {
    return <LoadingCenter />;
  }

  return (
    <div
      key={game.id}
      className="absolute h-full w-full transform cursor-pointer"
      style={{ left: `${index * 100}%` }}
      onClick={handleOnClick}
    >
      <Image preset="background" src={backgroundQuery.data[0]} alt={game.name} fade={false} className="!h-full" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
        <h2 className="mb-2 text-4xl font-bold text-normal">{game.name}</h2>
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
