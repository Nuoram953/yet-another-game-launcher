// Legacy Radix UI based components
import { SelectRoot } from "./SelectRoot";
import { SelectTrigger } from "./SelectTrigger";
import { SelectContent } from "./SelectContent";
import { SelectItem } from "./SelectItem";
import { SelectValue } from "./SelectValue";

// Import new React-Select based components
import { ReactSelectBase, ReactSelectComponent } from "./ReactSelect";
import { ReactSelectSingle } from "./ReactSelectSingle";
import { ReactSelectMulti } from "./ReactSelectMulti";
import { ReactSelectAsync } from "./ReactSelectAsync";
import { ReactSelectCreatable } from "./ReactSelectCreatable";
import { ReactSelectAsyncCreatable } from "./ReactSelectAsyncCreatable";

// New React-Select based components
export { ReactSelectBase, ReactSelectComponent } from "./ReactSelect";
export { ReactSelectSingle } from "./ReactSelectSingle";
export { ReactSelectMulti } from "./ReactSelectMulti";
export { ReactSelectAsync } from "./ReactSelectAsync";
export { ReactSelectCreatable } from "./ReactSelectCreatable";
export { ReactSelectAsyncCreatable } from "./ReactSelectAsyncCreatable";

// Custom components
export { RichOptionComponent, SimpleOptionComponent } from "./components/OptionComponent";

export {
  RichSingleValueComponent,
  RichMultiValueLabelComponent,
  SimpleSingleValueComponent,
  SimpleMultiValueComponent,
  SimpleMultiValueLabelComponent,
} from "./components/ValueComponent";

// Hooks
export { useDebounce, useDebouncedCallback } from "./hooks/useDebounce";

export { useAsyncOptions, type AsyncOptionsConfig, type AsyncOptionsResult } from "./hooks/useAsyncOptions";

// Types
export type {
  BaseSelectOption,
  RichSelectOption,
  SelectOption,
  SingleSelectValue,
  MultiSelectValue,
  SelectValue,
  SingleSelectChangeHandler,
  MultiSelectChangeHandler,
  SelectChangeHandler,
  AsyncOptionsLoader,
  CreateOptionHandler,
  FormatOptionLabelHandler,
  BaseSelectProps,
  EnhancedSelectProps,
  SingleSelectProps,
  MultiSelectProps,
  AsyncSelectProps,
  CreatableSelectProps,
  AsyncCreatableSelectProps,
  SelectRef,
  SelectVariant,
  SelectSize,
  SelectThemeConfig,
} from "./types";

// Styles and theming
export { createSimpleSelectStyles, selectVariants, simpleSelectStyles } from "./styles";

// Legacy Radix UI based Select - compound component pattern
export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Value: SelectValue,
});

// New React-Select component system - compound component pattern
export const ReactSelect = Object.assign(ReactSelectBase, {
  Single: ReactSelectSingle,
  Multi: ReactSelectMulti,
  Async: ReactSelectAsync,
  Creatable: ReactSelectCreatable,
  AsyncCreatable: ReactSelectAsyncCreatable,
});

// Default export for convenience
export default ReactSelect;
