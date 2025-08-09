"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import { cn } from "@render/lib/utils";

export const TooltipContent = ({
  children,
  side = "top",
  className,
}: {
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) => (
  <TooltipPrimitive.Content
    side={side}
    className={cn("z-50 rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-md", className)}
  >
    {children}
    <TooltipPrimitive.Arrow className="fill-gray-900" />
  </TooltipPrimitive.Content>
);
