import SelectComponent, {
  ActionMeta,
  GroupBase,
  MultiValue,
  OptionsOrGroups,
  PropsValue,
  SingleValue,
} from "react-select";
import CreatableSelect from "react-select/creatable";
import { Label } from "../ui/label";
import React from "react";
import { isNil } from "lodash";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";

const darkTheme = {
  borderRadius: 4,
};

const darkStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#222",
    borderColor: "#666",
    color: "#eee",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#222",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#333" : "#222",
    color: "#eee",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#eee",
  }),
  input: (provided) => ({
    ...provided,
    color: "#eee",
  }),
};

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  isMulti?: boolean;
  label: string;
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  onChange: (
    newValue: MultiValue<SelectOption> | SelectOption,
    actionMeta: ActionMeta<PropsValue<SelectOption>>,
  ) => void;
  values: PropsValue<SelectOption>[];
  allowCustomValues?: boolean;
  placeholder?: string;
  tooltip?: string;
}

export const Select = ({
  isMulti = true,
  label,
  options,
  onChange,
  values,
  allowCustomValues = false,
  placeholder = "Select options...",
  tooltip,
}: SelectProps) => {
  const handleCreateOption = (inputValue: string) => {
    if (!allowCustomValues) {
      return;
    }
    const newOption = { value: inputValue, label: inputValue };
    const currentValues = Array.isArray(values) ? values : values ? [values] : [];
    onChange(
      [...currentValues, newOption] as MultiValue<SelectOption>,
      {
        action: "create-option",
        option: newOption,
      } as ActionMeta<SelectOption>,
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="name" className="flex flex-row items-center gap-2 text-left">
        {label}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info size={16} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
      <CreatableSelect
        isMulti={isMulti}
        theme={(theme) => ({ ...theme, ...darkTheme })}
        styles={darkStyles}
        name="colors"
        options={options}
        className="basic-multi-select z-9999 dark"
        classNamePrefix="select"
        onChange={(newValue, actionMeta) => {
          if (isMulti) {
            onChange(newValue as MultiValue<SelectOption>, actionMeta);
          } else {
            onChange(newValue as SelectOption | null, actionMeta);
          }
        }}
        value={values as PropsValue<SelectOption>[]}
        placeholder={placeholder}
        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
        onCreateOption={handleCreateOption}
        isClearable={true}
        backspaceRemovesValue={true}
      />
    </div>
  );
};
