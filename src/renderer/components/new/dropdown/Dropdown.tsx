import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ReactNode } from "react";

interface DropdownProps {
  children: ReactNode;
}

export const Dropdown = ({ children }: DropdownProps) => {
  return <DropdownMenu.Root>{children}</DropdownMenu.Root>;
};
