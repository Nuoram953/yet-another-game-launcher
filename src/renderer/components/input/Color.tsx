import React from "react";

type ColorPickerProps = {
  value: string;
  onChange: (newColor: string) => void;
};

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-10 cursor-pointer border-none bg-transparent p-0"
    />
  );
};
