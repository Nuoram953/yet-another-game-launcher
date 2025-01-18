import React, { useEffect, useState } from "react";
import { Alert } from "./ui/alert";
import { Game } from "@prisma/client";
import { Button } from "./ui/button";

interface Props {
  game: Game;
}

export const RunningHeader = ({ game }: Props) => {
  const [picturePath, setPicturePath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const directory = await window.api.getStoredPicturesDirectory(game.id);
        setPicturePath(directory);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, [game]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Alert className="rounded-none border-x-0">
      <div className="flex justify-between items-center content-center">
        <div className="flex flew-col gap-4">
          <img
            src={`file://${picturePath}`}
            className={"rounded-xl h-32 w-24"}
          />
          <h1 className="text-xl">{game.name}</h1>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <p className="text-center text-xl text-white font-bold">Current session: </p>
          <p className="text-5xl text-white font-bold">{minutes}</p>
          <p className="text-xl text-white font-bold">mins.</p>
        </div>
        <Button variant="destructive">Stop game</Button>
      </div>
    </Alert>
  );
};
