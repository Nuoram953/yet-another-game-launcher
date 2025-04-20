import React from "react";

interface HeaderProps {
  children: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between bg-white p-2 align-middle shadow-md dark:bg-slate-800">
      {children}
    </div>
  );
};
