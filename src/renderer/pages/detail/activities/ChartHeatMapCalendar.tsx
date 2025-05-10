import React, { useMemo, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Scatter } from "react-chartjs-2";
import { useGames } from "@render//context/DatabaseContext";
import { Card } from "@render//components/card/Card";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const ChartHeatMapCalendar = () => {
  const { selectedGame } = useGames();
  const sessions = selectedGame?.activities || [];

  useEffect(() => {
    console.log("Sessions data received:", sessions);
    if (sessions && sessions.length > 0) {
      console.log("Sample session:", sessions[0]);
    }
  }, [sessions]);

  const calendarData = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      console.log("No sessions data available");
      return [];
    }

    const dayPlaytimeMap = new Map();

    sessions.forEach((session) => {
      try {
        const endTimestamp = typeof session.endedAt === "bigint" ? Number(session.endedAt) : Number(session.endedAt);

        const durationMinutes =
          typeof session.duration === "bigint" ? Number(session.duration) : Number(session.duration);

        if (isNaN(endTimestamp) || isNaN(durationMinutes)) {
          console.error("Invalid timestamp or duration:", {
            endedAt: session.endedAt,
            duration: session.duration,
          });
          return;
        }

        const endDate = new Date(endTimestamp);

        if (!(endDate instanceof Date && !isNaN(endDate.getTime()))) {
          console.error("Invalid date created from timestamp:", endTimestamp);
          return;
        }

        const dateKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

        if (dayPlaytimeMap.has(dateKey)) {
          dayPlaytimeMap.set(dateKey, dayPlaytimeMap.get(dateKey) + durationMinutes);
        } else {
          dayPlaytimeMap.set(dateKey, durationMinutes);
        }
      } catch (error) {
        console.error("Error processing session:", error, session);
      }
    });

    console.log("Day playtime map (minutes):", Array.from(dayPlaytimeMap.entries()));

    const dataPoints = [];
    const now = new Date();

    for (let i = 0; i < 56; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const weekNumber = Math.floor(i / 7);

      const dayOfWeek = date.getDay();

      const playtimeMinutes = dayPlaytimeMap.get(dateKey) || 0;
      const playtimeHours = playtimeMinutes / 60;

      dataPoints.push({
        x: dayOfWeek,
        y: weekNumber,
        value: playtimeHours,
        minutes: playtimeMinutes,
        date: new Date(date),
        dateString: dateKey,
      });
    }

    console.log("Generated data points for chart:", dataPoints);
    return dataPoints;
  }, [sessions]);

  const maxValue = useMemo(() => {
    if (calendarData.length === 0) return 1;
    const max = Math.max(...calendarData.map((point) => point.value), 0.1);
    console.log("Max value for color scaling (hours):", max);
    return max;
  }, [calendarData]);

  const getColor = (value: number) => {
    const intensity = Math.min(value / maxValue, 1);

    const r = Math.round(220 - intensity * 170);
    const g = Math.round(240 - intensity * 160);
    const b = 255;

    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  };

  const chartData = {
    datasets: [
      {
        label: "Playtime (Hours)",
        data: calendarData,
        backgroundColor: calendarData.map((point) => getColor(point.value)),
        borderColor: calendarData.map((point) => getColor(point.value)),
        borderWidth: 1,
        pointRadius: 15,
        pointHoverRadius: 18,
        hoverBackgroundColor: calendarData.map((point) => getColor(point.value)),
      },
    ],
  };

  return (
    <Card title="Gaming Activity Heat Map">
      <div style={{ height: "500px", width: "100%" }}>
        {sessions && sessions.length > 0 ? (
          <Scatter
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              showLine: false,
              scales: {
                x: {
                  type: "linear",
                  min: 0,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}`,
                    stepSize: 10,
                  },
                  title: {
                    display: true,
                    text: "X-Axis",
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
                y: {
                  type: "linear",
                  min: 0,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}`,
                    stepSize: 10,
                  },
                  title: {
                    display: true,
                    text: "Y-Axis",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    title: (tooltipItems) => {
                      if (!tooltipItems.length) return "";
                      const raw = tooltipItems[0].raw as { date?: Date };
                      if (!raw || !raw.date) return "Unknown date";
                      return raw.date.toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    },
                  },
                },
              },
            }}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>No gaming session data available to display.</div>
        )}
      </div>
    </Card>
  );
};

export default ChartHeatMapCalendar;
