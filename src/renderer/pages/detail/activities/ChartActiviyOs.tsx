import Tile from "@/components/Tile";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from "chart.js";
import React, { useEffect, useState } from "react";
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
    <Tile>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity per OS</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="mx-auto flex items-center justify-center">
        <div className="mx-auto max-h-[400px]">
          <Doughnut data={chartData} />
        </div>
      </CardContent>
    </Tile>
  );
};
