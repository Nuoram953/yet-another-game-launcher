import React from "react";
import { VariantProps, cva } from "class-variance-authority";

const dividerVariants = cva("w-full flex items-center", {
  variants: {
    variant: {
      default: "border-neutral-200",
      primary: "border-blue-500",
      secondary: "border-purple-500",
      success: "border-green-500",
      warning: "border-yellow-500",
      danger: "border-red-500",
    },
    thickness: {
      thin: "border-t",
      medium: "border-t-2",
      thick: "border-t-4",
    },
    alignment: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    withLabel: {
      true: "gap-4",
    },
    padding: {
      true: "p-2",
      false: "p-0",
    },
  },
  defaultVariants: {
    variant: "default",
    thickness: "thin",
    alignment: "center",
    withLabel: false,
    padding: true,
  },
});

export interface DividerProps extends VariantProps<typeof dividerVariants> {
  label?: string;
  className?: string;
}

export default function Divider({ variant, thickness, alignment, label, className, ...props }: DividerProps) {
  const withLabel = !!label;

  return (
    <div
      className={dividerVariants({
        variant,
        thickness,
        alignment,
        withLabel,
        className,
      })}
      {...props}
    >
      {label && alignment === "left" && <span className="text-sm font-medium text-neutral-500">{label}</span>}

      {label && alignment === "center" && (
        <span className="whitespace-nowrap px-4 text-sm font-medium text-neutral-500">{label}</span>
      )}

      {label && alignment !== "left" && alignment !== "center" && (
        <span className="text-sm font-medium text-neutral-500">{label}</span>
      )}
    </div>
  );
}
