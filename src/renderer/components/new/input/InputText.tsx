import { InputBase, InputBaseProps } from "./InputBase";

type InputTextProps = {} & InputBaseProps;

export const InputText = ({ ...props }: InputTextProps) => {
  return <InputBase {...props} />;
};
