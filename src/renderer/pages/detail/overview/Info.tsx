import { useState, useEffect } from "react";
import { Badge } from "@render//components/ui/badge";
import { Star, Calendar, Users, Building, Heart, Share2, BookOpen, RefreshCcw, Trash } from "lucide-react";
import { useGames } from "@render//context/DatabaseContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@render//components/ui/tooltip";
import { Progress } from "@render//components/ui/progress";
import React from "react";
import { Card } from "@render//components/card/Card";
import { Image } from "@render/components/image/Image";
import { useTranslation } from "react-i18next";
import { LOCALE_NAMESPACE } from "@common/constant";

const GameInfo = () => {
  const { selectedGame } = useGames();
  const [isFavorite, setIsFavorite] = useState(selectedGame?.isFavorite || false);
  const [scoreAnimation, setScoreAnimation] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (selectedGame?.scoreCritic) {
      const timer = setTimeout(() => {
        setScoreAnimation(selectedGame.scoreCritic ?? 0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedGame?.scoreCritic]);

  if (!selectedGame) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shadow-xl">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-2xl font-bold">No Game Selected</h3>
          <p className="text-gray-400">Select a game from your library to view details</p>
        </div>
      </div>
    );
  }

  const getReleaseYear = () => {
    return new Date(selectedGame?.releasedAt).getFullYear();
  };

  const toggleFavorite = () => {
    window.game.setFavorite({ id: selectedGame.id, isFavorite: !selectedGame.isFavorite });
    setIsFavorite(!isFavorite);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const developer = selectedGame?.developers?.length ? selectedGame.developers[0].company.name : "Unknown";
  const publisher = selectedGame?.publishers?.length ? selectedGame.publishers[0].company.name : "Unknown";

  const renderGenres = () => {
    const genres = selectedGame?.tags?.filter((tag) => tag.isGenre) || [];
    return genres.map((genre) => (
      <Badge
        key={genre.tag.name}
        variant="outline"
        className="border-none bg-gray-700 px-3 py-1 text-gray-200 hover:bg-gray-600"
      >
        {genre.tag.name}
      </Badge>
    ));
  };

  const renderThemes = () => {
    const themes = selectedGame?.tags?.filter((tag) => tag.isTheme) || [];
    return themes.map((theme) => (
      <Badge
        key={theme.tag.name}
        variant="outline"
        className="border-none bg-gray-700 px-3 py-1 text-gray-200 hover:bg-gray-600"
      >
        {theme.tag.name}
      </Badge>
    ));
  };

  const renderGameMode = () => {
    const gameModes = selectedGame?.tags?.filter((tag) => tag.isGameMode) || [];
    return gameModes.map((theme) => (
      <Badge
        key={theme.tag.name}
        variant="outline"
        className="border-none bg-gray-700 px-3 py-1 text-gray-200 hover:bg-gray-600"
      >
        {theme.tag.name}
      </Badge>
    ));
  };

  const formattedDate = new Date(selectedGame?.releasedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card
      title={"Details"}
      actions={[
        {
          icon: RefreshCcw,
          name: "Refresh",
          onClick: async () => {
            await window.game.refreshInfo(selectedGame.id);
          },
        },
        {
          icon: Trash,
          name: "Uninstall",
          onClick: async () => {
            await window.game.uninstall(selectedGame.id);
          },
          disabled: !selectedGame.isInstalled,
        },
      ]}
    >
      <div className="h-fit bg-gray-800 bg-opacity-50" />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex flex-row items-center">
            <h1 className="text-3xl font-bold">{selectedGame.name}</h1>
            <span className="inline-block rounded bg-gray-800 px-2 py-1 text-xs font-medium">{getReleaseYear()}</span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Building size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">{developer}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">{publisher}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Image src={`./icons/${selectedGame.storefront.name}.png`} alt={""} height={24} width={24} />
              <span className="text-sm text-gray-300">
                {t(`storefront.${selectedGame.storefront.name}`, { ns: LOCALE_NAMESPACE.COMMON })}
              </span>
            </div>
          </div>
        </div>

        {/* <div className="flex gap-2"> */}
        {/*   <TooltipProvider> */}
        {/*     <Tooltip> */}
        {/*       <TooltipTrigger asChild> */}
        {/*         <button */}
        {/*           onClick={toggleFavorite} */}
        {/*           className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700 ${ */}
        {/*             isFavorite ? "text-red-500" : "text-gray-400" */}
        {/*           }`} */}
        {/*         > */}
        {/*           <Heart size={18} fill={isFavorite ? "currentColor" : "none"} /> */}
        {/*         </button> */}
        {/*       </TooltipTrigger> */}
        {/*       <TooltipContent side="bottom"> */}
        {/*         <p>{selectedGame.isFavorite ? "Remove from favorites" : "Add to favorites"}</p> */}
        {/*       </TooltipContent> */}
        {/*     </Tooltip> */}
        {/*   </TooltipProvider> */}
        {/* </div> */}
      </div>
      <div className="mt-6 flex flex-row gap-4">
        {selectedGame.scoreCritic && (
          <div className="rounded-lg bg-gray-800 p-4 transition-all hover:bg-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                <Star className={`${getScoreColor(selectedGame.scoreCritic ?? 0)}`} size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(selectedGame.scoreCritic ?? 0)}`}>
                    {selectedGame.scoreCritic || "N/A"}
                  </span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
                <div className="mt-1">
                  <Progress value={scoreAnimation} className="h-1 w-24" />
                </div>
                <div className="mt-1 text-xs text-gray-400">Critic Score</div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-gray-800 p-4 transition-all hover:bg-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
              <Calendar className="text-blue-400" size={20} />
            </div>
            <div>
              <div className="text-lg font-semibold">{formattedDate}</div>
              <div className="mt-1 text-xs text-gray-400">Release Date</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div>
          <h3 className="mb-2 text-lg font-medium text-gray-300">About</h3>
          <p className="leading-relaxed text-gray-400">{selectedGame.summary}</p>
        </div>
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-300">Genres</h3>
          <div className="flex flex-wrap gap-2">{renderGenres()}</div>
        </div>
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-300">Themes</h3>
          <div className="flex flex-wrap gap-2">{renderThemes()}</div>
        </div>
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-300">Game Modes</h3>
          <div className="flex flex-wrap gap-2">{renderGameMode()}</div>
        </div>
      </div>
    </Card>
  );
};

export default GameInfo;
