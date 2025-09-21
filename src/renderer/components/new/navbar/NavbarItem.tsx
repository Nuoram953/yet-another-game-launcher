import * as React from "react";
import Button from "../button";

interface NavbarItemProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  textColor?: string;
}

export const NavbarItem = ({ onClick, disabled, children, textColor }: NavbarItemProps) => (
  <Button
    onClick={!disabled && onClick}
    disabled={disabled}
    intent="secondary"
    background={false}
    className={`text-[${textColor}] hover:bg flex gap-1 border-0 backdrop-blur-sm hover:!bg-black/20`}
  >
    {children}
  </Button>
);
