import * as React from "react";

interface NavbarProps {
  isFixed?: boolean;
  children: React.ReactNode;
}

export const Navbar = ({ children }: NavbarProps) => {
  return <div className={`flex w-full items-center bg-foreground p-2 shadow-lg backdrop-blur-sm`}>{children}</div>;
};
