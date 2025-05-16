import React from "react";
import { cn } from "@render//lib/utils";
import { Skeleton } from "@render//components/ui/skeleton";

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
  onClick,
}: StatsCardProps) => {
  if (hide) return null;

  const content = (
    <div
      className={cn(
        "flex flex-1 flex-grow flex-col rounded-lg bg-gray-800 p-4",
        "transform transition-all duration-300 hover:scale-105",
        "content-center items-start justify-center",
        "border border-gray-700 hover:border-gray-600",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-gray-500",
        onClick && "cursor-pointer",
        className,
      )}
      role={onClick ? "button" : "region"}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === "Space")) {
          onClick();
        }
      }}
      aria-label={`${label}: ${value}${detail ? `, ${detail}` : ""}`}
    >
      {isLoading ? (
        <>
          <div className="mb-2 flex w-full items-center">
            <Skeleton className="mr-2 h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex w-full flex-col">
            <Skeleton className="mb-1 h-6 w-16" />
            {detail && <Skeleton className="h-4 w-32" />}
          </div>
        </>
      ) : (
        <>
          <div className="mb-2 flex items-center">
            <Icon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-400">{label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">{value}</span>
            {detail && <span className="mt-1 text-sm text-gray-400">{detail}</span>}
          </div>
        </>
      )}
    </div>
  );

  return content;
};
