import * as RadixDialog from "@radix-ui/react-dialog";
import React from "react";

export const DialogRoot: React.FC<
  React.PropsWithChildren<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>
> = ({ children, open, onOpenChange }) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
};
