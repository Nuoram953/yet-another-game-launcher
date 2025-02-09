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
import { Bar, Doughnut } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Calendar as CalendarIcon, Timer, Activity } from "lucide-react";
import { Tile } from "./Tile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { unixToDate } from "@/utils/util";
import { useGames } from "@/context/DatabaseContext";
import { StatsPanelCard } from "./StatsPanelCard";
import YearlyHeatmap from "./YearlyHeatmap";
import { Calendar } from "@/components/ui/calendar";
import HeatmapCalendar from "./HeatmapCalendar";

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

export const SectionActivities = () => {
  const { selectedGame } = useGames();
  const [timeRange, setTimeRange] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [processedData, setProcessedData] = useState({
    weeklyData: [],
    stats: {
      totalSessions: 0,
      averageDuration: 0,
      longestSession: 0,
      totalPlaytime: 0,
    },
  });

  useEffect(() => {
    const processGamingData = (sessions) => {
      const normalizedSessions = sessions.map((session) => ({
        ...session,
        startedAt: Number(session.startedAt),
        endedAt: Number(session.endedAt),
        duration: Number(session.duration),
      }));

      const weeklyData = normalizedSessions.reduce((acc, session) => {
        const weekStart = new Date(session.startedAt);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const weekKey = weekStart.toISOString().split("T")[0];

        console.log(weekKey);

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
      }, {});

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

    processGamingData(selectedGame?.activities);
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

  const chartOsData = {
    labels: ["Windows", "Mac", "Linux", "Steamdeck"],
    datasets: [
      {
        label: "Os",
        data: [
          selectedGame?.timePlayedWindows ?? 0 / 60,
          selectedGame?.timePlayedMac ?? 0 / 60,
          selectedGame?.timePlayedLinux ?? 0 / 60,
          selectedGame?.timePlayedSteamdeck ?? 0 / 60,
        ],
        backgroundColor: "rgba(136, 132, 216, 0.7)",
        borderColor: "rgb(136, 132, 216)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label.includes("Playtime")) {
              return `${label}: ${context.parsed.y.toFixed(2)}`;
            }
            return `${label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const dates = selectedGame?.activities.map(item=>unixToDate(item.endedAt))


  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-4">
      <div className="flex w-full flex-row justify-around gap-4">
        <StatsPanelCard
          icon={CalendarIcon}
          label="Total Sessions"
          value={String(processedData.stats.totalSessions)}
        />
        <StatsPanelCard
          icon={Clock}
          label="Average Session"
          value={formatDuration(processedData.stats.averageDuration)}
        />
        <StatsPanelCard
          icon={Timer}
          label="Longest Session"
          value={formatDuration(processedData.stats.longestSession)}
        />
        <StatsPanelCard
          icon={Activity}
          label="Total Playtime"
          value={formatDuration(processedData.stats.totalPlaytime)}
        />
      </div>

      <Tile>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Tile>

      <div className="flex flex-row gap-4">
        <Tile>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity per OS</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="mx-auto flex items-center justify-center">
            <div className="mx-auto max-h-[400px]">
              <Doughnut data={chartOsData} />
            </div>
          </CardContent>
        </Tile>

        <Tile>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Heatmap</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <HeatmapCalendar/>
            </div>
          </CardContent>
        </Tile>
      </div>

      <div className="h-20"></div>
    </div>
  );
};

export default SectionActivities;
