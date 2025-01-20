import { Game } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PlayIcon, Settings } from "lucide-react";
import { Badge } from "../ui/badge";
import VideoPlayer from "../VideoPlayer";

interface Props {
  game: Game;
}

export const Info = ({ game }: Props) => {
  const [picturePath, setPicturePath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const directory = await window.ressource.getSingleTrailer(game.id);

        setPicturePath(directory);
        console.log(picturePath);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, [game]);

  const handleOnClick = async () => {
    await window.steam.launch(game.externalId);
  };

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <Card className="flex flex-col m-6 bg-stone-700/30 backdrop-blur-md border-white/50 shadow-xl">
      <VideoPlayer path={picturePath} />
      <div className="flex flex-col  p-6">
        <h1 className="text-6xl font-bold ">{game.name}</h1>
        <h2 className="text-2xl font-bold pb-6">Naughty Dog</h2>

        <p className="">
          Game description Game descriptionGame descriptionGame descriptionGame
          descriptionGame descriptionGame descriptionGame descriptionGame
          descriptionGame descriptionGame descriptionGame descriptionGame
          descriptionGame descriptionGame descriptionGame descriptionGame
          descriptionGame descriptionGame descriptionGame descriptionGame
          description
        </p>

        <p className="font-bold mt-4">Genres</p>
        <div className="flex-1 flex pt-2 gap-2">
          <Badge>Shooter</Badge>
          <Badge>Adventure</Badge>
        </div>

        <p className="font-bold mt-1">Themes</p>
        <div className="flex-1 flex pt-2 gap-2">
          <Badge>Action</Badge>
          <Badge>Horror</Badge>
          <Badge>Survival</Badge>
          <Badge>Stealth</Badge>
        </div>

        <p className="font-bold mt-1">Game Modes</p>
        <div className="flex-1 flex pt-2 gap-2">
          <Badge>Single player</Badge>
          <Badge>Multiplayer</Badge>
          <Badge>Co-operative</Badge>
        </div>

        <div className="flex flex-row gap-2 mt-6">
          <Button
            onClick={handleOnClick}
            className="flex items-center gap-2 bg-green-600 text-white"
          >
            <PlayIcon className="w-4 h-4" color="white" />
            Play
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Manage
          </Button>
        </div>
      </div>
    </Card>
  );
};
