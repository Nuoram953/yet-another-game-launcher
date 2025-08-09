import React, { useEffect, useRef, useState } from "react";
import { Clock, Target, Trophy, Star, BarChart3, PieChart, User, TrendingUp, TrendingDown } from "lucide-react";
import Chart from "chart.js/auto";
import useGameStore from "@render/feature/detail/store/GameStore";

export const HowLongToBeatWithComparison = () => {
  const game = useGameStore((state) => state.game);
  const data = {
    main: game.mainStory / 60 / 60,
    mainExtra: game.mainPlusExtra / 60 / 60,
    completionist: game.completionist / 60 / 60,
  };
  const personalTime = game?.timePlayed / 60 || 0;
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const formatTime = (hours) => {
    if (!hours) return "N/A";

    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    } else if (hours >= 100) {
      return `${Math.round(hours)}hrs`;
    } else {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);

      if (minutes === 0) {
        return `${wholeHours}hrs`;
      } else {
        return `${wholeHours}h ${minutes}min`;
      }
    }
  };

  const timeData = [
    {
      type: "Main Story",
      time: data.main || 0,
      icon: Target,
      description: "Focus on main objectives",
      color: "#60A5FA",
      borderColor: "#3B82F6",
    },
    {
      type: "Main + Extras",
      time: data.mainExtra || 0,
      icon: Star,
      description: "Main story plus side content",
      color: "#FBBF24",
      borderColor: "#F59E0B",
    },
    {
      type: "Completionist",
      time: data.completionist || 0,
      icon: Trophy,
      description: "100% completion",
      color: "#34D399",
      borderColor: "#10B981",
    },
  ];

  // Add personal time to the data
  const personalTimeData = {
    type: "Your Time",
    time: personalTime,
    icon: User,
    description: "Your actual playtime",
    color: "#F472B6", // pink-400
    borderColor: "#EC4899", // pink-500
  };

  const allTimeData = [...timeData, personalTimeData];
  const validData = allTimeData.filter((item) => item.time > 0);
  const hasData = validData.length > 0;

  // Calculate comparison insights
  const getClosestCategory = () => {
    if (!personalTime) return null;

    const availableTimes = timeData.filter((item) => item.time > 0);
    if (availableTimes.length === 0) return null;

    let closest = availableTimes[0];
    let minDiff = Math.abs(personalTime - closest.time);

    availableTimes.forEach((item) => {
      const diff = Math.abs(personalTime - item.time);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    });

    return {
      category: closest.type,
      difference: personalTime - closest.time,
      percentage: closest.time > 0 ? ((personalTime - closest.time) / closest.time) * 100 : 0,
    };
  };

  const comparison = getClosestCategory();

  useEffect(() => {
    if (!hasData || !chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    const config = {
      type: "bar",
      data: {
        labels: validData.map((item) => item.type),
        datasets: [
          {
            label: "Hours to Complete",
            data: validData.map((item) => item.time),
            backgroundColor: validData.map((item) => item.color + "33"),
            borderColor: validData.map((item) => item.borderColor),
            borderWidth: validData.map((item) => (item.type === "Your Time" ? 3 : 2)),
            borderRadius: 0,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#374151" },
            ticks: {
              color: "#9CA3AF",
              callback: function (value) {
                return formatTime(value);
              },
            },
            title: {
              display: true,
              text: "Hours",
              color: "#E5E7EB",
            },
          },
          x: {
            grid: { color: "#374151" },
            ticks: { color: "#9CA3AF" },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1F2937",
            titleColor: "#F9FAFB",
            bodyColor: "#F9FAFB",
            borderColor: "#374151",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const hours = context.parsed.y;
                const isPersonal = context.label === "Your Time";
                return `${context.label}: ${formatTime(hours)}${isPersonal ? " (You)" : ""}`;
              },
            },
          },
        },
      },
    };

    // @ts-ignore
    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [validData, hasData]);

  if (!hasData) {
    return null;
  }

  return (
    <div className={`rounded-lg p-6`}>
      {personalTime > 0 && comparison && (
        <div className="mb-6 rounded-lg border border-gray-600 bg-gray-800 p-4">
          <div className="mb-2 flex items-center gap-3">
            <User className="h-5 w-5 text-pink-400" />
            <h4 className="font-semibold text-white">Your Playtime Analysis</h4>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {comparison.difference > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-400" />
            )}
            <span className="text-gray-300">
              You played {Math.abs(comparison.percentage).toFixed(0)}%
              {comparison.difference > 0 ? " longer" : " shorter"} than the average {comparison.category.toLowerCase()}
            </span>
          </div>
        </div>
      )}

      <div className="relative mb-6 h-64">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};
