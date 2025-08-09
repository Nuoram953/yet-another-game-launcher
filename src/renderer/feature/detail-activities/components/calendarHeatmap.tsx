import useGameStore from "@render/feature/detail/store/GameStore";
import React, { useState, useMemo } from "react";

const CalendarHeatmap = () => {
  const game = useGameStore((state) => state.game);
  const [currentDate] = useState(new Date());

  const heatData = useMemo(() => {
    if (!game?.activities) return {};

    const data: Record<string, number> = {};
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();

    for (const activity of game.activities) {
      let start = new Date(Number(activity.startedAt));
      let end = new Date(Number(activity.endedAt));

      if (end <= start) continue;

      let cursor = new Date(start);

      while (cursor <= end) {
        const dayStart = new Date(
          Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate(), 0, 0, 0),
        );
        const dayEnd = new Date(dayStart);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1); // next midnight UTC

        const segmentStart = cursor > dayStart ? cursor : dayStart;
        const segmentEnd = end < dayEnd ? end : dayEnd;

        const durationHours = (segmentEnd.getTime() - segmentStart.getTime()) / (1000 * 60 * 60);

        if (segmentStart.getUTCMonth() === month && segmentStart.getUTCFullYear() === year) {
          const dateKey = `${segmentStart.getUTCFullYear()}-${String(segmentStart.getUTCMonth() + 1).padStart(2, "0")}-${String(
            segmentStart.getUTCDate(),
          ).padStart(2, "0")}`;

          data[dateKey] = (data[dateKey] || 0) + durationHours;
        }

        cursor = dayEnd;
      }
    }

    return data;
  }, [game, currentDate]);

  const getMonthData = () => {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = lastDay.getUTCDate();
    const startingDayOfWeek = firstDay.getUTCDay();

    const monthName = firstDay.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    return {
      monthName,
      daysInMonth,
      startingDayOfWeek,
    };
  };

  const getHeatColor = (hours: number) => {
    if (hours <= 0) return "bg-gray-100";
    if (hours < 1) return "bg-green-100 !text-gray-400";
    if (hours < 2) return "bg-green-300";
    if (hours < 4) return "bg-green-500";
    return "bg-green-700"; // 4+ hours in a day
  };

  const getDateKey = (day: number) => {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const { monthName, daysInMonth, startingDayOfWeek } = getMonthData();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="max-w-md rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-white">{monthName}</h2>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-8"></div>;
          }

          const dateKey = getDateKey(day);
          const hours = heatData[dateKey] || 0;
          const heatColor = getHeatColor(hours);

          return (
            <div
              key={day}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-xs font-medium transition-all hover:ring-2 hover:ring-blue-300 ${heatColor} ${
                hours === 0 ? "text-gray-400" : "text-white"
              }`}
              title={`${dateKey}: ${hours.toFixed(1)}h played`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center space-x-2">
        <span className="text-xs text-gray-500">Less</span>
        {[0, 0.5, 1.5, 3, 5].map((level, idx) => (
          <div key={idx} className={`h-3 w-3 rounded-sm ${getHeatColor(level)}`} title={`${level}+h`}></div>
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
