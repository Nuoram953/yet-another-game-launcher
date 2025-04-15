import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import _ from "lodash";

const image = cva(["w-full", "rounded-xl"], {
  variants: {
    intent: {
      cover: [],
      background: [],
    },
  },
});

export interface ImageProps
  extends Omit<React.ButtonHTMLAttributes<HTMLImageElement>, "disabled">,
    VariantProps<typeof image> {
  src: string | null;
  alt: string | undefined;
  className?: string;
  height?: string;
}

export const Image: React.FC<ImageProps> = ({
  className,
  intent,
  src,
  alt,
  height = "h-96",
  ...props
}) => {
  if (_.isNil(src)) {
    return (
      <div
        className={`${image({ intent, className })} bg-gray-800 ${height}`}
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={image({ intent, className })}
      {...props}
    />
  );
};
