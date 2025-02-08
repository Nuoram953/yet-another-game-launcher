import { useGames } from '@/context/DatabaseContext';
import React, { useMemo } from 'react';

const YearlyHeatmap = () => {
  const {selectedGame} = useGames()
  const normalizedSessions = selectedGame?.activities.map((session) => ({
    ...session,
    startedAt: Number(session.startedAt),
    endedAt: Number(session.endedAt),
    duration: Number(session.duration),
  }));

  // Generate calendar data
  const calendarData = useMemo(() => {
    const data = Array(53).fill(null).map(() => Array(7).fill(0));
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    
    normalizedSessions.forEach(session => {
      const date = new Date(session.startedAt);
      const week = Math.floor((date - yearStart) / (7 * 24 * 60 * 60 * 1000));
      const day = date.getDay();
      if (week >= 0 && week < 53) {
        data[week][day] += session.duration;
      }
    });
    
    return data;
  }, [normalizedSessions]);

  // Find max duration for color scaling
  const maxDuration = useMemo(() => {
    return Math.max(...calendarData.flat());
  }, [calendarData]);

  // Get color based on duration
  const getColor = (duration) => {
    if (duration === 0) return 'bg-gray-100';
    const intensity = Math.min((duration / maxDuration) * 0.8 + 0.2, 1);
    return `rgb(0, ${Math.floor(intensity * 100)}, ${Math.floor(intensity * 255)})`;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-1 min-h-0">
        {/* Day labels */}
        <div className="pr-2 pt-6">
          {weekDays.map((day) => (
            <div key={day} className="h-4 text-xs text-gray-500 mb-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="relative flex-1">
          {/* Month labels */}
          <div className="flex mb-1">
            {months.map((month) => (
              <div
                key={month}
                className="text-xs text-gray-500"
                style={{ width: `${100 / 12}%` }}
              >
                {month}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex h-[calc(100%-20px)]">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col flex-1">
                {week.map((duration, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 m-0.5 rounded-sm relative group"
                    style={{ backgroundColor: getColor(duration) }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {duration > 0
                        ? `${Math.round(duration / 60)} minutes`
                        : 'No activity'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyHeatmap;
