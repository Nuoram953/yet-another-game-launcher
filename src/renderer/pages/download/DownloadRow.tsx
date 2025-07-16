import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, Clock, Download, HardDrive, Settings, Zap } from "lucide-react";
import { GameWithRelations } from "@common/types";
import Spinner from "@render/components/Spinner";
import { useGames } from "@render/context/DatabaseContext";

interface GameDownloadRowProps {
  data: {
    progress: number;
    speed: number;
    timeRemaining: number;
    downloadedBytes: number;
    totalBytes: number;
  };
  title: string;
  speedHistory: { time: string; speed: number }[];
}

export const DownloadRow = ({ data, title, speedHistory }: GameDownloadRowProps) => {
  const [game, setGame] = useState<GameWithRelations>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const data = await window.library.getGame(title);
        setGame(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture paths:", error);
      }
    };

    fetchGame();
  }, []);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatSpeed = (speed: number) => {
    if (speed >= 1024) return `${(speed / 1024).toFixed(1)} GB/s`;
    return `${speed.toFixed(1)} MB/s`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs.toFixed(0)}s`;
    return `${secs.toFixed()}s`;
  };

  const formatBytes = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "from-emerald-400 to-emerald-600";
    if (progress >= 40) return "from-blue-400 to-blue-600";
    return "from-purple-400 to-purple-600";
  };

  const getSpeedStatus = (speed: number) => {
    if (speed >= 50) return { color: "text-emerald-400", icon: "🚀" };
    if (speed >= 20) return { color: "text-blue-400", icon: "⚡" };
    if (speed >= 5) return { color: "text-yellow-400", icon: "🐌" };
    return { color: "text-red-400", icon: "🔴" };
  };

  const speedStatus = getSpeedStatus(data.speed);

  if (loading || !game) {
    return <div className="text-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="group mb-4 rounded-xl p-6 transition-all duration-300">
      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-lg font-semibold text-white transition-colors">{game.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>{speedStatus.icon}</span>
              <span className={speedStatus.color}>{formatSpeed(data.speed)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            {data.progress >= 100 ? (
              <div className="flex flex-row items-center justify-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-full w-full animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                </div>
                <div className="text-xs text-slate-400">Installing</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{data.progress.toFixed(1)}%</div>
                <div className="text-xs text-slate-400">complete</div>
              </>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(data.progress)} relative transition-all duration-500 ease-out`}
            style={{ width: `${data.progress}%` }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/20"></div>
          </div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{formatBytes(data.downloadedBytes)}</span>
          <span>{formatBytes(data.totalBytes)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <div className="mb-1 flex items-center space-x-2 text-slate-400">
            <Zap className="h-4 w-4" />
            <span className="text-xs">Speed</span>
          </div>
          <div className="text-lg font-semibold text-white">{formatSpeed(data.speed)}</div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <div className="mb-1 flex items-center space-x-2 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Remaining</span>
          </div>
          <div className="text-lg font-semibold text-white">{formatTime(data.timeRemaining)}</div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <div className="mb-1 flex items-center space-x-2 text-slate-400">
            <HardDrive className="h-4 w-4" />
            <span className="text-xs">Downloaded</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {((data.downloadedBytes / data.totalBytes) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Expandable Speed Chart */}
      {isExpanded && (
        <div className="border-t border-slate-700 pt-4 duration-300 animate-in slide-in-from-top-2">
          <h4 className="mb-3 flex items-center space-x-2 text-sm font-medium text-slate-300">
            <Zap className="h-4 w-4" />
            <span>Speed History</span>
          </h4>
          <div className="h-32 rounded-lg bg-slate-800/30 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={speedHistory}>
                <defs>
                  <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" tick={false} axisLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value) => [`${value} MB/s`, "Speed"]}
                />
                <Area type="monotone" dataKey="speed" stroke="#3b82f6" fill="url(#speedGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
