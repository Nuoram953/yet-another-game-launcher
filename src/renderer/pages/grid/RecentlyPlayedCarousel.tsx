import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { RecentlyPlayedCarouselItem } from "./RecentlyPlayedItem";
import { Game } from "@prisma/client";
import { GameWithRelations } from "src/common/types";
import { Skeleton } from "@render/components/ui/skeleton";
import Button from "@render/components/new/button/Button";

export const RecentlyPlayedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentGames, setRecentGames] = useState<GameWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await window.library.getLastPlayed(10);
        setRecentGames(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === recentGames.length - 1 ? 0 : prevIndex + 1));
    }, 15000);

    return () => clearInterval(timer);
  }, [recentGames]);

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === recentGames.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? recentGames.length - 1 : prevIndex - 1));
  };

  return (
    <div className="relative mx-auto w-full">
      <div className="relative h-[30rem] overflow-hidden">
        <div
          className="absolute h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {recentGames.map((game, index) => (
            <RecentlyPlayedCarouselItem game={game} index={index} />
          ))}
        </div>

        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Button
            intent="tertiary"
            leadingIcon={<ChevronLeft />}
            onClick={prevSlide}
            aria-label="Prev slide"
            className="!rounded-full"
          />
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button
            intent="tertiary"
            leadingIcon={<ChevronRight />}
            onClick={nextSlide}
            aria-label="Next slide"
            className="!rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
