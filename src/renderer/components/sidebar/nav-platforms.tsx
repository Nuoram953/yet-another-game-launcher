"use client";

import {
  ChevronRight,
  ExternalLink,
  Globe,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import React from "react";
import { useNavigate } from "react-router-dom";

//https://wireframe.cc/nFc2yR

export function NavPlatform({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const navigate = useNavigate();
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon size={20} />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <div className="flex flex-row">
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                          <div className="flex flex-row gap-1">
                            <ExternalLink
                              className="hover:bg-gray-600 hover:rounded-md"
                              size={18}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.store.launch(subItem.title);
                              }}
                            />
                            <Globe
                              className="hover:bg-gray-600 hover:rounded-md"
                              size={18}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/web/steam");
                              }}
                            />
                          </div>
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
