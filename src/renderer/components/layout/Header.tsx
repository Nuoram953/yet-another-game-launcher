import React from "react";

interface HeaderProps {
  children: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between bg-design-foreground p-2 align-middle shadow-md">
      {children}
    </div>
  );
};
