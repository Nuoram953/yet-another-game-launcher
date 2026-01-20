import React, { forwardRef } from "react";
import { SelectInstance, Props as ReactSelectProps } from "react-select";
import { ReactSelectBase } from "./ReactSelect";
import { BaseSelectOption, COMPONENT_DISPLAY_NAMES } from "./types";
import { SelectVariantsProps } from "./styles";

// Single select specific props
interface SingleSelectProps extends ReactSelectProps<BaseSelectOption, false> {
  label?: string;
  tooltip?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: SelectVariantsProps["size"];
  // Override isMulti to always be false
  isMulti?: false;
}

export const ReactSelectSingle = forwardRef<SelectInstance<BaseSelectOption>, SingleSelectProps>(
  ({ classNamePrefix = "react-select-single", isMulti = false, closeMenuOnSelect = true, ...props }, ref) => {
    return (
      <ReactSelectBase
        ref={ref}
        isMulti={isMulti}
        closeMenuOnSelect={closeMenuOnSelect}
        classNamePrefix={classNamePrefix}
        {...props}
      />
    );
  },
);

ReactSelectSingle.displayName = COMPONENT_DISPLAY_NAMES.SELECT_SINGLE;
