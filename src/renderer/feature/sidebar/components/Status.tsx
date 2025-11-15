import { Divider } from "@render/components/new/divider/Divider";
import { ChartNoAxesColumn, Store } from "lucide-react";
import { SidebarNavigateItem } from "./NavigateItem";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useTranslation } from "react-i18next";
import { SidebarStatusData } from "@common/types";
import useSidebarStore from "../store/sidebarStore";
import { useGames } from "@render/context/DatabaseContext";

interface SidebarStatusProps {
  status: SidebarStatusData[];
}

export const SidebarStatus = ({ status }: SidebarStatusProps) => {
  const { t } = useTranslation();
  const { updateFilters } = useGames();
  const setOpen = useSidebarStore((s) => s.setOpen);

  const handleStatus = (id: number) => {
    setOpen(false);
    updateFilters({
      status: [{ label: String(id), value: String(id) }],
    });
  };

  return (
    <div className="my-4 flex flex-col">
      <div className="flex flex-row gap-3 rounded px-2 text-normal">
        <ChartNoAxesColumn />
        <h2 className="text-lg">Status</h2>
      </div>
      <Divider />
      <div className="ml-3">
        {status.map((status) => (
          <SidebarNavigateItem
            key={status.id}
            handleNavigate={() => handleStatus(status.id)}
            label={t(status.name, { ns: LOCALE_NAMESPACE.GAME_STATUS })}
            path={`/storefront/${status.id}`}
            count={status.count}
          />
        ))}
      </div>
    </div>
  );
};
