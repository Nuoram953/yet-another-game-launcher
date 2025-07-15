import React, { useEffect, useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import { useBreadcrumbsContext } from "@render//context/BreadcrumbsContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../button/Button";
import { House, SidebarIcon } from "lucide-react";
import { Sidebar } from "../sidebar/Sidebar";
import { CookieType, getCookie, setCookie } from "@render/utils/cookieUtil";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbsContext();
  const [open, setOpen] = useState<boolean>(Boolean(getCookie(CookieType.IS_SIDEBAR_OPEN, "boolean")) || false);
  const navigate = useNavigate();

  const handleClickBreadcrumbs = (path: string) => {
    const index = breadcrumbs.findIndex((item) => item.path === path);
    if (index != breadcrumbs.length - 1) {
      setBreadcrumbs(breadcrumbs.splice(0, index));
    }
    navigate(path, { replace: true });
  };

  useEffect(() => {
    setCookie(CookieType.IS_SIDEBAR_OPEN, open);
  }, [open]);

  return (
    <div className="flex h-full w-screen overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} />
      <main className="flex min-h-0 flex-1 flex-col bg-gradient-to-br from-gray-900 to-gray-800">
        <header className="absolute z-50 flex h-16 w-full shrink-0 items-center gap-2 text-design-text-normal">
          <div className="flex items-center gap-2 px-4">
            <Button
              icon={SidebarIcon}
              intent="icon"
              size="fit"
              onClick={() => {
                setOpen(!open);
              }}
            />
            {breadcrumbs.length > 0 && <Button icon={House} intent="icon" size="fit" onClick={() => navigate("/")} />}
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={breadcrumb.path}>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink onClick={() => handleClickBreadcrumbs(breadcrumb.path)}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index !== breadcrumbs.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="">{children}</div>
      </main>
    </div>
  );
}
