import React, { useEffect, useState } from "react";
import { useGames } from "@/context/DatabaseContext";
import { Card } from "@/components/card/Card";
import { MEDIA_TYPE } from "../../../../common/constant";
import { Check, Cross, Pencil, Star, Trash } from "lucide-react";
import { Image } from "@/components/image/Image";
import { Button } from "@/components/button/Button";
import { useNotifications } from "@/components/NotificationSystem";
import ImageAddDialogue from "./ImageAddDialogue";

export function SectionMetadata() {
  const { addNotification } = useNotifications();
  const { selectedGame } = useGames();
  const [media, setMedia] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState<MEDIA_TYPE | null>(MEDIA_TYPE.BACKGROUND);
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    const fetchMedia = async () => {
      if (!selectedGame?.id) return;

      try {
        const mediaData = await window.media.getAllMedia(selectedGame.id);
        if (!mediaData) return;

        const processedMedia = {
          background: formatMediaItems(mediaData.backgrounds, MEDIA_TYPE.BACKGROUND, "background"),
          icon: formatMediaItems(mediaData.icons, MEDIA_TYPE.ICON, "icon"),
          logo: formatMediaItems(mediaData.logos, MEDIA_TYPE.LOGO, "logo"),
          cover: formatMediaItems(mediaData.covers, MEDIA_TYPE.COVER, "cover"),
          screenshot: formatMediaItems(mediaData.screenshots, MEDIA_TYPE.SCREENSHOT, "screenshot"),
        };

        setMedia(processedMedia);
        // Initialize selected items structure
        const initialSelected = {};
        Object.keys(processedMedia).forEach((key) => {
          initialSelected[key] = [];
        });
        setSelectedItems(initialSelected);
      } catch (error) {
        console.error("Failed to fetch media:", error);
        addNotification({
          title: "Error",
          message: "Failed to load media assets",
          type: "error",
          duration: 3000,
        });
      }
    };

    fetchMedia();
  }, [selectedGame, addNotification]);

  const formatMediaItems = (items, type, alt) => {
    return items.map((imagePath) => ({
      src: imagePath,
      name: formatMediaName(imagePath),
      alt,
      type,
    }));
  };

  const formatMediaName = (mediaPath: string) => {
    const match = mediaPath.match(/\/([^/]+\.[a-zA-Z0-9]+)$/);
    return match ? match[1] : "";
  };

  const handleSetDefault = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string) => {
    await window.media.setDefault(gameId, mediaType, mediaId);
  };

  const handleDelete = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string, mediaSrc: string) => {
    if (!gameId || !mediaType || !mediaId) return;

    try {
      await window.media.delete(gameId, mediaType, mediaId);

      setMedia((prevMedia) => ({
        ...prevMedia,
        [mediaType]: prevMedia[mediaType].filter((image) => image.src !== mediaSrc),
      }));

      addNotification({
        title: "Media Deleted",
        message: `${mediaId} deleted successfully`,
        type: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to delete media:", error);
      addNotification({
        title: "Error",
        message: `Failed to delete ${mediaId}`,
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleBulkDelete = async (mediaType: MEDIA_TYPE) => {
    if (!selectedGame?.id || selectedItems[mediaType].length === 0) return;

    try {
      for (const item of selectedItems[mediaType]) {
        await window.media.delete(selectedGame.id, item.type, item.name);
      }

      setMedia((prevMedia) => ({
        ...prevMedia,
        [mediaType]: prevMedia[mediaType].filter(
          (image) => !selectedItems[mediaType].some((selected) => selected.src === image.src),
        ),
      }));

      // Clear selection after deletion
      setSelectedItems((prev) => ({
        ...prev,
        [mediaType]: [],
      }));

      addNotification({
        title: "Multiple Items Deleted",
        message: `${selectedItems[mediaType].length} items successfully deleted`,
        type: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to perform bulk delete:", error);
      addNotification({
        title: "Error",
        message: "Failed to delete some items",
        type: "error",
        duration: 3000,
      });
    }
  };

  const toggleItemSelection = (mediaType, item) => {
    setSelectedItems((prev) => {
      const isSelected = prev[mediaType].some((selected) => selected.src === item.src);

      if (isSelected) {
        return {
          ...prev,
          [mediaType]: prev[mediaType].filter((selected) => selected.src !== item.src),
        };
      } else {
        return {
          ...prev,
          [mediaType]: [...prev[mediaType], item],
        };
      }
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

  const getImageDimensions = (type: string) => {
    switch (String(type).toLowerCase()) {
      case "cover":
        return "h-48 w-full"; // Wider for covers
      case "logo":
        return "h-32 w-full"; // Square for logos
      case "icon":
        return "h-16 w-full"; // Small for icons
      case "screenshot":
        return "h-40 w-full"; // 16:10 ratio for screenshots
      case "background":
        return "h-36 w-full"; // Wide for backgrounds
      default:
        return "h-32 w-32"; // Default square
    }
  };

  const handleImagesSelected = (selectedImages) => {
    if (!selectedImages.length || !currentMediaType) return;

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
      {Object.entries(media).map(([mediaKey, group]) => (
        <Card
          key={mediaKey}
          title={mediaKey.charAt(0).toUpperCase() + mediaKey.slice(1)}
          actions={[
            {
              icon: Cross,
              name: "Add",
              onClick: () => openAddDialog(mediaKey),
            },
          ]}
        >
          {selectedItems[mediaKey]?.length > 0 && (
            <div className="mb-4 flex items-center justify-between border-b border-gray-700 pb-3">
              <span className="text-sm">
                {selectedItems[mediaKey].length} item{selectedItems[mediaKey].length !== 1 ? "s" : ""} selected
              </span>
              <Button
                intent="secondary"
                text="Delete Selected"
                size="sm"
                icon={Trash}
                onClick={() => handleBulkDelete(mediaKey)}
              />
            </div>
          )}

          {group.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-gray-400">No {mediaKey} images added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {group.map((item) => {
                const isSelected = selectedItems[mediaKey]?.some((selected) => selected.src === item.src);
                const dimensionClass = getImageDimensions(mediaKey);

                return (
                  <div
                    key={item.src}
                    className={`relative cursor-pointer rounded-md border-2 p-2 transition hover:shadow-md ${
                      isSelected ? "border-blue-500" : "border-gray-700 hover:border-gray-500"
                    }`}
                    onClick={() => toggleItemSelection(mediaKey, item)}
                  >
                    <div
                      className={`relative flex items-center justify-center overflow-hidden rounded bg-gray-900 ${dimensionClass}`}
                    >
                      <Image src={item.src} alt={item.alt || "image"} className="max-h-full object-contain" />

                      {isSelected && (
                        <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1">
                          <Check size={16} />
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 flex justify-end gap-1 bg-gradient-to-t from-black p-2">
                        <Button
                          intent="icon"
                          icon={<Star/>}
                          size="xs"
                          aria-label="Edit image"
                          onClick={(e) => {
                            handleSetDefault(selectedGame!.id, item.type, item.name);
                            e.stopPropagation();
                            // Edit functionality would go here
                          }}
                        />
                        <Button
                          intent="icon"
                          icon={Trash}
                          size="xs"
                          aria-label="Delete image"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(selectedGame?.id, item.type, item.name, item.src);
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 truncate text-sm text-gray-300">{item.name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ))}

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
