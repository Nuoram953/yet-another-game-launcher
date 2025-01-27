import { Game } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PlayIcon, Settings } from "lucide-react";
import { Badge } from "../ui/badge";
import VideoPlayer from "../VideoPlayer";
import { ImageWithFallback } from "../cover/cover";
import { useGames } from "@/context/DatabaseContext";

export const Info = () => {
  const [cover, setCover] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const cover = await window.api.getStoredPicturesDirectory(
          selectedGame.id,
        );

        setCover(cover);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, [selectedGame]);

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div className="flex flex-row h-fit">
      <div className="w-1/3 py-6">
        <ImageWithFallback src={`file://${cover}`} />
      </div>
      <div className="flex flex-col w-2/3 px-6">
        <h1 className="text-5xl font-bold ">{selectedGame.name}</h1>

        <p className="">{selectedGame.summary}</p>

        <p className="font-bold">Genres</p>
        <div>
          {selectedGame.tags
            .filter((tag) => tag.isGenre)
            .map((item) => (
              <Badge className="h-fit mx-1">{item.tag.name}</Badge>
            ))}
        </div>

        <p className="font-bold">Themes</p>
        <div>
          {selectedGame.tags
            .filter((tag) => tag.isTheme)
            .map((item) => (
              <Badge className="h-fit mx-1">{item.tag.name}</Badge>
            ))}
        </div>
      </div>
    </div>
  );
};
