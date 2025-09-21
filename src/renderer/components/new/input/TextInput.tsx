import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as Label from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";

const cn = clsx;

const inputStyles = cva(
  "flex items-center gap-2 border px-3 py-2 transition focus-within:ring-2 focus-within:ring-offset-0",
  {
    variants: {
      intent: {
        default:
          "bg-white border-gray-200 focus-within:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus-within:ring-blue-400",
        subtle:
          "bg-gray-50 border-transparent focus-within:ring-blue-400 dark:bg-gray-800 dark:text-gray-200 dark:focus-within:ring-blue-300",
        danger:
          "bg-white border-red-300 focus-within:ring-red-400 dark:bg-gray-900 dark:border-red-500 dark:text-gray-100 dark:focus-within:ring-red-400",
      },
      size: {
        sm: "text-sm px-2 py-1 min-h-[32px]",
        md: "text-base px-3 py-2 min-h-[40px]",
        lg: "text-lg px-4 py-3 min-h-[48px]",
      },
      fullWidth: {
        true: "w-full",
        false: "inline-flex",
      },
      disabled: {
        true: "opacity-60 cursor-not-allowed",
      },
    },
    defaultVariants: {
      intent: "default",
      size: "md",
      fullWidth: true,
    },
  },
);

const nativeInputStyles = cva(
  "flex-1 bg-transparent outline-none border-none p-0 text-inherit placeholder-gray-400 dark:placeholder-gray-500",
);

type Props = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputStyles> & {
    label?: string;
    helperText?: string;
    left?: React.ReactNode; // icon or element on the left
    right?: React.ReactNode; // icon or element on the right
    asChild?: boolean; // if you want to use a custom wrapper via Slot
  };

const Input = forwardRef<HTMLInputElement, Props>(
  (
    { label, helperText, left, right, intent, size, fullWidth, disabled, className, asChild = false, id, ...rest },
    ref,
  ) => {
    const Wrapper: any = asChild ? Slot : "div";

    return (
      <div className={cn("flex flex-col gap-1")}>
        {label && (
          <Label.Root htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
          </Label.Root>
        )}

        <Wrapper className={cn(inputStyles({ intent, size, fullWidth, disabled }), className)}>
          {left && <div className="flex items-center">{left}</div>}

          <input
            id={id}
            ref={ref}
            className={nativeInputStyles()}
            aria-invalid={intent === "danger" || !!rest["aria-invalid"]}
            disabled={disabled}
            {...rest}
          />

          {right && <div className="flex items-center">{right}</div>}
        </Wrapper>

        {helperText && (
          <p
            className={cn(
              "mt-0.5 text-xs",
              intent === "danger" ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;

/*
Example usage with dark mode:

<div className="dark bg-gray-950 p-4 min-h-screen">
  <Input
    id="username"
    name="username"
    label="Username"
    placeholder="Enter your username"
    intent="default"
    size="md"
    helperText="This will be displayed publicly."
  />
</div>

*/
