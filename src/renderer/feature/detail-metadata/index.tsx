import React, { useCallback, useEffect, useState } from "react";
import { Plus, Star, Trash, Video } from "lucide-react";
import { Image } from "@render//components/image/Image";
import { Button } from "@render//components/button/Button";
import { useNotifications } from "@render//components/NotificationSystem";
import ImageAddDialogue from "./ImageAddDialogue";
import { MediaItem, MediaState } from "./types";
import { MEDIA_TYPE } from "@common/constant";
import { getMedia } from "@render/api/electron";
import useGameStore from "../detail/store/GameStore";
import Section from "@render/components/new/section";

export function DetailsMetadata() {
  const { addNotification } = useNotifications();
  const game = useGameStore((state) => state.game);
  const [media, setMedia] = useState<MediaState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState<MEDIA_TYPE>(MEDIA_TYPE.BACKGROUND);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(false);
      const mediaData = await getMedia().getAllMedia(game.id);
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
        music: {
          all: formatMediaItems(mediaData.musics.all, MEDIA_TYPE.MUSIC),
          default: mediaData.musics.default,
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
  }, [game, addNotification]);

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
        return "h-fit w-full";
      default:
        return "h-32 w-32";
    }
  };

  console.log("Media state:", media);
  if (loading || !media) {
    return <div>...loading</div>;
  }

  return (
    <>
      {Object.entries(media).map(([mediaKey, group]) => (
        <Section>
          <Plus onClick={() => openAddDialog(MEDIA_TYPE.MUSIC)} />
          <Section.Title title={mediaKey.charAt(0).toUpperCase() + mediaKey.slice(1)} />
          <Section.Content>
            {group.all.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-design-text-subtle">No {mediaKey} images added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {group.all.map((item) => {
                  const dimensionClass = getImageDimensions(mediaKey);

                  return (
                    <div
                      key={item.src}
                      className="relative cursor-pointer rounded-md p-2 transition hover:scale-105 hover:border-design-border-hover hover:shadow-md"
                    >
                      <div
                        className={`relative flex items-center justify-center overflow-hidden rounded ${dimensionClass}`}
                      >
                        {mediaKey === "trailer" ? (
                          <Video />
                        ) : (
                          <Image src={item.src} alt={item.alt || "image"} className="max-h-full object-contain" />
                        )}
                      </div>

                      <div className="mt-1 flex items-center justify-start gap-2">
                        <div className="truncate text-center text-sm text-design-text-subtle">{item.name}</div>
                        <Button
                          intent="icon"
                          icon={Star}
                          size="fit"
                          iconColor={item.name === group?.default ? "yellow" : "white"}
                          aria-label="Set as default"
                          onClick={(e) => {
                            if (game?.id) {
                              handleSetDefault(game.id, item.type, item.name);
                              e.stopPropagation();
                            }
                          }}
                        />
                        <Button
                          intent="icon"
                          icon={Trash}
                          size="fit"
                          aria-label="Delete image"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (game?.id) {
                              handleDelete(game.id, item.type, item.name, item.src);
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section.Content>
        </Section>
      ))}

      <ImageAddDialogue
        isOpen={isDialogOpen}
        onClose={closeDialog}
        mediaType={currentMediaType}
        gameId={game?.id}
        refresh={refreshPage}
      />
    </>
  );
}
