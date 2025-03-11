"use client";

import {
  ChevronRight,
  ExternalLink,
  Globe,
  SquareTerminal,
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
import { IconButton } from "../button/IconButton";
import { useTranslation } from "react-i18next";
import { Storefront } from "@prisma/client";

export function NavStorefront({ items }: { items: Storefront[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation("common", { keyPrefix: "storefront" });
  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible
          key={"storefront"}
          asChild
          defaultOpen={true}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={"storefront"}>
                <SquareTerminal />
                <span>Store</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {items?.map((storefront) => (
                  <SidebarMenuSubItem key={storefront.name}>
                    <SidebarMenuSubButton asChild>
                      <div className="flex flex-row">
                        <a href={storefront.url}>
                          <span>{t(storefront.name)}</span>
                        </a>
                        <div className="flex flex-row gap-1">
                          {storefront.hasLauncher && (
                            <IconButton
                              icon={ExternalLink}
                              onClick={(e) => {
                                window.store.launch(storefront.name);
                              }}
                            />
                          )}
                          <IconButton
                            icon={Globe}
                            onClick={(e) => {
                              navigate("/web", {
                                state: {
                                  url: storefront.url,
                                },
                              });
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
      </SidebarMenu>
    </SidebarGroup>
  );
}
