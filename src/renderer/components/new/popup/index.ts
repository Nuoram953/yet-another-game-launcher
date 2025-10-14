import { DialogRoot } from "./DialogRoot";
import { DialogTrigger } from "./DialogTrigger";
import { DialogContent } from "./DialogContent";
import { DialogTitle } from "./DialogTitle";
import { DialogDescription } from "./DialogDescription";
import { DialogClose } from "./DialogClose";
import { DialogFooter } from "./DialogFooter";
import { DialogPositiveButton } from "./DialogPositiveButton";
import { DialogNegativeButton } from "./DialogNegativeButton";

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Footer: DialogFooter,
  PositiveAction: DialogPositiveButton,
  NegativeAction: DialogNegativeButton,
});
