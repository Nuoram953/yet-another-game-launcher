import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { ImageWithFallback } from "../cover/cover";

interface Props {
  size: number;
}

export const CarouselRecentlyPlayed = ({ size }: Props) => {
  const [GameBackgrounds, setGameBackgrounds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogoPicture = async () => {
      try {
        const pictures =
          await window.ressource.getRecentlyPlayedBackgrounds(size);
        console.log(pictures);
        setGameBackgrounds(pictures);
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
    <Carousel className="!h-full">
      <CarouselContent>
        {GameBackgrounds.map((background) => (
          <CarouselItem>
            <ImageWithFallback src={background} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
