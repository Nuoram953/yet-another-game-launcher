import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { Game } from "@prisma/client";
import { Background } from "@/components/detail/Background";
import { Logo } from "@/components/detail/Logo";
import { Info } from "@/components/detail/Info";
import { Summary } from "@/components/detail/Summary";
import { PlayIcon, Settings } from "lucide-react";

const GameDetail = () => {
  const [game, setGame] = useState<Game>();
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams();
  const { setBreadcrumbs } = useBreadcrumbsContext();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const result = await window.database.getGame(id);
        if (result) {
          setGame(result);
          setLoading(false);
        }

        setBreadcrumbs([
          { path: "/", label: "Library" },
          { path: `/${result.id}`, label: result.name },
        ]);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchPicturePath();
  }, []);

  const handleOnClick = async () => {
    await window.steam.launch(game.externalId);
  };

  if (loading && game === undefined) {
    return <div>loading</div>;
  }

  return (
    <div className="bg-slate-500 h-screen relative">
      <div className="absolute inset-0">
        <Background gameId={id} />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center pt-16">
        <div className="max-w-[33vw] pb-[75px]">
          <Logo gameId={id} />

          <div className="flex flex-row gap-2 justify-center mt-4">
            <Button className="flex items-center gap-2 bg-green-600 text-white" onClick={handleOnClick}>
              <PlayIcon className="w-4 h-4" color="white" />
              Play
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-white"
            >
              <Settings className="w-4 h-4 text-white" />
              Manage
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center overflow-y-scroll h-fit w-full max-w-[1300px] mb-14">
          <div className="w-full">
            <Info game={game} />
            <Summary game={game} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
