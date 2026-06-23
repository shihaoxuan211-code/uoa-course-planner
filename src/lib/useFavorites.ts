"use client";

import { useSyncExternalStore, useCallback, useState, useEffect } from "react";
import { FAVORITES_STORAGE_KEY } from "@/lib/storageKeys";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : [];
  } catch { return []; }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

let cached: string[] | null = null;

function getSnapshot(): string[] {
  if (cached === null) cached = readFavorites();
  return cached;
}

export function useFavorites() {
  const [mounted, setMounted] = useState(false);
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => { setMounted(true); }, []);

  const toggle = useCallback((courseId: string) => {
    const current = readFavorites();
    const next = current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    cached = next;
    window.dispatchEvent(new Event("storage"));
  }, []);

  const isFavorite = useCallback(
    (courseId: string) => mounted ? favorites.includes(courseId) : false,
    [favorites, mounted]
  );

  return { favorites, toggle, isFavorite };
}
