import React, { useEffect } from "react";
import { useState } from "react";
import { Game } from "@prisma/client";

interface Props {
  index: number;
  game: Game;
}

export const RecentlyPlayedCarouselItem = ({ index, game }: Props) => {
  const [backgroundPicture, setBackgroundPicture] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.ressource.getSingleBackground(game.id);
        setBackgroundPicture(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      key={game.id}
      className="absolute w-full h-full"
      style={{ left: `${index * 100}%` }}
    >
      <img
        src={backgroundPicture}
        alt={game.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
        <h2 className="text-4xl font-bold text-white mb-2">{game.name}</h2>
      </div>
    </div>
  );
};
