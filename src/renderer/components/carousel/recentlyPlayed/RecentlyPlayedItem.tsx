import React, { useEffect } from "react";
import { useState } from "react";
import { Game } from "@prisma/client";
import { useNavigate } from "react-router-dom";

interface Props {
  index: number;
  game: Game;
}

export const RecentlyPlayedCarouselItem = ({ index, game }: Props) => {
  const [backgroundPicture, setBackgroundPicture] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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

  const handleOnClick = () => {
    navigate(`/game/${game.id}`, { replace: true });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      key={game.id}
      className="absolute h-full w-full transform cursor-pointer transition-transform duration-700 hover:scale-105"
      style={{ left: `${index * 100}%` }}
      onClick={handleOnClick}
    >
      <img
        src={backgroundPicture}
        alt={game.name}
        className="h-full w-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
        <h2 className="mb-2 text-4xl font-bold text-white">{game.name}</h2>
      </div>
    </div>
  );
};
