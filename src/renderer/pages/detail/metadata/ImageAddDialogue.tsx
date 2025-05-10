import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, Upload } from "lucide-react";
import { Button } from "@render//components/button/Button";
import { Image } from "@render//components/image/Image";
import { MEDIA_TYPE } from "src/common/constant";
import { useGames } from "@render//context/DatabaseContext";
import { MediaItem } from "./types";

interface ImageSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: MEDIA_TYPE;
  gameId?: string;
  refresh: () => void;
}

export default function ImageAddDialogue({ isOpen, onClose, mediaType, gameId, refresh }: ImageSelectionDialogProps) {
  const { selectedGame } = useGames();
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<(string | MediaItem)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadMode, setIsUploadMode] = useState(false);

  useEffect(() => {
    if (isOpen && gameId) {
      fetchAvailableImages();
    } else {
      setSelectedImages([]);
      setCurrentPage(1);
      setIsUploadMode(false);
    }
  }, [isOpen, currentPage, gameId, mediaType]);

  const fetchAvailableImages = async () => {
    if (!gameId || !selectedGame?.id) return;

    setIsLoading(true);
    try {
      const response = await window.media.search(selectedGame.id, mediaType, 0);
      setAvailableImages(response);
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
    if (!selectedGame?.id) return;

    for (const image of selectedImages) {
      await window.media.downloadByUrl(selectedGame.id, mediaType, image as string);
    }
    refresh();
    onClose();
  };

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex max-h-screen w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-gray-800 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{`Select ${mediaType}`}</h2>
          <div className="flex items-center gap-2">
            <Button intent="icon" icon={X} size="fit" onClick={onClose} className="hover:bg-gray-700" />
          </div>
        </div>

        <div className="mb-4 flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <p>Loading images...</p>
            </div>
          ) : availableImages.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableImages.map((image) => {
                const dimensionClass = getImageDimensions(mediaType.toString());
                const isSelected = selectedImages.some((img) =>
                  typeof img === "string" ? img === image : img.src === image,
                );

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
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p>No images found. Upload some images to get started.</p>
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center justify-center space-x-2">
          <Button intent="icon" icon={ChevronLeft} onClick={handlePrevPage} disabled={currentPage === 1 || isLoading} />
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
        <div className="mt-2 flex justify-between border-t border-gray-700 pt-4">
          <div>
            {selectedImages.length > 0 && (
              <span className="text-sm">
                {selectedImages.length} image{selectedImages.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button intent="secondary" onClick={onClose} text="Cancel" />
            <Button
              intent="primary"
              onClick={handleSubmit}
              disabled={selectedImages.length === 0}
              text="Add selected"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
