import React from "react";
import { ButtonBase, ButtonBaseProps } from "./ButtonBase";
import { Tooltip } from "../tooltip";

export interface ButtonProps extends ButtonBaseProps {
  icon?: React.ReactNode;
}

const ButtonIcon = React.forwardRef<HTMLButtonElement, ButtonProps>(({ text, icon, size, ...props }, ref) => {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <ButtonBase ref={ref} text="" size={size ?? "sm"} leading={icon} {...props} />
      </Tooltip.Trigger>
      <Tooltip.Content>{text}</Tooltip.Content>
    </Tooltip>
  );
});

ButtonIcon.displayName = "ButtonIcon";

export default ButtonIcon;
