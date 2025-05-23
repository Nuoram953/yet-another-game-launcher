import React, { useEffect, useState } from "react";
import { Badge } from "@render//components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@render//components/ui/dropdown-menu";
import { useGames } from "@render//context/DatabaseContext";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Game, GameStatus } from "@prisma/client";
import { GameWithRelations } from "../../../common/types";

interface Props {
  className?: string;
  game?: GameWithRelations;
}

const BadgeDropdown = ({ className, game }: Props) => {
  const [status, setStatus] = useState<GameStatus[]>([]);
  const { selectedGame } = useGames();
  const [currentGame, setCurrentGame] = useState(_.isUndefined(game) ? selectedGame : game);

  if (!currentGame) {
    return;
  }
  const { t } = useTranslation("GameStatus");
  const [selectedOption, setSelectedOption] = useState<string>(currentGame.gameStatus.name);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.library.getStatus();
        setStatus(data);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      playing: "bg-blue-500",
      played: "bg-yellow-500",
      planned: "bg-purple-500",
      dropped: "bg-red-500",
      completed: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const handleOptionSelect = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const newStatus = status.find((item) => item.name == name);
    const data: Partial<Game> = {
      id: currentGame.id,
      gameStatusId: newStatus!.id,
    };
    window.game.setStatus(data);
    setSelectedOption(name);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <Badge
          className={`cursor-pointer hover:bg-primary/80 ${getStatusColor(selectedOption)} ` + className}
          variant="default"
        >
          {t(selectedOption)}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={className}>
        {status.map((item) => (
          <DropdownMenuItem onClick={(e) => handleOptionSelect(e, item.name)}>{t(item.name)}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BadgeDropdown;
