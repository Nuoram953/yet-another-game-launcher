import React from "react";

interface ToolbarProps {
  children: React.ReactNode;
}

export const Toolbar = ({ children }: ToolbarProps) => {
  return <div className="flex items-center gap-2 border-b p-2">{children}</div>;
};
