"use client";

import * as React from "react";
import {
  Activity,
  HardDriveDownload,
  House,
  Medal,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavStorefront } from "./sidebar/nav-storefront";
import { NavStatus } from "./sidebar/nav-status";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGames } from "@/context/DatabaseContext";
import { Badge } from "./ui/badge";
import { GameStatus, Storefront } from "@prisma/client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { games, downloading } = useGames();
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [status, setStatus] = useState<(GameStatus & { count?: number }) | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = await window.library.getCountForAllStatus();
        // setStatus(status);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }

      try {
        const storefronts = await window.library.getStorefronts();
        setStorefronts(storefronts);
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, [games]);

  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem key={"Home"}>
              <SidebarMenuButton asChild>
                <a onClick={() => navigate("/")}>
                  <House />
                  <span>Home</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem key={"Home"} className="flex justify-between">
              <SidebarMenuButton asChild>
                <div className="flex justify-between">
                  <a
                    className="flex flex-row gap-2"
                    onClick={() => navigate("/download")}
                  >
                    <HardDriveDownload />
                    <span className="flex content-center items-center">
                      Downloads
                    </span>
                  </a>
                  {downloading.length > 0 && (
                    <Badge>{downloading.length}</Badge>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem key={"Home"}>
              <SidebarMenuButton asChild>
                <a onClick={() => navigate("/activity")}>
                  <Activity />
                  <span>Activity</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem key={"Ranking"}>
              <SidebarMenuButton asChild>
                <a onClick={() => navigate("/ranking")}>
                  <Medal />
                  <span>Ranking</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem key={"Settings"}>
              <SidebarMenuButton asChild>
                <a onClick={() => navigate("/settings")}>
                  <Settings />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator className="mt-8" />
        </SidebarGroup>
        <NavStorefront items={storefronts} />
        {/* <NavStatus items={status} /> */}
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
