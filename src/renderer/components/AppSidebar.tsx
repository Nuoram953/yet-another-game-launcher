"use client";

import * as React from "react";
import {
  Activity,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  HardDriveDownload,
  House,
  Settings,
  SquareTerminal,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavPlatform } from "./sidebar/nav-platforms";
import { NavStatus } from "./sidebar/nav-status";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGames } from "@/context/DatabaseContext";
import { Badge } from "./ui/badge";

const data = {
  NavPlatform: [
    {
      title: "Store",
      url: "/steam",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Steam",
          url: "/steam",
        },
      ],
    },
  ],

  NavStatus: [
    {
      title: "Status",
      url: "/steam",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Steam",
          url: "/steam",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation("GameStatus");
  const navigate = useNavigate();
  const { games, downloading } = useGames();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = await window.library.getCountForAllStatus();
        data.NavStatus[0].items = status.map((gameStatus) => ({
          id: gameStatus.id,
          title: t(gameStatus.name),
          url: gameStatus.name,
          count: gameStatus.count,
        }));
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
                  <a className="flex flex-row gap-2" onClick={() => navigate("/download")}>
                    <HardDriveDownload />
                    <span className="flex content-center items-center">Downloads</span>
                  </a>
                  {downloading.length > 0 && <Badge>{downloading.length}</Badge>}
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
        <NavPlatform items={data.NavPlatform} />
        <NavStatus items={data.NavStatus} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
