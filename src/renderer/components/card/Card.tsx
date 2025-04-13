import { X } from "lucide-react";
import React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  header?: boolean;
  footer?: React.ReactNode;
  onClose?: () => void;
}

export const Card = ({
  title,
  children,
  className = "",
  header = false,
  footer = false,
  onClose,
}: CardProps) => {
  return (
    <div
      className={`overflow-hidden rounded-lg bg-gray-800 shadow-lg ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between border-gray-700 px-6">
        <h3 className="text-lg font-medium text-gray-100">{title}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-200"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="px-6 py-4">{children}</div>

      {/* Optional Footer */}
      {footer && (
        <div className="border-t border-gray-700 bg-gray-900 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
};
