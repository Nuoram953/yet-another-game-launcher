"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

export const TooltipTrigger = ({ children }: { children: ReactNode }) => {
  return <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>;
};
