import * as RadixDialog from "@radix-ui/react-dialog";

export const DialogTitle = ({ children, ...props }: RadixDialog.DialogTitleProps) => {
  return (
    <RadixDialog.Title {...props} className="pb-4 text-lg font-medium text-white">
      {children}
    </RadixDialog.Title>
  );
};
