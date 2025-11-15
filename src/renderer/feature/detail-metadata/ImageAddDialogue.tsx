import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, Upload, Eye, Timer, Plus } from "lucide-react";
import { Image } from "@render//components/image/Image";
import { MEDIA_TYPE } from "@common/constant";
import { MediaItem } from "./types";
import { Video } from "@main/externalApi/youtube/types";
import useGameStore from "../detail/store/GameStore";
import { Dialog } from "@render/components/new/popup";
import Button from "@render/components/new/button/Button";
import { useDebounce } from "@render/hooks/useDebounce";
import { Input } from "@render/components/new/input";

interface ImageSelectionDialogProps {
  mediaType: MEDIA_TYPE;
}

export default function ImageAddDialogue({ mediaType }: ImageSelectionDialogProps) {
  const game = useGameStore((state) => state.game);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
  const [selectedImages, setSelectedImages] = useState<(string | MediaItem)[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedInput = useDebounce(search, 500);

  useEffect(() => {
    if (game) {
      fetchAvailableImages();
    } else {
      setSelectedImages([]);
      setCurrentPage(1);
      setIsUploadMode(false);
    }
  }, [currentPage, game, debouncedInput, mediaType]);

  const fetchAvailableImages = async () => {
    if (!game || !game?.id) return;

    setIsLoading(true);
    try {
      const response = await window.media.search(game.id, mediaType, search, 0);
      if (mediaType === MEDIA_TYPE.TRAILER || mediaType === MEDIA_TYPE.MUSIC) {
        setAvailableVideos(response as Video[]);
        setAvailableImages([]);
      } else {
        setAvailableImages(response as string[]);
        setSelectedVideos([]);
      }
      setTotalPages(1);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleImageSelection = (image: string) => {
    if (selectedImages.some((img) => (typeof img === "string" ? img === image : img.src === image))) {
      setSelectedImages((prev) => prev.filter((img) => (typeof img === "string" ? img !== image : img.src !== image)));
    } else {
      setSelectedImages((prev) => [...prev, image]);
    }
  };

  const toggleVideoSelection = (video: Video) => {
    if (selectedVideos.some((img) => img.id === video.id)) {
      setSelectedVideos((prev) => prev.filter((img) => img.id !== video.id));
    } else {
      setSelectedVideos((prev) => [...prev, video]);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!game?.id) return;

    for (const image of selectedImages) {
      await window.media.downloadByUrl(game.id, mediaType, image as string);
    }

    for (const video of selectedVideos) {
      await window.media.downloadByUrl(game.id, mediaType, String(video.id));
    }
  };

  return (
    <Dialog>
      <Dialog.Trigger>
        <Button intent={"primary"} leadingIcon={<Plus />} />
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>{`Select ${mediaType}`}</Dialog.Title>
        <Dialog.Description>Add one or more music for this game</Dialog.Description>
        <div className="py-2">
          <Input.Text
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading images...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 max-h-[500px] flex-1 overflow-y-auto">
              {availableImages.length > 0 ? (
                <ImageView
                  availableImages={availableImages}
                  mediaType={mediaType}
                  selectedImages={selectedImages}
                  toggleImageSelection={toggleImageSelection}
                />
              ) : (
                <VideoView
                  availableVideos={availableVideos}
                  mediaType={mediaType}
                  selectedVideos={selectedVideos}
                  toggleImageSelection={toggleVideoSelection}
                />
              )}
            </div>

            {totalPages > 1 && (
              <div className="mb-4 flex items-center justify-center space-x-2">
                <Button
                  intent="icon"
                  icon={ChevronLeft}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoading}
                />
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  intent="icon"
                  icon={ChevronRight}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || isLoading}
                />
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-gray-700 pt-4">
              <div>
                {selectedImages.length > 0 && (
                  <span className="text-sm">
                    {selectedImages.length} image{selectedImages.length !== 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button intent="secondary" text="Cancel" size="md" />
                <Button
                  size="md"
                  intent="primary"
                  onClick={handleSubmit}
                  disabled={selectedImages.length === 0 && selectedVideos.length === 0}
                  text="Add selected"
                />
              </div>
            </div>
          </>
        )}
      </Dialog.Content>
    </Dialog>
  );
}

interface ImageViewProps {
  availableImages: string[];
  mediaType: MEDIA_TYPE;
  selectedImages: (string | MediaItem)[];
  toggleImageSelection: (image: string) => void;
}

const ImageView = ({ availableImages, mediaType, selectedImages, toggleImageSelection }: ImageViewProps) => {
  const getImageDimensions = (type: string): string => {
    switch (type.toLowerCase()) {
      case "cover":
        return "h-48 w-full";
      case "logo":
        return "h-32 w-32";
      case "icon":
        return "h-16 w-16";
      case "screenshot":
        return "h-40 w-64";
      case "background":
        return "h-36 w-full";
      default:
        return "h-32 w-32";
    }
  };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {availableImages.map((image) => {
        const dimensionClass = getImageDimensions(mediaType.toString());
        const isSelected = selectedImages.some((img) => (typeof img === "string" ? img === image : img.src === image));

        return (
          <div
            key={image}
            className={`relative cursor-pointer rounded-md border-2 p-2 transition hover:shadow-md ${
              isSelected ? "border-blue-500" : "border-gray-700 hover:border-gray-500"
            }`}
            onClick={() => toggleImageSelection(image)}
          >
            <div
              className={`relative flex items-center justify-center overflow-hidden rounded bg-gray-900 ${dimensionClass}`}
            >
              <Image src={image} alt="media image" className="max-h-full object-contain" />
              {isSelected && (
                <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1">
                  <Check size={16} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface VideoViewProps {
  availableVideos: Video[];
  mediaType: MEDIA_TYPE;
  selectedVideos: Video[];
  toggleImageSelection: (video: Video) => void;
}

const VideoView = ({ availableVideos, mediaType, selectedVideos, toggleImageSelection }: VideoViewProps) => {
  const getImageDimensions = (type: string): string => {
    switch (type.toLowerCase()) {
      case "trailer":
        return "h-40 w-64";
      default:
        return "h-32 w-32";
    }
  };
  return (
    <div className="flex flex-col gap-2">
      {availableVideos.map((video) => {
        const dimensionClass = getImageDimensions(mediaType.toString());
        const isSelected = selectedVideos.some((img) => img.id === video.id);

        return (
          <div
            key={video.id}
            className={`relative flex cursor-pointer flex-row gap-2 rounded-md border-2 p-2 transition hover:shadow-md ${
              isSelected ? "border-blue-500" : "border-gray-700 hover:border-gray-500"
            }`}
            onClick={() => toggleImageSelection(video)}
          >
            {isSelected && (
              <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1">
                <Check size={16} />
              </div>
            )}

            <div className={`flex flex-row rounded ${dimensionClass}`}>
              <Image src={video.thumbnail.url} alt="media image" className="max-h-full object-contain" />
            </div>

            <div>
              <h3 className="text-sm font-semibold">{video.title}</h3>
              <p className="text-xs text-gray-400">{video.channel.name}</p>
              <div className="mt-8 flex flex-row items-center gap-4">
                <div className="flex flex-row items-center gap-2">
                  <Eye />
                  <p className="text-xs text-gray-400">{video.views}</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <Timer />
                  <p className="text-xs text-gray-400">{Number(video.duration / 60000).toFixed(2)}m</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
