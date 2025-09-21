import * as React from "react";
import { Root as ToolbarRoot } from "@radix-ui/react-toolbar";

interface NavbarProps {
  isFixed?: boolean;
  children: React.ReactNode;
  backgroundColor: string;
  textColor: string;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const adjustColor = (color: string, amount: number) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  const adjust = (val: number) => Math.max(0, Math.min(255, val + amount));
  return `rgb(${adjust(rgb.r)}, ${adjust(rgb.g)}, ${adjust(rgb.b)})`;
};

export const Navbar = ({ isFixed = false, children, backgroundColor, textColor }: NavbarProps) => {
  const baseColor = backgroundColor;
  const lighterColor = adjustColor(baseColor, 40);
  const darkerColor = adjustColor(baseColor, -30);

  const gradientStyle = {
    background: `linear-gradient(135deg, ${lighterColor} 0%, ${baseColor} 35%, ${darkerColor} 100%)`,
    color: textColor,
    position: "relative" as const,
  };

  return (
    <ToolbarRoot
      className={`${
        isFixed ? "fixed left-0 right-0 top-0 z-50" : ""
      } flex w-full items-center p-2 shadow-lg backdrop-blur-sm`}
      style={gradientStyle}
    >
      {children}
    </ToolbarRoot>
  );
};
