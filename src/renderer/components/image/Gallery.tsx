import React, { useState } from "react";

interface ImageGAlleryProps {
  images: { src: string; alt: string; width?: number; height?: number }[];
  layout?: "masonry" | "grid" | "square"; // Options: "masonry", "grid", "square"
  gap?: number; // Gap between images in grid layout
}

export const ImageGallery = ({
  images = [],
  layout = "masonry", // Options: "masonry", "grid", "square"
  gap = 4,
}:ImageGAlleryProps) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Default images with varied dimensions to demonstrate different aspect ratios
  const defaultImages = [
    { id: 1, src: "/api/placeholder/800/600", alt: "Landscape format (4:3)", width: 800, height: 600 },
    { id: 2, src: "/api/placeholder/600/800", alt: "Portrait format (3:4)", width: 600, height: 800 },
    { id: 3, src: "/api/placeholder/800/400", alt: "Panorama format (2:1)", width: 800, height: 400 },
    { id: 4, src: "/api/placeholder/500/500", alt: "Square format (1:1)", width: 500, height: 500 },
    { id: 5, src: "/api/placeholder/600/400", alt: "Classic format (3:2)", width: 600, height: 400 },
    { id: 6, src: "/api/placeholder/400/600", alt: "Portrait format (2:3)", width: 400, height: 600 },
  ];

  const galleryImages = images.length > 0 ? images : defaultImages;

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Different layout styles
  const layoutStyles = {
    masonry: "columns-1 sm:columns-2 md:columns-3",
    grid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    square: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  };

  // Get gap class based on the provided gap value
  const gapClass = `gap-${gap}`;

  return (
    <div className="container mx-auto px-4">
      {/* Gallery Layout */}
      <div className={`${layoutStyles[layout]} ${layout !== "masonry" ? gapClass : ""} mb-4`}>
        {galleryImages.map((image) =>
          layout === "masonry" ? (
            // Masonry layout - preserves aspect ratio in column layout
            <div
              key={image.id}
              className="mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl"
              onClick={() => openModal(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full transform object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ) : layout === "square" ? (
            // Square layout - forces all images into squares
            <div
              key={image.id}
              className="aspect-square cursor-pointer overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl"
              onClick={() => openModal(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full transform object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ) : (
            // Grid layout - preserves aspect ratio with consistent width
            <div
              key={image.id}
              className="cursor-pointer overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl"
              onClick={() => openModal(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full transform object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ),
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
          onClick={closeModal}
        >
          <div className="relative max-h-screen w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute right-4 top-4 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70"
              onClick={closeModal}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
              />
              <p className="mt-2 text-center text-white">{selectedImage.alt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
