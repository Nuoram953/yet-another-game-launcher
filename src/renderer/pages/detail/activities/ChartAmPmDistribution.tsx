import { Card } from "@render//components/card/Card";
import { useGames } from "@render//context/DatabaseContext";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from "chart.js";
import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartAMPMPlaytimeDistribution = () => {
  const { selectedGame } = useGames();
  const sessions = selectedGame?.activities || [];

  // Define AM and PM categories
  const timeCategories = [
    { label: "AM (12:00 AM - 11:59 AM)", min: 0, max: 12 },
    { label: "PM (12:00 PM - 11:59 PM)", min: 12, max: 24 },
  ];

  // Calculate total playtime for AM and PM
  const playtimeByTimeOfDay = useMemo(() => {
    const playtimes = timeCategories.map(() => 0);

    sessions.forEach((session) => {
      // Extract hour from start and end times
      const startHour = new Date(Number(session.startedAt)).getHours();
      const endHour = new Date(Number(session.endedAt)).getHours();
      const duration = session.duration; // In minutes

      // Simple approach: categorize by session start time
      for (let i = 0; i < timeCategories.length; i++) {
        if (startHour >= timeCategories[i].min && startHour < timeCategories[i].max) {
          playtimes[i] += duration;
          break;
        }
      }
    });

    return playtimes;
  }, [sessions]);

  const data = {
    labels: timeCategories.map((category) => category.label),
    datasets: [
      {
        label: "Minutes Played",
        data: playtimeByTimeOfDay,
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 159, 64, 0.6)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 159, 64, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card title="Playtime Distribution: AM vs PM">
      <div style={{ height: "400px", width: "100%" }}>
        <Doughnut
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
                  label: (context: TooltipItem<"doughnut">) => {
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
            cutout: "50%",
          }}
        />
      </div>
    </Card>
  );
};

export default ChartAMPMPlaytimeDistribution;
