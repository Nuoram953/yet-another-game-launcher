import React, { useState, useEffect } from "react";
import { DownloadHistory } from "@prisma/client";
import { GameWithRelations } from "src/common/types";
import _ from "lodash";

interface DownloadHistoryRowProps {
  id: string;
}

const DownloadHistoryRow = ({ id }: DownloadHistoryRowProps) => {
  const [game, setGame] = useState<GameWithRelations>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const data = await window.library.getGame(id);
        setGame(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture paths:", error);
      }
    };

    fetchGame();
  }, []);

  if (loading || _.isNil(game)) {
    return <div>loading...</div>;
  }

  return (
    <div className="flex h-16 flex-row">
      <div></div>
      <div className="flex flex-col">
        <p>{game.name}</p>
        <p>{game?.storefront!.name}</p>
        <p>{Number(game?.downloadHistory!.slice(-1).pop()?.createdAt)}</p>
      </div>
    </div>
  );
};

const DownloadHistory = () => {
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
    <div title="Download history">
      {downloadHistory.map((item) => (
        <DownloadHistoryRow id={item.gameId} />
      ))}
    </div>
  );
};

export default DownloadHistory;
