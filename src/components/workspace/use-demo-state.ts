"use client";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
export function useDemoState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [stored, setStored] = useState<{
    key: string;
    data: T;
    ready: boolean;
  }>({ key, data: initial, ready: false });
  useEffect(() => {
    let data = initial;
    try {
      const value = localStorage.getItem(key);
      if (value) data = JSON.parse(value);
    } catch {}
    setStored({ key, data, ready: true });
    const reset = () => setStored({ key, data: initial, ready: true });
    window.addEventListener("cloudlens-demo-reset", reset);
    return () => window.removeEventListener("cloudlens-demo-reset", reset);
  }, [key]); // Seed changes are not user edits.
  useEffect(() => {
    if (stored.ready && stored.key === key)
      try {
        localStorage.setItem(key, JSON.stringify(stored.data));
      } catch {}
  }, [stored, key]);
  const set: Dispatch<SetStateAction<T>> = (update) =>
    setStored((previous) => ({
      key,
      data:
        typeof update === "function"
          ? (update as (v: T) => T)(
              previous.key === key ? previous.data : initial,
            )
          : update,
      ready: true,
    }));
  return [stored.key === key ? stored.data : initial, set];
}
