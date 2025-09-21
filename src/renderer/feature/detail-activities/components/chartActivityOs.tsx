import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import useGameStore from "@render/feature/detail/store/GameStore";
import Section from "@render/components/new/section";
import { StatsCard } from "@render/components/new/card/StatsCard";

ChartJS.register(ArcElement, Tooltip, Legend);

export const ChartActivityOs = () => {
  const game = useGameStore((state) => state.game);

  const chartOsData: any = {
    labels: [],
    datasets: [
      {
        label: "OS",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 2,
      },
    ],
  };

  // Windows
  if (game?.timePlayedWindows) {
    const color = "rgba(0, 120, 215, 0.4)";
    chartOsData.labels.push("Windows");
    chartOsData.datasets[0].data.push(game.timePlayedWindows / 60);
    chartOsData.datasets[0].backgroundColor.push(color);
    chartOsData.datasets[0].borderColor.push("rgba(0, 120, 215, 1)");
  }

  // Linux
  if (game?.timePlayedLinux) {
    const color = "rgba(48, 98, 48, 0.4)";
    chartOsData.labels.push("Linux");
    chartOsData.datasets[0].data.push(game.timePlayedLinux / 60);
    chartOsData.datasets[0].backgroundColor.push(color);
    chartOsData.datasets[0].borderColor.push("rgba(48, 98, 48, 1)");
  }

  // Mac
  if (game?.timePlayedMac) {
    const color = "rgba(88, 86, 214, 0.4)";
    chartOsData.labels.push("Mac");
    chartOsData.datasets[0].data.push(game.timePlayedMac / 60);
    chartOsData.datasets[0].backgroundColor.push(color);
    chartOsData.datasets[0].borderColor.push("rgba(88, 86, 214, 1)");
  }

  // Steamdeck
  if (game?.timePlayedSteamdeck) {
    const color = "rgba(0, 0, 0, 0.3)";
    chartOsData.labels.push("Steamdeck");
    chartOsData.datasets[0].data.push(game.timePlayedSteamdeck / 60);
    chartOsData.datasets[0].backgroundColor.push(color);
    chartOsData.datasets[0].borderColor.push("rgba(0, 0, 0, 0.9)");
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.85)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const label = context.label || "Unknown";
            const hours = Math.floor(value);
            const mins = Math.round((value % 1) * 60);
            return `${label}: ${hours}h ${mins}m`;
          },
        },
      },
    },
    cutout: "50%",
  };

  return (
    <Section>
      <Section.Title title="Per OS" />
      <Section.Content>
        <div className="flex gap-4">
          {game.timePlayedLinux > 0 && (
            <StatsCard
              value={((game.timePlayedLinux * 100) / game.timePlayed).toFixed(0) + "%"}
              detail={`${(game.timePlayedLinux / 60).toFixed(0)} hours`}
              label="Linux"
            />
          )}

          {game.timePlayedWindows > 0 && (
            <StatsCard
              value={((game.timePlayedWindows * 100) / game.timePlayed).toFixed(0) + "%"}
              detail={`${(game.timePlayedWindows / 60).toFixed(0)} hours`}
              label="Windows"
            />
          )}

          {game.timePlayedSteamdeck > 0 && (
            <StatsCard
              value={((game.timePlayedSteamdeck * 100) / game.timePlayed).toFixed(0) + "%"}
              detail={`${(game.timePlayedSteamdeck / 60).toFixed(0)} hours`}
              label="Steamdeck"
            />
          )}

          {game.timePlayedMac > 0 && (
            <StatsCard
              value={((game.timePlayedMac * 100) / game.timePlayed).toFixed(0) + "%"}
              detail={`${(game.timePlayedMac / 60).toFixed(0)} hours`}
              label="Steamdeck"
            />
          )}
        </div>
        <div className="max-h-96">
          <Pie data={chartOsData} options={options} />
        </div>
      </Section.Content>
    </Section>
  );
};
