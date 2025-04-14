import { BubbleDataPoint, ChartData, Point } from "chart.js";
import React from "react";
import { Doughnut } from "react-chartjs-2";

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
import { Card } from "@/components/card/Card";

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

export const ChartActivityOs = ({ chartData }: Props) => {
  return (
    <Card title="Activity per OS">
      <Doughnut
        data={
          chartData as ChartData<
            "doughnut",
            (number | [number, number] | Point | BubbleDataPoint | null)[],
            unknown
          >
        }
      />
    </Card>
  );
};
