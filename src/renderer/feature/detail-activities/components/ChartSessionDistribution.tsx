import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import useGameStore from "@render/feature/detail/store/GameStore";
import Section from "@render/components/new/section";
import { StatsCard } from "@render/components/new/card/StatsCard";

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartSessionDurationDistribution = () => {
  const game = useGameStore((state) => state.game);
  const sessions = game?.activities || [];

  const durationBuckets = [
    { label: "0-15 min", min: 0, max: 15 },
    { label: "15-30 min", min: 15, max: 30 },
    { label: "30-60 min", min: 30, max: 60 },
    { label: "1-2 hours", min: 60, max: 120 },
    { label: "2-3 hours", min: 120, max: 180 },
    { label: "3+ hours", min: 180, max: Infinity },
  ];

  const durationCounts = useMemo(() => {
    const counts = durationBuckets.map(() => 0);

    sessions.forEach((session) => {
      const sessionDuration = session.duration;

      for (let i = 0; i < durationBuckets.length; i++) {
        if (sessionDuration >= durationBuckets[i].min && sessionDuration < durationBuckets[i].max) {
          counts[i]++;
          break;
        }
      }
    });

    return counts;
  }, [sessions]);

  const totalSessions = durationCounts.reduce((sum, c) => sum + c, 0) || 1;

  const under1hCount = durationCounts[0] + durationCounts[1] + durationCounts[2];
  const around1hCount = durationCounts[3];
  const over2hCount = durationCounts[4] + durationCounts[5];

  const under1h = (under1hCount / totalSessions) * 100;
  const around1h = (around1hCount / totalSessions) * 100;
  const over2h = (over2hCount / totalSessions) * 100;

  const formatPercent = (val: number) => `${val.toFixed(0)}%`;

  const colors = [
    { border: "rgba(255, 99, 132, 1)", background: "rgba(255, 99, 132, 0.2)" },
    { border: "rgba(54, 162, 235, 1)", background: "rgba(54, 162, 235, 0.2)" },
    { border: "rgba(255, 206, 86, 1)", background: "rgba(255, 206, 86, 0.2)" },
    { border: "rgba(75, 192, 192, 1)", background: "rgba(75, 192, 192, 0.2)" },
    { border: "rgba(153, 102, 255, 1)", background: "rgba(153, 102, 255, 0.2)" },
    { border: "rgba(255, 159, 64, 1)", background: "rgba(255, 159, 64, 0.2)" },
  ];

  const data = {
    labels: durationBuckets.map((bucket) => bucket.label),
    datasets: [
      {
        label: "Number of Sessions",
        data: durationCounts,
        borderColor: colors.map((c) => c.border),
        backgroundColor: colors.map((c) => c.background),
        borderWidth: 2,
      },
    ],
  };

  return (
    <Section>
      <Section.Title title="Avg Session Time" />
      <Section.Content>
        <div className="flex gap-4">
          <StatsCard value={formatPercent(under1h)} label="Under 1h" detail={`${under1hCount} sessions`} />
          <StatsCard value={formatPercent(around1h)} label="Around 1h" detail={`${around1hCount} sessions`} />
          <StatsCard value={formatPercent(over2h)} label="Over 2h" detail={`${over2hCount} sessions`} />
        </div>
        <div className="max-h-96 flex-1 sm:items-center sm:justify-center">
          <Pie
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: false,
                  labels: {
                    color: "#fff",
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.raw} sessions`,
                  },
                },
              },
              cutout: "50%",
            }}
          />
        </div>
      </Section.Content>
    </Section>
  );
};

export default ChartSessionDurationDistribution;
