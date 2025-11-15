import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import useGameStore from "@render/feature/detail/store/GameStore";
import { getScreenshots } from "../api/DetailOverviewApi";
import { Image } from "@render/components/image/Image";
import Button from "@render/components/new/button/Button";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { useParams } from "@tanstack/react-router";
import { useGame } from "@render/api/get-game";

/**
 * Hook: true if viewport >= given width
 */
const useMinWidth = (width: number) => {
  const [matches, setMatches] = useState(
    typeof window !== "undefined" ? window.matchMedia(`(min-width: ${width}px)`).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${width}px)`);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [width]);

  return matches;
};

export const ScreenshotsCarousel = () => {
  const { id } = useParams({ from: "/game/$id" });

  const gameQuery = useGame({ gameId: id });

  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const filmstripRef = useRef<HTMLDivElement | null>(null);
  const [, forceUpdate] = useState(0);

  const isWide = useMinWidth(1000);
  const heroCount = isWide ? 4 : 1;

  const { data = [], isPending } = useQuery({
    queryKey: ["screenshots", id],
    queryFn: () => getScreenshots(id),
    gcTime: 0,
    onSuccess: (screenshots) => {
      if (screenshots.length) {
        setActiveScreenshot((prev) => prev ?? screenshots[0]);
      }
    },
  });

  if (gameQuery.isPending) {
    return <LoadingCenter />;
  }

  if (isPending || !data.length) {
    return <div>Loading...</div>;
  }

  const game = gameQuery.data;
  const activeIndex = data.findIndex((s) => s === (activeScreenshot ?? data[0]));

  const heroScreenshots = [data[activeIndex], ...data.filter((_, i) => i !== activeIndex)].slice(0, heroCount);

  const scrollFilmstrip = (direction: "left" | "right") => {
    if (!filmstripRef.current) return;

    filmstripRef.current.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  const canScrollLeft = filmstripRef.current ? filmstripRef.current.scrollLeft > 0 : false;

  const canScrollRight = filmstripRef.current
    ? filmstripRef.current.scrollLeft < filmstripRef.current.scrollWidth - filmstripRef.current.clientWidth
    : false;

  return (
    <div className="w-full">
      {/* ================= HERO ================= */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-2xl">
          <div className={`grid gap-2 ${isWide ? "grid-cols-2 grid-rows-2" : "grid-cols-1"}`}>
            {heroScreenshots.map((screenshot) => (
              <Image
                key={screenshot}
                src={screenshot}
                alt={screenshot}
                className="aspect-[5/3] w-full object-cover transition-all duration-500"
              />
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
            <span className="text-sm text-gray-300">
              {activeIndex + 1} of {data.length}
            </span>
          </div>
        </div>
      </div>

      {/* ================= FILMSTRIP ================= */}
      <div className="flex gap-2">
        <Button
          onClick={() => scrollFilmstrip("left")}
          disabled={!canScrollLeft}
          leadingIcon={<ChevronLeft />}
          intent="tertiary"
          className="my-auto h-1/2 items-center justify-center"
        />

        <div
          ref={filmstripRef}
          onScroll={() => forceUpdate((v) => v + 1)}
          className="scrollbar-hide flex gap-4 overflow-x-auto rounded-lg py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {data.map((screenshot) => (
            <button
              key={screenshot}
              onClick={() => setActiveScreenshot(screenshot)}
              className={`relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                screenshot === activeScreenshot
                  ? "scale-105 shadow-xl ring-2 ring-blue-400"
                  : "opacity-80 hover:scale-105 hover:opacity-100 hover:ring-2 hover:ring-gray-400"
              }`}
            >
              <Image src={screenshot} alt={screenshot} className="h-28 w-48 object-cover" />
            </button>
          ))}
        </div>

        <Button
          onClick={() => scrollFilmstrip("right")}
          disabled={!canScrollRight}
          leadingIcon={<ChevronRight />}
          intent="tertiary"
          className="my-auto h-1/2 items-center justify-center"
        />
      </div>
    </div>
  );
};
