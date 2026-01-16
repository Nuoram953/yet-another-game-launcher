import * as React from "react";
import Button from "../button/Button";

interface NavbarItemProps {
  onClick?: () => void;
  disabled?: boolean;
  text: string;
  icon?: React.ReactNode;
  active?: boolean;
  className?: string;
}

export const NavbarItem = ({ onClick, disabled, text, active, icon, className }: NavbarItemProps) => (
  <Button
    onClick={!disabled && onClick}
    disabled={disabled}
    intent={active ? "secondary" : "tertiary"}
    leadingIcon={icon}
    text={text}
    className={className}
  />
);
