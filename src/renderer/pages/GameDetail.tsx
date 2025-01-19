import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { Game } from "@prisma/client";
import { Background } from "@/components/detail/Background";
import { Logo } from "@/components/detail/Logo";

const GameDetail = () => {
  const [game, setGame] = useState<Game>();
  const { id } = useParams();
  const { setBreadcrumbs } = useBreadcrumbsContext();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const result = await window.database.getGame(id);
        if (result) {
          setGame(result);
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

  return (
    <div className="bg-slate-500 h-screen relative">
      <div className="absolute inset-0">
        <Background gameId={id} />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center pt-16">
        <div className="max-w-[50vw]">
          <Logo gameId={id} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-white">{id}</p>
          <Button onClick={handleOnClick} />
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
