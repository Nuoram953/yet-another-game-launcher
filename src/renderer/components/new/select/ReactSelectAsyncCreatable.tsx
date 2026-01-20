import React, { forwardRef } from "react";
import AsyncCreatableSelect, { AsyncCreatableProps } from "react-select/async-creatable";
import { ChevronDown, X, Info, Plus, Loader2 } from "lucide-react";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { BaseSelectOption, COMPONENT_DISPLAY_NAMES } from "./types";
import { createSimpleSelectStyles, SelectVariantsProps } from "./styles";
import { GroupBase } from "react-select";

// Async creatable select specific props
interface ReactAsyncCreatableSelectProps
  extends AsyncCreatableProps<BaseSelectOption, false, GroupBase<BaseSelectOption>> {
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

export const ReactSelectAsyncCreatable = forwardRef<
  any, // AsyncCreatableSelect doesn't expose proper ref types
  ReactAsyncCreatableSelectProps
>(
  (
    {
      label,
      tooltip,
      required,
      error,
      helperText,
      className: containerClassName,
      classNamePrefix = "react-select-async-creatable",
      placeholder = "Type to search or create...",
      isClearable = true,
      isSearchable = true,
      closeMenuOnSelect = true,
      size = "sm",
      formatCreateLabel = (inputValue) => (
        <div className="flex items-center gap-2">
          <Plus className="h-3 w-3" />
          <span>Create "{inputValue}"</span>
        </div>
      ),
      loadingMessage = ({ inputValue }) => `Searching for "${inputValue}"...`,
      noOptionsMessage = ({ inputValue }) =>
        inputValue ? `No options found. Create "${inputValue}"?` : "Start typing to search or create",
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
        <AsyncCreatableSelect
          ref={ref}
          classNamePrefix={classNamePrefix}
          placeholder={placeholder}
          isClearable={isClearable}
          isSearchable={isSearchable}
          closeMenuOnSelect={closeMenuOnSelect}
          formatCreateLabel={formatCreateLabel}
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

ReactSelectAsyncCreatable.displayName = COMPONENT_DISPLAY_NAMES.SELECT_ASYNC_CREATABLE;
