import React from "react";
import { cn } from "@render/lib/utils";
import { ButtonVariants, buttonVariants } from "./style";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  children?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const Button = ({
  children,
  className,
  intent,
  state,
  size,
  disabled,
  background,
  leadingIcon,
  trailingIcon,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "items-center justify-center gap-2 rounded-md",
        buttonVariants({ intent, state, size, disabled, background }),
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {leadingIcon && <span className="flex-shrink-0">{leadingIcon}</span>}
      {children && <span>{children}</span>}
      {trailingIcon && <span className="flex-shrink-0">{trailingIcon}</span>}
    </button>
  );
};

export default Button;
