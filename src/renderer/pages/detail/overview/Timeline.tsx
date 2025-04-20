import React from "react";
import {
  Calendar,
  Clock,
  Trophy,
  Bell,
  CircleCheck,
  Gamepad2,
  CirclePlus,
  Pencil,
  AlertCircle,
  History,
  ArrowRight,
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

  const getEventColor = (
    status: string,
  ): { bg: string; text: string; border: string; light: string } => {
    const colors: {
      [key: string]: {
        bg: string;
        text: string;
        border: string;
        light: string;
      };
    } = {
      playing: {
        bg: "bg-blue-600",
        text: "text-blue-200",
        border: "border-blue-400",
        light: "bg-blue-500/20",
      },
      played: {
        bg: "bg-yellow-600",
        text: "text-yellow-200",
        border: "border-yellow-400",
        light: "bg-yellow-500/20",
      },
      planned: {
        bg: "bg-purple-600",
        text: "text-purple-200",
        border: "border-purple-400",
        light: "bg-purple-500/20",
      },
      dropped: {
        bg: "bg-red-600",
        text: "text-red-200",
        border: "border-red-400",
        light: "bg-red-500/20",
      },
      completed: {
        bg: "bg-green-600",
        text: "text-green-200",
        border: "border-green-400",
        light: "bg-green-500/20",
      },
      added: {
        bg: "bg-indigo-600",
        text: "text-indigo-200",
        border: "border-indigo-400",
        light: "bg-indigo-500/20",
      },
    };
    return (
      colors[status] || {
        bg: "bg-gray-600",
        text: "text-gray-200",
        border: "border-gray-400",
        light: "bg-gray-500/20",
      }
    );
  };

  const getEventIcon = (type: string): JSX.Element => {
    const size = 20;
    switch (type) {
      case "added":
        return <CirclePlus size={size} className="text-indigo-100" />;
      case "completed":
        return <CircleCheck size={size} className="text-green-100" />;
      case "playing":
        return <Gamepad2 size={size} className="text-blue-100" />;
      case "played":
        return <History size={size} className="text-yellow-100" />;
      case "planned":
        return <Calendar size={size} className="text-purple-100" />;
      case "dropped":
        return <AlertCircle size={size} className="text-red-100" />;
      default:
        return <div className="h-4 w-4 rounded-full"></div>;
    }
  };

  const currentStatusIndex =
    sortedEvents.length > 0 ? sortedEvents.length - 1 : 0;

  const currentStatus = sortedEvents[currentStatusIndex]?.type || "";
  const currentStatusColors = getEventColor(currentStatus);

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-indigo-400" />
          <span>Game Status Timeline</span>
        </div>
      }
      className="overflow-hidden"
    >

      {sortedEvents.length > 0 ? (
        <div className="relative w-full pb-8">
          {/* Current Status Display */}
          <div className="mb-6 px-4">
            <div
              className={`flex items-center justify-between rounded-lg p-3 ${currentStatusColors.light}`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStatusColors.bg} shadow-lg`}
                >
                  {getEventIcon(currentStatus)}
                </div>
                <div>
                  <div className="text-sm text-gray-400">Current Status</div>
                  <div
                    className={`text-lg font-medium ${currentStatusColors.text}`}
                  >
        <BadgeDropdown />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Since</div>
                <div className="text-base font-medium text-gray-300">
                  {formatDate(
                    sortedEvents[currentStatusIndex]?.timestamp || new Date(),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto px-4 pb-4">
            <div className="relative py-6">
              {/* Timeline Bar */}
              <div className="absolute left-0 right-0 top-12 h-1 bg-gray-700/50 shadow-inner"></div>

              {/* Progress Bar - Gradient effect */}
              <div
                className="absolute left-0 top-12 h-1 bg-gradient-to-r from-indigo-600 to-indigo-400 shadow transition-all duration-700 ease-out"
                style={{
                  width: `${(currentStatusIndex / Math.max(sortedEvents.length - 1, 1)) * 100}%`,
                }}
              ></div>

              {/* Timeline Items */}
              <div
                className="relative flex justify-start"
                style={{
                  minWidth:
                    sortedEvents.length > 3
                      ? `${sortedEvents.length * 150}px`
                      : "100%",
                }}
              >
                {sortedEvents.map((event, index) => {
                  const colors = getEventColor(event.type);
                  const isActive = index <= currentStatusIndex;
                  const isLast = index === sortedEvents.length - 1;

                  return (
                    <div
                      key={index}
                      className={`relative z-10 flex flex-1 flex-col items-center transition-all duration-300 hover:scale-105`}
                      style={{ minWidth: "120px" }}
                    >
                      {/* Status Circle */}
                      <div className="mb-4 flex items-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-lg ${
                            isActive
                              ? `${colors.bg} ${colors.border} shadow-${event.type}-500/20`
                              : "border-gray-700 bg-gray-800"
                          }`}
                        >
                          {getEventIcon(event.type)}
                        </div>

                        {/* Connector arrow between events */}
                        {index < sortedEvents.length - 1 && (
                          <div className="absolute left-full top-6 -translate-x-1/2 transform">
                            <ArrowRight
                              size={16}
                              className={`opacity-50 ${isActive ? "text-white" : "text-gray-600"}`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Status Label */}
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`mb-1 rounded-md px-3 py-1 text-sm font-medium ${
                            isActive
                              ? `${colors.light} ${colors.text}`
                              : "bg-gray-800/50 text-gray-400"
                          }`}
                        >
                          {t(event.title)}
                        </div>
                        <div
                          className={`text-xs ${isActive ? "text-gray-300" : "text-gray-500"}`}
                        >
                          {formatTime(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
