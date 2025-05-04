import React, { useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, TooltipItem } from "chart.js";
import { useGames } from "@render//context/DatabaseContext";
import { Card } from "@render//components/card/Card";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterDataPoint {
  x: number;
  y: number;
  originalDate: Date;
}

const StartEndTimeScatterPlot = () => {
  const { selectedGame } = useGames();
  const sessions = selectedGame?.activities || [];

  const scatterData = useMemo(() => {
    const startPoints: ScatterDataPoint[] = [];
    const endPoints: ScatterDataPoint[] = [];

    sessions.forEach((session) => {
      const startTimestamp = typeof session.startedAt === "bigint" ? Number(session.startedAt) : session.startedAt;
      const endTimestamp = typeof session.endedAt === "bigint" ? Number(session.endedAt) : session.endedAt;

      const startDate = new Date(startTimestamp);
      const endDate = new Date(endTimestamp);

      const startHours = startDate.getHours() + startDate.getMinutes() / 60;
      const endHours = endDate.getHours() + endDate.getMinutes() / 60;

      startPoints.push({
        x: startHours,
        y: startDate.getDay(),
        originalDate: startDate,
      });

      endPoints.push({
        x: endHours,
        y: endDate.getDay(),
        originalDate: endDate,
      });
    });

    return {
      startPoints,
      endPoints,
    };
  }, [sessions]);

  const data = {
    datasets: [
      {
        label: "Session Start Time",
        data: scatterData.startPoints,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "Session End Time",
        data: scatterData.endPoints,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  return (
    <Card title="Start and End Times of Sessions">
      <div style={{ height: "500px", width: "100%" }}>
        <Scatter
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: "linear",
                min: 0,
                max: 24,
                ticks: {
                  stepSize: 1,
                  callback: (value) => `${value}:00`,
                },
                title: {
                  display: true,
                  text: "Time of Day (Hours)",
                },
              },
              y: {
                type: "linear",
                title: {
                  display: true,
                  text: "Day of Week",
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  title: (tooltipItems: TooltipItem<"scatter">[]) => {
                    const datasetLabel = tooltipItems[0]?.dataset.label;
                    if (!datasetLabel) return "";
                    return datasetLabel.includes("Start") ? "Session Start" : "Session End";
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

export default StartEndTimeScatterPlot;
