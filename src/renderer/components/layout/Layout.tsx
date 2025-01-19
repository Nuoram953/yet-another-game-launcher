import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import { AppSidebar } from "../AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { useBreadcrumbsContext } from "@/context/BreadcrumbsContext";
import { useNavigate } from "react-router-dom";
import NotificationList from "../notification/NotificationList";
import { RunningHeader } from "../runningHeader";
import { useGames } from "@/context/DatabaseContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const {gameRunning} = useGames()
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbsContext();
  const navigate = useNavigate();


  const handleClickBreadcrumbs = (path: string) => {
    const index = breadcrumbs.findIndex((item) => item.path === path);
    setBreadcrumbs(breadcrumbs.splice(0, index));
    navigate(path);
  };

  return (
    <SidebarProvider>
      <div className="h-screen w-screen flex overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 flex flex-col min-h-0 bg-slate-900">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="dark" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((breadcrumb, index) => (
                      <React.Fragment key={breadcrumb.path}>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink
                            onClick={() =>
                              handleClickBreadcrumbs(breadcrumb.path)
                            }
                          >
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index !== breadcrumbs.length - 1 && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>

            {/* Game Running Alert */}
            {gameRunning.isRunning && <RunningHeader game={gameRunning.game} />}

            <div className="">{children}</div>
          </main>
        </SidebarInset>

        <NotificationList />
      </div>
    </SidebarProvider>
  );
}
