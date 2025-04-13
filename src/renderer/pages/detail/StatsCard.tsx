import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  label: string;
  detail?: string;
  value: string;
  hide?: boolean;
  icon: React.ElementType;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StatsCard = ({ 
  label, 
  detail, 
  value, 
  hide, 
  icon: Icon,
  isLoading = false,
  className,
  onClick 
}: StatsCardProps) => {
  if (hide) return null;

  const content = (
    <div
      className={cn(
        "bg-gray-800 flex flex-col flex-grow flex-1 rounded-lg p-4",
        "transform hover:scale-105 transition-all duration-300",
        "justify-center items-start content-center",
        "border border-gray-700 hover:border-gray-600",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-gray-500",
        onClick && "cursor-pointer",
        className
      )}
      role={onClick ? "button" : "region"}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === "Space")) {
          onClick();
        }
      }}
      aria-label={`${label}: ${value}${detail ? `, ${detail}` : ''}`}
    >
      {isLoading ? (
        <>
          <div className="flex items-center mb-2 w-full">
            <Skeleton className="h-5 w-5 mr-2 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-col w-full">
            <Skeleton className="h-6 w-16 mb-1" />
            {detail && <Skeleton className="h-4 w-32" />}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-2">
            <Icon className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-400">{label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">{value}</span>
            {detail && (
              <span className="text-sm text-gray-400 mt-1">{detail}</span>
            )}
          </div>
        </>
      )}
    </div>
  );

  return content;
};
