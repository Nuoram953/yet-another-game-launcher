import React from "react";
import {
  ActionMeta,
  GroupBase,
  MultiValue,
  SingleValue,
  StylesConfig,
  Theme,
  FormatOptionLabelMeta,
} from "react-select";

// Base option interface - can be extended for rich options
export interface BaseSelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

// Rich option interface for complex displays
export interface RichSelectOption extends BaseSelectOption {
  image?: string;
  icon?: React.ReactNode;
  description?: string;
  badge?: string | React.ReactNode;
  color?: string;
  metadata?: Record<string, any>;
}

// Generic option type
export type SelectOption<T = BaseSelectOption> = T;

// Value types for different select modes
export type SingleSelectValue<T = BaseSelectOption> = SingleValue<T>;
export type MultiSelectValue<T = BaseSelectOption> = MultiValue<T>;
export type SelectValue<T = BaseSelectOption, IsMulti extends boolean = false> = IsMulti extends true
  ? MultiSelectValue<T>
  : SingleSelectValue<T>;

// Change handler types
export type SingleSelectChangeHandler<T = BaseSelectOption> = (
  value: SingleSelectValue<T>,
  actionMeta: ActionMeta<T>,
) => void;

export type MultiSelectChangeHandler<T = BaseSelectOption> = (
  value: MultiSelectValue<T>,
  actionMeta: ActionMeta<T>,
) => void;

export type SelectChangeHandler<T = BaseSelectOption, IsMulti extends boolean = false> = IsMulti extends true
  ? MultiSelectChangeHandler<T>
  : SingleSelectChangeHandler<T>;

// Async options loader
export type AsyncOptionsLoader<T = BaseSelectOption> = (
  inputValue: string,
  callback: (options: T[]) => void,
) => void | Promise<T[]>;

// Create option handler
export type CreateOptionHandler = (inputValue: string) => void;

// Custom format option label
export type FormatOptionLabelHandler<T = BaseSelectOption> = (
  option: T,
  labelMeta: FormatOptionLabelMeta<T>,
) => React.ReactNode;

// Base props shared across all select components
export interface BaseSelectProps<T = BaseSelectOption, IsMulti extends boolean = false> {
  // Core functionality
  options?: T[];
  value?: SelectValue<T, IsMulti>;
  onChange?: SelectChangeHandler<T, IsMulti>;

  // UI and behavior
  placeholder?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  menuIsOpen?: boolean;
  closeMenuOnSelect?: boolean;
  closeMenuOnScroll?: boolean;

  // Styling
  className?: string;
  classNamePrefix?: string;
  styles?: StylesConfig<T, IsMulti, GroupBase<T>>;
  theme?: (theme: Theme) => Theme;

  // Custom rendering
  formatOptionLabel?: FormatOptionLabelHandler<T>;
  noOptionsMessage?: (obj: { inputValue: string }) => React.ReactNode;
  loadingMessage?: (obj: { inputValue: string }) => React.ReactNode;
  components?: any; // React-select components

  // Form integration
  name?: string;
  inputId?: string;

  // Advanced
  filterOption?: ((option: T, inputValue: string) => boolean) | null;
  onInputChange?: (newValue: string, actionMeta: any) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

// Enhanced props with label and tooltip (like existing Select component)
export interface EnhancedSelectProps<T = BaseSelectOption, IsMulti extends boolean = false>
  extends BaseSelectProps<T, IsMulti> {
  label?: string;
  tooltip?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

// Single select specific props
export interface SingleSelectProps<T = BaseSelectOption> extends EnhancedSelectProps<T, false> {
  isMulti?: false;
}

// Multi select specific props
export interface MultiSelectProps<T = BaseSelectOption> extends EnhancedSelectProps<T, true> {
  isMulti: true;
}

// Async select props
export interface AsyncSelectProps<T = BaseSelectOption, IsMulti extends boolean = false>
  extends Omit<EnhancedSelectProps<T, IsMulti>, "options"> {
  loadOptions: AsyncOptionsLoader<T>;
  defaultOptions?: boolean | T[];
  cacheOptions?: boolean;
  loadingMessage?: (obj: { inputValue: string }) => React.ReactNode;
}

// Creatable select props
export interface CreatableSelectProps<T = BaseSelectOption, IsMulti extends boolean = false>
  extends EnhancedSelectProps<T, IsMulti> {
  allowCustomValues?: boolean;
  onCreateOption?: CreateOptionHandler;
  formatCreateLabel?: (inputValue: string) => React.ReactNode;
  isValidNewOption?: (inputValue: string, selectValue: SelectValue<T, IsMulti>, selectOptions: T[]) => boolean;
  getNewOptionData?: (inputValue: string, optionLabel: React.ReactNode) => T;
}

// Combined async + creatable props
export interface AsyncCreatableSelectProps<T = BaseSelectOption, IsMulti extends boolean = false>
  extends Omit<AsyncSelectProps<T, IsMulti>, "options">,
    Omit<CreatableSelectProps<T, IsMulti>, "options"> {}

// Component ref types
export interface SelectRef {
  focus: () => void;
  blur: () => void;
  clearValue: () => void;
  getValue: () => any;
  hasValue: boolean;
  openMenu: (focusOption?: "first" | "last") => void;
  closeMenu: () => void;
}

// Style variants
export type SelectVariant = "default" | "outline" | "filled" | "minimal";
export type SelectSize = "sm" | "md" | "lg";

// Theme customization
export interface SelectThemeConfig {
  variant?: SelectVariant;
  size?: SelectSize;
  borderRadius?: number;
  colors?: {
    primary?: string;
    background?: string;
    border?: string;
    text?: string;
    placeholder?: string;
    hover?: string;
    focus?: string;
    disabled?: string;
  };
}

// Component display names for better debugging
export const COMPONENT_DISPLAY_NAMES = {
  SELECT_BASE: "ReactSelect",
  SELECT_SINGLE: "ReactSelectSingle",
  SELECT_MULTI: "ReactSelectMulti",
  SELECT_ASYNC: "ReactSelectAsync",
  SELECT_CREATABLE: "ReactSelectCreatable",
  SELECT_ASYNC_CREATABLE: "ReactSelectAsyncCreatable",
} as const;
