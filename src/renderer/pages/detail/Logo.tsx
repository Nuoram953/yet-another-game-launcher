import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";

export const Logo = () => {
  const [LogoPicture, setLogoPicture] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const {selectedGame} = useGames()

  useEffect(() => {
    const fetchLogoPicture = async () => {
      try {
        const logos = await window.media.getLogos(selectedGame!.id, 1);
        setLogoPicture(logos[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchLogoPicture();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <img
      src={LogoPicture}
      alt={`game name logo`}
      className="max-h-32 object-contain transform hover:scale-105 transition-transform duration-300"
    />
  );
};
