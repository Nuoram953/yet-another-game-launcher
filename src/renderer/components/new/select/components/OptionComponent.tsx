import React from "react";
import { OptionProps, components } from "react-select";
import { Check, X } from "lucide-react";
import { RichSelectOption } from "../types";

// Rich option component that supports images, icons, descriptions, etc.
export const RichOptionComponent: React.FC<OptionProps<RichSelectOption, false>> = (props) => {
  const { data, isSelected, isFocused } = props;

  return (
    <components.Option {...props}>
      <div className="flex w-full items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Image */}
          {data.image && (
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded">
              <img
                src={data.image}
                alt={data.label}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Icon */}
          {data.icon && !data.image && (
            <div className="text-muted flex h-5 w-5 flex-shrink-0 items-center justify-center">{data.icon}</div>
          )}

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium" style={{ color: data.color }}>
                {data.label}
              </span>
              {data.badge && (
                <span className="bg-secondary text-secondary-foreground flex-shrink-0 rounded-full px-2 py-0.5 text-xs">
                  {data.badge}
                </span>
              )}
            </div>
            {data.description && <p className="text-muted-foreground mt-0.5 truncate text-sm">{data.description}</p>}
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="ml-2 flex-shrink-0">
            <Check className="text-primary h-4 w-4" />
          </div>
        )}
      </div>
    </components.Option>
  );
};

// Simple option component (default behavior)
export const SimpleOptionComponent: React.FC<OptionProps<any, false>> = (props) => {
  return <components.Option {...props} />;
};
