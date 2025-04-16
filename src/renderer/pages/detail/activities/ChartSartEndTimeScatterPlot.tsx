import React, { useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const StartEndTimeScatterPlot = () => {
  const { selectedGame } = useGames();
  const sessions = selectedGame?.activities || [];

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const scatterData = useMemo(() => {
    const startPoints = [];
    const endPoints = [];

    sessions.forEach((session) => {
      const startTimestamp =
        typeof session.startedAt === "bigint"
          ? Number(session.startedAt)
          : session.startedAt;
      const endTimestamp =
        typeof session.endedAt === "bigint"
          ? Number(session.endedAt)
          : session.endedAt;

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

  const dayLabels = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const generateHourLabels = () => {
    const labels = [];
    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`);
    }
    return labels;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 24,
        ticks: {
          stepSize: 2,
          callback: function (value) {
            return value % 1 === 0 ? `${value}:00` : "";
          },
        },
        title: {
          display: true,
          text: "Time of Day",
        },
      },
      y: {
        type: "linear",
        min: -0.5,
        max: 6.5,
        ticks: {
          callback: function (value) {
            return value >= 0 && value <= 6 ? dayLabels[value] : "";
          },
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Day of Week",
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Gaming Session Start and End Times",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            const item = tooltipItems[0];
            const dataset = item.dataset;
            const isStart = dataset.label.includes("Start");

            return isStart ? "Session Start" : "Session End";
          },
          label: function (context) {
            const dataPoint = context.dataset.data[context.dataIndex];
            const dayName = dayLabels[dataPoint.y];

            const hours = Math.floor(dataPoint.x);
            const minutes = Math.round((dataPoint.x - hours) * 60);
            const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

            return `${dayName} at ${timeString}`;
          },
        },
      },
    },
  };

  return (
    <Card title="Start and End Times of Sessions">
      <div style={{ height: "500px", width: "100%" }}>
        <Scatter data={data} options={options} />
      </div>
    </Card>
  );
};

export default StartEndTimeScatterPlot;
