import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentProps<typeof RadixSelect.Content>
>(({ children, ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className="mt-1 w-48 rounded-md border bg-foreground text-normal shadow-md"
      {...props}
    >
      <RadixSelect.ScrollUpButton className="text-center">↑</RadixSelect.ScrollUpButton>
      <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
      <RadixSelect.ScrollDownButton className="text-center">↓</RadixSelect.ScrollDownButton>
    </RadixSelect.Content>
  </RadixSelect.Portal>
));
SelectContent.displayName = "SelectContent";
