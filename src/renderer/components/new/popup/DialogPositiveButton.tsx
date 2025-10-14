import Button, { ButtonProps } from "../button/Button";

export const DialogPositiveButton = ({ children, ...props }: ButtonProps) => {
  return (
    <Button intent="primary" {...props}>
      {children}
    </Button>
  );
};
