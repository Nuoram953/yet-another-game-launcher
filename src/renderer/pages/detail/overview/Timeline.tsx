import React, { useState } from "react";
import {
  Calendar,
  History,
  CirclePlus,
  CircleCheck,
  Gamepad2,
  AlertCircle,
  Clock,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";
import BadgeDropdown from "@/components/dropdown/StatusSelection";
import { useTranslation } from "react-i18next";

interface Event {
  type: "status" | "achievement" | "alert" | "added" | string;
  title: string;
  description: string | null;
  timestamp: bigint | Date;
}

export const EventTimeline = () => {
  const { selectedGame } = useGames();
  const { t } = useTranslation("GameStatus");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getDateFromBigint = (timestamp: bigint): Date => {
    const timestampNumber = Number(timestamp);
    return timestampNumber > 10000000000
      ? new Date(timestampNumber)
      : new Date(timestampNumber * 1000);
  };

  const status =
    selectedGame?.statusHistory.map((status) => ({
      type: status.gameStatus.name,
      title: status.gameStatus.name,
      description: "",
      timestamp: status.createdAt,
    })) || [];

  let events: Event[] = [...status];

  if (selectedGame?.createdAt) {
    events.push({
      type: "added",
      title: "Added to library",
      description: "",
      timestamp: selectedGame.createdAt,
    });
  }

  const sortedEvents = [...events].sort((a, b) => {
    const timestampA =
      typeof a.timestamp === "bigint"
        ? Number(a.timestamp)
        : (a.timestamp as Date).getTime();
    const timestampB =
      typeof b.timestamp === "bigint"
        ? Number(b.timestamp)
        : (b.timestamp as Date).getTime();
    return timestampA - timestampB;
  });

  const formatTime = (timestamp: bigint | Date): string => {
    const date =
      typeof timestamp === "bigint" ? getDateFromBigint(timestamp) : timestamp;
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDate = (timestamp: bigint | Date): string => {
    const date =
      typeof timestamp === "bigint" ? getDateFromBigint(timestamp) : timestamp;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  const getEventIcon = (type: string): JSX.Element => {
    const size = 20;
    switch (type) {
      case "added":
        return <CirclePlus size={size} />;
      case "completed":
        return <CircleCheck size={size} />;
      case "playing":
        return <Gamepad2 size={size} />;
      case "played":
        return <History size={size} />;
      case "planned":
        return <Calendar size={size} />;
      case "dropped":
        return <AlertCircle size={size} />;
      default:
        return <Clock size={size} />;
    }
  };

  const getEventColor = (type: string): string => {
    const colors: Record<string, string> = {
      playing: "from-blue-600 to-blue-400",
      played: "from-yellow-600 to-yellow-400",
      planned: "from-purple-600 to-purple-400",
      dropped: "from-red-600 to-red-400",
      completed: "from-green-600 to-green-400",
      added: "from-indigo-600 to-indigo-400",
    };
    return colors[type] || "from-gray-600 to-gray-400";
  };

  const currentStatusIndex = sortedEvents.length - 1;
  const currentStatus = sortedEvents[currentStatusIndex]?.type || "";
  
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: Math.min(5, sortedEvents.length)
  });

  const showPrevious = () => {
    if (visibleRange.start > 0) {
      setVisibleRange({
        start: visibleRange.start - 1,
        end: visibleRange.end - 1
      });
    }
  };

  const showNext = () => {
    if (visibleRange.end < sortedEvents.length) {
      setVisibleRange({
        start: visibleRange.start + 1,
        end: visibleRange.end + 1
      });
    }
  };

  const visibleEvents = sortedEvents.slice(visibleRange.start, visibleRange.end);

  return (
    <Card
      title={ "Status History" }
      className="overflow-hidden"
    >
      {sortedEvents.length > 0 ? (
        <div className="w-full">
          {/* Current Status Bar */}
          <div className="mb-8 px-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4">
              <div className="flex items-center space-x-3">
                <div className="text-lg font-medium text-gray-200">Current Status:</div>
                <div className="flex">
                  <BadgeDropdown />
                </div>
              </div>
              <div className="flex items-center text-gray-400">
                <Clock size={16} className="mr-2" />
                {formatDate(sortedEvents[currentStatusIndex]?.timestamp || new Date())}
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="relative px-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-300">Status Timeline</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={showPrevious} 
                  disabled={visibleRange.start === 0}
                  className={`p-1 rounded-full ${visibleRange.start === 0 ? 'bg-gray-800 text-gray-600' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={showNext} 
                  disabled={visibleRange.end >= sortedEvents.length}
                  className={`p-1 rounded-full ${visibleRange.end >= sortedEvents.length ? 'bg-gray-800 text-gray-600' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            {/* Timeline Visualization */}
            <div className="grid grid-cols-1 gap-4">
              {visibleEvents.map((event, idx) => {
                const actualIndex = visibleRange.start + idx;
                const isActive = activeIndex === actualIndex || activeIndex === null;
                const isLatest = actualIndex === currentStatusIndex;
                
                return (
                  <div 
                    key={actualIndex}
                    className={`relative rounded-lg transition-all duration-300 ${isActive ? 'bg-gray-800' : 'bg-gray-800/50'}`}
                    onClick={() => setActiveIndex(isActive && activeIndex !== null ? null : actualIndex)}
                  >
                    {/* Indicator line */}
                    {actualIndex < sortedEvents.length - 1 && (
                      <div className="absolute top-1/2 left-6 h-full w-px bg-gray-700" style={{transform: 'translateX(-50%)'}}></div>
                    )}
                    
                    <div className="relative flex items-start p-4">
                      {/* Icon Circle */}
                      <div className={`relative mr-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                        {isLatest && (
                          <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white ring-2 ring-gray-800"></div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-200">{t(event.title)}</h4>
                          <span className="text-sm text-gray-400">{formatTime(event.timestamp)}</span>
                        </div>
                        
                        {isActive && (
                          <div className="mt-2 text-sm text-gray-400">
                            {event.type === "added" ? (
                              <span>Game was added to your library</span>
                            ) : event.type === "completed" ? (
                              <span>You marked this game as completed</span>
                            ) : event.type === "playing" ? (
                              <span>You started playing this game</span>
                            ) : event.type === "played" ? (
                              <span>You've played this game before</span>
                            ) : event.type === "planned" ? (
                              <span>You plan to play this game</span>
                            ) : event.type === "dropped" ? (
                              <span>You stopped playing this game</span>
                            ) : (
                              <span>Status was updated</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Status Count Indicator */}
            <div className="mt-4 flex items-center justify-center">
              <div className="text-sm text-gray-500">
                Showing {visibleRange.start + 1}-{Math.min(visibleRange.end, sortedEvents.length)} of {sortedEvents.length} status updates
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-800/50 p-8 text-center">
          <div className="mb-4">
            <Calendar className="mx-auto text-gray-400" size={32} />
          </div>
          <p className="font-medium text-gray-300">No activity to display</p>
          <p className="mt-2 text-sm text-gray-500">
            Change the game status to start tracking progress
          </p>
        </div>
      )}
    </Card>
  );
};
