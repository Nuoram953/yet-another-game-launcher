import { Card } from "@render//components/card/Card";
import { useGames } from "@render//context/DatabaseContext";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import React, { useMemo } from "react";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ChartDailyPlaytimeDistribution = () => {
  const { selectedGame } = useGames();
  const sessions = selectedGame?.activities || [];

  // Define days of the week
  const dayCategories = [
    { label: "Monday", dayIndex: 1 },
    { label: "Tuesday", dayIndex: 2 },
    { label: "Wednesday", dayIndex: 3 },
    { label: "Thursday", dayIndex: 4 },
    { label: "Friday", dayIndex: 5 },
    { label: "Saturday", dayIndex: 6 },
    { label: "Sunday", dayIndex: 0 }, // Sunday is 0 in JavaScript Date
  ];

  // Calculate total playtime for each day
  const playtimeByDay = useMemo(() => {
    const playtimes = dayCategories.map(() => 0);

    sessions.forEach((session) => {
      // Get day of week from session start time (0 = Sunday, 1 = Monday, etc.)
      const startDate = new Date(Number(session.startedAt));
      const dayOfWeek = startDate.getDay();
      const duration = session.duration; // In minutes

      // Find the corresponding category index
      const categoryIndex = dayCategories.findIndex((category) => category.dayIndex === dayOfWeek);

      if (categoryIndex !== -1) {
        playtimes[categoryIndex] += duration;
      }
    });

    return playtimes;
  }, [sessions]);

  const data = {
    labels: dayCategories.map((category) => category.label),
    datasets: [
      {
        label: "Minutes Played",
        data: playtimeByDay,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
        pointBorderColor: "transparent",
        pointHoverBackgroundColor: "transparent",
        pointHoverBorderColor: "rgba(54, 162, 235, 1)",
      },
    ],
  };

  return (
    <Card title="Playtime Distribution: By Day of Week">
      <div style={{ height: "400px", width: "100%" }}>
        <Radar
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
              },
              tooltip: {
                callbacks: {
                  label: (context: TooltipItem<"radar">) => {
                    const minutes = context.raw as number;
                    const hours = Math.floor(minutes / 60);
                    const remainingMinutes = minutes % 60;
                    if (hours > 0) {
                      return `${context.label}: ${hours}h ${remainingMinutes}m (${minutes} min)`;
                    } else {
                      return `${context.label}: ${minutes} min`;
                    }
                  },
                },
              },
            },
            scales: {
              r: {
                beginAtZero: true,
                angleLines: {
                  display: true,
                  color: "rgba(99, 96, 97, 0.43)", // Color for the lines from center to edge
                },
                grid: {
                  display: true,
                  color: "rgba(99, 96, 97, 0.43)", // Color for the concentric circles
                },
                pointLabels: {
                  display: true,
                  font: {
                    size: 12,
                  },
                },
                ticks: {
                  display: false,
                  callback: function (value: any) {
                    const minutes = value as number;
                    const hours = Math.floor(minutes / 60);
                    if (hours > 0) {
                      return `${hours}h`;
                    }
                    return `${minutes}m`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </Card>
  );
};

export default ChartDailyPlaytimeDistribution;
