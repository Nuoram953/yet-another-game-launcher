

import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";

export const SectionSettings = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        const ressources = await window.ressource.getAll(selectedGame.id);
        console.log(ressources);
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

  return <div></div>;
};
