import React from "react";

interface ToolbarProps {
  children: React.ReactNode;
}

export const Toolbar = ({ children }: ToolbarProps) => {
  return <div className="flex items-center justify-between gap-2 p-6">{children}</div>;
};
