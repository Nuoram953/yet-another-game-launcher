import { TSRBreadCrumbs } from "@render/components/TSRBreadcrumbs";
import { Sidebar } from "../sidebar";
import { useTSRBreadCrumbs } from "@render/hooks/useTSRBreadCrumbs";
import { ArrowLeft } from "lucide-react";
import Button from "@render/components/new/button/Button";
import { useNavigate } from "@tanstack/react-router";

export const Header = () => {
  const navigate = useNavigate();
  const { breadcrumb_routes } = useTSRBreadCrumbs();

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-[50px] px-4 backdrop-blur-sm">
      <div className="flex h-full items-center gap-4 text-white">
        {breadcrumb_routes.length > 1 && (
          <Button leadingIcon={<ArrowLeft />} intent="tertiary" onClick={() => navigate({ to: "/" })} />
        )}
        <Sidebar />
        <TSRBreadCrumbs />
      </div>
    </div>
  );
};
