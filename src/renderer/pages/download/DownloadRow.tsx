import React, { useEffect, useState } from "react";
import { GameWithRelations } from "@common/types";

interface GameDownloadRowProps {
  data: {
    progress: number;
    speed: number;
    timeRemaining: number;
    downloadedBytes: number;
    totalBytes: number;
  };
  title: string;
}

export const DownloadRow = ({ data, title }: GameDownloadRowProps) => {
  const [game, setGame] = useState<GameWithRelations>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const data = await window.library.getGame(title, false);
        setGame(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture paths:", error);
      }
    };

    fetchGame();
  }, []);

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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "from-emerald-400 to-emerald-600";
    if (progress >= 40) return "from-blue-400 to-blue-600";
    return "from-purple-400 to-purple-600";
  };

  if (loading || !game) {
    return <div className="text-center text-design-text-subtle">Loading...</div>;
  }

  return (
    <div className="group mb-4 rounded-xl p-6 transition-all duration-300">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-lg font-semibold text-design-white transition-colors">{game.name}</h3>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            {data.progress >= 100 ? (
              <div className="flex flex-row items-center justify-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <div className="h-full w-full animate-spin rounded-full border-4 border-design-white border-t-transparent"></div>
                </div>
                <div className="text-xs text-design-text-subtle">Installing</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-design-white">{data.progress.toFixed(1)}%</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-3 w-full overflow-hidden rounded-full bg-design-download-progressBar">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(data.progress)} relative transition-all duration-500 ease-out`}
            style={{ width: `${data.progress}%` }}
          >
            <div className="bg-design-white/20 absolute inset-0 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-1 flex gap-2 text-xs text-design-text-subtle">
          <span>{formatSpeed(data.speed)}</span>
          <span>•</span>
          <span>{formatTime(data.timeRemaining)}</span>
        </div>
      </div>
    </div>
  );
};
