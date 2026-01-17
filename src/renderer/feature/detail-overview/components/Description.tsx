import { Image } from "@render/components/image/Image";
import { IconAndText } from "@render/components/layout/Container";
import { Building, Heart, Layers, Newspaper, RefreshCcw, Star, Trash, Trophy, User } from "lucide-react";
import { Tags } from "./Tags";
import { ButtonPlay } from "@render/components/button/Play";
import ButtonIcon from "@render/components/new/button/ButtonIcon";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useGameCover } from "@render/api/get-game-cover";
import { useGameFromParams } from "@render/hooks/useGameParam";
import { getGame } from "@render/api/electron";

export const Description = () => {
  const { game, isLoading, id } = useGameFromParams();
  const coverQuery = useGameCover({ gameId: id, queryConfig: { enabled: !!game } });

  if (isLoading || coverQuery.isPending) {
    return <LoadingCenter />;
  }

  if (!game) return;

  const cover = coverQuery.data?.[0] ?? "";

  const scores = [
    { label: "Your Score", value: game.scoreUser, Icon: User },
    { label: "User Score", value: game.scoreCommunity, Icon: Star },
    { label: "Critic Score", value: game.scoreCritic, Icon: Trophy },
  ];

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-600 text-white";
    if (score >= 80) return "bg-green-500 text-white";
    if (score >= 60) return "bg-green-300 text-black";
    if (score >= 40) return "bg-yellow-400 text-black";
    return "bg-red-500 text-white";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border border-normal bg-foreground p-4 text-white shadow-lg hover:border-hover">
        <div className="flex flex-wrap justify-between gap-3">
          <ButtonPlay />
          <div className="flex gap-2">
            <ButtonIcon intent="secondary" icon={<Heart />} text="Add to favorite" />
            <ButtonIcon
              intent="secondary"
              icon={<RefreshCcw />}
              text="Refresh"
              onClick={() => {
                getGame().refreshInfo(game.id);
              }}
            />
            {game?.isInstalled && <ButtonIcon intent="destroy" icon={<Trash />} text="Uninstall" />}
          </div>
        </div>
      </div>
      <div className="rounded-md border border-normal bg-foreground p-6 text-white shadow-lg hover:border-hover">
        <div className="flex flex-col gap-6 md:flex-row">
          <Image src={cover} alt="game cover" className="h-[350px] w-[250px] flex-shrink-0 rounded-md" />

          <div className="flex flex-1 flex-col gap-2">
            <h1 className="text-design-white text-2xl font-bold">{game.name}</h1>

            <div className="flex flex-wrap gap-8 text-subtle">
              {game.developers?.[0]?.company?.name && (
                <IconAndText icon={<Building className="h-4 w-4" />} text={game.developers[0].company.name} />
              )}
              {game.publishers?.[0]?.company?.name && (
                <IconAndText icon={<Newspaper className="h-4 w-4" />} text={game.publishers[0].company.name} />
              )}
            </div>

            <div className="rounded-xl py-2 text-subtle">
              {game.franchises?.[0]?.franchise.name && (
                <IconAndText icon={<Layers className="h-4 w-4" />} text={`${game.franchises[0].franchise.name}`} />
              )}
            </div>

            <div className="rounded-xl py-4">
              <p className="leading-relaxed text-gray-200">{game.summary}</p>
            </div>

            <Tags />

            <div className="flex flex-wrap gap-4 py-4">
              {scores.map(
                ({ label, value, Icon }) =>
                  value &&
                  value > 0 && (
                    <div
                      key={label}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold ${getScoreColor(value)}`}
                    >
                      {label}: {value ?? "--"}
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
