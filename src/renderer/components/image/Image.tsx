import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import _ from "lodash";

const image = cva(["object-cover"], {
  variants: {
    intent: {
      cover: ["w-full", "rounded-xl"],
      background: ["!w-[600px]", "h-[220px]", "object-cover"],
      icon: ["w-16", "h-16", "object-cover", "rounded-full"],
    },
    size: {
      sm: ["w-16", "h-16"],
      md: ["w-32", "h-32"],
      lg: ["w-64", "h-64"],
      xl: ["w-96", "h-96"],
    },
    aspect: {
      square: ["aspect-square"],
      wide: ["aspect-[16/9]"],
      tall: ["aspect-[9/16]"],
    },
  },
});

export interface ImageProps
  extends Omit<React.ButtonHTMLAttributes<HTMLImageElement>, "disabled">,
    VariantProps<typeof image> {
  src: string | null;
  alt: string | undefined;
  className?: string;
  height?: number;
  width?: number;
}

export const Image: React.FC<ImageProps> = ({ className, intent, src, size, alt, ...props }) => {
  if (_.isNil(src)) {
    return <div className={`${image({ intent, size, className })} bg-design-foreground`} aria-label={alt} />;
  }

  return <img src={src} alt={alt} className={image({ intent, size, className })} {...props} />;
};
