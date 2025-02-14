import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";

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
    <div>
      <div>Gamescope</div>
      <div>
        <Switch id="enable-gamescope" />
        <Label htmlFor="enable-gamescope">Enable Gamescope</Label>
      </div>

      <div>
        <Switch id="gamescope-steam-overlay" />
        <Label htmlFor="gamescope-steam-overlay">Enable steam overlay</Label>
      </div>

      <div>
        <Switch id="gamescope-steam-overlay" />
        <Label htmlFor="gamescope-steam-overlay">Enable steam overlay</Label>
      </div>
    </div>
  );

  // SteamDeck=1 VKD3D_DISABLE_EXTENSIONS=VK_KHR_present_wait gamescope -e -W 3840 -H 1600 -r 144 --force-grab-cursor -- gamemoderun %command%
};
