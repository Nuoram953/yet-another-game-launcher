import React from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "../button/Button";

interface ActionItem {
  icon: React.FC<any>;
  name: string;
  onClick: () => void;
  disabled?: boolean;
}

interface CardProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  actions?: ActionItem[];
  className?: string;
}

export const Card = ({ title, subtitle, children, actions, className }: CardProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-md focus-visible:ring-gray-500 ${className}`}
    >
      <div className="p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <h3>{subtitle}</h3>
          </div>
          {actions && actions.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <Button
                intent="icon"
                icon={EllipsisVertical}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Open actions menu"
              />
              {isDropdownOpen && (
                <div className="absolute right-0 z-[100] mt-2 w-48 rounded-md bg-gray-700 py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      className="z-[100] flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-gray-600 disabled:text-gray-500"
                      disabled={action.disabled ?? false}
                      onClick={() => {
                        action.onClick();
                        setIsDropdownOpen(false);
                      }}
                    >
                      {action.icon && <span className="mr-2">{React.createElement(action.icon, { size: 16 })}</span>}
                      {action.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 px-6">{children}</div>
      </div>
    </div>
  );
};
