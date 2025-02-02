import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useGames } from "@/context/DatabaseContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const AchievementTimeline = () => {
  const { selectedGame } = useGames();

  const processData = () => {
    const countsByDate = new Map();

    selectedGame.achievements
      .filter((item) => item.isUnlocked)
      .forEach((achievement) => {
        const date = new Date(Number(achievement.unlockedAt) * 1000)
          .toISOString()
          .split("T")[0];

        countsByDate.set(date, (countsByDate.get(date) || 0) + 1);
      });

    return Array.from(countsByDate.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  };

  const processedData = processData();
  const labels = processedData.map(([date]) => date);
  const counts = processedData.map(([, count]) => count);

  const data = {
    labels,
    datasets: [
      {
        label: "Achievements Unlocked",
        data: counts,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
        text: "Achievement Timeline",
      },
      legend:{
        display:false
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-96 w-full">
      <Line options={options} data={data} />
    </div>
  );
};

export default AchievementTimeline;
