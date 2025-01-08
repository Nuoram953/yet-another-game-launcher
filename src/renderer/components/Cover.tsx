import React, { useEffect, useState } from "react";
import { Card, CardFooter } from "./ui/card";
import { ArrowDownToLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IGame } from "src/common/types";
import { convertToHoursAndMinutes } from "@/utils/util";

const Cover: React.FC<{ game: IGame }> = ({ game }) => {
  const [picturePath, setPicturePath] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        console.log(game)
        const directory = await window.api.getStoredPicturesDirectory(game.id);
        setPicturePath(`${directory}/cover_1.jpg`);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, [game.name]);

  const handleRunCommand = async () => {
    try {
      navigate(`/game/${188930}`);
      //const result = await window.api.runCommand(`steam steam://rungameid/1888930`);
    } catch (err) {}
  };

  if (!picturePath) {
    return <div>Loading...</div>;
  }

  return (
    <Card onClick={handleRunCommand} className="w-full">
      <ImageWithFallback
        src={`file://${picturePath}`}
      />
      <CardFooter className="flex flex-row align-middle py-2 justify-around">
        <div className="flex flex-col truncate w-wull text-center">
          <p className="truncate w-full text-center">{game.name}</p>
          <p>
            {`${game.timePlayed > 0 ? convertToHoursAndMinutes(game.timePlayed) + " • " : ""} ${game.status}`}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

const ImageWithFallback = ({ src, alt, style }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        ...style,
        display: "inline-block",
        backgroundColor: hasError ? "grey" : "transparent",
      }}
      className="rounded-xl rounded-b-none w-full"
    >
      {!hasError && (
        <img
          src={src}
          alt={alt}
          style={{ display: "block", ...style }}
          onError={() => setHasError(true)}
          className="rounded-xl rounded-b-none w-full"
        />
      )}
    </div>
  );
};

export default Cover;
