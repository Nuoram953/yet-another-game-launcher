import React, { useEffect, useState } from "react";
import { Card, CardFooter } from "./ui/card";
import { ArrowDownToLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cover: React.FC<{ fileName: string }> = ({ fileName }) => {
  const [picturePath, setPicturePath] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const directory = await window.api.getStoredPicturesDirectory();
        setPicturePath(`${directory}/${fileName}`);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, [fileName]);

  const handleRunCommand = async () => {
    try {
      navigate(`/game/${188930}`)
      //const result = await window.api.runCommand(`steam steam://rungameid/1888930`);
    } catch (err) {}
  };

  if (!picturePath) {
    return <div>Loading...</div>;
  }

  return (
    <Card onClick={handleRunCommand}>
      <img
        src={`file://${picturePath}`}
        className="rounded-xl rounded-b-none"
      />
      <CardFooter className="flex flex-row align-middle py-2 justify-around">
        <div className="flex flex-col">
          <p>The Last of Us Past 1</p>
          <p>3h 32m • Playing</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Cover;
