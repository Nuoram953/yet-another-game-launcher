import React, { useEffect, useState } from "react";

interface Props {
  gameId: string;
  children: any;
}

export const Background = ({ gameId, children }: Props) => {
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
    <div
      className="relative h-96 bg-cover bg-center transform transition-transform duration-700 hover:scale-[1.02]"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${backgroundPicture})`,
        backgroundAttachment: "fixed",
      }}
    >
      {children}
    </div>
  );
};
