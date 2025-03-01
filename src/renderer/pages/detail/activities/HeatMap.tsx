import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils"; // Ensure this utility exists for conditional classes
import React from "react";
import { useGames } from "@/context/DatabaseContext";
import { Tile } from "../Tile";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HeatMap = () => {
  const { selectedGame } = useGames();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getIntensityClass = (count: number) => {
    if (count >= 5) return "bg-red-500";
    if (count >= 3) return "bg-orange-400";
    if (count >= 1) return "bg-yellow-300";
    return "bg-gray-200";
  };

  const countActivitiesForDate = (timestamp: number) => {
    return selectedGame?.activities.filter(
      (activity) =>
        timestamp >= activity.startedAt && timestamp <= activity.endedAt,
    ).length;
  };

  return (
    <Tile>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Heatmap</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className="p-4">
            <h2 className="mb-4 text-xl font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
              {daysInMonth.map((day) => {
                const unixTimestamp = Math.floor(day.getTime() / 1000); // Convert to Unix seconds
                const activityCount = countActivitiesForDate(unixTimestamp);
                return (
                  <div
                    key={unixTimestamp}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md",
                      getIntensityClass(activityCount),
                    )}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Tile>
  );
};
