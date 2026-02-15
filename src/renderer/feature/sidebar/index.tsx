import { useConfig } from "@render/components/ConfigProvider";
import { useSidebar } from "./api/get-sidebar-data";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTrigger } from "@render/components/ui/sheet";
import { SidebarPages } from "./components/Pages";
import useSidebarStore from "./store/sidebarStore";
import Button from "@render/components/new/button/Button";
import { SidebarIcon, X } from "lucide-react";
import { SidebarStorefronts } from "./components/Storefronts";
import { LoadingCenter } from "@render/components/new/loading/Loading";
import { SidebarStatus } from "./components/Status";
import { SidebarPlatforms } from "./components/Platform";

export const Sidebar = () => {
  const sidebarQuery = useSidebar({});
  const { renderKey } = useConfig();

  const open = useSidebarStore((s) => s.open);
  const setOpen = useSidebarStore((s) => s.setOpen);

  if (sidebarQuery.isFetching) {
    return <LoadingCenter />;
  }

  return (
    <Sheet key={renderKey} open={open} onOpenChange={(v) => setOpen(v)}>
      <SheetTrigger className="z-50 text-normal">
        <Button
          leadingIcon={<SidebarIcon className="size-[20px]" />}
          intent="tertiary"
          size="xs"
          onClick={(e) => {
            setOpen(!open);
          }}
        />
      </SheetTrigger>
      <SheetContent side={"left"} className="overflow-y-auto bg-background">
        <div className="mt-6 flex flex-col gap-2">
          <SidebarPages />
          <SidebarStorefronts storefronts={sidebarQuery.data.storefronts} />
          <SidebarStatus status={sidebarQuery.data.status} />
          <SidebarPlatforms platforms={sidebarQuery.data.platforms} />
        </div>

        <SheetFooter className="mt-4">
          <SheetClose asChild className="absolute right-4 top-4 p-2">
            <Button
              leadingIcon={<X />}
              intent="tertiary"
              onClick={(e) => {
                setOpen(!open);
              }}
            />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
