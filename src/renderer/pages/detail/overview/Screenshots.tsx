import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@render//components/ui/carousel";
import { useGames } from "@render//context/DatabaseContext";
import React, { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

export const Screenshots = () => {
  const [loading, setLoading] = useState(true);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const { selectedGame } = useGames();

  if (!selectedGame) {
    return null;
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await window.media.getScreenshots(selectedGame.id);
        setScreenshots(response);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {screenshots.length > 0 && (
        <Carousel className="mx-auto flex items-center justify-center" plugins={[]}>
          <CarouselContent className="overflow-x-auto">
            {screenshots.map((screenshot, index) => (
              <CarouselItem key={index} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <img
                  src={screenshot}
                  alt="Image"
                  className="h-[150px] w-[300px] rounded-md object-cover hover:border-2 hover:border-gray-200"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </>
  );
};
