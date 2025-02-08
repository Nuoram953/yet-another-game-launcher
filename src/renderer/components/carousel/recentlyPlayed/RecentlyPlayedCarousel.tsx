import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { RecentlyPlayedCarouselItem } from "./RecentlyPlayedItem";
import { Game } from "@prisma/client";

export const RecentlyPlayedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
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
      setCurrentIndex((prevIndex) =>
        prevIndex === recentGames.length - 1 ? 0 : prevIndex + 1,
      );
    }, 15000);

    return () => clearInterval(timer);
  }, [recentGames]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === recentGames.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? recentGames.length - 1 : prevIndex - 1,
    );
  };

  return (
    <div className="relative w-full mx-auto mb-8">
      <div className="relative h-[24rem] overflow-hidden">
        <div
          className="absolute w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {recentGames.map((game, index) => (
            <RecentlyPlayedCarouselItem game={game} index={index} />
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {recentGames.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
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
