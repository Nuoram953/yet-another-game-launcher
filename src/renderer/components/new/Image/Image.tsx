import { VariantProps, cva } from "class-variance-authority";
import React from "react";

const imageVariants = cva("relative overflow-hidden object-cover transition-opacity duration-500", {
  variants: {
    preset: {
      cover: "w-48 h-64",
      background: "w-full h-96",
      icon: "w-16 h-16 rounded",
      avatar: "w-24 h-24 rounded-full",
      fill: "w-full h-full",
    },
    fade: {
      true: "opacity-50 hover:opacity-100",
      false: "opacity-100",
    },
  },
  defaultVariants: {
    preset: "cover",
    fade: false,
  },
});

type ImageProps = {} & React.ImgHTMLAttributes<HTMLImageElement> & VariantProps<typeof imageVariants>;

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(({ className, preset, fade, ...props }, ref) => {
  return <img ref={ref} className={imageVariants({ preset, fade, className })} {...props} />;
});

Image.displayName = "Image";
