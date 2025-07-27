import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useGames } from "@render//context/DatabaseContext";
import { Calendar, BarChart3, TrendingUp, Clock } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const AchievementTimeline = () => {
  const { selectedGame } = useGames();
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const processedData = useMemo(() => {
    if (!selectedGame) return null;

    const unlockedAchievements = selectedGame.achievements
      .filter((item) => item.isUnlocked && item.unlockedAt)
      .sort((a, b) => Number(a.unlockedAt) - Number(b.unlockedAt));

    if (unlockedAchievements.length === 0) return null;

    const countsByPeriod = new Map();

    unlockedAchievements.forEach((achievement) => {
      const date = new Date(Number(achievement.unlockedAt) * 1000);
      let periodKey: string;

      switch (viewMode) {
        case "weekly":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split("T")[0];
          break;
        case "monthly":
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        default: // daily
          periodKey = date.toISOString().split("T")[0];
          break;
      }

      countsByPeriod.set(periodKey, (countsByPeriod.get(periodKey) || 0) + 1);
    });

    const sortedData = Array.from(countsByPeriod.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      labels: sortedData.map(([period]) => period),
      counts: sortedData.map(([, count]) => count),
      type: viewMode,
    };
  }, [selectedGame, viewMode]);

  if (!selectedGame || !processedData) {
    return (
      <div className="flex h-64 items-center justify-center text-design-text-subtle">
        <div className="text-center">
          <Clock className="mx-auto mb-2 h-8 w-8" />
          <p>No achievement data available</p>
        </div>
      </div>
    );
  }

  const formatLabel = (label: string) => {
    switch (viewMode) {
      case "weekly":
        return `Week of ${new Date(label).toLocaleDateString()}`;
      case "monthly":
        const [year, month] = label.split("-");
        return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
      default:
        return new Date(label).toLocaleDateString();
    }
  };

  const getChartColor = () => {
    switch (viewMode) {
      case "weekly":
        return {
          border: "rgb(168, 85, 247)", // purple
          background: "rgba(168, 85, 247, 0.1)",
          point: "rgb(168, 85, 247)",
        };
      case "monthly":
        return {
          border: "rgb(249, 115, 22)", // orange
          background: "rgba(249, 115, 22, 0.1)",
          point: "rgb(249, 115, 22)",
        };
      default:
        return {
          border: "rgb(59, 130, 246)", // blue
          background: "rgba(59, 130, 246, 0.1)",
          point: "rgb(59, 130, 246)",
        };
    }
  };

  const colors = getChartColor();

  const data = {
    labels: processedData.labels,
    datasets: [
      {
        label: "Achievements Unlocked",
        data: processedData.counts,
        borderColor: colors.border,
        backgroundColor: colors.background,
        pointBackgroundColor: colors.point,
        pointBorderColor: colors.border,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: chartType === "line",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: colors.border,
        borderWidth: 1,
        callbacks: {
          title: function (context: any) {
            return formatLabel(context[0].label);
          },
          label: function (context: any) {
            const value = context.parsed.y;
            return `${value} achievement${value !== 1 ? "s" : ""} unlocked`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          maxTicksLimit: 10,
          callback: function (value: any, index: number) {
            const label = processedData.labels[index];
            if (viewMode === "daily") {
              return new Date(label).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }
            return formatLabel(label);
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          stepSize: 1,
          callback: function (value: any) {
            return Number.isInteger(value) ? value : "";
          },
        },
      },
    },
  };

  const stats = useMemo(() => {
    const total = processedData.counts.reduce((sum, count) => sum + count, 0);
    const average = total / processedData.counts.length;
    const max = Math.max(...processedData.counts);
    const maxIndex = processedData.counts.indexOf(max);
    const maxDate = processedData.labels[maxIndex];

    return { total, average, max, maxDate };
  }, [processedData]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-design-border bg-design-foreground p-1">
            {["daily", "weekly", "monthly"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-primary text-design-black"
                    : "text-design-text-normal hover:bg-design-background"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType("line")}
            className={`rounded-md p-2 transition-colors ${
              chartType === "line"
                ? "bg-primary text-design-black"
                : "text-design-text-subtle hover:bg-design-foreground"
            }`}
            title="Line Chart"
          >
            <TrendingUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`rounded-md p-2 transition-colors ${
              chartType === "bar"
                ? "bg-primary text-design-black"
                : "text-design-text-subtle hover:bg-design-foreground"
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-design-border bg-design-foreground p-3">
          <div className="text-lg font-bold text-design-text-normal">{stats.total}</div>
          <div className="text-xs text-design-text-subtle">Total in Period</div>
        </div>

        <div className="rounded-lg border border-design-border bg-design-foreground p-3">
          <div className="text-lg font-bold text-design-text-normal">{stats.average.toFixed(1)}</div>
          <div className="text-xs text-design-text-subtle">Daily Average</div>
        </div>

        <div className="rounded-lg border border-design-border bg-design-foreground p-3">
          <div className="text-lg font-bold text-design-text-normal">{stats.max}</div>
          <div className="text-xs text-design-text-subtle">Best Day</div>
        </div>

        <div className="rounded-lg border border-design-border bg-design-foreground p-3">
          <div className="text-lg font-bold text-design-text-normal">
            {new Date(stats.maxDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
          <div className="text-xs text-design-text-subtle">Peak Date</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full rounded-lg border border-design-border bg-design-foreground p-4">
        {chartType === "line" ? <Line options={options} data={data} /> : <Bar options={options} data={data} />}
      </div>
    </div>
  );
};

export default AchievementTimeline;
