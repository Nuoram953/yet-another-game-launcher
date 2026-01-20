import React from "react";
import { VariantProps, cva } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "flex items-center justify-center gap-2 rounded-md font-medium transition",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      intent: {
        primary: "bg-white text-black hover:bg-white/80 active:bg-gray-200",
        secondary: "bg-transparent border border-1 border-white text-white hover:bg-white/20 active:bg-gray-400",
        tertiary: "bg-transparent text-white hover:bg-white/20 active:bg-gray-100",
        destroy: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
        link: "text-white hover:underline",
        custom: "",
      },
      size: {
        xs: "px-1.5 py-1 text-xs",
        sm: "px-2 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "sm",
    },
  },
);

export type ButtonBaseProps = {
  leading?: React.ReactNode;
  text?: string;
  trailing?: React.ReactNode;
  className?: string;
} & VariantProps<typeof buttonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ intent, size, leading, text, trailing, className, ...props }, ref) => {
    return (
      <button ref={ref} className={buttonVariants({ intent, size, className })} {...props}>
        {leading}
        {text}
        {trailing}
      </button>
    );
  },
);

ButtonBase.displayName = "ButtonBase";
