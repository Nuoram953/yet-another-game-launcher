import React from "react";
import { Calendar, Clock, Badge, Trophy, Bell } from "lucide-react";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";

// Define TypeScript interfaces for our data structures
interface Event {
  type: "status" | "achievement" | "alert" | string;
  title: string;
  description: string | null;
  timestamp: bigint;
}

interface EventsGroupedByDate {
  [date: string]: Event[];
}

interface EventTimelineProps {
  events: Event[];
}

export const EventTimeline = () => {
  const { selectedGame } = useGames();

  const getDateFromBigint = (timestamp: bigint): Date => {
    // Convert from milliseconds to seconds if needed (if timestamp is too large)
    const timestampNumber = Number(timestamp);
    // Check if timestamp is in seconds (Unix standard) or milliseconds
    return timestampNumber > 10000000000
      ? new Date(timestampNumber) // Already in milliseconds
      : new Date(timestampNumber * 1000); // Convert seconds to milliseconds
  };

  const getDateString = (timestamp: bigint): string => {
    const date = getDateFromBigint(timestamp);
    return date.toISOString().split("T")[0];
  };

  const achievements = selectedGame!.achievements
    .filter((achievement) => achievement.isUnlocked)
    .map((achivement) => ({
      type: "achievement",
      title: achivement.name,
      description: achivement.description,
      timestamp: achivement.unlockedAt!,
    }));

  const events: Event[] = achievements;

  const groupedEvents: EventsGroupedByDate = events.reduce(
    (acc: EventsGroupedByDate, event) => {
      const eventDate = getDateString(event.timestamp);

      if (!acc[eventDate]) {
        acc[eventDate] = [];
      }

      acc[eventDate].push(event);
      return acc;
    },
    {},
  );

  // Sort dates in descending order (newest first)
  const sortedDates: string[] = Object.keys(groupedEvents).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const formatTime = (timestamp: bigint): string => {
    const date = getDateFromBigint(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
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

  // Event icon based on type
  const getEventIcon = (type: string): JSX.Element => {
    switch (type) {
      case "status":
        return <Badge className="text-blue-500" size={20} />;
      case "achievement":
        return <Trophy className="text-yellow-500" size={20} />;
      case "alert":
        return <Bell className="text-red-500" size={20} />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-500"></div>;
    }
  };

  // Get color based on event type
  const getEventColor = (type: string): string => {
    switch (type) {
      case "status":
        return "border-blue-500 bg-blue-50";
      case "achievement":
        return "border-yellow-500 bg-yellow-50";
      case "alert":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  return (
    <Card title={"Timeline"}>
      {sortedDates.map((date) => (
        <div key={date} className="mb-10">
          <div className="mb-4 flex items-center">
            <div className="mr-3 rounded-full bg-gray-100 p-2">
              <Calendar className="text-gray-600" size={18} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {formatDate(date)}
            </h3>
          </div>

          <div className="ml-4 space-y-4 border-l-2 border-gray-200 pl-6">
            {groupedEvents[date].map((event, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-9 mt-1.5 rounded-full bg-white p-1">
                  {getEventIcon(event.type)}
                </div>

                <div
                  className={`rounded-lg border-l-4 p-4 ${getEventColor(event.type)} transition-all duration-200 hover:shadow-md`}
                >
                  <div className="mb-2 flex items-center">
                    <Clock className="mr-2 text-gray-400" size={14} />
                    <span className="text-sm text-gray-500">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>

                  <h4 className="mb-1 text-lg font-medium text-gray-800">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sortedDates.length === 0 && (
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
