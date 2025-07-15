import React, { useState, useEffect } from "react";
import { GameWithRelations } from "src/common/types";
import _ from "lodash";
import { getMedia } from "@render/api/electron";
import { Image } from "@render/components/image/Image";
import { Button } from "@render/components/button/Button";
import { Calendar, Store } from "lucide-react";
import { unixToDate, formatDateWithOrdinalYear } from "@render/utils/util";
import { useTranslation } from "react-i18next";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useNavigate } from "react-router-dom";

interface DownloadHistoryRowProps {
  id: string;
  dateInstalled: bigint;
}

export const DownloadHistoryRow = ({ id, dateInstalled }: DownloadHistoryRowProps) => {
  const [game, setGame] = useState<GameWithRelations>();
  const [cover, setCover] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const data = await window.library.getGame(id);
        const cover = await getMedia().getCovers(id, 1);
        setGame(data);
        setCover(cover[0]);
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
    <div className="flex w-full gap-6">
      <div className="flex w-1/5 flex-col">
        <Image src={cover} alt={""} intent={"cover"} className="h-48 w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h1 className="text-lg font-bold">{game.name}</h1>
        <div className="flex flex-row gap-8">
          <div className="flex flex-row items-center justify-center gap-1 text-gray-300">
            <Calendar className="mr-1" size={16} />
            <p>{formatDateWithOrdinalYear(Number(dateInstalled))}</p>
          </div>
          <div className="flex flex-row items-center justify-center gap-1 text-gray-300">
            <Store className="mr-1" size={16} />
            <p>{t(`storefront.${game.storefront.name}`, { ns: LOCALE_NAMESPACE.COMMON })}</p>
          </div>
        </div>
        <p className="multiline-ellipsis text-design-text-subtle">{game.summary}</p>
        <div className="mt-2">
          <Button
            intent="primary"
            text="Go to page"
            size="small"
            onClick={() => {
              navigate(`/game/${game.id}`, { replace: true });
            }}
          />
        </div>
      </div>
    </div>
  );
};
