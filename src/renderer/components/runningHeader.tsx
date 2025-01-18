import { ArrowDownToLine, Terminal } from "lucide-react";
import { Badge } from "../ui/badge";
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Game } from "@prisma/client";
import { ImageWithFallback } from "./cover/cover";

interface Props {
  game: Game;
}

export const RunningHeader = ({ game }: Props) => {
  const [picturePath, setPicturePath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const directory = await window.api.getStoredPicturesDirectory(
          "c2e8898a-e05e-4b71-827d-90f78ad31903",
        );
        setPicturePath(directory);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, [game]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Alert className="rounded-none border-x-0">
      <div className="flex justify-between">
        <div className="flex flew-col gap-4">
          <img
            src={`file://${picturePath}`}
            className={"rounded-xl h-32 w-24"}
          />
          <h1 className="text-xl">The last of us</h1>
        </div>
        <p>12:37</p>
        <p>close</p>
      </div>
    </Alert>
  );
};
