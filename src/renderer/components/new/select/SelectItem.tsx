import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check } from "lucide-react";

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentProps<typeof RadixSelect.Item>
>(({ children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-design-border-hover"
    {...props}
  >
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    <RadixSelect.ItemIndicator>
      <Check className="h-4 w-4" />
    </RadixSelect.ItemIndicator>
  </RadixSelect.Item>
));
SelectItem.displayName = "SelectItem";
