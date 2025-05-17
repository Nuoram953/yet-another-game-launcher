import SelectComonent, { ActionMeta, GroupBase, MultiValue, OptionsOrGroups, PropsValue } from "react-select";
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

interface SelectProps {
  label: string;
  options: OptionsOrGroups<{ value: string; label: string }, GroupBase<{ value: string; label: string }>>;
  onChange: (
    newValue: MultiValue<{
      value: string;
      label: string;
    }>,
    actionMeta: ActionMeta<{
      value: string;
      label: string;
    }>,
  ) => void;
  values: PropsValue<{ value: string; label: string }>[];
}

export const Select = ({ label, options, onChange, values }: SelectProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="name" className="text-left">
        {label}
      </Label>
      <SelectComonent
        isMulti
        theme={(theme) => ({ ...theme, ...darkTheme })}
        styles={darkStyles}
        name="colors"
        options={options}
        className="basic-multi-select z-9999 dark"
        classNamePrefix="select"
        onChange={onChange}
        value={values}
      />
    </div>
  );
};
