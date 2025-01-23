import { Play } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";
import { Game } from "@prisma/client";

interface Props {
  game: Game;
}

export const ButtonPlay = ({ game }: Props) => {
  const handleOnClick = async () => {
    await window.steam.launch(game.externalId);
  };

  return (
    <Button
      size="lg"
      className="bg-green-600 hover:bg-green-500 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
      onClick={handleOnClick}
    >
      <Play className="mr-2 h-5 w-5 animate-pulse" />
      Play Now
    </Button>
  );
};
