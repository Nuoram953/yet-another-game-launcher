import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useElectronStore } from "@render/store/ElectronState";
import { DataRoute } from "@common/constant";

export const GlobalEventHandler = () => {
  const queryClient = useQueryClient();
  const events = useElectronStore((state) => state.events);

  useEffect(() => {
    Object.entries(events).forEach(([eventName, payload]) => {
      if (!payload) return;

      switch (eventName) {
        case DataRoute.REQUEST_GAME:
          {
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey.some((keyPart) => keyPart === payload.data.id),
            });
          }
          break;

        default:
          console.warn(`Unhandled event: ${eventName}`, payload);
          break;
      }
    });
  }, [events, queryClient]);

  return null;
};
