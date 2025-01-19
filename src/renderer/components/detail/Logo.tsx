import React, { useEffect, useState } from "react";

interface Props {
  gameId: string;
  size: number
}

export const Logo = ({ gameId, size }: Props) => {
  const [LogoPicture, setLogoPicture] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogoPicture = async () => {
      try {
        const logo = await window.ressource.getSingleLogo(gameId);
        setLogoPicture(logo);
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
      <img src={LogoPicture} />
  );
};
