import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";
import { Clock, Calendar as CalendarIcon, Timer, Activity } from "lucide-react";
import { useGames } from "@/context/DatabaseContext";
import { StatsCard } from "../StatsCard";
import { ChartActiviy } from "./ChartActiviy";
import { ChartActivityOs } from "./ChartActiviyOs";
import ChartSessionDurationDistribution from "./ChartSessionDistribution";
import ChartStartEndTimeScatterPlot from "./ChartSartEndTimeScatterPlot";
import ChartHeatMapCalendar from "./ChartHeatMapCalendar";
import ChartAMPMPlaytimeDistribution from "./ChartAmPmDistribution";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

type Session = {
  startedAt: number | string;
  endedAt: number | string;
  duration: number | string;
};

type WeeklyData = {
  week: string;
  totalPlaytime: number;
  sessionCount: number;
  averageDuration: number;
};

export const SectionActivities = () => {
  const { selectedGame } = useGames();
  const [timeRange, setTimeRange] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [processedData, setProcessedData] = useState<{
    weeklyData: WeeklyData[];
    stats: {
      totalSessions: number;
      averageDuration: number;
      longestSession: number;
      totalPlaytime: number;
    };
  }>({
    weeklyData: [],
    stats: {
      totalSessions: 0,
      averageDuration: 0,
      longestSession: 0,
      totalPlaytime: 0,
    },
  });

  useEffect(() => {
    const processGamingData = (sessions: Session[]) => {
      const normalizedSessions = sessions.map((session) => ({
        ...session,
        startedAt: Number(session.startedAt),
        endedAt: Number(session.endedAt),
        duration: Number(session.duration),
      }));

      const weeklyData = normalizedSessions.reduce<Record<string, WeeklyData>>(
        (acc, session) => {
          const weekStart = new Date(session.startedAt);
          weekStart.setHours(0, 0, 0, 0);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());

          const weekKey = weekStart.toISOString().split("T")[0];

          if (!acc[weekKey]) {
            acc[weekKey] = {
              week: weekKey,
              totalPlaytime: 0,
              sessionCount: 0,
              averageDuration: 0,
            };
          }

          acc[weekKey].totalPlaytime += session.duration / 60;
          acc[weekKey].sessionCount += 1;
          acc[weekKey].averageDuration =
            acc[weekKey].totalPlaytime / acc[weekKey].sessionCount;
          return acc;
        },
        {},
      );

      const stats = {
        totalSessions: normalizedSessions.length,
        averageDuration:
          normalizedSessions.reduce(
            (acc, session) => acc + session.duration,
            0,
          ) / normalizedSessions.length,
        longestSession: Math.max(...normalizedSessions.map((s) => s.duration)),
        totalPlaytime: normalizedSessions.reduce(
          (acc, session) => acc + session.duration,
          0,
        ),
      };

      setProcessedData({
        weeklyData: Object.values(weeklyData),
        stats,
      });
      setLoading(false);
    };

    if (selectedGame?.activities) {
      processGamingData(
        selectedGame.activities.map((activity) => ({
          id: activity.id,
          gameId: activity.gameId,
          startedAt: Number(activity.startedAt),
          endedAt: Number(activity.endedAt),
          duration: activity.duration,
        })),
      );
    }
  }, []);

  const chartData = {
    labels: processedData.weeklyData.map((data) => String(data.week)),
    datasets: [
      {
        label: "Total Playtime (minutes)",
        data: processedData.weeklyData.map((data) => data.totalPlaytime),
        backgroundColor: "rgba(136, 132, 216, 0.7)",
        borderColor: "rgb(136, 132, 216)",
        borderWidth: 1,
      },
      {
        label: "Number of Sessions",
        data: processedData.weeklyData.map((data) => data.sessionCount),
        backgroundColor: "rgba(130, 202, 157, 0.7)",
        borderColor: "rgb(130, 202, 157)",
        borderWidth: 1,
      },
    ],
  };

  const chartOsData: any = {
    labels: [],
    datasets: [
      {
        label: "Os",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  };

  if (selectedGame?.timePlayedWindows) {
    const color = "rgba(0, 120, 215, 1)";
    chartOsData.labels.push("Windows");
    chartOsData.datasets[0].data.push(selectedGame.timePlayedWindows / 60);
    chartOsData.datasets[0].backgroundColor.push(color);
    chartOsData.datasets[0].borderColor.push(color);
  }

  if (selectedGame?.timePlayedLinux) {
    const color = "rgba(48, 98, 48, 1)";
    chartOsData.labels.push("Linux");
    chartOsData.datasets[0].data.push(selectedGame.timePlayedLinux / 60);
    chartOsData.datasets[0].backgroundColor.push(color);
    chartOsData.datasets[0].borderColor.push(color);
  }

  if (selectedGame?.timePlayedMac) {
    const color = "rgba(88, 86, 214, 1)";
    chartOsData.labels.push("Mac");
    chartOsData.datasets[0].data.push(selectedGame.timePlayedMac / 60);
    chartOsData.datasets[0].backgroundColor.push(color);
    chartOsData.datasets[0].borderColor.push(color);
  }

  if (selectedGame?.timePlayedSteamdeck) {
    const color = "rgba(0, 0, 0, 0.8)";
    chartOsData.labels.push("Steamdeck");
    chartOsData.datasets[0].data.push(selectedGame.timePlayedSteamdeck / 60);
    chartOsData.datasets[0].backgroundColor.push(color);
    chartOsData.datasets[0].borderColor.push(color);
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto w-full space-y-4 py-4">
      <div className="flex w-full flex-row justify-around gap-4">
        <StatsCard
          icon={CalendarIcon}
          label="Total Sessions"
          value={String(processedData.stats.totalSessions)}
        />
        <StatsCard
          icon={Clock}
          label="Average Session"
          value={formatDuration(processedData.stats.averageDuration)}
        />
        <StatsCard
          icon={Timer}
          label="Longest Session"
          value={formatDuration(processedData.stats.longestSession)}
        />
        <StatsCard
          icon={Activity}
          label="Total Playtime"
          value={formatDuration(processedData.stats.totalPlaytime)}
        />
      </div>

      <ChartActiviy chartData={chartData} />
      <div className="flex w-full flex-row gap-4">
        <div className="w-1/2">
          <ChartActivityOs chartData={chartOsData} />
        </div>
        <div className="w-1/2">
          <ChartAMPMPlaytimeDistribution />
        </div>
      </div>
      <ChartStartEndTimeScatterPlot />
      <ChartSessionDurationDistribution />
      <ChartHeatMapCalendar />

      <div className="h-20"></div>
    </div>
  );
};

export default SectionActivities;
