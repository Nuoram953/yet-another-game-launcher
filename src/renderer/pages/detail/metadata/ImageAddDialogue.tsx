import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, Upload } from "lucide-react";
import { Button } from "@/components/button/Button";
import { Image } from "@/components/image/Image";
import { MEDIA_TYPE } from "src/common/constant";
import { useGames } from "@/context/DatabaseContext";

interface ImageSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (images: { src: string; name: string; alt: string; type: string }[]) => void;
  mediaType: MEDIA_TYPE;
  gameId?: string;
}

export default function ImageAddDialogue({ isOpen, onClose, onSelect, mediaType, gameId }: ImageSelectionDialogProps) {
  const { selectedGame } = useGames();
  const [availableImages, setAvailableImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadMode, setIsUploadMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableImages();
    } else {
      setSelectedImages([]);
      setCurrentPage(1);
      setIsUploadMode(false);
    }
  }, [isOpen, currentPage, gameId, mediaType]);

  const fetchAvailableImages = async () => {
    if (!gameId) return;

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

  const toggleImageSelection = (image) => {
    if (selectedImages.some((img) => img === image)) {
      setSelectedImages((prev) => prev.filter((img) => img !== image));
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

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length || !gameId || !mediaType) return;

    setIsLoading(true);
    try {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedPath = await window.media.upload(gameId, mediaType, file);

        uploadedImages.push({
          src: uploadedPath,
          name: file.name,
          alt: mediaType.toLowerCase(),
          type: mediaType,
        });
      }

      setSelectedImages((prev) => [...prev, ...uploadedImages]);
      setIsUploadMode(false);
      fetchAvailableImages();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log("Selected images:", selectedImages);
    for (const image of selectedImages) {
      await window.media.downloadByUrl(selectedGame!.id, mediaType, image);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Define dimensions for different media types
  const getImageDimensions = (type) => {
    switch (String(type).toLowerCase()) {
      case "cover":
        return "h-48 w-full"; // Wider for covers
      case "logo":
        return "h-32 w-32"; // Square for logos
      case "icon":
        return "h-16 w-16"; // Small for icons
      case "screenshot":
        return "h-40 w-64"; // 16:10 ratio for screenshots
      case "background":
        return "h-36 w-full"; // Wide for backgrounds
      default:
        return "h-32 w-32"; // Default square
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex max-h-screen w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-gray-800 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{isUploadMode ? `Upload ${mediaType}` : `Select ${mediaType}`}</h2>
          <div className="flex items-center gap-2">
            <Button intent="secondary" onClick={() => setIsUploadMode(!isUploadMode)} size="sm">
              {isUploadMode ? "Browse Library" : "Upload New"}
            </Button>
            <Button intent="icon" icon={X} size="fit" onClick={onClose} className="hover:bg-gray-700" />
          </div>
        </div>

        {isUploadMode ? (
          <div className="mb-6">
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 p-8 hover:border-gray-400">
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <p className="mb-2 text-center text-sm text-gray-400">Click to browse or drag and drop files</p>
              <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, SVG</p>
              <input
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileUpload}
                accept="image/*"
                multiple
              />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <p>Loading images...</p>
                </div>
              ) : availableImages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {availableImages.map((image) => {
                    const dimensionClass = getImageDimensions(mediaType);

                    return (
                      <div
                        key={image}
                        className={`relative cursor-pointer rounded-md border-2 p-2 transition hover:shadow-md ${
                          selectedImages.some((img) => img === image)
                            ? "border-blue-500"
                            : "border-gray-700 hover:border-gray-500"
                        }`}
                        onClick={() => toggleImageSelection(image)}
                      >
                        <div
                          className={`relative flex items-center justify-center overflow-hidden rounded bg-gray-900 ${dimensionClass}`}
                        >
                          <Image src={image} alt={image.alt || "image"} className="max-h-full object-contain" />
                          {selectedImages.some((img) => img === image) && (
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

            {/* Pagination controls */}
            <div className="mb-4 flex items-center justify-center space-x-2">
              <Button
                intent="icon"
                icon={ChevronLeft}
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
              />
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                intent="icon"
                icon={ChevronRight}
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
              />
            </div>
          </>
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
