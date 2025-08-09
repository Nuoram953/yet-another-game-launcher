import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ReactNode } from "react";

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const DropdownItem = ({ children, onClick, disabled }: DropdownItemProps) => {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer select-none px-3 py-2 text-start text-sm hover:bg-neutral-700"
    >
      {children}
    </DropdownMenu.Item>
  );
};
