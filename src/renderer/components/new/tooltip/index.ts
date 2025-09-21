"use client";

import { Tooltip as TooltipRoot } from "./Tooltip";
import { TooltipTrigger } from "./TooltipTrigger";
import { TooltipContent } from "./TooltipContent";

type TooltipComponent = typeof TooltipRoot & {
  Trigger: typeof TooltipTrigger;
  Content: typeof TooltipContent;
};

const Tooltip = TooltipRoot as TooltipComponent;
Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;

export { Tooltip };
