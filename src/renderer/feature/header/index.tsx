import { TSRBreadCrumbs } from "@render/components/TSRBreadcrumbs";
import { Sidebar } from "../sidebar";
import { useTSRBreadCrumbs } from "@render/hooks/useTSRBreadCrumbs";
import { ArrowLeft } from "lucide-react";
import Button from "@render/components/new/button/Button";
import { useRouter } from "@tanstack/react-router";

export const Header = () => {
  const router = useRouter();
  const { breadcrumb_routes } = useTSRBreadCrumbs();

  const handleBackClick = () => {
    router.history.back();
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-[35px] bg-slate-900 px-2 shadow-md backdrop-blur-sm">
      <div className="flex h-full items-center text-white">
        <Sidebar />
        {breadcrumb_routes.length > 1 && (
          <Button
            leadingIcon={<ArrowLeft className="size-[20px]" />}
            size="xs"
            intent="tertiary"
            onClick={handleBackClick}
          />
        )}
        <TSRBreadCrumbs />
      </div>
    </div>
  );
};
