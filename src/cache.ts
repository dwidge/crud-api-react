// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

// https://swr.vercel.app/docs/advanced/cache

import { Cache, mutate } from "swr";
import { JsonStorage } from "./JsonStorage.js";

export const createCache =
  (storage: JsonStorage) =>
  (cache: Readonly<Cache<any>>): Cache<any> => {
    // load cache async after swr setup
    // so we can support AsyncStorage
    const loadCache = async () => {
      const items = await storage.getItem<[string, any][]>("cache");
      if (items)
        for (const [key, value] of items) {
          // cache.set(key, value);
          await mutate(key, value, false);
        }
    };

    const saveCache = async () => {
      const items: [string, any][] = Array.from(cache.keys())
        .map((key) => {
          const state = cache.get(key);
          return [key, state?.data] as [string, any];
        })
        .filter(([_key, data]) => data != undefined);
      await storage.setItem("cache", items);
    };

    loadCache();
    // window.addEventListener("beforeunload", saveCache);
    // window.addEventListener("blur", saveCache);

    let t: ReturnType<typeof setTimeout> | undefined;
    const debouncedSaveCache = () => {
      if (t) clearTimeout(t);
      t = setTimeout(saveCache, 3000);
    };

    // workaround: swr global mutate + custom cache
    // https://github.com/vercel/swr/issues/2824
    const setter = cache.set;
    (cache as any).set = (key: string, value: any) => {
      setter.call(cache, key, value);
      debouncedSaveCache();
    };

    return cache;
  };
