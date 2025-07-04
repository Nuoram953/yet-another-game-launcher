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
  actionRight?: React.ReactNode;
}

export const InputText = ({
  title,
  description,
  inputOnChange,
  inputPlaceholder,
  inputValue,
  customClass,
  actionRight,
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
        actionRight={actionRight}
      />
    </div>
  );
};

interface InputFileProps {
  title: string;
  description?: string;
  inputOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
  customClass?: string;
  currentFileName?: string;
  showCurrentFile?: boolean;
}

export const InputFile = ({
  title,
  description,
  inputOnChange,
  accept,
  multiple = false,
  customClass,
  currentFileName,
  showCurrentFile = false,
}: InputFileProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="file-input" className="flex flex-col">
          <span>{title}</span>
          <span className="text-sm text-gray-500">{description}</span>
        </Label>
      </div>

      {showCurrentFile && currentFileName && (
        <div className="rounded border bg-gray-50 p-2 text-sm text-gray-600">
          Current file: <span className="font-medium">{currentFileName}</span>
        </div>
      )}

      <Input
        id="file-input"
        type="file"
        color="dark"
        className={customClass}
        accept={accept}
        multiple={multiple}
        onChange={inputOnChange}
      />
    </div>
  );
};
