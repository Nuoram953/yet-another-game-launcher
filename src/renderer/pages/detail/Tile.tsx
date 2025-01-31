import React from "react";

interface Props {
  children: any;
}

export const Tile = ({ children }: Props) => {
  return (
    <div className="flex-1 flex-grow transform rounded-lg bg-gray-800 p-4">
      {children}
    </div>
  );
};
