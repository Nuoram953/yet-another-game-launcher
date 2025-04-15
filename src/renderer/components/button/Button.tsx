import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import _ from "lodash";

const button = cva(["font-semibold", "border", "rounded", "flex", "flex-row"], {
  variants: {
    intent: {
      primary: [
        "bg-gray-600",
        "text-white",
        "border-transparent",
        "hover:bg-gray-700",
      ],
      secondary: ["bg-white", "text-gray-800", "border-gray-400"],
      install: ["bg-yellow-500", "text-white", "border-yellow-400"],
      play: [
        "bg-green-600",
        "text-white",
        "hover:bg-green-500",
        "active:bg-green-700",
      ],
      running: ["animate-pulse"],
      destructive: ["bg-red", "text-gray-800", "border-gray-400"],
      icon: ["text-white", "border-transparent", "hover:opacity-50"],
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
      fit: ["text-base"],
    },
    disabled: {
      false: null,
      true: ["opacity-50", "cursor-not-allowed"],
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "medium",
    disabled: false,
  },
});

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof button> {
  text?: string;
  onClick?: () => void;
  icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  intent,
  size,
  disabled,
  text,
  icon: Icon,
  onClick,
  ...props
}) => (
  <button
    className={button({ intent, size, disabled, className })}
    disabled={disabled || undefined}
    onClick={onClick}
    {...props}
  >
    {!_.isUndefined(Icon) && (
      <div className="flex flew-row gap-2 items-center justify-center">
        <Icon />
        <p className="text-center">{text}</p>
      </div>
    )}
    {_.isUndefined(Icon) && <p>{text}</p>}
  </button>
);
