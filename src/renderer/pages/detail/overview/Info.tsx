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
    return "text-design-text-error";
  };

  const developer = selectedGame?.developers?.length ? selectedGame.developers[0].company.name : "Unknown";
  const publisher = selectedGame?.publishers?.length ? selectedGame.publishers[0].company.name : "Unknown";

  const renderGenres = () => {
    const genres = selectedGame?.tags?.filter((tag) => tag.isGenre) || [];
    return genres.map((genre) => (
      <Badge
        key={genre.tag.name}
        variant="outline"
        className="border-none bg-design-badge-background px-3 py-1 text-design-text-normal hover:bg-design-badge-hover"
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
        className="border-none bg-design-badge-background px-3 py-1 text-design-text-normal hover:bg-design-badge-hover"
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
        className="border-none bg-design-badge-background px-3 py-1 text-design-text-normal hover:bg-design-badge-hover"
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
      <div className="h-fit bg-design-background bg-opacity-50" />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex flex-row items-center">
            <h1 className="text-3xl font-bold">{selectedGame.name}</h1>
            <span className="inline-block rounded px-2 py-1 text-xs font-medium">{getReleaseYear()}</span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Building size={16} className="text-design-text-subtle" />
              <span className="text-sm text-design-text-subtle">{developer}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-design-text-subtle" />
              <span className="text-sm text-design-text-subtle">{publisher}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Image src={`./icons/${selectedGame.storefront.name}.png`} alt={""} height={24} width={24} />
              <span className="text-sm text-design-text-subtle">
                {t(`storefront.${selectedGame.storefront.name}`, { ns: LOCALE_NAMESPACE.COMMON })}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-row gap-4">
        {selectedGame.scoreCritic && (
          <div className="rounded-lg p-4 transition-all">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                <Star className={`${getScoreColor(selectedGame.scoreCritic ?? 0)}`} size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(selectedGame.scoreCritic ?? 0)}`}>
                    {selectedGame.scoreCritic || "N/A"}
                  </span>
                  <span className="text-xs text-design-text-subtle">/100</span>
                </div>
                <div className="mt-1">
                  <Progress value={scoreAnimation} className="h-1 w-24" />
                </div>
                <div className="mt-1 text-xs text-design-text-subtle">Critic Score</div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg p-4 transition-all">
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
