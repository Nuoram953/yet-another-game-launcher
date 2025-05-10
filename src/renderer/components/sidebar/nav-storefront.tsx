"use client";

import { ChevronRight, ExternalLink, Globe, SquareTerminal } from "lucide-react";

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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Storefront } from "@prisma/client";
import { Button } from "../button/Button";

export function NavStorefront({ items }: { items: Storefront[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation("common", { keyPrefix: "storefront" });
  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible key={"storefront"} asChild defaultOpen={true} className="group/collapsible">
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
                        <a href={storefront.url!}>
                          <span>{t(storefront.name)}</span>
                        </a>
                        <div className="flex flex-row gap-1">
                          <Button
                            icon={ExternalLink}
                            size={"fit"}
                            intent={"icon"}
                            disabled={!storefront.hasLauncher}
                            onClick={() => {
                              window.store.launch(storefront.name);
                            }}
                          />
                          <Button
                            icon={Globe}
                            size={"fit"}
                            intent={"icon"}
                            onClick={() => {
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
