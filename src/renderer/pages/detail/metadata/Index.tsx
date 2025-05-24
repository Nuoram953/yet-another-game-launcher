import React, { useCallback, useEffect, useState } from "react";
import { useGames } from "@render//context/DatabaseContext";
import { Card } from "@render//components/card/Card";
import { MEDIA_TYPE } from "../../../../common/constant";
import { Plus, Star, Trash, Video } from "lucide-react";
import { Image } from "@render//components/image/Image";
import { Button } from "@render//components/button/Button";
import { useNotifications } from "@render//components/NotificationSystem";
import ImageAddDialogue from "./ImageAddDialogue";
import { MediaItem, MediaState } from "./types";

export function SectionMetadata() {
  const { addNotification } = useNotifications();
  const { selectedGame } = useGames();
  const [media, setMedia] = useState<MediaState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState<MEDIA_TYPE>(MEDIA_TYPE.BACKGROUND);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMedia = useCallback(async () => {
    if (!selectedGame?.id) return;

    try {
      setLoading(false);
      const mediaData = await window.media.getAllMedia(selectedGame.id);
      console.log(mediaData);
      if (!mediaData) {
        setLoading(false);
        return;
      }

      const processedMedia: MediaState = {
        background: {
          all: formatMediaItems(mediaData.backgrounds.all, MEDIA_TYPE.BACKGROUND),
          default: mediaData.backgrounds.default,
        },
        icon: {
          all: formatMediaItems(mediaData.icons.all, MEDIA_TYPE.ICON),
          default: mediaData.icons.default,
        },
        logo: {
          all: formatMediaItems(mediaData.logos.all, MEDIA_TYPE.LOGO),
          default: mediaData.logos.default,
        },
        cover: {
          all: formatMediaItems(mediaData.covers.all, MEDIA_TYPE.COVER),
          default: mediaData.covers.default,
        },
        screenshot: {
          all: formatMediaItems(mediaData.screenshots.all, MEDIA_TYPE.SCREENSHOT),
          default: mediaData.screenshots.default,
        },
        trailer: {
          all: formatMediaItems(mediaData.trailers.all, MEDIA_TYPE.TRAILER),
          default: mediaData.trailers.default,
        },
      };

      setMedia(processedMedia);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch media:", error);
      addNotification({
        title: "Error",
        message: "Failed to load media assets",
        type: "error",
        duration: 3000,
      });
      setLoading(false);
    }
  }, [selectedGame, addNotification]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia, refreshKey]);

  const formatMediaItems = (items: string[], type: MEDIA_TYPE): MediaItem[] => {
    return items.map((imagePath) => ({
      src: imagePath,
      name: formatMediaName(imagePath),
      alt: type.toString(),
      type,
    }));
  };

  const refreshPage = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const formatMediaName = (mediaPath: string): string => {
    const match = mediaPath.match(/\/([^/]+\.[a-zA-Z0-9]+)$/);
    return match ? match[1] : "";
  };

  const handleSetDefault = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string) => {
    if (!gameId) return;
    await window.media.setDefault(gameId, mediaType, mediaId);
    refreshPage();
  };

  const handleDelete = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string, mediaSrc: string) => {
    if (!gameId || !mediaType || !mediaId) return;

    try {
      await window.media.delete(gameId, mediaType, mediaId);

      setMedia((prevMedia) => {
        if (!prevMedia) return null;

        const updatedMediaType = {
          ...prevMedia[mediaType],
          all: prevMedia[mediaType].all.filter((image) => image.src !== mediaSrc),
        };

        return {
          ...prevMedia,
          [mediaType]: updatedMediaType,
        };
      });

      addNotification({
        title: "Media Deleted",
        message: `${mediaId} deleted successfully`,
        type: "success",
        duration: 2000,
      });

      refreshPage();
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

  const openAddDialog = (mediaType: MEDIA_TYPE) => {
    setCurrentMediaType(mediaType);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const getImageDimensions = (type: string): string => {
    switch (type.toLowerCase()) {
      case "cover":
        return "h-48 w-full";
      case "logo":
        return "h-32 w-full";
      case "icon":
        return "h-16 w-full";
      case "screenshot":
      case "trailer":
        return "h-40 w-full";
      case "background":
        return "h-36 w-full";
      default:
        return "h-32 w-32";
    }
  };

  if (loading || !media) {
    return <div>...loading</div>;
  }

  return (
    <div className="container mx-auto mb-20 h-fit w-full space-y-4 py-4">
      {Object.entries(media).map(([mediaKey, group]) => (
        <Card
          key={mediaKey}
          title={mediaKey.charAt(0).toUpperCase() + mediaKey.slice(1)}
          actions={[
            {
              icon: Plus,
              name: "Add",
              onClick: () => openAddDialog(mediaKey as MEDIA_TYPE),
            },
            {
              icon: Trash,
              name: "Clear default",
              onClick: () => {
                if (selectedGame?.id) {
                  window.media.removeDefault(selectedGame.id, mediaKey as MEDIA_TYPE);
                  refreshPage();
                }
              },
              disabled: !group.default,
            },
          ]}
        >
          {group.all.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-gray-400">No {mediaKey} images added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {group.all.map((item) => {
                const dimensionClass = getImageDimensions(mediaKey);

                return (
                  <div
                    key={item.src}
                    className="relative cursor-pointer rounded-md border-2 border-gray-700 p-2 transition hover:border-gray-500 hover:shadow-md"
                  >
                    <div
                      className={`relative flex items-center justify-center overflow-hidden rounded bg-gray-900 ${dimensionClass}`}
                    >
                      {mediaKey === "trailer" ? (
                        <Video />
                      ) : (
                        <Image src={item.src} alt={item.alt || "image"} className="max-h-full object-contain" />
                      )}

                      <div className="absolute bottom-0 left-0 right-0 flex justify-end gap-1 bg-gradient-to-t from-black p-2">
                        <Button
                          intent="icon"
                          icon={Star}
                          iconColor={item.name === group?.default ? "yellow" : "white"}
                          aria-label="Set as default"
                          onClick={(e) => {
                            if (selectedGame?.id) {
                              handleSetDefault(selectedGame.id, item.type, item.name);
                              e.stopPropagation();
                            }
                          }}
                        />
                        <Button
                          intent="icon"
                          icon={Trash}
                          aria-label="Delete image"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedGame?.id) {
                              handleDelete(selectedGame.id, item.type, item.name, item.src);
                            }
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
        mediaType={currentMediaType}
        gameId={selectedGame?.id}
        refresh={refreshPage}
      />
    </div>
  );
}
