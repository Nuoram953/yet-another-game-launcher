import React, { MouseEvent, createElement } from "react";
import { VariantProps, cva } from "class-variance-authority";
import _ from "lodash";

const button = cva(["font-semibold", "border", "rounded", "flex", "flex-row", "w-fit"], {
  variants: {
    intent: {
      primary: [
        "bg-design-button-primary",
        "text-design-inverted",
        "border-transparent",
        "hover:bg-design-button-primary/90",
        "active:bg-design-button-primary/80",
      ],
      secondary: [
        "bg-design-button-secondary",
        "text-design-inverted",
        "border-transparent",
        "hover:bg-design-button-secondary/90",
        "active:bg-design-button-secondary/80",
      ],
      destructive: ["bg-design-button-destructive", "text-gray-800", "border-gray-400"],
      icon: ["text-design-normal", "border-transparent", "hover:opacity-50", "active:opacity-75"],
    },
    state: {
      false: null,
      play: ["bg-design-button-state-play"],
      install: ["bg-design-button-state-install"],
      running: ["bg-design-button-state-running"],
    },
    size: {
      small: ["text-sm", "py-1", "px-2", "h-8"],
      medium: ["text-base", "py-2", "px-4"],
      large: ["text-base", "py-3", "px-8"],
      fit: ["text-base"],
    },
    background: {
      false: "!bg-transparent",
      true: null,
    },
    disabled: {
      false: null,
      true: ["opacity-50", "cursor-not-allowed"],
    },
  },
  compoundVariants: [
    {
      intent: "primary",
      state: "play",
      className: [
        "text-design-normal",
        "bg-design-button-state-play",
        "hover:bg-design-button-state-play/90",
        "active:bg-design-button-state-play/80",
        "transform transition-all duration-300 hover:scale-105 hover:shadow-lg",
      ],
    },
    {
      intent: "primary",
      state: "install",
      className: [
        "text-design-normal",
        "bg-design-button-state-install",
        "hover:bg-design-button-state-install/90",
        "active:bg-design-button-state-install/80",
        "transform transition-all duration-300 hover:scale-105 hover:shadow-lg",
      ],
    },
    {
      intent: "primary",
      state: "running",
      className: [
        "text-design-normal",
        "bg-design-button-state-running",
        "hover:bg-design-button-state-running/90",
        "active:bg-design-button-state-running/80",
        "transform transition-all duration-300 hover:scale-105 hover:shadow-lg",
      ],
    },
  ],
  defaultVariants: {
    intent: "primary",
    size: "medium",
    disabled: false,
    state: false,
    background: true,
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
  background,
  disabled,
  text,
  state,
  icon,
  iconColor,
  onClick,
  ...props
}) => (
  <button
    className={button({ intent, size, state, background, disabled, className })}
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
