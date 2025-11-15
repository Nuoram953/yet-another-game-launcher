import { useLastPlayed } from "./api/get-last-played";
import { useRotatingIndex } from "./hooks/useRotatingIndex";
import Button from "@render/components/new/button/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Item } from "./components/Item";
import { LoadingCenter } from "@render/components/new/loading/Loading";

export const HomeRecentCarousel = () => {
  const ITEMS = 10;
  const { index, next, prev, set } = useRotatingIndex(ITEMS);
  const lastPlayedQuery = useLastPlayed({ count: ITEMS });

  if (lastPlayedQuery.isFetching) {
    return <LoadingCenter />;
  }

  return (
    <div className="relative w-full">
      <div className="relative h-[30rem] overflow-hidden">
        <div
          className="absolute h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {lastPlayedQuery.data.map((game, index) => (
            <Item game={game} index={index} />
          ))}
        </div>

        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Button
            intent="tertiary"
            leadingIcon={<ChevronLeft />}
            onClick={prev}
            aria-label="Prev slide"
            className="!rounded-full"
          />
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button
            intent="tertiary"
            leadingIcon={<ChevronRight />}
            onClick={next}
            aria-label="Next slide"
            className="!rounded-full"
          />
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {lastPlayedQuery.data.map((_, idx) => (
            <Button
              key={idx}
              onClick={() => set(idx)}
              className={`h-2 w-2 rounded-full !p-0 transition-colors ${index === idx ? "bg-white" : "bg-white/50"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
