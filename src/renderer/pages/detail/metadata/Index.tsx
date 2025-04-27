import React, { useEffect, useState } from "react";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";
import { MEDIA_TYPE } from "../../../../common/constant";
import { Cross, Pencil, Trash } from "lucide-react";
import { Image } from "@/components/image/Image";
import { Button } from "@/components/button/Button";
import { useNotifications } from "@/components/NotificationSystem";
import ImageAddDialogue  from "./ImageAddDialogue";

export function SectionMetadata() {
  const { addNotification } = useNotifications();
  const { selectedGame } = useGames();
  const [media, setMedia] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState(
    MEDIA_TYPE.BACKGROUND
  );

  useEffect(() => {
    const fetchData = async () => {
      const media = await window.media.getAllMedia(selectedGame!.id);
      if (media) {
        const background = media.backgrounds.map((image) => ({
          src: image,
          name: formatMediaName(image),
          alt: "background",
          type: MEDIA_TYPE.BACKGROUND,
        }));
        const icon = media.icons.map((image) => ({
          src: image,
          name: formatMediaName(image),
          alt: "icon",
          type: MEDIA_TYPE.ICON,
        }));
        const logo = media.logos.map((image) => ({
          src: image,
          name: formatMediaName(image),
          alt: "logo",
          type: MEDIA_TYPE.LOGO,
        }));
        const cover = media.covers.map((image) => ({
          src: image,
          name: formatMediaName(image),
          alt: "cover",
          type: MEDIA_TYPE.COVER,
        }));

        setMedia({ background, icon, logo, cover });
      }
    };

    fetchData();
  }, [selectedGame]);

  const formatMediaName = (media: string) => {
    const match = media.match(/\/([^/]+\.[a-zA-Z0-9]+)$/);
    if (match) {
      return match[1];
    }
    return "";
  };

  const handleDelete = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string, mediaSrc: string) => {
    await window.media.delete(gameId, mediaType, mediaId);
    setMedia((prevMedia) => ({
      ...prevMedia,
      [mediaType]: prevMedia[mediaType].filter((image: { src: string }) => image.src !== mediaSrc),
    }));
    addNotification({
      title: "Media Deleted",
      message: `${mediaId} deleted successfully`,
      type: "success",
      duration: 2000,
    });
  };

  const handleEdit = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string, mediaSrc: string) => {
    await window.media.delete(gameId, mediaType, mediaId);
    setMedia((prevMedia) => ({
      ...prevMedia,
      [mediaType]: prevMedia[mediaType].filter((image: { src: string }) => image.src !== mediaSrc),
    }));
    addNotification({
      title: "Media Deleted",
      message: `${mediaId} deleted successfully`,
      type: "success",
      duration: 2000,
    });
  };

  const openAddDialog = (mediaType) => {
    setCurrentMediaType(mediaType);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentMediaType(null);
  };

  const handleImagesSelected = (selectedImages) => {
    if (!selectedImages.length || !currentMediaType) return;

    // Add the selected images to the current media type
    setMedia((prevMedia) => ({
      ...prevMedia,
      [currentMediaType]: [...(prevMedia[currentMediaType] || []), ...selectedImages],
    }));

    addNotification({
      title: "Media Added",
      message: `${selectedImages.length} ${currentMediaType.toLowerCase()} image${selectedImages.length !== 1 ? "s" : ""} added successfully`,
      type: "success",
      duration: 2000,
    });
  };

  return (
    <div className="container mx-auto mb-20 h-fit w-full space-y-4 py-4">
      <Card title="Metadata">test</Card>
      {Object.entries(media).map(([key, group]) => (
        <Card key={key} title={key} actions={[{ icon: Cross, name: "Add", onClick: () => openAddDialog(key) }]}>
          <div className="flex flex-col gap-2">
            {group.map((item, indexItem) => (
              <React.Fragment key={item.src}>
                <div className="flex flex-row items-center justify-between hover:bg-gray-700">
                  <div className="flex flex-row items-center gap-2">
                    <Image src={item.src} alt={item.alt} size="sm" loading="lazy"/>
                    <span>{item.name}</span>
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
                {indexItem < group.length - 1 && <div className="my-2 border-b border-gray-300"></div>}
              </React.Fragment>
            ))}
          </div>
        </Card>
      ))}

      {/* Image Selection Dialog */}
      <ImageAddDialogue
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onSelect={handleImagesSelected}
        mediaType={currentMediaType}
        gameId={selectedGame?.id}
        existingMedia={currentMediaType ? media[currentMediaType] : []}
      />
    </div>
  );
}
