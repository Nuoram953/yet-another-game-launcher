import { useGames } from "@/context/DatabaseContext";
import React, { useEffect, useState } from "react";
import { Tile } from "./Tile";
import { CardContent, CardHeader } from "@/components/ui/card";

export const SectionMetadata = () => {
  const [media, setMedia] = useState<{
    backgrounds: string[];
    icons: string[];
    logos: string[];
    covers: string[];
    trailers: string[];
  }>();
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedGame } = useGames();

  useEffect(() => {
    const fetchBackgroundPicture = async () => {
      try {
        const data = await window.media.getAllMedia(selectedGame!.id);
        setMedia(data);
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
    <div className="mx-auto w-full max-w-6xl space-y-4 py-4">
      <Tile>
        <CardHeader>Background</CardHeader>
        <CardContent>
          <div className="flex flex-row gap-4 overflow-x-auto">
            {media?.backgrounds.map((item: string) => (
              <img src={item} className="h-[100px] w-[300px]" />
            ))}
          </div>
        </CardContent>
      </Tile>

      <Tile>
        <CardHeader>Cover</CardHeader>
        <CardContent>
          <div className="flex flex-row gap-4 overflow-x-auto">
            {media?.covers.map((item: string) => (
              <img src={item} className="h-[300px] w-[200px]" />
            ))}
          </div>
        </CardContent>
      </Tile>
    </div>
  );
};
