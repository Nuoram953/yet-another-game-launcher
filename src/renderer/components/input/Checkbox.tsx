import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, XIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const checkboxVariants = cva(
  "peer relative flex shrink-0 rounded-sm border shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#222] border-[#666] text-[#eee] data-[state=checked]:bg-[#333] data-[state=checked]:border-[#666] data-[state=checked]:text-[#eee] data-[state=indeterminate]:bg-[#333] data-[state=indeterminate]:border-[#666] data-[state=indeterminate]:text-[#eee]",
  {
    variants: {
      variant: {
        default: "focus-visible:ring-[#666]",
        outline: "border-2 focus-visible:ring-[#666]",
        ghost: "border-transparent bg-transparent shadow-none focus-visible:ring-[#666] hover:bg-[#333]",
      },
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface CheckboxProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
      "checked" | "defaultChecked" | "onCheckedChange"
    >,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  setValue?: (value: boolean | "indeterminate") => void;
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, variant, size, label, description, checked, defaultChecked, setValue, ...props }, ref) => {
    const handleCheckedChange = () => {
      switch (checked) {
        case false:
          setValue(true);
          break;
        case true:
          setValue("indeterminate");
          break;
        case "indeterminate":
          setValue(false);
          break;
      }
    };

    return (
      <div className="flex items-center space-x-2">
        <CheckboxPrimitive.Root
          ref={ref}
          className={checkboxVariants({ variant, size, className })}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleCheckedChange}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            {React.useMemo(() => {
              if (checked === "indeterminate") {
                return <XIcon className="h-4 w-4" />;
              }
              return <CheckIcon className="h-4 w-4" />;
            }, [checked])}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {(label || description) && (
          <div className="grid gap-0.5 leading-none">
            {label && (
              <label
                htmlFor={props.id}
                className="text-sm font-medium leading-none text-design-text-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
            {description && <p className="text-xs text-design-text-subtle">{description}</p>}
          </div>
        )}
      </div>
    );
  },
);
