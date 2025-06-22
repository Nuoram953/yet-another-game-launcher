import { Input } from "@render/components/input/Input";
import { Label } from "@render/components/ui/label";
import { Switch } from "@render/components/ui/switch";
import React from "react";

interface InputSwitchProps {
  title: string;
  description: string;
  value: boolean;
  handleCheckedChange: (value: boolean) => void;
  inputPlaceholder?: string;
  inputValue?: string;
  inputOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputSwitch = ({
  title,
  description,
  value,
  handleCheckedChange,
  inputOnChange,
  inputPlaceholder,
  inputValue,
}: InputSwitchProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="borderless" className="flex flex-col">
          <span>{title}</span>
          <span className="text-sm text-gray-500">{description}</span>
        </Label>
        <Switch checked={value} onCheckedChange={handleCheckedChange} />
      </div>
      {value && inputPlaceholder && inputOnChange && (
        <Input color={"dark"} placeholder={inputPlaceholder} value={inputValue} onChange={inputOnChange} />
      )}
    </div>
  );
};

interface InputTextProps {
  title: string;
  description: string;
  inputOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputPlaceholder: string;
  inputValue: string;
  customClass?: string;
}

export const InputText = ({
  title,
  description,
  inputOnChange,
  inputPlaceholder,
  inputValue,
  customClass,
}: InputTextProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="borderless" className="flex flex-col">
          <span>{title}</span>
          <span className="text-sm text-gray-500">{description}</span>
        </Label>
      </div>
      <Input
        className={customClass}
        color={"dark"}
        placeholder={inputPlaceholder}
        value={inputValue}
        onChange={inputOnChange}
      />
    </div>
  );
};
