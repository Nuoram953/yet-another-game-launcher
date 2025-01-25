import VideoPlayer from "@/components/VideoPlayer";
import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";

export const Trailer = () => {
  const [trailer, setTrailer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logo = await window.ressource.getSingleTrailer(selectedGame.id);
        setTrailer(logo);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="aspect-video max-h-[1080px] max-w-[1500px] mx-auto">
      <VideoPlayer path={trailer} />
    </div>
  );
};
