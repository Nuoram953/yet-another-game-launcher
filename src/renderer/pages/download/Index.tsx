import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CardHeader, CardTitle, CardContent } from "@render//components/ui/card";
import { Download, Settings } from "lucide-react";
import { useGames } from "@render//context/DatabaseContext";
import { DownloadHistoryRow } from "./History";
import { Column, Container } from "@render/components/layout/Container";
import { Card } from "@render/components/card/Card";
import { getLibrary } from "@render/api/electron";

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

const formatSpeed = (bytesPerSecond: number) => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
};

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

const GameDownloadRow = ({ data, title, speedHistory }: GameDownloadRowProps) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <div className="space-y-2 p-4">
        {/* Title and Progress Row */}
        <div className="flex items-center justify-between">
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500">{data.progress.toFixed(1)}%</div>
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
              <span className="font-medium">{formatTime(data.timeRemaining)}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Downloaded:</span>{" "}
            <span className="font-medium">
              {formatBytes(data.downloadedBytes)} / {formatBytes(Number(data.totalBytes))}
            </span>
          </div>
        </div>

        {/* Speed Chart */}
        <div className="h-24">
          <AreaChart data={speedHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={false} />
            <YAxis label={{ value: "MB/s", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Area type="monotone" dataKey="speed" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        </div>
      </div>
    </div>
  );
};

const DownloadView = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const { downloading } = useGames();

  useEffect(() => {
    const fetchData = async () => {
      setDownloadHistory(await getLibrary().getDownloadHistory());
    };
    fetchData();
    setLoading(false);
  }, []);

  if (loading) {
    return <div>...Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="relative flex flex-1 overflow-hidden">
        <div className="mt-16 flex h-screen flex-col gap-4">
          <Container>
            <div className="flex flex-col gap-4">
              <Card title="Stats">
                <div>Stats</div>
              </Card>

              <Card title="Downloading">
                <div>Stats</div>
              </Card>

              <Card title="Recent Downloads">
                <Column>
                  {downloadHistory.map((download) => (
                    <DownloadHistoryRow id={download.gameId} dateInstalled={download.createdAt} />
                  ))}
                </Column>
              </Card>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

// {downloading.map((download) => (
//   <GameDownloadRow key={download.id} title={download.id} data={download} speedHistory={[]} />
// ))}

export default DownloadView;
