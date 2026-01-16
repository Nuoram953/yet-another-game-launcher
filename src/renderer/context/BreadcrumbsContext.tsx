import { createContext, useContext } from "react";
import { useMatches } from "react-router-dom";
import { Breadcrumb } from "@render/types";

const BreadcrumbContext = createContext<{ breadcrumbs: Breadcrumb[] } | undefined>(undefined);

export const BreadcrumbProvider = ({ children }) => {
  const matches = useMatches();

  const breadcrumbs = matches.filter((m) => m.handle?.breadcrumb).map((m) => m.handle.breadcrumb(m.params));

  return <BreadcrumbContext.Provider value={{ breadcrumbs }}>{children}</BreadcrumbContext.Provider>;
};

export const useBreadcrumbs = () => {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("BreadcrumbContext missing");
  return ctx;
};
