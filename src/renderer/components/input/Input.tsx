import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const inputStyles = cva("flex w-full rounded-md px-3 py-2 text-black text-sm transition-colors focus:outline-none", {
  variants: {
    variant: {
      default: "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500",
      error: "border-red-500 bg-red-50 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500",
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
    color: {
      dark: "!text-white !bg-gray-700",
      light: "!text-black !bg-white",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    color: "light",
  },
});

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, "color" | "disabled" | "size">,
    VariantProps<typeof inputStyles> {
  label?: string;
  helperText?: string;
  textarea?: boolean;
  actionRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    { className, type = "text", label, helperText, color, variant, size, disabled, textarea, actionRight, ...props },
    ref,
  ) => {
    const inputProps = props as React.InputHTMLAttributes<HTMLInputElement>;
    const textareaProps = props as React.TextareaHTMLAttributes<HTMLTextAreaElement>;

    // Modify padding when there's an action button
    const inputClassName = actionRight
      ? inputStyles({
          variant,
          size,
          disabled,
          color,
          className: `pr-10 ${className || ""}`, // Add right padding for button space
        })
      : inputStyles({
          variant,
          size,
          disabled,
          color,
          className,
        });

    return (
      <div className="flex w-full flex-col space-y-1.5">
        {label && (
          <label htmlFor={props.id} className={`text-sm font-medium ${color == "dark" ? "text-white" : "text-black"}`}>
            {label}
          </label>
        )}
        <div className="relative">
          {textarea ? (
            <textarea
              className={inputClassName}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              disabled={disabled ?? false}
              {...textareaProps}
            />
          ) : (
            <input
              type={type}
              className={inputClassName}
              ref={ref as React.Ref<HTMLInputElement>}
              disabled={disabled ?? false}
              {...inputProps}
            />
          )}
          {actionRight && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{actionRight}</div>}
        </div>
        {helperText && (
          <p className={`text-xs ${variant === "error" ? "text-red-500" : "text-gray-500"}`}>{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
