import { Dropdown as Root } from "./Dropdown";
import { DropdownTrigger as Trigger } from "./DropdownTrigger";
import { DropdownContent as Content } from "./DropdownContent";
import { DropdownItem as Item } from "./DropdownItem";

type DropdownNamespace = typeof Root & {
  Trigger: typeof Trigger;
  Content: typeof Content;
  Item: typeof Item;
};

export const Dropdown: DropdownNamespace = Object.assign(Root, {
  Trigger,
  Content,
  Item,
});
