import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import _ from "lodash";

const button = cva(["font-semibold", "border", "rounded", "flex", "flex-row"], {
  variants: {
    intent: {
      primary: ["bg-grey-500", "text-white", "border-transparent"],
      secondary: ["bg-white", "text-gray-800", "border-gray-400"],
      install: ["bg-yellow-500", "text-white", "border-yellow-400"],
      play: [
        "bg-green-600",
        "text-white",
        "hover:bg-green-500",
        "active:bg-green-700",
      ],
      running: ["animate-pulse"],
      destroy: ["bg-red", "text-gray-800", "border-gray-400"],
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
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
  icon?: Icon;
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
    {!_.isUndefined(Icon) && <Icon className="mr-2 h-5 w-5" />}
    <p>{text}</p>
  </button>
);
