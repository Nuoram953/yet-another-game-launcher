import VideoPlayer from "@/components/VideoPlayer";
import React, { useEffect, useState } from "react";

interface Props {
  gameId: string;
}

export const Trailer = ({ gameId }: Props) => {
  const [trailer, setTrailer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logo = await window.ressource.getSingleTrailer(gameId);
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
