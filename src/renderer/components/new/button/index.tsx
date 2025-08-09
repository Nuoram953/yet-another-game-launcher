import ButtonRoot from "./Button";
import Content from "./Content";
import Item from "./Item";

type ButtonCompound = typeof ButtonRoot & {
  Content: typeof Content;
  Item: typeof Item;
};

const Button = ButtonRoot as ButtonCompound;

Button.Content = Content;
Button.Item = Item;

export default Button;
