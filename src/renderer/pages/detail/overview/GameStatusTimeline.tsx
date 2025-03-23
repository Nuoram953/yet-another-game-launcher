import { Card } from "@/components/card/Card";
import { useGames } from "@/context/DatabaseContext";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

//status
//achievements
//installed?

export const GameStatusTimeline = () => {
  // Mock data and hooks
  const {selectedGame}=useGames()
  const t = (str) => str; // Mock translation function
  const timelineRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    // We're not setting a fixed minimum width anymore since we want it to truncate
    // to fit the parent container width
    if (selectedGame?.statusHistory && selectedGame.statusHistory.length > 0) {
      // Get the parent container width if needed for calculations
      const parentWidth = timelineRef.current?.parentElement?.clientWidth || 0;
      setTimelineWidth(parentWidth);

      // Set a minimum width based on the number of status items to ensure scrolling works
      const statusCount = selectedGame.statusHistory.length;
      if (statusCount > 3) {
        // Reset the timeline width to allow for scrolling when there are many items
        setTimelineWidth(statusCount * 150);
      }
    }
  }, [selectedGame?.statusHistory]);

  // Check if scrolling is possible
  const checkScrollable = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollWidth > container.clientWidth &&
          container.scrollLeft < container.scrollWidth - container.clientWidth,
      );
    }
  };

  // Add scroll listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollable);
      window.addEventListener("resize", checkScrollable);

      // Initial check
      checkScrollable();

      return () => {
        container.removeEventListener("scroll", checkScrollable);
        window.removeEventListener("resize", checkScrollable);
      };
    }
  }, [selectedGame?.statusHistory]);

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Color mapping for status indicators
  const getColorClasses = (color, isCurrent = false) => {
    const colorMap = {
      amber: "bg-amber-200",
      orange: "bg-orange-200",
      blue: "bg-blue-200",
      green: "bg-green-200",
      red: "bg-red-200",
      purple: "bg-purple-200",
    };
    return colorMap[color] || "bg-gray-200";
  };

  return (
    <Card title={""}>
      <div className="bg-gray-800 p-4 text-white">
        <h2 className="text-xl font-bold">Game Development Timeline</h2>
        <p className="text-gray-300">Latest updates on our game progress</p>
      </div>

      {/* Timeline navigation controls */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2">
        <button
          onClick={scrollLeft}
          className={`rounded-full p-2 ${canScrollLeft ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"}`}
          disabled={!canScrollLeft}
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-sm text-gray-500">Scroll Timeline</span>

        <button
          onClick={scrollRight}
          className={`rounded-full p-2 ${canScrollRight ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"}`}
          disabled={!canScrollRight}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Scrollable container with fixed max-width to match parent */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto scroll-smooth p-2"
      >
        {/* Timeline container that allows scrolling */}
        <div
          ref={timelineRef}
          className="p-4"
          style={{
            width: timelineWidth > 0 ? `${timelineWidth}px` : "100%",
            minWidth: "100%",
          }}
        >
          <div className="flex flex-col">
            {/* Timeline bar as a separate div */}
            <div className="mx-4 my-8 h-1 bg-gray-300"></div>

            {/* Status points container - flex with equal spacing */}
            <div className="-mt-16 flex overflow-hidden">
              {selectedGame?.statusHistory?.map((item, index) => (
                <div
                  key={item.id}
                  className="mx-2 flex flex-1 flex-col items-center px-2"
                >
                  {/* Status dot */}
                  <div
                    className={`h-8 w-8 rounded-full ${getColorClasses("amber", true)} flex items-center justify-center border-2 border-gray-400`}
                  >
                    <span className="font-bold text-gray-800">{index + 1}</span>
                  </div>

                  {/* Status cards with truncation for text overflow */}
                  <div
                    className={`max-w-48 w-full rounded-lg border bg-white p-3 shadow-md ${index % 2 === 0 ? "mt-4" : "mt-16"}`}
                  >
                    <div className="mb-1 flex items-center">
                      <h3 className="w-full truncate text-sm font-semibold text-black">
                        {t(item.gameStatus.name)}
                      </h3>
                    </div>

                    {/* Date information */}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar size={12} className="mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
