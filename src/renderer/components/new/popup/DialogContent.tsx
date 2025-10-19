import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { DialogClose } from "./DialogClose";

export const DialogContent = ({ children, ...props }: RadixDialog.DialogContentProps) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/70" />
      <RadixDialog.Content
        {...props}
        className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-design-foreground p-4 shadow-lg"
      >
        {children}
        <DialogClose className="absolute right-3 top-3">
          <X className="h-4 w-4" />
        </DialogClose>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
};
