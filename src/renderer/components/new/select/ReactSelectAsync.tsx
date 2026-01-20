import React, { forwardRef } from "react";
import AsyncSelect, { AsyncProps } from "react-select/async";
import { ChevronDown, X, Info, Loader2 } from "lucide-react";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { BaseSelectOption, COMPONENT_DISPLAY_NAMES } from "./types";
import { createSimpleSelectStyles, SelectVariantsProps } from "./styles";
import { GroupBase } from "react-select";

// Async select specific props
interface ReactAsyncSelectProps extends AsyncProps<BaseSelectOption, false, GroupBase<BaseSelectOption>> {
  label?: string;
  tooltip?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: SelectVariantsProps["size"];
}

// Custom loading indicator
const LoadingIndicator = () => (
  <div className="flex items-center justify-center p-2">
    <Loader2 className="text-muted h-4 w-4 animate-spin" />
  </div>
);

export const ReactSelectAsync = forwardRef<
  any, // AsyncSelect doesn't expose proper ref types
  ReactAsyncSelectProps
>(
  (
    {
      label,
      tooltip,
      required,
      error,
      helperText,
      className: containerClassName,
      classNamePrefix = "react-select-async",
      placeholder = "Type to search...",
      isClearable = true,
      isSearchable = true,
      closeMenuOnSelect = true,
      size = "sm",
      loadingMessage = ({ inputValue }) => `Searching for "${inputValue}"...`,
      noOptionsMessage = ({ inputValue }) =>
        inputValue ? `No options found for "${inputValue}"` : "Start typing to search",
      ...props
    },
    ref,
  ) => {
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
        <AsyncSelect
          ref={ref}
          classNamePrefix={classNamePrefix}
          placeholder={placeholder}
          isClearable={isClearable}
          isSearchable={isSearchable}
          closeMenuOnSelect={closeMenuOnSelect}
          loadingMessage={loadingMessage}
          noOptionsMessage={noOptionsMessage}
          styles={createSimpleSelectStyles(size || "sm")}
          components={{
            DropdownIndicator: () => <ChevronDown className="h-4 w-4" />,
            ClearIndicator: () => <X className="h-3 w-3" />,
            LoadingIndicator,
          }}
          {...props}
        />
        {renderHelperText()}
      </div>
    );
  },
);

ReactSelectAsync.displayName = COMPONENT_DISPLAY_NAMES.SELECT_ASYNC;
