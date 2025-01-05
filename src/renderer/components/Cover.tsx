import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
};

export default Cover;
