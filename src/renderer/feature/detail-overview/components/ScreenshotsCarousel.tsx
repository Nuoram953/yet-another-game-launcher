import { useQuery } from "@tanstack/react-query";
import useGameStore from "@render/feature/detail/store/GameStore";
import { getScreenshots } from "../api/DetailOverviewApi";
import { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { Image } from "@render/components/image/Image";

export const ScreenshotsCarousel = () => {
  const game = useGameStore((state) => state.game);
  const [activeScreenshot, setActiveScreenshot] = useState<string>("");
  const filmstripRef = useRef(null);

  const { data, isPending } = useQuery({
    queryKey: ["screenshots", game.id],
    queryFn: () => {
      const screenshots = getScreenshots(game.id);
      setActiveScreenshot(screenshots[0]);
      return screenshots;
    },
    gcTime: 0,
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  const scrollFilmstrip = (direction) => {
    if (filmstripRef.current) {
      const scrollAmount = 200;
      const currentScroll = filmstripRef.current.scrollLeft;
      const newScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;

      filmstripRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  const canScrollLeft = filmstripRef.current?.scrollLeft > 0;
  const canScrollRight =
    filmstripRef.current?.scrollLeft < filmstripRef.current?.scrollWidth - filmstripRef.current?.clientWidth;

  return (
    <div className="">
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-2xl">
          <Image
            src={activeScreenshot ?? data[0]}
            alt={activeScreenshot ?? data[0]}
            className="h-160 w-full object-cover transition-all duration-500"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
            <div className="flex items-center gap-4 text-gray-300">
              <span className="text-sm">
                {data.findIndex((s) => s === (activeScreenshot ?? data[0])) + 1} of {data.length}
              </span>
              <div className="flex gap-1">
                {data.map((screenshot) => (
                  <div
                    key={screenshot}
                    className={`h-1 w-2 rounded-full transition-all duration-200 ${
                      (activeScreenshot ?? data[0] === screenshot) ? "w-8 bg-blue-400" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollFilmstrip("left")}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-lg bg-black/70 p-3 backdrop-blur-sm transition-all duration-200 hover:bg-black/90"
          disabled={!canScrollLeft}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div
          ref={filmstripRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto px-12 py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={() => {
            setActiveScreenshot((prev) => prev);
          }}
        >
          {data.map((screenshot) => (
            <div
              key={screenshot}
              className={`relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-300 ${
                activeScreenshot === screenshot
                  ? "ring-3 scale-105 shadow-xl ring-blue-400"
                  : "hover:scale-102 opacity-80 hover:opacity-100 hover:ring-2 hover:ring-gray-400"
              }`}
              onClick={() => setActiveScreenshot(screenshot)}
            >
              <Image src={screenshot} alt={screenshot} className="h-28 w-48 object-cover" />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollFilmstrip("right")}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-l-lg bg-black/70 p-3 backdrop-blur-sm transition-all duration-200 hover:bg-black/90"
          disabled={!canScrollRight}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
