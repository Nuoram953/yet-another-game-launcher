"use client";

import * as React from "react";
import {
    Activity,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  HardDriveDownload,
  House,
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
  const navigate = useNavigate()
  const {games} = useGames()

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
                <a onClick={()=>navigate("/")}>
                  <House />
                  <span>Home</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem key={"Home"}>
              <SidebarMenuButton asChild>
                <a onClick={()=>navigate("/downloads")}>
                  <HardDriveDownload />
                  <span>Downloads</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem key={"Home"}>
              <SidebarMenuButton asChild>
                <a onClick={()=>navigate("/activity")}>
                  <Activity />
                  <span>Activity</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator className="mt-8"/>
        </SidebarGroup>
        <NavPlatform items={data.NavPlatform} />
        <NavStatus items={data.NavStatus} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
