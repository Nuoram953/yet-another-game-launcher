import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

export const Tooltip = ({ children }: { children: ReactNode }) => {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
