import React from "react";
import {
  Calendar,
  Clock,
  Badge,
  Trophy,
  Bell,
  CircleCheck,
  Gamepad2,
  CirclePlus,
  Pencil,
  Cross,
} from "lucide-react";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";
import BadgeDropdown from "@/components/dropdown/StatusSelection";
import { useTranslation } from "react-i18next";

interface Event {
  type: "status" | "achievement" | "alert" | string;
  title: string;
  description: string | null;
  timestamp: bigint | Date;
}

export const EventTimeline = () => {
  const { selectedGame } = useGames();
  const { t } = useTranslation("GameStatus");

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

  const getEventColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      playing: "bg-blue-500",
      played: "bg-yellow-500",
      planned: "bg-purple-500",
      dropped: "bg-red-500",
      completed: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getEventIcon = (type: string): JSX.Element => {
    const size = 24;
    switch (type) {
      case "added":
        return <CirclePlus size={size} />;
      case "completed":
        return <CircleCheck size={size} />;
      case "playing":
        return <Gamepad2 size={size} />;
      default:
        return <div className="h-4 w-4 rounded-full"></div>;
    }
  };

  const currentStatusIndex =
    sortedEvents.length > 0 ? sortedEvents.length - 1 : 0;

  return (
    <Card title="Game Status">
      <BadgeDropdown />
      {sortedEvents.length > 0 ? (
        <div className="relative w-full px-4 py-6">
          {/* Timeline Bar */}
          <div className="absolute left-0 right-0 top-8 h-1 bg-gray-700"></div>

          {/* Progress Bar */}
          <div
            className="absolute left-0 top-8 h-1 bg-gray-700 transition-all duration-300"
            style={{
              width: `${(currentStatusIndex / Math.max(sortedEvents.length - 1, 1)) * 100}%`,
            }}
          ></div>

          {/* Timeline Items */}
          <div className="relative flex justify-start gap-14">
            {sortedEvents.map((event, index) => (
              <div
                key={index}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Status Circle */}
                <div
                  className={`mt-[-10px] flex h-10 w-10 items-center justify-center rounded-full border-2 text-white ${index <= currentStatusIndex ? getEventColor(event.type) : "border-gray-700 bg-gray-800"}`}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* Status Label */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${index <= currentStatusIndex ? "text-white" : "text-gray-400"}`}
                  >
                    {t(event.title)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg py-10 text-center text-gray-500">
          <div className="mb-3">
            <Calendar className="mx-auto text-gray-400" size={32} />
          </div>
          <p className="font-medium">No activity to display</p>
        </div>
      )}
    </Card>
  );
};
