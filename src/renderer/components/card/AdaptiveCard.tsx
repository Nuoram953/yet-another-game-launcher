import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

const getAverageRGB = (imgEl) => {
  const blockSize = 5;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return { r: 128, g: 128, b: 128 }; // Fallback gray
  }

  const width = (canvas.width =
    imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width);
  const height = (canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height);

  context.drawImage(imgEl, 0, 0);

  try {
    const data = context.getImageData(0, 0, width, height).data;
    let r = 0,
      g = 0,
      b = 0,
      count = 0;

    for (let i = 0; i < data.length; i += 4 * blockSize) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    return {
      r: Math.floor(r / count),
      g: Math.floor(g / count),
      b: Math.floor(b / count),
    };
  } catch (e) {
    return { r: 128, g: 128, b: 128 }; // Fallback gray
  }
};

export const AdaptiveCard = ({ children, className }) => {
  const [bgColor, setBgColor] = useState("bg-stone-700/40");

  useEffect(() => {
    const img = document.querySelector(`#background-image`);
    if (img) {
      img.addEventListener("load", () => {
        const { r, g, b } = getAverageRGB(img);

        // Darken the color slightly and add transparency
        const darkenedR = Math.floor(r * 0.7);
        const darkenedG = Math.floor(g * 0.7);
        const darkenedB = Math.floor(b * 0.7);

        setBgColor(`rgb(${darkenedR} ${darkenedG} ${darkenedB} / 0.4)`);
      });
    }
  }, []);

  return (
    <Card
      className={"flex flex-row m-6 backdrop-blur-md border-white/50 shadow-xl " + className}
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </Card>
  );
};

export default AdaptiveCard;
