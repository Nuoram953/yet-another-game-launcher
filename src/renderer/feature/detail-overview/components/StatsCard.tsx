import React from "react";
import { cn } from "@render//lib/utils";
import { Skeleton } from "@render//components/ui/skeleton";
import useColorStore from "@render/feature/detail/store/ColorStore";

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
  const theme = useColorStore((state) => state.theme);

  if (hide) return null;

  const content = (
    <div
      className={cn(
        "group flex min-w-0 flex-1 flex-col gap-3 p-6",
        "transition-all duration-200 ease-out",
        "hover:bg-design-foreground/50",
        "border-l-2 border-transparent hover:border-l-design-border-hover",
        onClick && [
          "cursor-pointer",
          "focus-visible:bg-design-foreground/50 focus-visible:outline-none",
          "focus-visible:border-l-design-border-hover",
          "active:scale-[0.98]",
        ],
        className,
      )}
      role={onClick ? "button" : "region"}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${label}: ${value}${detail ? `, ${detail}` : ""}`}
    >
      {isLoading ? (
        <>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            {detail && <Skeleton className="h-3 w-32" />}
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 text-design-text-subtle">
            <Icon
              className="h-6 w-6 transition-colors duration-200 group-hover:text-design-text-normal"
              aria-hidden="true"
            />
            <span className="text-sm font-medium uppercase tracking-wide">{label}</span>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="text-2xl font-bold tabular-nums text-design-text-normal">{value}</div>
            {detail && <div className="text-sm leading-relaxed text-design-text-subtle">{detail}</div>}
          </div>
        </>
      )}
    </div>
  );

  return content;
};
