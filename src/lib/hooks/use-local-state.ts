"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalState<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      if (state === null || state === undefined || state === "") {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch { /* quota exceeded — ignore */ }
  }, [key, state]);

  const set = useCallback((val: T | ((prev: T) => T)) => {
    setState(val as Parameters<typeof setState>[0]);
  }, []);

  return [state, set];
}
