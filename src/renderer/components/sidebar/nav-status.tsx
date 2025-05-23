"use client";

import { ChevronRight, SquareTerminal, type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@render//components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@render//components/ui/sidebar";
import React from "react";
import { Badge } from "../ui/badge";
import { useGames } from "@render//context/DatabaseContext";

export function NavStatus({
  items,
}: {
  items: {
    id: number;
    name: string;
    count?: number;
  }[];
}) {
  const { updateFilters } = useGames();
  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible key={"status"} asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="status">
                <SquareTerminal />
                <span>Status</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.name} className="flex justify-between">
                    <SidebarMenuSubButton asChild>
                      <>
                        <div
                          onClick={() => {
                            updateFilters({ gameStatusId: subItem.id });
                          }}
                        >
                          <span>{subItem.name}</span>
                        </div>
                        {subItem.count && <Badge>{subItem.count}</Badge>}
                      </>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
