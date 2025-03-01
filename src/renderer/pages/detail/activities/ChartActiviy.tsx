import { Card } from "@/components/card/Card";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";
import { ChartData } from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface Props {
  chartData: ChartData;
}

export const ChartActiviy = ({ chartData }: Props) => {
  const [timeRange, setTimeRange] = useState("weekly");

  const chartOptions = {
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
          label: function (context) {
            let label = context.dataset.label || "";
            if (label.includes("Playtime")) {
              return `${label}: ${context.parsed.y.toFixed(2)}`;
            }
            return `${label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card title={"Activity"}>
      <div className="h-[400px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
};
