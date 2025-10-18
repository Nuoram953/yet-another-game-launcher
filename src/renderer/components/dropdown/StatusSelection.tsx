import React, { useEffect, useState } from "react";
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
import { Badge } from "../new/badge/Badge";

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
      playing: "bg-[#2b7fff]/75 border-[#2b7fff] hover:bg-[#2b7fff]",
      played: "bg-[#efb100]/75 border-[#efb100] hover:bg-[#efb100]",
      plan: "bg-[#ad46ff]/75 border-[#ad46ff] hover:bg-[#ad46ff]",
      dropped: "bg-[#fb2c36]/75 border-[#fb2c36] hover:bg-[#fb2c36]",
      completed: "bg-[#00c951]/75 border-[#00c951] hover:bg-[#00c951]",
    };
    return colors[status] || "bg-design-status-none";
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
        <Badge text={t(selectedOption)} className={`cursor-pointer ${getStatusColor(selectedOption)} ` + className} />
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
