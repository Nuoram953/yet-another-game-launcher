"use client";

import * as React from "react";
import { Activity, HardDriveDownload, House, Medal, Settings } from "lucide-react";

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
  useSidebar,
} from "@render/components/ui/sidebar";
import { NavStorefront } from "./nav-storefront";
import { NavStatus } from "./nav-status";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGames } from "@render/context/DatabaseContext";
import { Badge } from "../ui/badge";
import { GameStatus, Storefront } from "@prisma/client";
import { CookieType, getCookie, setCookie } from "@render/utils/cookieUtil";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();
  const { games, downloading } = useGames();
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [status, setStatus] = useState<(GameStatus & { count?: number }) | undefined>(undefined);

  const hasMounted = useRef(false);

  useEffect(() => {
    const sidebarState = getCookie(CookieType.SIDEBAR_COLLAPSED, "boolean") as boolean;
    setOpen(sidebarState);
    console.log(sidebarState);
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (typeof open !== "boolean") {
      return;
    }

    setCookie(CookieType.SIDEBAR_COLLAPSED, open);
  }, [open]);

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

            <SidebarMenuItem key={"Ranking"}>
              <SidebarMenuButton asChild>
                <a onClick={() => navigate("/ranking")}>
                  <Medal />
                  <span>Ranking</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem key={"Setting"}>
              <SidebarMenuButton asChild>
                <a onClick={() => navigate("/setting")}>
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
