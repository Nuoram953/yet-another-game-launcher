import React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Card = ({
  title,
  children,
  actions,
}: CardProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-md focus-visible:ring-gray-500">
      <div className="p-4">
        <div className="flex flex-row justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <div className="flex flex-row gap-2">{actions}</div>
        </div>
        <div className="mt-3 px-6">{children}</div>
      </div>
    </div>
  );
};
