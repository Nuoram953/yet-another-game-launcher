import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { DialogClose } from "./DialogClose";
import { VariantProps, cva } from "class-variance-authority";

const contentStyles = cva(
  [
    "max-h-1/2 fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-foreground p-4 shadow-md text-normal",
  ],
  {
    variants: {
      size: {
        sm: "w-[600px]",
        md: "w-[800px]",
        lg: "w-[1000px]",
      },
    },
    compoundVariants: [],
    defaultVariants: {
      size: "sm",
    },
  },
);

type ContentProps = RadixDialog.DialogContentProps & VariantProps<typeof contentStyles>;

export const DialogContent = ({ children, size, className, ...props }: ContentProps) => {
  return (
    <RadixDialog.Portal container={document.body}>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />

      <RadixDialog.Content {...props} className={contentStyles({ size })}>
        {children}

        <DialogClose className="absolute right-3 top-3 text-inverted">
          <X className="h-4 w-4" />
        </DialogClose>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
};
