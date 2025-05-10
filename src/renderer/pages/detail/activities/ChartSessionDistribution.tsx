import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useGames } from "@render//context/DatabaseContext";
import { Card } from "@render//components/card/Card";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartSessionDurationDistribution = () => {
  const { selectedGame } = useGames();
  const sessions = selectedGame?.activities || [];

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

  const data = {
    labels: durationBuckets.map((bucket) => bucket.label),
    datasets: [
      {
        label: "Number of Sessions",
        data: durationCounts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card title="Session Duration Distribution">
      <div style={{ height: "400px", width: "100%" }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: false,
                text: "Session Distribution",
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.raw} sessions`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
              x: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </Card>
  );
};

export default ChartSessionDurationDistribution;
