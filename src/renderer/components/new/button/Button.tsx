import React from "react";
import { cn } from "@render/lib/utils";
import { ButtonVariants, buttonVariants } from "./style";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  children: React.ReactNode;
}

const Button = ({ children, className, intent, state, size, disabled, background, ...props }: ButtonProps) => {
  return (
    <button className={cn(buttonVariants({ intent, state, size, disabled, background }), className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
