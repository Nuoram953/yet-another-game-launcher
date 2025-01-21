import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const GameCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample featured games data
  const featuredGames = [
    {
      id: 1,
      title: "Elden Ring",
      description: "An epic action RPG set in a vast world",
      imageUrl: "/api/placeholder/800/400"
    },
    {
      id: 2,
      title: "God of War Ragnarök",
      description: "Continue the Norse saga in this epic adventure",
      imageUrl: "/api/placeholder/800/400"
    },
    {
      id: 3,
      title: "Horizon Forbidden West",
      description: "Explore a vibrant, post-apocalyptic world",
      imageUrl: "/api/placeholder/800/400"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === featuredGames.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredGames.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full mx-auto mb-8">
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {featuredGames.map((game, index) => (
            <div
              key={game.id}
              className="absolute w-full h-full"
              style={{ left: `${index * 100}%` }}
            >
              <img
                src={game.imageUrl}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <h2 className="text-4xl font-bold text-white mb-2">{game.title}</h2>
                <p className="text-lg text-gray-200">{game.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
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
          {featuredGames.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameCarousel;
