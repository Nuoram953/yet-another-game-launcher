import React from "react";
import { ButtonBase, ButtonBaseProps } from "./ButtonBase";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonBaseProps {
  text?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const Button = ({ text, leadingIcon, trailingIcon, ...props }: ButtonProps) => {
  return <ButtonBase text={text} leading={leadingIcon} trailing={trailingIcon} {...props} />;
};

export default Button;
