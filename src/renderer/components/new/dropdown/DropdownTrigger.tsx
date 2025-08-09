import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ReactNode } from "react";

interface DropdownTriggerProps {
  children: ReactNode;
}

export const DropdownTrigger = ({ children }: DropdownTriggerProps) => {
  return (
    <DropdownMenu.Trigger className="cursor-pointer" asChild>
      {children}
    </DropdownMenu.Trigger>
  );
};
