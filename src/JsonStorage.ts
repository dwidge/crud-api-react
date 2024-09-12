// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

export type WebStorage = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};
export type JsonStorage = {
  getItem: <T = unknown>(key: string) => Promise<T | undefined>;
  setItem: <T = unknown>(key: string, item: T) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export const useJsonStorage = ({
  storage,
  prefix = "",
  log,
}: {
  storage: WebStorage;
  prefix?: string;
  log?: (...v: unknown[]) => void;
}): JsonStorage => ({
  getItem: async (key) => {
    const value = await storage.getItem(prefix + key);
    const item = value != null ? JSON.parse(value) : undefined;
    log?.("getItem", key, item);
    return item;
  },
  setItem: async (key, item) => {
    log?.("setItem", key, item);
    const value = JSON.stringify(item);
    await storage.setItem(prefix + key, value);
  },
  removeItem: async (key) => {
    log?.("removeItem", key);
    await storage.removeItem(prefix + key);
  },
});
