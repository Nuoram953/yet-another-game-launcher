import { StylesConfig, GroupBase } from "react-select";
import { cva, VariantProps } from "class-variance-authority";
import { BaseSelectOption } from "./types";

// Select variants matching InputBase exactly using Tailwind classes
export const selectVariants = cva(
  [
    "flex items-center justify-center gap-2 rounded-md font-medium transition bg-foreground border border-normal",
    "focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "placeholder:text-placeholder",
  ],
  {
    variants: {
      size: {
        xs: "px-1.5 py-2 text-xs min-h-[32px]",
        sm: "px-2 py-2.5 text-sm min-h-[40px]",
        md: "px-4 py-3 text-base min-h-[48px]",
        lg: "px-6 py-4 text-lg min-h-[56px]",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

export type SelectVariantsProps = VariantProps<typeof selectVariants>;

// Size configurations that match the Tailwind classes exactly
const sizeConfigs = {
  xs: {
    minHeight: 32,
    padding: "0.375rem 0.375rem", // px-1.5 py-2
    fontSize: "0.75rem", // text-xs
  },
  sm: {
    minHeight: 40,
    padding: "0.625rem 0.5rem", // px-2 py-2.5
    fontSize: "0.875rem", // text-sm
  },
  md: {
    minHeight: 48,
    padding: "0.75rem 1rem", // px-4 py-3
    fontSize: "1rem", // text-base
  },
  lg: {
    minHeight: 56,
    padding: "1rem 1.5rem", // px-6 py-4
    fontSize: "1.125rem", // text-lg
  },
} as const;

// CSS custom properties that match your Tailwind tokens exactly
const cssColors = {
  // Background colors (from Tailwind tokens)
  background: "var(--color-semantic-background-background)",
  foreground: "var(--color-semantic-background-foreground)",

  // Text colors (from Tailwind tokens)
  textNormal: "var(--color-semantic-text-normal)",
  textSubtle: "var(--color-semantic-text-subtle)",
  textDisabled: "var(--color-semantic-text-disabled)",
  textError: "var(--color-semantic-text-error)",

  // Border colors (from Tailwind tokens)
  borderNormal: "var(--color-semantic-border-normal)",
  borderHover: "var(--color-semantic-border-hover)",

  // Primitive colors for accent, destructive, etc.
  blue500: "var(--color-primitive-blue-500)",
  red500: "var(--color-primitive-red-500)",
  gray700: "var(--color-primitive-gray-700)",
} as const;

// Create styles using the exact same CSS variables as your Tailwind setup
export function createSimpleSelectStyles<T = BaseSelectOption, IsMulti extends boolean = false>(
  size: keyof typeof sizeConfigs = "sm",
): StylesConfig<T, IsMulti, GroupBase<T>> {
  const sizeConfig = sizeConfigs[size];

  return {
    // Main container
    container: (base) => ({
      ...base,
      position: "relative",
    }),

    // Control (the main input area) - matches bg-foreground border border-normal
    control: (base, state) => ({
      ...base,
      backgroundColor: cssColors.foreground,
      borderColor: state.isFocused ? cssColors.blue500 : cssColors.borderNormal,
      borderWidth: "1px",
      borderRadius: "6px", // rounded-md
      minHeight: sizeConfig.minHeight,
      padding: 0,
      boxShadow: state.isFocused ? "0 0 0 1px white" : "none", // focus-visible:ring-1 focus-visible:ring-white
      "&:hover": {
        borderColor: state.isFocused ? cssColors.blue500 : cssColors.borderHover,
      },
      transition: "all 0.2s ease-in-out", // transition
      cursor: state.isDisabled ? "not-allowed" : "default", // disabled:cursor-not-allowed
      opacity: state.isDisabled ? 0.5 : 1, // disabled:opacity-50
    }),

    // Value container (holds the selected value)
    valueContainer: (base) => ({
      ...base,
      padding: sizeConfig.padding, // matches px-2 py-2.5 etc.
      fontSize: sizeConfig.fontSize, // matches text-sm etc.
    }),

    // Single value display - matches text-normal
    singleValue: (base) => ({
      ...base,
      color: cssColors.textNormal,
      fontSize: sizeConfig.fontSize,
    }),

    // Multi value (tags) - simple gray styling
    multiValue: (base) => ({
      ...base,
      backgroundColor: cssColors.gray700,
      borderRadius: "4px",
      margin: "0.125rem",
    }),

    multiValueLabel: (base) => ({
      ...base,
      color: cssColors.textNormal,
      fontSize: "0.75rem",
      padding: "0.125rem 0.25rem",
    }),

    multiValueRemove: (base) => ({
      ...base,
      color: cssColors.textNormal,
      "&:hover": {
        backgroundColor: cssColors.red500,
        color: "white",
      },
      borderRadius: "0 4px 4px 0",
    }),

    // Placeholder - matches placeholder:text-placeholder (which maps to text-subtle)
    placeholder: (base) => ({
      ...base,
      color: cssColors.textSubtle,
      fontSize: sizeConfig.fontSize,
    }),

    // Input (search input) - matches text-normal
    input: (base) => ({
      ...base,
      color: cssColors.textNormal,
      fontSize: sizeConfig.fontSize,
    }),

    // Dropdown indicators
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: cssColors.borderNormal,
    }),

    indicatorsContainer: (base) => ({
      ...base,
      padding: "0 0.5rem",
    }),

    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? cssColors.textNormal : cssColors.textSubtle,
      "&:hover": {
        color: cssColors.textNormal,
      },
      transition: "color 0.2s ease-in-out",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "none",
    }),

    clearIndicator: (base) => ({
      ...base,
      color: cssColors.textSubtle,
      "&:hover": {
        color: cssColors.red500,
      },
      transition: "color 0.2s ease-in-out",
    }),

    // Loading indicator
    loadingIndicator: (base) => ({
      ...base,
      color: cssColors.blue500,
    }),

    // Menu (dropdown) - matches bg-foreground border border-normal
    menu: (base) => ({
      ...base,
      backgroundColor: cssColors.foreground,
      border: `1px solid ${cssColors.borderNormal}`,
      borderRadius: "6px", // rounded-md
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // shadow-md
      zIndex: 9999,
      marginTop: "0.25rem",
    }),

    menuList: (base) => ({
      ...base,
      padding: "0.25rem",
      maxHeight: "200px",
    }),

    // Menu options - using hover states like Tailwind hover:bg-hover
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? cssColors.borderHover : state.isSelected ? cssColors.gray700 : "transparent",
      color: cssColors.textNormal,
      padding: "0.5rem 0.75rem",
      borderRadius: "4px",
      margin: "0.125rem 0",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      opacity: state.isDisabled ? 0.5 : 1,
      "&:hover": {
        backgroundColor: state.isDisabled
          ? "transparent"
          : state.isSelected
            ? cssColors.gray700
            : cssColors.borderHover,
      },
      transition: "all 0.2s ease-in-out",
    }),

    // Group styling
    group: (base) => ({
      ...base,
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
    }),

    groupHeading: (base) => ({
      ...base,
      color: cssColors.textSubtle,
      fontSize: "0.75rem",
      fontWeight: "600",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      padding: "0.5rem 0.75rem 0.25rem",
      marginBottom: "0.25rem",
    }),

    // No options message
    noOptionsMessage: (base) => ({
      ...base,
      color: cssColors.textSubtle,
      fontSize: sizeConfig.fontSize,
      padding: "0.75rem",
      textAlign: "center" as const,
    }),

    // Loading message
    loadingMessage: (base) => ({
      ...base,
      color: cssColors.textSubtle,
      fontSize: sizeConfig.fontSize,
      padding: "0.75rem",
      textAlign: "center" as const,
    }),
  };
}

// Simple presets for different sizes
export const simpleSelectStyles = {
  xs: createSimpleSelectStyles("xs"),
  sm: createSimpleSelectStyles("sm"),
  md: createSimpleSelectStyles("md"),
  lg: createSimpleSelectStyles("lg"),
} as const;

// Default export for backward compatibility
export default createSimpleSelectStyles();
