import { Navbar as NavbarRoot } from "./Navbar";
import { NavbarSection } from "./NavbarSection";
import { NavbarItem } from "./NavbarItem";
import { NavbarAction } from "./NavbarAction";

type NavbarCompound = typeof NavbarRoot & {
  Section: typeof NavbarSection;
  Item: typeof NavbarItem;
  Action: typeof NavbarAction;
};

export const Navbar: NavbarCompound = Object.assign(NavbarRoot, {
  Section: NavbarSection,
  Item: NavbarItem,
  Action: NavbarAction,
});
