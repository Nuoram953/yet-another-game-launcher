import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Clock, HardDrive, ChevronRight } from "lucide-react";
import { useGames } from "@/context/DatabaseContext";
import { DownloadStats, GameWithRelations } from "src/common/types";
import { DownloadHistory } from "@prisma/client";
import { Tile } from "../detail/Tile";

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

const formatSpeed = (bytesPerSecond) => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

const formatTime = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600)
    return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
};

const GameDownloadRow = ({ data, title, speedHistory }) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <div className="space-y-2 p-4">
        {/* Title and Progress Row */}
        <div className="flex items-center justify-between">
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500">
            {data.progress.toFixed(1)}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${data.progress}%` }}
          />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex space-x-4">
            <div>
              <span className="text-gray-500">Speed:</span>{" "}
              <span className="font-medium">{formatSpeed(data.speed)}</span>
            </div>
            <div>
              <span className="text-gray-500">Remaining:</span>{" "}
              <span className="font-medium">
                {formatTime(data.timeRemaining)}
              </span>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Downloaded:</span>{" "}
            <span className="font-medium">
              {formatBytes(data.downloadedBytes)} /{" "}
              {formatBytes(Number(data.totalBytes))}
            </span>
          </div>
        </div>

        {/* Speed Chart */}
        <div className="h-24">
          <AreaChart
            data={speedHistory}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={false} />
            <YAxis
              label={{ value: "MB/s", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="speed"
              stroke="#2563eb"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          </AreaChart>
        </div>
      </div>
    </div>
  );
};

const DownloadView = () => {
  const { downloading } = useGames();
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);

  useEffect(() => {
    const fetchDownloadHistory = async () => {
      try {
        const games = await window.library.getDownloadHistory();
        setDownloadHistory(games);
      } catch (error) {
        console.error("Error fetching picture paths:", error);
      }
    };

    fetchDownloadHistory();
  }, []);

  return (
    <div className="w-full p-4">
      <Tile>
        <div className="w-full">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Downloads
                </CardTitle>
                <div className="text-sm">
                  Total Speed:{" "}
                  <span className="font-bold text-blue-600">
                    {formatSpeed(0)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {downloading.map((download) => (
                <GameDownloadRow
                  key={download.id}
                  title={download.id}
                  data={download}
                  speedHistory={0}
                />
              ))}
            </CardContent>
          </Card>
          {downloadHistory.map((item) => (
            <div>{item.gameId}</div>
          ))}
        </div>
      </Tile>
    </div>
  );
};

export default DownloadView;
