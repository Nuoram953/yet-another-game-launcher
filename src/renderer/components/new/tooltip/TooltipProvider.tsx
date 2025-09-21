"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

export const TooltipProvider = ({ children }: { children: ReactNode }) => {
  return <Tooltip.Provider delayDuration={200}>{children}</Tooltip.Provider>;
};
