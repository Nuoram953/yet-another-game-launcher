import { Game } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PlayIcon, Settings } from "lucide-react";
import { Badge } from "../ui/badge";
import VideoPlayer from "../VideoPlayer";
import { ImageWithFallback } from "../cover/cover";

interface Props {
  game: Game;
}

export const Info = ({ game }: Props) => {
  const [trailer, setTrailer] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const trailer = await window.ressource.getSingleTrailer(game.id);
        const cover = await window.api.getStoredPicturesDirectory(game.id);

        setTrailer(trailer);
        setCover(cover);

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
      <VideoPlayer path={trailer} />
      <div className="flex flex-row p-6">
        <div className="w-1/3 py-6">
          <ImageWithFallback src={`file://${cover}`} />
        </div>
        <div className="flex flex-col w-2/3 px-6">
          <h1 className="text-6xl font-bold ">{game.name}</h1>
          <h2 className="text-2xl font-bold pb-6">Naughty Dog</h2>

          <p className="">
            Game description Game descriptionGame descriptionGame
            descriptionGame descriptionGame descriptionGame descriptionGame
            descriptionGame descriptionGame descriptionGame descriptionGame
            descriptionGame descriptionGame descriptionGame descriptionGame
            descriptionGame descriptionGame descriptionGame descriptionGame
            descriptionGame description
          </p>

          <p className="font-bold ">Genres</p>
          <div className=" flex gap-2 h-fit">
            <Badge className="h-fit">Shooter</Badge>
            <Badge className="h-fit">Adventure</Badge>
          </div>

          <p className="font-bold ">Themes</p>
          <div className=" flex pt-2 gap-2">
            <Badge className="h-fit">Action</Badge>
            <Badge className="h-fit">Horror</Badge>
            <Badge className="h-fit">Survival</Badge>
            <Badge className="h-fit">Stealth</Badge>
          </div>

          <p className="font-bold ">Game Modes</p>
          <div className=" flex pt-2 gap-2">
            <Badge className="h-fit">Single player</Badge>
            <Badge className="h-fit">Multiplayer</Badge>
            <Badge className="h-fit">Co-operative</Badge>
          </div>

        </div>
      </div>
    </Card>
  );
};
