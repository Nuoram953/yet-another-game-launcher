import { useCallback, useEffect, useRef, useState } from "react";
import { BaseSelectOption } from "../types";

export interface AsyncOptionsConfig<T = BaseSelectOption> {
  loadOptions: (inputValue: string) => Promise<T[]>;
  defaultOptions?: boolean | T[];
  cacheOptions?: boolean;
  debounceTime?: number;
  minInputLength?: number;
}

export interface AsyncOptionsResult<T = BaseSelectOption> {
  options: T[];
  isLoading: boolean;
  error: string | null;
  loadOptions: (inputValue: string) => Promise<T[]>;
  clearCache: () => void;
}

/**
 * Custom hook for managing async option loading with caching and debouncing
 */
export function useAsyncOptions<T extends BaseSelectOption = BaseSelectOption>({
  loadOptions,
  defaultOptions = false,
  cacheOptions = true,
  debounceTime = 300,
  minInputLength = 1,
}: AsyncOptionsConfig<T>): AsyncOptionsResult<T> {
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache for storing loaded options
  const cacheRef = useRef<Map<string, T[]>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout>();
  const requestCounterRef = useRef(0);

  // Load default options on mount
  useEffect(() => {
    if (Array.isArray(defaultOptions)) {
      setOptions(defaultOptions);
    } else if (defaultOptions === true) {
      handleLoadOptions("");
    }
  }, []);

  const handleLoadOptions = useCallback(
    async (inputValue: string): Promise<T[]> => {
      const trimmedInput = inputValue.trim();

      // Check minimum input length
      if (trimmedInput.length < minInputLength && trimmedInput.length > 0) {
        return [];
      }

      // Check cache first
      if (cacheOptions && cacheRef.current.has(trimmedInput)) {
        const cachedOptions = cacheRef.current.get(trimmedInput)!;
        setOptions(cachedOptions);
        return cachedOptions;
      }

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      return new Promise((resolve) => {
        debounceRef.current = setTimeout(async () => {
          const currentRequestId = ++requestCounterRef.current;

          try {
            setIsLoading(true);
            setError(null);

            const newOptions = await loadOptions(trimmedInput);

            // Only update if this is still the latest request
            if (currentRequestId === requestCounterRef.current) {
              setOptions(newOptions);

              // Cache the results
              if (cacheOptions) {
                cacheRef.current.set(trimmedInput, newOptions);
              }

              resolve(newOptions);
            }
          } catch (err) {
            if (currentRequestId === requestCounterRef.current) {
              const errorMessage = err instanceof Error ? err.message : "Failed to load options";
              setError(errorMessage);
              setOptions([]);
              resolve([]);
            }
          } finally {
            if (currentRequestId === requestCounterRef.current) {
              setIsLoading(false);
            }
          }
        }, debounceTime);
      });
    },
    [loadOptions, cacheOptions, debounceTime, minInputLength],
  );

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    options,
    isLoading,
    error,
    loadOptions: handleLoadOptions,
    clearCache,
  };
}
