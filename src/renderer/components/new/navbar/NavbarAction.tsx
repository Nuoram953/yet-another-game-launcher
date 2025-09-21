import * as React from "react";
import Button from "../button";

interface NavbarActionProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const NavbarAction = ({ onClick, children }: NavbarActionProps) => (
  <Button onClick={onClick} intent="icon">
    {children}
  </Button>
);
