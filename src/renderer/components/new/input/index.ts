import { Help } from "./Help";
import { InputText } from "./InputText";
import { Label } from "./Label";
import { Root } from "./Root";

type InputCompound = React.FC<React.ComponentProps<typeof Root>> & {
  Label: typeof Label;
  Help: typeof Help;
  Text: typeof InputText;
};

export const Input = Object.assign(Root, {
  Text: InputText,
  Label,
  Help,
}) as InputCompound;
