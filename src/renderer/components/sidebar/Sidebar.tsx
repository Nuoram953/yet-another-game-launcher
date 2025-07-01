import React, { useEffect } from "react";
import { Sheet, SheetClose, SheetContent, SheetFooter } from "@render/components/ui/sheet";
import { Activity, ChartNoAxesColumn, HardDriveDownload, Home, Medal, Settings, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useNavigate } from "react-router-dom";
import Divider from "../Divider";
import { useGames } from "@render/context/DatabaseContext";
import { getLibrary } from "@render/api/electron";
import { SidebarData } from "@common/types";
import { Badge } from "../ui/badge";
import { AppConfig } from "@common/interface";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { games, updateFilters } = useGames();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [sidebarData, setSidebarData] = React.useState<SidebarData>();
  const [config, setConfig] = React.useState<AppConfig>(null);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      setSidebarData(await getLibrary().getSidebar());
      const config = await window.config.getAll();
      console.log(config);
      setConfig(config);
    };

    fetchData();
    setLoading(false);
  }, [games]);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleStorefront = (id: number) => {
    setOpen(false);
    updateFilters({
      storefronts: [{ label: String(id), value: String(id) }],
    });
  };

  const handleStatus = (id: number) => {
    setOpen(false);
    updateFilters({
      status: [{ label: String(id), value: String(id) }],
    });
  };

  if (loading || _.isNil(sidebarData) || _.isNil(config)) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Sheet key={"button"} open={open} onOpenChange={setOpen}>
        <SheetContent side={"left"} color="#1e293b">
          <div className="flex flex-col gap-2">
            <SidebarNavigateItem handleNavigate={handleNavigate} icon={<Home />} label={"Home"} path={"/"} />
            <SidebarNavigateItem
              handleNavigate={handleNavigate}
              icon={<HardDriveDownload />}
              label={"Downloads"}
              path={"/download"}
              config={config}
            />
            <SidebarNavigateItem
              handleNavigate={handleNavigate}
              icon={<Activity />}
              label={"Activiy"}
              path={"/activity"}
              config={config}
            />
            <SidebarNavigateItem
              handleNavigate={handleNavigate}
              icon={<Medal />}
              label={"Rankings"}
              path={"/ranking"}
              config={config}
            />
            <SidebarNavigateItem
              handleNavigate={handleNavigate}
              icon={<Settings />}
              label={"Settings"}
              path={"/setting"}
              config={config}
            />
            <div className="my-4 flex flex-col">
              <div className="flex flex-row gap-3 rounded p-2">
                <Store />
                <h2 className="text-lg">Storefronts</h2>
              </div>
              <Divider />
              <div className="ml-3">
                {sidebarData.storefronts.map((storefront) => (
                  <SidebarNavigateItem
                    key={storefront.id}
                    handleNavigate={() => handleStorefront(storefront.id)}
                    label={t(`storefront.${storefront.name}`, { ns: LOCALE_NAMESPACE.COMMON })}
                    path={`/storefront/${storefront.id}`}
                    count={storefront.count}
                    config={config}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-3 rounded p-2">
                <ChartNoAxesColumn />
                <h2 className="text-lg">Status</h2>
              </div>
              <Divider />
              <div className="ml-3">
                {sidebarData.status.map((status) => (
                  <SidebarNavigateItem
                    key={status.id}
                    handleNavigate={() => handleStatus(status.id)}
                    label={t(status.name, { ns: LOCALE_NAMESPACE.GAME_STATUS })}
                    path={`/storefront/${status.id}`}
                    count={status.count}
                    config={config}
                  />
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="mt-4">
            <SheetClose asChild></SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

interface SidebarNavigateItemProps {
  icon?: React.ReactNode;
  label: string;
  path: string;
  handleNavigate: (path: string) => void;
  count?: number;
  config?: AppConfig;
}

const SidebarNavigateItem = ({ icon, label, path, handleNavigate, count, config }: SidebarNavigateItemProps) => {
  return (
    <a
      className="flex flex-row justify-between gap-3 rounded p-2 hover:bg-gray-400/50"
      onClick={() => handleNavigate(path)}
    >
      <div className="flex flex-row gap-2">
        {icon}
        <span>{label}</span>
      </div>

      {!_.isNil(count) && config.sidebar.display.showGameCount && (
        <div>
          <Badge>{count}</Badge>
        </div>
      )}
    </a>
  );
};
