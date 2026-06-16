"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

type AddResult = "added" | "exists" | "max";

const serverSnapshot = "[]";

function eventName(key: string) {
  return `uoa-course-planner-storage:${key}`;
}

function readStorage(key: string) {
  if (typeof window === "undefined") {
    return serverSnapshot;
  }

  try {
    return window.localStorage.getItem(key) ?? serverSnapshot;
  } catch {
    return serverSnapshot;
  }
}

function parseItems(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function useLocalStorageList(key: string, { maxItems }: { maxItems?: number } = {}) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const storageHandler = (event: StorageEvent) => {
        if (event.key === null || event.key === key) {
          onStoreChange();
        }
      };

      const localHandler = () => onStoreChange();

      window.addEventListener("storage", storageHandler);
      window.addEventListener(eventName(key), localHandler);

      return () => {
        window.removeEventListener("storage", storageHandler);
        window.removeEventListener(eventName(key), localHandler);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => readStorage(key), [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
  const items = useMemo(() => parseItems(raw), [raw]);

  const save = useCallback(
    (nextItems: string[]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(nextItems));
        window.dispatchEvent(new Event(eventName(key)));
      } catch {
        // Keep the UI usable even if storage is blocked.
      }
    },
    [key]
  );

  const add = useCallback(
    (id: string): AddResult => {
      if (items.includes(id)) {
        return "exists";
      }

      if (maxItems && items.length >= maxItems) {
        return "max";
      }

      save([...items, id]);
      return "added";
    },
    [items, maxItems, save]
  );

  const remove = useCallback(
    (id: string) => {
      save(items.filter((item) => item !== id));
    },
    [items, save]
  );

  const clear = useCallback(() => {
    save([]);
  }, [save]);

  const contains = useCallback((id: string) => items.includes(id), [items]);

  return useMemo(
    () => ({ items, isReady: true, add, remove, clear, contains }),
    [items, add, remove, clear, contains]
  );
}
