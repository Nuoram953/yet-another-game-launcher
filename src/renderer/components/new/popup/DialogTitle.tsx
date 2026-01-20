import * as RadixDialog from "@radix-ui/react-dialog";

export const DialogTitle = ({ children, ...props }: RadixDialog.DialogTitleProps) => {
  return (
    <RadixDialog.Title {...props} className="text-xl font-bold text-white">
      {children}
    </RadixDialog.Title>
  );
};
