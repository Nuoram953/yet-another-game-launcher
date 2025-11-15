import { Divider } from "@render/components/new/divider/Divider";
import { Store } from "lucide-react";
import { SidebarNavigateItem } from "./NavigateItem";
import { LOCALE_NAMESPACE } from "@common/constant";
import { useTranslation } from "react-i18next";
import { SidebarStorefrontsData } from "@common/types";
import useSidebarStore from "../store/sidebarStore";
import { useGames } from "@render/context/DatabaseContext";

interface SidebarStorefrontsProps {
  storefronts: SidebarStorefrontsData[];
}

export const SidebarStorefronts = ({ storefronts }: SidebarStorefrontsProps) => {
  const { t } = useTranslation();
  const { updateFilters } = useGames();
  const setOpen = useSidebarStore((s) => s.setOpen);

  const handleStorefront = (id: number) => {
    setOpen(false);
    updateFilters({
      storefronts: [{ label: String(id), value: String(id) }],
    });
  };

  return (
    <div className="my-4 flex flex-col">
      <div className="flex flex-row gap-3 rounded px-2 text-normal">
        <Store />
        <h2 className="text-lg">Storefronts</h2>
      </div>
      <Divider spacing="sm" />
      <div className="ml-3">
        {storefronts.map((storefront) => (
          <SidebarNavigateItem
            key={storefront.id}
            handleNavigate={() => handleStorefront(storefront.id)}
            label={t(`storefront.${storefront.name}`, { ns: LOCALE_NAMESPACE.COMMON })}
            path={`/storefront/${storefront.id}`}
            count={storefront.count}
          />
        ))}
      </div>
    </div>
  );
};
