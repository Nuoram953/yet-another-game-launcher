import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";

interface Props {
  children: any;
}

export const Background = ({ children }: Props) => {
  const [backgroundPicture, setBackgroundPicture] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        const backgrounds = await window.media.getBackgrounds(selectedGame!.id);
        setBackgroundPicture(backgrounds[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchBackgroundPicture();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex h-96 transform items-center justify-evenly bg-cover bg-center transition-transform duration-700 hover:scale-[1.02] gap-32"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${backgroundPicture})`,
        backgroundAttachment: "fixed",
      }}
    >
      {children}
    </div>
  );
};
