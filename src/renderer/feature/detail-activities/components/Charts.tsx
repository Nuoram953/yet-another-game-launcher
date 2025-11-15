import React, { useMemo, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useGameFromParams } from "@render/hooks/useGameParam";
import { GameActivity } from "@prisma/client";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Props = {
  days?: number;
};

type TimeScale = "day" | "month" | "year" | "current";

export const GameActivityCharts: React.FC<Props> = ({ days = 28 }) => {
  const { game, isLoading } = useGameFromParams();
  const activities: GameActivity[] = game?.activities || [];

  const [timeScale, setTimeScale] = useState<TimeScale>("day");

  const { labels, totalPlaytimeData, sessionsData, avgSessionData, hourBuckets, sessionBuckets } = useMemo(() => {
    const now = new Date();
    let labels: string[] = [];
    let buckets: { [key: string]: { total: number; sessions: number } } = {};
    const hourBuckets: number[] = Array(24).fill(0);
    const sessionBuckets = { Short: 0, Medium: 0, Long: 0 };

    activities.forEach((a) => {
      const date = new Date(Number(a.startedAt));

      let label = "";
      switch (timeScale) {
        case "day":
          label = date.toLocaleDateString();
          break;
        case "month":
          label = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        case "year":
          label = `${date.getFullYear()}`;
          break;
      }

      if (!buckets[label]) buckets[label] = { total: 0, sessions: 0 };
      buckets[label].total += a.duration;
      buckets[label].sessions += 1;

      hourBuckets[date.getHours()] += 1;

      if (a.duration < 30) sessionBuckets.Short++;
      else if (a.duration <= 90) sessionBuckets.Medium++;
      else sessionBuckets.Long++;
    });

    labels = Object.keys(buckets).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const totalPlaytimeData = labels.map((l) => buckets[l].total);
    const sessionsData = labels.map((l) => buckets[l].sessions);
    const avgSessionData = labels.map((l, idx) =>
      sessionsData[idx] ? Math.round(totalPlaytimeData[idx] / sessionsData[idx]) : 0,
    );

    return { labels, totalPlaytimeData, sessionsData, avgSessionData, hourBuckets, sessionBuckets };
  }, [activities, timeScale]);

  const totalPlaytimeChart = {
    labels,
    datasets: [
      {
        label: "Total Playtime (min)",
        data: totalPlaytimeData,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
      },
    ],
  };
  const sessionsChart = {
    labels,
    datasets: [{ label: "Sessions Played", data: sessionsData, backgroundColor: "rgba(153,102,255,0.6)" }],
  };
  const avgSessionChart = {
    labels,
    datasets: [
      {
        label: "Average Session Length (min)",
        data: avgSessionData,
        borderColor: "rgba(255,159,64,1)",
        backgroundColor: "rgba(255,159,64,0.2)",
        tension: 0.3,
      },
    ],
  };
  const hourChart = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{ label: "Sessions by Hour", data: hourBuckets, backgroundColor: "rgba(54,162,235,0.6)" }],
  };
  const sessionPieChart = {
    labels: ["Short (<30m)", "Medium (30–90m)", "Long (>90m)"],
    datasets: [
      {
        data: [sessionBuckets.Short, sessionBuckets.Medium, sessionBuckets.Long],
        backgroundColor: ["rgba(75,192,192,0.6)", "rgba(255,206,86,0.6)", "rgba(255,99,132,0.6)"],
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { position: "top" as const }, title: { display: true, text: "" } },
  };

  if (isLoading) return <div>Loading charts...</div>;
  if (!activities.length) return <div>No activity data available.</div>;

  return (
    <div className="space-y-6 p-2 text-subtle">
      <div className="flex items-center gap-4">
        <span>View by:</span>
        {["day", "month", "year"].map((scale) => (
          <button
            key={scale}
            className={`rounded border px-2 py-1 ${timeScale === scale ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setTimeScale(scale as TimeScale)}
          >
            {scale.toUpperCase()}
          </button>
        ))}
      </div>

      {/* First row: Total Playtime 75% + Pie 25% */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full rounded-md border border-normal bg-foreground p-3 shadow-md md:w-3/4">
          <h3 className="text-sm font-medium uppercase tracking-wide">TOTAL PLAYTIME OVER TIME</h3>
          <Line
            data={totalPlaytimeChart}
            options={{ ...options, plugins: { ...options.plugins, title: { text: "Total Playtime" } } }}
          />
        </div>
        <div className="w-full rounded-md border border-normal bg-foreground p-3 shadow-md md:w-1/4">
          <h3 className="mb-2 text-lg font-semibold">SESSION DURATION DISTRIBUTION</h3>
          <Pie
            data={sessionPieChart}
            options={{ ...options, plugins: { ...options.plugins, title: { text: "Short / Medium / Long Sessions" } } }}
          />
        </div>
      </div>

      {/* Other charts stacked below */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="w-full rounded-md border border-normal bg-foreground p-3 shadow-md">
          <h3 className="mb-2 text-lg font-semibold">SESSIONS PLAYED OVER TIME</h3>
          <Bar
            data={sessionsChart}
            options={{ ...options, plugins: { ...options.plugins, title: { text: "Sessions Played" } } }}
          />
        </div>
        <div className="w-full rounded-md border border-normal bg-foreground p-3 shadow-md">
          <h3 className="mb-2 text-lg font-semibold">AVERAGE SESSION LENGTH OVER TIME</h3>
          <Line
            data={avgSessionChart}
            options={{ ...options, plugins: { ...options.plugins, title: { text: "Average Session Length" } } }}
          />
        </div>
        <div className="col-span-1 rounded-md border border-normal bg-foreground p-3 md:col-span-2">
          <h3 className="mb-2 text-lg font-semibold">ACTIVITY BY HOUR OF DAY</h3>
          <Bar
            data={hourChart}
            options={{ ...options, plugins: { ...options.plugins, title: { text: "Sessions by Hour" } } }}
          />
        </div>
      </div>
    </div>
  );
};
