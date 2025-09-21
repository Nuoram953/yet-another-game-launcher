import { debounce } from "lodash";
import { useMemo } from "react";
import { getGames } from "../api/get-games";

const useDebouncedGames = () => {
  // Keep a ref to the latest resolve function
  let resolveRef: ((value: any[]) => void) | null = null;

  // Debounced fetch function
  const debouncedFetch = useMemo(
    () =>
      debounce(async (inputValue: string) => {
        try {
          const results = await getGames({ search: inputValue });
          const options = results.map((g) => ({
            value: g.id,
            label: g.name,
            released: g.first_release_date,
            image: g.cover.url,
          }));
          resolveRef?.(options); // resolve the promise
        } catch (err) {
          resolveRef?.([]); // or reject if you prefer
        }
      }, 500),
    [],
  );

  // Function called by react-select
  const promiseOptions = (inputValue: string) =>
    new Promise<any[]>((resolve) => {
      resolveRef = resolve; // store resolve for later
      debouncedFetch(inputValue); // call debounced fetch
    });

  return promiseOptions;
};

export default useDebouncedGames;
