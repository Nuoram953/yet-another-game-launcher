"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavPlatform } from "./sidebar/nav-platforms";
import { NavStatus } from "./sidebar/nav-status";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  NavPlatform: [
    {
      title: "Platforms",
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = await window.database.getStatus();
        console.log(status)
        data.NavStatus[0].items = status.map((gameStatus) => ({
          title: t(gameStatus.name),
          url: gameStatus.name,
          count: gameStatus.count
        }));
      } catch (error) {
        console.error("Error fetching picture path:", error);
      }
    };

    fetchData();
  }, [data]);

  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavPlatform items={data.NavPlatform} />
        <NavStatus items={data.NavStatus} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
