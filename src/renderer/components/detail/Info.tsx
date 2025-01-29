import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../cover/cover";
import { useGames } from "@/context/DatabaseContext";
import { Dna, Eye, Gamepad2, Palette } from "lucide-react";

export const Info = () => {
  const [cover, setCover] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const cover = await window.ressource.getSingleCover(selectedGame.id);

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

  const tags = [
    {
      name: "Genre",
      items: selectedGame.tags.filter((tag) => tag.isGenre),
      icon: Dna,
    },
    {
      name: "Themes",
      items: selectedGame.tags.filter((tag) => tag.isTheme),
      icon: Palette,
    },
    {
      name: "Game modes",
      items: selectedGame.tags.filter((tag) => tag.isGameMode),
      icon: Gamepad2,
    },
    {
      name: "Player perspective",
      items: selectedGame.tags.filter((tag) => tag.isPlayerPerspective),
      icon: Eye,
    },
  ];

  return (
    <div className="flex h-fit flex-row">
      <div className="w-1/3 py-6">
        <ImageWithFallback src={cover} />
      </div>
      <div className="flex w-2/3 flex-col px-6">
        <h1 className="text-5xl font-bold">{selectedGame.name}</h1>
        <p className="mt-2">{selectedGame.summary}</p>
        <div className="flex flex-col gap-6 mt-4">
          {tags.map((group) => (
            <div className="">
              <div className="flex flex-row gap-2">
                <group.icon />
                <p className="font-bold">{group.name}</p>
              </div>
              <div className="ml-1">
                {group.items.map((item) => (
                  <Badge className="mx-1 h-fit">{item.tag.name}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
