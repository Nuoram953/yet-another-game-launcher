import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const inputStyles = cva(
  "flex w-full rounded-md border px-3 py-2 text-black text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500",
        error:
          "border-red-500 bg-red-50 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500",
        success:
          "border-green-500 bg-green-50 text-green-900 placeholder:text-green-300 focus:border-green-500 focus:ring-green-500",
      },
      size: {
        sm: "h-8 text-xs",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
      },
      color:{
        dark: "!text-white !bg-gray-600",
        light: "!text-black !bg-white"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      color: "light"
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputStyles> {
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      color,
      variant,
      size,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={props.id}
            className={`text-sm font-medium ${color == "dark" ? "text-white" : "text-black"}`}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={inputStyles({ variant, size, disabled, color, className })}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        {helperText && (
          <p
            className={`text-xs ${variant === "error" ? "text-red-500" : "text-gray-500"}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
