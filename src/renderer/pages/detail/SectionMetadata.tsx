import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";

export const SectionMetadata = () => {
  const [media, setMedia] = useState<object>();
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        const data = await window.media.getAllMedia(selectedGame!.id);
        setMedia(data);
        console.log(data);
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
    <div className="flex flex-col">
      <h1>backgrounds</h1>

      <div className="flex flex-row gap-4">
        {media.backgrounds.map((item) => (
          <img src={item} className="h-45 w-45" />
        ))}
      </div>
    </div>
  );
};
