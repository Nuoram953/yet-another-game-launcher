import React, { forwardRef } from "react";
import CreatableSelect, { CreatableProps } from "react-select/creatable";
import { ChevronDown, X, Info, Plus } from "lucide-react";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { BaseSelectOption, COMPONENT_DISPLAY_NAMES } from "./types";
import { createSimpleSelectStyles, SelectVariantsProps } from "./styles";
import { GroupBase } from "react-select";

// Creatable select specific props
interface ReactCreatableSelectProps extends CreatableProps<BaseSelectOption, false, GroupBase<BaseSelectOption>> {
  label?: string;
  tooltip?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: SelectVariantsProps["size"];
}

export const ReactSelectCreatable = forwardRef<
  any, // CreatableSelect doesn't expose proper ref types
  ReactCreatableSelectProps
>(
  (
    {
      label,
      tooltip,
      required,
      error,
      helperText,
      className: containerClassName,
      classNamePrefix = "react-select-creatable",
      placeholder = "Select or create an option...",
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
      noOptionsMessage = ({ inputValue }) =>
        inputValue ? `Type to create "${inputValue}"` : "Type to create an option",
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
        <CreatableSelect
          ref={ref}
          classNamePrefix={classNamePrefix}
          placeholder={placeholder}
          isClearable={isClearable}
          isSearchable={isSearchable}
          closeMenuOnSelect={closeMenuOnSelect}
          formatCreateLabel={formatCreateLabel}
          noOptionsMessage={noOptionsMessage}
          styles={createSimpleSelectStyles(size || "sm")}
          components={{
            DropdownIndicator: () => <ChevronDown className="h-4 w-4" />,
            ClearIndicator: () => <X className="h-3 w-3" />,
          }}
          {...props}
        />
        {renderHelperText()}
      </div>
    );
  },
);

ReactSelectCreatable.displayName = COMPONENT_DISPLAY_NAMES.SELECT_CREATABLE;
