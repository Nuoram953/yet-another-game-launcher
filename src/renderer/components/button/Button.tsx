import React, { MouseEvent, createElement } from "react";
import { VariantProps, cva } from "class-variance-authority";
import _ from "lodash";

const button = cva(["font-semibold", "border", "rounded", "flex", "flex-row"], {
  variants: {
    intent: {
      primary: ["bg-gray-600", "text-white", "border-transparent", "hover:bg-gray-700", "active:bg-gray-800"],
      secondary: ["bg-white", "text-gray-800", "border-gray-400"],
      install: ["bg-yellow-500", "text-white", "border-yellow-400"],
      play: ["bg-green-600", "text-white", "hover:bg-green-500", "active:bg-green-700"],
      running: ["animate-pulse"],
      destructive: ["bg-red", "text-gray-800", "border-gray-400"],
      icon: ["text-white", "border-transparent", "hover:opacity-50", "active:opacity-75"],
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
  onClick?: (e: MouseEvent) => void;
  icon?: React.FC<any>;
  iconColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  intent,
  size,
  disabled,
  text,
  icon,
  iconColor,
  onClick,
  ...props
}) => (
  <button
    className={button({ intent, size, disabled, className })}
    disabled={disabled || undefined}
    onClick={onClick}
    {...props}
  >
    <div className="flew-row flex items-center justify-center gap-2">
      {icon && createElement(icon, { color: iconColor || "white" })}
      <p>{text}</p>
    </div>
  </button>
);
