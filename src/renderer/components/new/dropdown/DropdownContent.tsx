import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ReactNode } from "react";

interface DropdownContentProps {
  children: ReactNode;
}

export const DropdownContent = ({ children }: DropdownContentProps) => {
  return <DropdownMenu.Content className="bg-neutral-800 p-2 text-white shadow-md">{children}</DropdownMenu.Content>;
};
