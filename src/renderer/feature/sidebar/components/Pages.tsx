import { Gift, HardDriveDownload, Home, Medal, Settings } from "lucide-react";
import { SidebarNavigateItem } from "./NavigateItem";
import { useNavigate } from "@tanstack/react-router";
import useSidebarStore from "../store/sidebarStore";

export const SidebarPages = () => {
  const navigate = useNavigate();
  const setOpen = useSidebarStore((s) => s.setOpen);

  return (
    <div className="text-normal">
      <SidebarNavigateItem
        handleNavigate={() => {
          navigate({ to: "/" });
          setOpen(false);
        }}
        icon={<Home />}
        label={"Home"}
        path={"/"}
      />
      <SidebarNavigateItem handleNavigate={""} icon={<HardDriveDownload />} label={"Downloads"} path={"/download"} />
      <SidebarNavigateItem
        icon={<Medal />}
        label={"Rankings"}
        path={"/ranking"}
        handleNavigate={() => {
          navigate({ to: "/ranking" });
          setOpen(false);
        }}
      />
      <SidebarNavigateItem
        icon={<Gift />}
        label={"Wishlist"}
        path={"/wishlist"}
        handleNavigate={() => {
          navigate({ to: "/wishlist" });
          setOpen(false);
        }}
      />
      <SidebarNavigateItem handleNavigate={""} icon={<Settings />} label={"Settings"} path={"/setting"} />
    </div>
  );
};
