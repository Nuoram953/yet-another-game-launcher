import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { GetMediaByType } from "@main/media/media.schema";

export const getMedia = (data: GetMediaByType) => {
  return window.media.getMediaByType(data);
};

export const getMediaQueryOptions = (data: GetMediaByType) => {
  return queryOptions({
    queryKey: ["media", data],
    queryFn: () => getMedia(data),
  });
};

type UseMediaOptions = {
  data: GetMediaByType;
  queryConfig?: QueryConfig<typeof getMediaQueryOptions>;
};

export const useMedia = ({ data, queryConfig }: UseMediaOptions) => {
  return useQuery({
    ...getMediaQueryOptions(data),
    ...queryConfig,
  });
};
