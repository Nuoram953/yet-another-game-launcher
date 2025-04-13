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
        const trailers = await window.media.getTrailers(selectedGame!.id);
        setTrailer(trailers[0]);
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
    <div className="aspect-video max-h-[1080px] mx-auto">
      <VideoPlayer path={trailer} />
    </div>
  );
};
