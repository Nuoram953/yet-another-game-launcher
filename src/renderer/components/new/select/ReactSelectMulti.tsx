import React, { forwardRef } from "react";
import { SelectInstance, Props as ReactSelectProps } from "react-select";
import { ReactSelectBase } from "./ReactSelect";
import { BaseSelectOption, COMPONENT_DISPLAY_NAMES } from "./types";
import { SelectVariantsProps } from "./styles";

// Multi select specific props
interface MultiSelectProps extends Omit<ReactSelectProps<BaseSelectOption, true>, "isMulti"> {
  label?: string;
  tooltip?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: SelectVariantsProps["size"];
  // Override isMulti to always be true
  isMulti?: true;
}

export const ReactSelectMulti = forwardRef<SelectInstance<BaseSelectOption, true>, MultiSelectProps>(
  (
    {
      classNamePrefix = "react-select-multi",
      isMulti = true,
      closeMenuOnSelect = false,
      placeholder = "Select multiple options...",
      ...props
    },
    ref,
  ) => {
    return (
      <ReactSelectBase
        ref={ref as any}
        isMulti={isMulti}
        closeMenuOnSelect={closeMenuOnSelect}
        classNamePrefix={classNamePrefix}
        placeholder={placeholder}
        {...(props as any)}
      />
    );
  },
);

ReactSelectMulti.displayName = COMPONENT_DISPLAY_NAMES.SELECT_MULTI;
