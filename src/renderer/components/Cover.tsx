import React, { useEffect, useState } from "react";
import {
  Card,
  CardFooter,
} from "./ui/card";

const Cover: React.FC<{ fileName: string }> = ({ fileName }) => {
  const [picturePath, setPicturePath] = useState<string | null>(null);

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
      //const result = await window.api.runCommand(`steam steam://rungameid/1888930`);
    } catch (err) {}
  };

  if (!picturePath) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <img src={`file://${picturePath}`} className="rounded-xl rounded-b-none"/>
      <CardFooter className="flex flex-col align-middle py-2">
        <p>The Last of Us Past 1</p>
        <p>3h 32m • Playing</p>
      </CardFooter>
    </Card>
  );
};

export default Cover;
