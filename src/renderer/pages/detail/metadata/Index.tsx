import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";
import { ImageGallery } from "@/components/image/Gallery";
import { MEDIA_TYPE } from "../../../../common/constant";
import { Button } from "@/components/button/Button";
import { Cross } from "lucide-react";

export function SectionMetadata() {
  const { selectedGame } = useGames();
  const [media, setMedia] = useState<{ src: string; alt: string; type: MEDIA_TYPE; width?: number; height?: number }[]>(
    [],
  );

  function shuffleArray(array: { src: string; alt: string; type: MEDIA_TYPE; width?: number; height?: number }[]) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array;
  }

  useEffect(() => {
    const fetchData = async () => {
      const media = await window.media.getAllMedia(selectedGame!.id);
      if (media) {
        const backgrounds = media.backgrounds.map((background) => ({
          src: background,
          alt: "background",
          type: MEDIA_TYPE.BACKGROUND,
        }));
        const icons = media.icons.map((image) => ({ src: image, alt: "icon", type: MEDIA_TYPE.ICON }));
        const logos = media.logos.map((image) => ({ src: image, alt: "logo", type: MEDIA_TYPE.LOGO }));
        const covers = media.covers.map((image) => ({ src: image, alt: "cover", type: MEDIA_TYPE.COVER }));
        setMedia(shuffleArray([...backgrounds, ...icons, ...logos, ...covers]));
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto h-fit w-full space-y-4 py-4">
      <Card title="Metadata">test</Card>
      <Card title="Gallery" actions={[{ icon: Cross, name: "Add", onClick: () => {} }]}>
        <div className="flex flex-row gap-2">
          <Button size={"small"} text="All" />
          <Button size={"small"} text="Icons" />
          <Button size={"small"} text="Covers" />
          <Button size={"small"} text="Logs" />
        </div>
        <div className="my-5 border-b border-gray-300"></div>
        <ImageGallery images={media} />
      </Card>
    </div>
  );
}
