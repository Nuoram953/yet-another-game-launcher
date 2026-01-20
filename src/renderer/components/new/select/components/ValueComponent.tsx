import React from "react";
import { SingleValueProps, MultiValueProps, components } from "react-select";
import { RichSelectOption } from "../types";

// Rich single value component that supports images and icons
export const RichSingleValueComponent: React.FC<any> = (props) => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {/* Image */}
        {data?.image && (
          <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded">
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
        {data?.icon && !data.image && (
          <div className="text-muted flex h-4 w-4 flex-shrink-0 items-center justify-center">{data.icon}</div>
        )}

        {/* Label */}
        <span className="truncate" style={{ color: data?.color }}>
          {data?.label}
        </span>

        {/* Badge */}
        {data?.badge && (
          <span className="bg-secondary text-secondary-foreground flex-shrink-0 rounded px-1.5 py-0.5 text-xs">
            {data.badge}
          </span>
        )}
      </div>
    </components.SingleValue>
  );
};

// Rich multi value label component
export const RichMultiValueLabelComponent: React.FC<any> = (props) => {
  const { data } = props;

  return (
    <components.MultiValueLabel {...props}>
      <div className="flex items-center gap-1.5">
        {/* Image */}
        {data?.image && (
          <div className="h-4 w-4 flex-shrink-0 overflow-hidden rounded">
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
        {data?.icon && !data.image && (
          <div className="flex h-3 w-3 flex-shrink-0 items-center justify-center">{data.icon}</div>
        )}

        {/* Label */}
        <span className="truncate" style={{ color: data?.color }}>
          {data?.label}
        </span>
      </div>
    </components.MultiValueLabel>
  );
};

// Simple value components (default behavior)
export const SimpleSingleValueComponent: React.FC<any> = (props) => {
  return <components.SingleValue {...props} />;
};

export const SimpleMultiValueComponent: React.FC<any> = (props) => {
  return <components.MultiValue {...props} />;
};

export const SimpleMultiValueLabelComponent: React.FC<any> = (props) => {
  return <components.MultiValueLabel {...props} />;
};
