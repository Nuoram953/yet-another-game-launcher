import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";

interface Props {
  children: any;
}

export const Background = ({ children }: Props) => {
  const [backgroundPictures, setBackgroundPictures] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIndex, setFadeIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPictures = async () => {
      try {
        const backgrounds = await window.media.getBackgrounds(selectedGame!.id);
        if (backgrounds.length > 0) {
          setBackgroundPictures(backgrounds);
        }
      } catch (error) {
        console.error("Error fetching picture paths:", error);
      }
    };

    fetchBackgroundPictures();
  }, [selectedGame]);

  useEffect(() => {
    if (backgroundPictures.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % backgroundPictures.length;
        setFadeIndex(nextIndex);
        setIsFading(true);

        setTimeout(() => {
          setCurrentIndex(nextIndex);
          setIsFading(false);
        }, 900);
      }, 12000);

      return () => clearInterval(interval);
    }
  }, [backgroundPictures, currentIndex]);

  if (backgroundPictures.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-64 animate-pulse rounded-xl bg-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="relative flex h-96 transform items-center justify-evenly gap-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${backgroundPictures[currentIndex]})`,
          backgroundAttachment: "fixed",
          opacity: isFading ? 0.99 : 1,
        }}
      />

      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${backgroundPictures[fadeIndex]})`,
          backgroundAttachment: "fixed",
          opacity: isFading ? 1 : 0,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
};
