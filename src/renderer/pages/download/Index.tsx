import React, { useState, useEffect } from "react";
import { useGames } from "@render//context/DatabaseContext";
import { DownloadHistoryRow } from "./History";
import { Column, Container } from "@render/components/layout/Container";
import { Card } from "@render/components/card/Card";
import { getLibrary } from "@render/api/electron";
import { DownloadRow } from "./DownloadRow";
import { DataRoute, RouteDownload } from "@common/constant";
import { X } from "lucide-react";

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

    window.data.on(RouteDownload.ON_DOWNLOAD_STOP, fetchData);

    return () => {
      window.data.removeAllListeners(RouteDownload.ON_DOWNLOAD_STOP);
    };
  }, []);

  if (loading) {
    return <div>...Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="relative flex flex-1 overflow-hidden">
        <div className="mx-auto mt-16 flex h-screen w-full flex-col gap-4">
          <Container>
            <div className="flex flex-col gap-4">
              <Card title="Downloads">
                {downloading.length > 0 ? (
                  downloading.map((download) => (
                    <DownloadRow key={download.id} title={download.id} data={download} speedHistory={[]} />
                  ))
                ) : (
                  <div className="flex h-[25vh] items-center justify-center text-design-text-subtle">
                    No downloads in progress
                  </div>
                )}
              </Card>

              {downloadHistory.length > 0 && (
                <Card
                  title="Recent Downloads"
                  actions={[
                    {
                      name: "Clear History",
                      onClick: () => {
                        getLibrary().clearDownloadHistory();
                        setDownloadHistory([]);
                      },
                      icon: X,
                    },
                  ]}
                >
                  <Column>
                    {downloadHistory.map((download) => (
                      <DownloadHistoryRow id={download.gameId} dateInstalled={download.createdAt} />
                    ))}
                  </Column>
                </Card>
              )}
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default DownloadView;
