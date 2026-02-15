import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { LoadingCenter } from "../loading/Loading";
import { Loader2 } from "lucide-react";

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
        xs: "px-1 py-0.5 text-xs",
        sm: "px-2 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
      loading: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
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
  ({ intent, size, leading, text, trailing, className, loading, ...props }, ref) => {
    return (
      <button ref={ref} className={buttonVariants({ intent, size, loading, className })} {...props}>
        {loading ? (
          <>
            {leading && <Loader2 className="animate-spin text-normal" />}
            {text && "Loading..."}
          </>
        ) : (
          <>
            {leading}
            {text}
            {trailing}
          </>
        )}
      </button>
    );
  },
);

ButtonBase.displayName = "ButtonBase";
