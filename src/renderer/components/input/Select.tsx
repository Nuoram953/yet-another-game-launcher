import SelectComponent, { ActionMeta, GroupBase, MultiValue, OptionsOrGroups, PropsValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { Label } from "../ui/label";
import React from "react";

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

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  onChange: (newValue: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => void;
  values: PropsValue<SelectOption>[];
  allowCustomValues?: boolean;
  placeholder?: string;
}

export const Select = ({
  label,
  options,
  onChange,
  values,
  allowCustomValues = false,
  placeholder = "Select options...",
}: SelectProps) => {
  // Function to handle custom value creation
  const handleCreateOption = (inputValue: string) => {
    const newOption = { value: inputValue, label: inputValue };
    // Call onChange with the new option added to the current values
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
      <Label htmlFor="name" className="text-left">
        {label}
      </Label>
      {allowCustomValues ? (
        <CreatableSelect
          isMulti
          theme={(theme) => ({ ...theme, ...darkTheme })}
          styles={darkStyles}
          name="colors"
          options={options}
          className="basic-multi-select z-9999 dark"
          classNamePrefix="select"
          onChange={onChange}
          value={values}
          placeholder={placeholder}
          formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
          onCreateOption={handleCreateOption}
        />
      ) : (
        <SelectComponent
          isMulti
          theme={(theme) => ({ ...theme, ...darkTheme })}
          styles={darkStyles}
          name="colors"
          options={options}
          className="basic-multi-select z-9999 dark"
          classNamePrefix="select"
          onChange={onChange}
          value={values}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};
