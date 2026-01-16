import { VariantProps, cva } from "class-variance-authority";

const dividerVariants = cva("", {
  variants: {
    orientation: {
      horizontal: "w-full",
      vertical: "h-full",
    },
    thickness: {
      thin: "",
      medium: "",
      thick: "",
    },
    spacing: {
      none: "",
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
    color: {
      gray: "border-white/40",
      slate: "border-slate-300",
      blue: "border-blue-500",
      red: "border-red-500",
      green: "border-green-500",
      purple: "border-purple-500",
      orange: "border-orange-500",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    thickness: "thin",
    spacing: "md",
    color: "gray",
  },
});

export type ButtonVariants = VariantProps<typeof dividerVariants>;

interface DividerProps extends ButtonVariants {
  children?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}
export const Divider = ({
  orientation = "horizontal",
  thickness = "thin",
  spacing = "md",
  color = "gray",
}: DividerProps) => {
  const thicknessClass =
    orientation === "horizontal"
      ? { thin: "border-t", medium: "border-t-2", thick: "border-t-4" }[thickness]
      : { thin: "border-l", medium: "border-l-2", thick: "border-l-4" }[thickness];

  const spacingClass =
    orientation === "horizontal"
      ? { none: "", sm: "my-2", md: "my-4", lg: "my-6", xl: "my-8" }[spacing]
      : { none: "", sm: "mx-2", md: "mx-4", lg: "mx-6", xl: "mx-8" }[spacing];

  const classes = dividerVariants({ orientation, color });

  return (
    <div
      className={`${classes} ${thicknessClass} ${spacingClass} ${orientation === "vertical" ? "self-stretch" : ""}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
};
