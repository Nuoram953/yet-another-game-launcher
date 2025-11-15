import { useState, useCallback, useEffect } from "react";

export function useRotatingIndex(max: number, initial: number = 0) {
  const [index, setIndex] = useState(initial);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % max);
  }, [max]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + max) % max);
  }, [max]);

  const set = useCallback(
    (value: number) => {
      setIndex(((value % max) + max) % max);
    },
    [max],
  );

  useEffect(() => {
    const id = setInterval(() => {
      next();
    }, 10000);

    return () => clearInterval(id);
  }, []);

  return { index, next, prev, set };
}
