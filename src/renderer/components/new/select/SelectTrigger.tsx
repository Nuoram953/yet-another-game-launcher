import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentProps<typeof RadixSelect.Trigger>
>(({ children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className="inline-flex w-fit items-center justify-between rounded-md border bg-design-background px-3 py-2"
    {...props}
  >
    {children}
    <RadixSelect.Icon className="ml-2">
      <ChevronDown className="h-4 w-4" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";
