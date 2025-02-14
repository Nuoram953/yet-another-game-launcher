import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";
import GameScopeSettings from "./GamescopeSettings";
import { Tile } from "../Tile";

export const SectionSettings = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        setLoading(false);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchBackgroundPicture();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="py-4">
      <Tile>
        <GameScopeSettings />
      </Tile>
    </div>
  );

  // SteamDeck=1 VKD3D_DISABLE_EXTENSIONS=VK_KHR_present_wait gamescope -e -W 3840 -H 1600 -r 144 --force-grab-cursor -- gamemoderun %command%
  //gamescope -e -W 3840 -H 1600 -r 144 --force-grab-cursor -- gamemoderun steam -silent steam://launch/1931730
};
