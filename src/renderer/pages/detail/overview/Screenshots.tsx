import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGames } from "@/context/DatabaseContext";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
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
    <Card title={""}>
      <Carousel
        className="mx-auto flex w-[90%] items-center justify-center"
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent className="min-h-48">
          {screenshots.map((screenshot, index) => (
            <CarouselItem key={index} className="md:basis-1/3">
              <img
                src={screenshot}
                alt="Image"
                className="max-w-1/2 min-h-[96px] rounded-md object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </Card>
  );
};
