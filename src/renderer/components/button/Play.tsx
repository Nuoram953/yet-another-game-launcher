import { Play } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";
import { useGames } from "@/context/DatabaseContext";

export const ButtonPlay = () => {
  const { gameRunning, selectedGame } = useGames();

  const handleOnPlay = async () => {
    await window.steam.launch(selectedGame.externalId);
  };

  const handleOnStop = async () => {
    console.log("stop");
  };

  if (gameRunning.isRunning) {
    return (
      <Button
        size="lg"
        className="bg-blue-600 hover:bg-blue-500 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
        onClick={handleOnStop}
      >
        <Play className="mr-2 h-5 w-5 animate-pulse" />
        Stop
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="bg-green-600 hover:bg-green-500 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
      onClick={handleOnPlay}
    >
      <Play className="mr-2 h-5 w-5 animate-pulse" />
      Play Now
    </Button>
  );
};
