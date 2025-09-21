import { useState, useEffect } from "react";
import { FastAverageColor } from "fast-average-color";

function getRandomPixelColor(image: HTMLImageElement, samples = 5): string {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#000000";

  ctx.drawImage(image, 0, 0, image.width, image.height);

  let r = 0,
    g = 0,
    b = 0;

  for (let i = 0; i < samples; i++) {
    const x = Math.floor(Math.random() * image.width);
    const y = Math.floor(Math.random() * image.height);
    const { data } = ctx.getImageData(x, y, 1, 1);
    r += data[0];
    g += data[1];
    b += data[2];
  }

  r = Math.round(r / samples);
  g = Math.round(g / samples);
  b = Math.round(b / samples);

  return `rgb(${r}, ${g}, ${b})`;
}

function isBadColor(color: { value: number[]; hex: string }) {
  const [r, g, b] = color.value;
  const brightness = (r + g + b) / 3;
  const grayish = Math.abs(r - g) < 15 && Math.abs(g - b) < 15;
  // too dark or almost gray
  return brightness < 40 || grayish;
}

export const useDominantColor = (imageUrl?: string, shouldProcess?: boolean) => {
  const [backgroundColor, setBackgroundColor] = useState("#222");
  const [textColor, setTextColor] = useState("#fff");

  useEffect(() => {
    if (!shouldProcess || !imageUrl) return;

    const fac = new FastAverageColor();
    let isCancelled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = async () => {
      try {
        let color = await fac.getColorAsync(img, {
          algorithm: "dominant",
          mode: "precision",
          dominantDivider: 8,
          step: 2,
        });

        if (isBadColor(color)) {
          color = await fac.getColorAsync(img, { algorithm: "sqrt", mode: "precision" });
        }

        if (!isCancelled) {
          if (isBadColor(color) || color.hex === "#000000") {
            const randomColor = getRandomPixelColor(img, 10);
            setBackgroundColor(randomColor);
            setTextColor("#fff");
          } else {
            setBackgroundColor(color.hex);
            setTextColor(color.isDark ? "white" : "black");
          }
        }
      } catch (e) {
        console.error("FAC error, falling back to random color:", e);
        if (!isCancelled) {
          const randomColor = getRandomPixelColor(img, 10);
          setBackgroundColor(randomColor);
          setTextColor("#fff");
        }
      }
    };

    img.onerror = () => {
      console.warn("Image failed to load, using fallback color:", imageUrl);
      if (!isCancelled) {
        const randomColor = getRandomPixelColor(img, 10);
        setBackgroundColor(randomColor);
        setTextColor("#fff");
      }
    };

    return () => {
      isCancelled = true;
    };
  }, [imageUrl, shouldProcess]);

  return { backgroundColor, textColor };
};
