import { Divider } from "@render/components/new/divider/Divider";
import { ChartNoAxesColumn, Store } from "lucide-react";
import { SidebarNavigateItem } from "./NavigateItem";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useTranslation } from "react-i18next";
import { SidebarStatusData } from "@common/types";
import useSidebarStore from "../store/sidebarStore";
import { useGames } from "@render/context/DatabaseContext";

interface SidebarStatusProps {
  platforms: SidebarStatusData[];
}

export const SidebarPlatforms = ({ platforms }: SidebarStatusProps) => {
  const { t } = useTranslation();
  const { updateFilters } = useGames();
  const setOpen = useSidebarStore((s) => s.setOpen);

  const handlePlatform = (id: number) => {
    setOpen(false);
  };

  return (
    <div className="my-4 flex flex-col">
      <div className="flex flex-row gap-3 rounded px-2 text-normal">
        <ChartNoAxesColumn />
        <h2 className="text-lg">Platform</h2>
      </div>
      <Divider />
      <div className="ml-3">
        {platforms.map((platform) => (
          <SidebarNavigateItem
            key={platform.id}
            handleNavigate={() => handlePlatform(platform.id)}
            label={t(platform.name, { ns: LOCALE_NAMESPACE.GAME_STATUS })}
            path={`/storefront/${platform.id}`}
            count={platform.count}
          />
        ))}
      </div>
    </div>
  );
};
