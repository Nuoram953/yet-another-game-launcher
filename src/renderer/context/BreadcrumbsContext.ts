import { Breadcrumb } from "@render//types";
import { createContext, useContext, useState, ReactNode, FC } from "react";
import { useNavigate } from "react-router-dom";

export interface BreadcrumbContextType {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (newBreadcrumbs: Breadcrumb[]) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const useBreadcrumbsContext = () => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("context not found");
  }
  return context;
};
