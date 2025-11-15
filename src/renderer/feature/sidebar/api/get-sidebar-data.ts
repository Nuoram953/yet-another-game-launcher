import { useQuery, queryOptions } from "@tanstack/react-query";
import { QueryConfig } from "@render/lib/react-query";
import { getLibrary } from "@render/api/electron";
import { SidebarData } from "@common/types";

export const getSidebar = (): Promise<SidebarData> => {
  return getLibrary().getSidebar();
};

export const getSidebarQueryOptions = () => {
  return queryOptions({
    queryKey: ["sidebar"],
    queryFn: () => getSidebar(),
  });
};

type UseSidebarOptions = {
  queryConfig?: QueryConfig<typeof getSidebarQueryOptions>;
};

export const useSidebar = ({ queryConfig }: UseSidebarOptions) => {
  return useQuery({
    ...getSidebarQueryOptions(),
    ...queryConfig,
  });
};
