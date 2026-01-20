import React, { forwardRef, useMemo } from "react";
import Select, { SelectInstance, components, Props as ReactSelectProps } from "react-select";
import { ChevronDown, X, Info } from "lucide-react";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { BaseSelectOption, COMPONENT_DISPLAY_NAMES } from "./types";
import { createSimpleSelectStyles, selectVariants, SelectVariantsProps } from "./styles";

// Class name prefixes for different variants
const classNamePrefixes = {
  default: "react-select",
  single: "react-select-single",
  multi: "react-select-multi",
  async: "react-select-async",
  creatable: "react-select-creatable",
} as const;

// Enhanced props interface
interface EnhancedReactSelectProps extends ReactSelectProps<BaseSelectOption, false> {
  label?: string;
  tooltip?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: SelectVariantsProps["size"];
}

// Custom components for react-select
const DropdownIndicator = (props: any) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown className="h-4 w-4" />
  </components.DropdownIndicator>
);

const ClearIndicator = (props: any) => (
  <components.ClearIndicator {...props}>
    <X className="h-3 w-3" />
  </components.ClearIndicator>
);

const MultiValueRemove = (props: any) => (
  <components.MultiValueRemove {...props}>
    <X className="h-3 w-3" />
  </components.MultiValueRemove>
);

// Base ReactSelect component that all other variants extend
export const ReactSelectBase = forwardRef<SelectInstance<BaseSelectOption>, EnhancedReactSelectProps>(
  (
    {
      // Enhanced props
      label,
      tooltip,
      required,
      error,
      helperText,
      className: containerClassName,
      size = "sm",

      // Style props
      styles: customStyles,
      theme: customTheme,
      classNamePrefix = classNamePrefixes.default,

      // React-select props
      placeholder = "Select an option...",
      isClearable = true,
      isSearchable = true,
      closeMenuOnSelect = true,
      components: customComponents,
      ...selectProps
    },
    ref,
  ) => {
    // Memoize styles to prevent unnecessary re-renders
    const mergedStyles = useMemo(() => {
      const baseStyles = createSimpleSelectStyles(size || "sm");
      return customStyles ? { ...baseStyles, ...customStyles } : baseStyles;
    }, [customStyles, size]);

    // Custom components
    const selectComponents = useMemo(
      () => ({
        DropdownIndicator,
        ClearIndicator,
        MultiValueRemove,
        ...customComponents,
      }),
      [customComponents],
    );

    const renderLabel = () => {
      if (!label) return null;

      return (
        <Label className="mb-2 flex flex-row items-center gap-2 text-left">
          {label}
          {required && <span className="text-destructive">*</span>}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <Info size={14} className="text-muted" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
      );
    };

    const renderHelperText = () => {
      if (!helperText && !error) return null;

      return (
        <div className="mt-1 text-sm">
          {error && <p className="text-destructive">{error}</p>}
          {helperText && !error && <p className="text-muted">{helperText}</p>}
        </div>
      );
    };

    return (
      <div className={containerClassName}>
        {renderLabel()}
        <Select
          ref={ref}
          placeholder={placeholder}
          isClearable={isClearable}
          isSearchable={isSearchable}
          closeMenuOnSelect={closeMenuOnSelect}
          styles={mergedStyles}
          classNamePrefix={classNamePrefix}
          components={selectComponents}
          {...selectProps}
        />
        {renderHelperText()}
      </div>
    );
  },
);

ReactSelectBase.displayName = COMPONENT_DISPLAY_NAMES.SELECT_BASE;

// Keep the original component for backward compatibility
export const ReactSelectComponent = ReactSelectBase;

// Legacy interface for backward compatibility
export interface ReactSelectOption {
  value: string;
  label: string;
}
