import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/card/Card";
import Autoplay from "embla-carousel-autoplay";

export const Screenshots = () => {
  const [loading, setLoading] = useState(true);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const { selectedGame } = useGames();

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
        <Card title={""}>
          <Carousel
            className="mx-auto flex items-center justify-center"
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
          >
            <CarouselContent className="min-h-48">
              {screenshots.map((screenshot, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <img
                    src={screenshot}
                    alt="Image"
                    className="h-[150px] w-[300px] rounded-md object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </Card>
      )}
    </>
  );
};
