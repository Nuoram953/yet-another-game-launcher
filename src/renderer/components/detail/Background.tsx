import React, { useEffect, useState } from "react";

interface Props {
  gameId: string;
}

export const Background = ({ gameId }: Props) => {
  const [backgroundPicture, setBackgroundPicture] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        const background = await window.ressource.getSingleBackground(gameId);
        setBackgroundPicture(background);
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
    <div className="relative w-full h-full">
      <div
        className="w-full h-full absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundPicture})` }}
      />

      <div className="absolute inset-0">
        <div
          className="w-full h-full backdrop-blur-sm"
          style={{
            background: `linear-gradient(
        to bottom,
        transparent 33%,
        rgba(0, 0, 0, 0.0) 33%,
        rgba(0, 0, 0, 0.4) 50%,
        rgba(0, 0, 0, 0.6) 66%,
        rgba(0, 0, 0, 0.8) 80%,
        rgba(0, 0, 0, 0.9) 90%,
        rgba(0, 0, 0, 1) 100%
      )`,
          }}
        />
      </div>
    </div>
  );
};
