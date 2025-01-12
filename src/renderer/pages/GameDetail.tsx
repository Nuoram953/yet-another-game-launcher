import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { Game } from "@prisma/client";

const GameDetail = () => {
  const [game, setGame] = useState<Game>();
  const { id } = useParams();
  const { setBreadcrumbs } = useBreadcrumbsContext();

  useEffect(() => {
    const fetchPicturePath = async () => {
      try {
        const result = await window.database.getGame(id);
        console.log(result);
        if (result) {
          setGame(result);
        }

        setBreadcrumbs([
          { path: "/", label: "library" },
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
    <div>
      <p>{id}</p>
      <Button onClick={handleOnClick} />
    </div>
  );
};

export default GameDetail;
