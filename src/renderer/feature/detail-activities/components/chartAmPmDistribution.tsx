import { Card } from "@render//components/card/Card";
import { StatsCard } from "@render/components/new/card/StatsCard";
import Section from "@render/components/new/section";
import useGameStore from "@render/feature/detail/store/GameStore";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

const ChartAMPMPlaytimeDistribution = () => {
  const game = useGameStore((state) => state.game);
  const sessions = game?.activities || [];

  const timeCategories = [
    { label: "AM (0–11:59)", min: 0, max: 12 },
    { label: "PM (12–23:59)", min: 12, max: 24 },
  ];

  const playtimeByTimeOfDay = useMemo(() => {
    const playtimes = timeCategories.map(() => 0);

    sessions.forEach((session) => {
      const startHour = new Date(Number(session.startedAt)).getHours();
      const duration = session.duration; // in minutes

      for (let i = 0; i < timeCategories.length; i++) {
        if (startHour >= timeCategories[i].min && startHour < timeCategories[i].max) {
          playtimes[i] += duration;
          break;
        }
      }
    });

    return playtimes;
  }, [sessions]);

  const colors = [
    { border: "rgb(59,130,246)", background: "rgba(59,130,246,0.2)" },
    { border: "rgb(234,179,8)", background: "rgba(234,179,8,0.2)" },
  ];

  const data = {
    labels: timeCategories.map((c) => c.label),
    datasets: [
      {
        data: playtimeByTimeOfDay,
        borderColor: colors.map((c) => c.border),
        backgroundColor: colors.map((c) => c.background),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        callbacks: {
          label: (context: any) => {
            const minutes = context.raw as number;
            const hours = Math.floor(minutes / 60);
            const rem = minutes % 60;
            const label = context.label;

            if (hours > 0) {
              return `${label}: ${hours}h ${rem}m`;
            } else {
              return `${label}: ${minutes}m`;
            }
          },
        },
      },
    },
    cutout: "50%",
  };

  return (
    <Section>
      <Section.Title title="AM vs PM" />
      <Section.Content>
        <div className="flex gap-4">
          <StatsCard
            value={`${((playtimeByTimeOfDay[0] * 100) / (playtimeByTimeOfDay[0] + playtimeByTimeOfDay[1])).toFixed(0)}%`}
            label="AM"
            detail={playtimeByTimeOfDay[0] > 0 ? `${(playtimeByTimeOfDay[0] / 60).toFixed(1)} hours` : "0 min"}
          />
          <StatsCard
            value={`${((playtimeByTimeOfDay[1] * 100) / (playtimeByTimeOfDay[0] + playtimeByTimeOfDay[1])).toFixed(0)}%`}
            label="PM"
            detail={playtimeByTimeOfDay[1] > 0 ? `${(playtimeByTimeOfDay[1] / 60).toFixed(1)} hours` : "0 min"}
          />
        </div>
        <div className="max-h-96">
          <Pie data={data} options={options} />
        </div>
      </Section.Content>
    </Section>
  );
};

export default ChartAMPMPlaytimeDistribution;
