import React, { useEffect, useState } from "react";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";
import { MEDIA_TYPE } from "../../../../common/constant";
import { Cross, Pencil, Trash } from "lucide-react";
import { Image } from "@/components/image/Image";
import { Button } from "@/components/button/Button";
import { useNotifications } from "@/components/NotificationSystem";

export function SectionMetadata() {
  const { addNotification } = useNotifications();
  const { selectedGame } = useGames();
  const [media, setMedia] = useState<
    { src: string; name: string; alt: string; type: MEDIA_TYPE; width?: number; height?: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const media = await window.media.getAllMedia(selectedGame!.id);
      if (media) {
        const backgrounds = media.backgrounds.map((image) => ({
          src: image,
          name: formatMediaName(image),
          alt: "background",
          type: MEDIA_TYPE.BACKGROUND,
        }));
        const icons = media.icons.map((image) => ({
          src: image,
          name: formatMediaName(image),
          alt: "icon",
          type: MEDIA_TYPE.ICON,
        }));
        const logos = media.logos.map((image) => ({
          src: image,
          name: formatMediaName(image),
          alt: "logo",
          type: MEDIA_TYPE.LOGO,
        }));
        const covers = media.covers.map((image) => ({
          src: image,
          name: formatMediaName(image),
          alt: "cover",
          type: MEDIA_TYPE.COVER,
        }));
        const categoryGroups = [...backgrounds, ...icons, ...logos, ...covers].reduce((groups, item) => {
          const key = item.type;
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(item);
          return groups;
        });
        setMedia(categoryGroups);
      }
    };

    fetchData();
  }, []);

  const formatMediaName = (media: string) => {
    const match = media.match(/\/([^/]+\.[a-zA-Z0-9]+)$/);
    if (match) {
      return match[1];
    }
    return "";
  };

  const handleDelete = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string, mediaSrc: string) => {
    await window.media.delete(gameId, mediaType, mediaId);
    setMedia((prevMedia) => prevMedia.filter((image) => image.src !== mediaSrc));
    addNotification({
      title: "Media Deleted",
      message: `${mediaId} deleted successfully`,
      type: "success",
      duration: 2000,
    });
  };

  const handleEdit = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string, mediaSrc: string) => {
    await window.media.delete(gameId, mediaType, mediaId);
    setMedia((prevMedia) => prevMedia.filter((image) => image.src !== mediaSrc));
    addNotification({
      title: "Media Deleted",
      message: `${mediaId} deleted successfully`,
      type: "success",
      duration: 2000,
    });
  };

  return (
    <div className="container mx-auto h-fit w-full space-y-4 py-4">
      <Card title="Metadata">test</Card>
      {media.map((group, index) => (
        <Card title="Gallery" actions={[{ icon: Cross, name: "Add", onClick: () => {} }]}>
          <div className="flex flex-col gap-2">
            {group.map((item) => (
              <>
                <div className="flex flex-row items-center justify-between hover:bg-gray-700">
                  <div className="flex flex-row items-center gap-2">
                    <Image src={item.src} alt={item.alt} size="sm" />
                    <span>{item.name}</span>
                    <span>{item.type}</span>
                  </div>
                  <div className="flex flex-row items-center">
                    <Button intent={"icon"} icon={Pencil} size="fit" onClick={() => {}} />
                    <Button
                      intent={"icon"}
                      icon={Trash}
                      size="fit"
                      onClick={() => {
                        handleDelete(selectedGame!.id, item.type, item.name, item.src);
                      }}
                    />
                  </div>
                </div>
                <div className="my-2 border-b border-gray-300"></div>
              </>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
