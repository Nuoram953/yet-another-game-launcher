import React from "react";

interface Props {
  score: number | null;
  maxScore?: number;
  size?: number;
  label: string;
}

const ScoreCircle = ({
  score,
  maxScore = 100,
  size = 100,
  label = "Score",
}: Props) => {
  const percentage =
    score !== null && !isNaN(score) ? Math.round((score / maxScore) * 100) : null;

  const getColors = (percentage: number | null) => {
    if (percentage === null) {
      return {
        stroke: "#94a3b8", // slate-400
        background: "#e2e8f0", // slate-200
      };
    }
    if (percentage < 33) {
      return {
        stroke: "#ef4444", // red-500
        background: "#fee2e2", // red-100
      };
    }
    if (percentage < 66) {
      return {
        stroke: "#eab308", // yellow-500
        background: "#fef9c3", // yellow-100
      };
    }
    return {
      stroke: "#22c55e", // green-500
      background: "#dcfce7", // green-100
    };
  };

  const radius = 47;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray =
    percentage !== null
      ? `${(percentage / 100) * circumference} ${circumference}`
      : "0 ${circumference}";

  const colors = getColors(percentage);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-medium text-white">{label}</span>
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          className="absolute"
          viewBox="0 0 100 100"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-none"
            stroke={colors.background}
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-none transition-all duration-500 ease-in-out"
            stroke={colors.stroke}
            strokeWidth="6"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dasharray"
              dur="0.5s"
              fill="freeze"
            />
          </circle>
        </svg>
        <div className="relative flex flex-col items-center justify-center">
          {score !== null ? (
            <>
              <span
                className="text-2xl font-bold"
                style={{ color: colors.stroke }}
              >
                {percentage}%
              </span>
              <span className="text-xs text-gray-500">
                {score}/{maxScore}
              </span>
            </>
          ) : (
            <span className="text-lg font-medium text-gray-500">No data</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreCircle;
