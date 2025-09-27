import Button, { ButtonProps } from "../button/Button";
import { DialogClose } from "./DialogClose";

export const DialogNegativeButton = ({ children, ...props }: ButtonProps) => {
  return (
    <DialogClose>
      <Button intent="secondary" {...props}>
        {children}
      </Button>
    </DialogClose>
  );
};
