import * as React from "react";
import Button from "../button/Button";

interface NavbarItemProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  textColor?: string;
  icon?: React.ReactNode;
}

export const NavbarItem = ({ onClick, disabled, children, textColor, icon }: NavbarItemProps) => (
  <Button
    onClick={!disabled && onClick}
    disabled={disabled}
    intent="secondary"
    background={false}
    className={`text-[${textColor}] hover:bg flex gap-1 border-0 backdrop-blur-sm hover:!bg-black/20`}
    leadingIcon={icon}
  >
    {children}
  </Button>
);
