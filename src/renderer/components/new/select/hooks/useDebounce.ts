import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook for debouncing values
 * Useful for search inputs to avoid excessive API calls
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debounced async operations
 * Returns both the debounced value and loading state
 */
export function useDebouncedCallback<T extends any[]>(callback: (...args: T) => Promise<any>, delay: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const debouncedCallback = useCallback(
    (...args: T) => {
      setIsLoading(true);
      setError(null);

      const handler = setTimeout(async () => {
        try {
          const result = await callback(...args);
          setData(result);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setIsLoading(false);
        }
      }, delay);

      return () => clearTimeout(handler);
    },
    [callback, delay],
  );

  return {
    debouncedCallback,
    isLoading,
    data,
    error,
    setData,
    setError,
  };
}
