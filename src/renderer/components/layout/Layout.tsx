import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";
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

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbsContext();
  const navigate = useNavigate();

  const handleClickBreadcrumbs = (path: string) => {
    const index = breadcrumbs.findIndex((item) => item.path === path);
    if (index != breadcrumbs.length - 1) {
      setBreadcrumbs(breadcrumbs.splice(0, index));
    }
    navigate(path, { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex min-h-0 flex-1 flex-col">
          <main className="flex min-h-0 flex-1 flex-col bg-gray-900">
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

            <div className="">{children}</div>
          </main>
        </SidebarInset>

      </div>
    </SidebarProvider>
  );
}
