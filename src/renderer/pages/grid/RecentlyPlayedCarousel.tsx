import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { RecentlyPlayedCarouselItem } from "./RecentlyPlayedItem";
import { Game } from "@prisma/client";
import { GameWithRelations } from "src/common/types";
import { Skeleton } from "@render/components/ui/skeleton";

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
      <div className="relative h-[24rem] overflow-hidden">
        <div
          className="absolute h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {recentGames.map((game, index) => (
            <RecentlyPlayedCarouselItem game={game} index={index} />
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-design-text-normal transition-colors hover:bg-black/70"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-design-text-normal transition-colors hover:bg-black/70"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {recentGames.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
