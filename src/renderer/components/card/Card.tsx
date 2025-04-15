import React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
  showSeparator?: boolean;
}

export const Card = ({ title, children, showSeparator = true }: CardProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-md focus-visible:ring-gray-500">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {showSeparator && <div className="mt-2 border-b border-gray-300 mb-5"></div>}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
};
