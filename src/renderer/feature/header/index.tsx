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
    <div className="absolute z-10 p-2">
      <div className="flex items-center justify-center text-white">
        {breadcrumb_routes.length > 1 && (
          <Button leadingIcon={<ArrowLeft onClick={() => navigate({ to: "/" })} />} intent={"tertiary"} />
        )}
        <Sidebar />
        <TSRBreadCrumbs />
      </div>
    </div>
  );
};
