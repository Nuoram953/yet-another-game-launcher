import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import useGameStore from "@render/feature/detail/store/GameStore";
import React, { useEffect, useState, useMemo } from "react";
import Section from "@render/components/new/section";
import { StatsCard } from "@render/components/new/card/StatsCard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

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

const ChartSessionTimeline = () => {
  const game = useGameStore((state) => state.game);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);

  useEffect(() => {
    if (!game?.activities) return;

    const normalizedSessions: Session[] = game.activities.map((s) => ({
      startedAt: Number(s.startedAt),
      endedAt: Number(s.endedAt),
      duration: Number(s.duration),
    }));

    const dataByWeek: Record<string, WeeklyData> = {};

    normalizedSessions.forEach((session) => {
      const weekStart = new Date(session.startedAt);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!dataByWeek[weekKey]) {
        dataByWeek[weekKey] = {
          week: weekKey,
          totalPlaytime: 0,
          sessionCount: 0,
          averageDuration: 0,
        };
      }

      dataByWeek[weekKey].totalPlaytime += Number(session.duration) / 60;
      dataByWeek[weekKey].sessionCount += 1;
      dataByWeek[weekKey].averageDuration = dataByWeek[weekKey].totalPlaytime / dataByWeek[weekKey].sessionCount;
    });

    setWeeklyData(Object.values(dataByWeek));
  }, [game?.activities]);

  const avgSessionsPerWeek = weeklyData.length
    ? weeklyData.reduce((sum, w) => sum + w.sessionCount, 0) / weeklyData.length
    : 0;

  const avgPlaytimePerWeek = weeklyData.length
    ? weeklyData.reduce((sum, w) => sum + w.totalPlaytime, 0) / weeklyData.length
    : 0;

  const chartData = useMemo(
    () => ({
      labels: weeklyData.map((d) => d.week),
      datasets: [
        {
          label: "Total Playtime",
          data: weeklyData.map((d) => d.totalPlaytime),
          backgroundColor: "rgba(136, 132, 216, 0.2)",
          borderColor: "rgb(136, 132, 216)",
          borderWidth: 1,
          stack: "Stack 0",
        },
        {
          label: "Session Count",
          data: weeklyData.map((d) => d.sessionCount),
          backgroundColor: "rgba(130, 202, 157, 0.2)",
          borderColor: "rgb(130, 202, 157)",
          borderWidth: 1,
          stack: "Stack 0",
        },
      ],
    }),
    [weeklyData],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "white",
          bodyColor: "white",
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || "";
              const value = context.parsed.y;
              return `${label}: ${label.includes("Playtime") ? value.toFixed(2) : value}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { display: false },
        },
        x: {
          stacked: true,
          ticks: { autoSkip: true },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
        },
      },
    }),
    [],
  );

  return (
    <Section>
      <Section.Title title="Weekly Session Overview" />
      <Section.Content>
        <div className="flex gap-4">
          <StatsCard value={`${avgSessionsPerWeek.toFixed(1)} sessions`} label="Avg sessions per week" detail="" />
          <StatsCard value={`${avgPlaytimePerWeek.toFixed(1)} h`} label="Avg time played per week" detail="" />
        </div>
        <div className="max-h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Section.Content>
    </Section>
  );
};

export default ChartSessionTimeline;
