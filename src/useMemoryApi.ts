import {
  AsyncDispatch,
  AsyncState,
  getActionValue,
  useAsyncState,
} from "@dwidge/hooks-react";
import { dropUndefined } from "@dwidge/query-axios-zod";
import { filterDuplicatesBy } from "@dwidge/utils-js";
import { useCallback, useMemo } from "react";
import { BaseApiHooks } from "./BaseApiHooks.js";
import { randId } from "./randId.js";
import {
  ApiFilterObject,
  ApiFilterValue,
  ApiRecord,
  QueryOptions,
} from "./types.js";

/** Type helper for the parse function in the in‑memory implementation. */
type ParseItem<T> = (v: any) => T;

/**
 * Creates API hooks for managing a list of items in memory.
 *
 * This implementation accepts an AsyncState as input for the items, allowing for external control and read‑only scenarios.
 * If the provided AsyncState’s setter is undefined, all setter hooks returned by `useMemoryApi` will also be undefined.
 *
 * Each item is expected to have the following tracking fields:
 *   - id: string
 *   - createdAt: number (unix timestamp)
 *   - updatedAt: number (unix timestamp)
 *   - deletedAt: number | null (if non‑null, the item is “deleted” and can be restored)
 *
 * @typeparam T - The type of the API record. Must extend ApiRecord and include { id, createdAt, updatedAt, deletedAt }.
 * @typeparam PK - The type of the primary key, defaults to Pick<T, "id">.
 * @param initialItems - An AsyncState tuple containing the initial array of items (or undefined) and a setter function (or undefined for read‑only mode).
 * @param parse - A function to parse items before returning them from hooks. Defaults to identity.
 * @param usePreUpdate - A hook that returns a function to preprocess items before update/create operations. Defaults to identity.
 * @returns BaseApiHooks<T, PK> – an object containing API hooks for list and item operations.
 */
export const useMemoryApi = <
  T extends ApiRecord & {
    id: string;
    createdAt: number;
    updatedAt: number;
    deletedAt: number | null;
  },
  PK = Pick<T, "id">,
>(
  initialItems: AsyncState<T[]>,
  {
    parse,
    usePreUpdate,
    generateRandomId = () => randId(),
  }: {
    parse?: ParseItem<T>;
    usePreUpdate?: () => ParseItem<T>;
    generateRandomId?: () => string;
  } = {},
): BaseApiHooks<T, PK> => {
  const defaultParse: ParseItem<T> = (v: any) => v as T;
  const parser = parse ?? defaultParse;
  const preUpdater = usePreUpdate?.() ?? defaultParse;

  const [itemsState, setItemsState] = initialItems;
  const uniqueItems = useMemo(
    () => filterDuplicatesBy(itemsState ?? [], (v) => v.id),
    [itemsState],
  );

  const getItems = useCallback((): T[] => uniqueItems ?? [], [uniqueItems]);

  const setItemsInternal = useCallback(
    (newItems: T[]) => {
      if (setItemsState) {
        setItemsState(newItems);
      } else {
        console.warn("useMemoryApi: Read‑only mode; cannot update items.");
      }
    },
    [setItemsState],
  );

  const getUnixTimestamp = () => Math.floor(Date.now() / 1000);

  const filterItems = useCallback(
    (currentItems: T[], filter?: ApiFilterObject<T>): T[] => {
      if (!filter) return currentItems;
      return currentItems.filter((item) => {
        for (const key in filter) {
          if (Object.prototype.hasOwnProperty.call(filter, key)) {
            const filterValue = filter[key];
            const itemValue = item[key as keyof T];
            if (filterValue === undefined) continue;
            if (Array.isArray(filterValue)) {
              if (!filterValue.includes(itemValue as ApiFilterValue<T>)) {
                return false;
              }
            } else if (
              typeof filterValue === "object" &&
              filterValue !== null
            ) {
              if ("$range" in filterValue) {
                const [lower, upper] = filterValue.$range;
                if (
                  itemValue == null ||
                  (lower !== undefined && (itemValue as any) < lower) ||
                  (upper !== undefined && (itemValue as any) >= upper)
                ) {
                  return false;
                }
              } else if ("$not" in filterValue) {
                if (itemValue === filterValue.$not) return false;
              } else if (filterValue !== itemValue) {
                return false;
              }
            } else if (filterValue !== itemValue) {
              return false;
            }
          }
        }
        return true;
      });
    },
    [],
  );

  const sortItems = useCallback(
    (
      currentItems: T[],
      options?: QueryOptions<T> & { columns?: (keyof T)[] },
    ): T[] => {
      const order = options?.order ?? [];
      if (order.length === 0) return currentItems;
      return [...currentItems].sort((a, b) => {
        for (const [column, direction] of order) {
          const aValue = a[column];
          const bValue = b[column];
          if (aValue == null && bValue == null) continue;
          if (aValue == null) return direction === "ASC" ? -1 : 1;
          if (bValue == null) return direction === "ASC" ? 1 : -1;
          if (aValue === bValue) continue;
          return direction === "ASC"
            ? aValue < bValue
              ? -1
              : 1
            : aValue > bValue
              ? -1
              : 1;
        }
        return 0;
      });
    },
    [],
  );

  const paginateItems = useCallback(
    (
      currentItems: T[],
      options?: QueryOptions<T> & { columns?: (keyof T)[] },
    ): T[] => {
      let items = currentItems;
      if (options?.offset) {
        items = items.slice(options.offset);
      }
      if (options?.limit) {
        items = items.slice(0, options.limit);
      }
      return items;
    },
    [],
  );

  const useGetList: BaseApiHooks<T, PK>["useGetList"] = useCallback(
    <K extends keyof T>(
      filter?: ApiFilterObject<T>,
      options?: QueryOptions<T> & { columns?: K[] },
    ) => {
      const currentItems = getItems();
      const filteredItems = filterItems(currentItems, filter);
      const sortedItems = sortItems(filteredItems, options);
      const paginatedItems = paginateItems(sortedItems, options);
      if (options?.columns) {
        return paginatedItems.map((item) => {
          const newItem = {} as Pick<T, K>;
          options.columns!.forEach((col) => {
            newItem[col] = item[col];
          });
          return newItem;
        });
      }
      return paginatedItems;
    },
    [getItems, filterItems, sortItems, paginateItems],
  );

  const get: BaseApiHooks<T, PK>["get"] = useCallback(
    async <K extends keyof T>(
      filter?: ApiFilterObject<T>,
      options?: QueryOptions<T> & { columns?: K[] },
    ) => {
      const items = useGetList(filter, options) || [];
      return items.map(parser);
    },
    [useGetList, parser],
  ) as BaseApiHooks<T, PK>["get"];

  const useSetList: BaseApiHooks<T, PK>["useSetList"] = useCallback(() => {
    if (!setItemsState) return undefined;
    const setList = <V extends Partial<T>>(list: V[]): Promise<PK[]> => {
      const currentItems = getItems();
      const updatedItems = list.map((item) => {
        const existing = currentItems.find((i) => i.id === item.id);
        if (existing) {
          return {
            ...existing,
            ...preUpdater(item),
            updatedAt: getUnixTimestamp(),
          } as T;
        } else {
          return {
            ...preUpdater(item),
            id: generateRandomId(),
            createdAt: getUnixTimestamp(),
            updatedAt: getUnixTimestamp(),
            deletedAt: null,
          } as T;
        }
      });
      const nextItems = currentItems.map((item) => {
        const updated = updatedItems.find((u) => u.id === item.id);
        return updated ? updated : item;
      });
      const newItems = updatedItems.filter(
        (u) => !currentItems.some((i) => i.id === u.id),
      );
      setItemsInternal([...nextItems, ...newItems]);
      return Promise.resolve(
        updatedItems.map((item) => ({ id: item.id }) as PK),
      );
    };
    return setList;
  }, [getItems, preUpdater, setItemsInternal, setItemsState, generateRandomId]);

  const useCreateList: BaseApiHooks<T, PK>["useCreateList"] = useCallback(
    (filter?: Partial<T>) => {
      if (!setItemsState) return undefined;
      const createList = <V extends Partial<T>>(list: V[]): Promise<PK[]> => {
        const currentItems = getItems();
        const newItems = list.map(
          (item) =>
            ({
              ...preUpdater({ ...item, ...dropUndefined(filter ?? {}) }),
              id: generateRandomId(),
              createdAt: getUnixTimestamp(),
              updatedAt: getUnixTimestamp(),
              deletedAt: null,
            }) as T,
        );
        setItemsInternal([...currentItems, ...newItems]);
        return Promise.resolve(newItems.map((item) => ({ id: item.id }) as PK));
      };
      return createList;
    },
    [getItems, preUpdater, setItemsInternal, setItemsState, generateRandomId],
  );

  const useUpdateList: BaseApiHooks<T, PK>["useUpdateList"] =
    useCallback(() => {
      if (!setItemsState) return undefined;
      const updateList = <V extends Partial<T>>(list: V[]): Promise<PK[]> => {
        const currentItems = getItems();
        const updatedItems = list
          .map((item) => {
            const existing = currentItems.find((i) => i.id === item.id);
            if (existing) {
              return {
                ...existing,
                ...preUpdater(item),
                updatedAt: getUnixTimestamp(),
              } as T;
            }
            return null;
          })
          .filter((x): x is T => x !== null);
        const nextItems = currentItems.map((item) => {
          const updated = updatedItems.find((u) => u.id === item.id);
          return updated ? updated : item;
        });
        setItemsInternal(nextItems);
        return Promise.resolve(
          updatedItems.map((item) => ({ id: item.id }) as PK),
        );
      };
      return updateList;
    }, [getItems, preUpdater, setItemsInternal, setItemsState]);

  const useDeleteList: BaseApiHooks<T, PK>["useDeleteList"] =
    useCallback(() => {
      if (!setItemsState) return undefined;
      const deleteList = <V extends Partial<T>>(list: V[]): Promise<PK[]> => {
        const currentItems = getItems();
        const updatedItems = currentItems.map((item) => {
          if (list.find((l) => l.id === item.id)) {
            return {
              ...item,
              updatedAt: getUnixTimestamp(),
              deletedAt: getUnixTimestamp(),
            } as T;
          }
          return item;
        });
        setItemsInternal(updatedItems);
        return Promise.resolve(list.map((item) => ({ id: item.id }) as PK));
      };
      return deleteList;
    }, [getItems, setItemsInternal, setItemsState]);

  const useRestoreList: BaseApiHooks<T, PK>["useRestoreList"] =
    useCallback(() => {
      if (!setItemsState) return undefined;
      const restoreList = <V extends Partial<T>>(list: V[]): Promise<PK[]> => {
        const currentItems = getItems();
        const updatedItems = currentItems.map((item) => {
          if (list.find((l) => l.id === item.id)) {
            return {
              ...item,
              updatedAt: getUnixTimestamp(),
              deletedAt: null,
            } as T;
          }
          return item;
        });
        setItemsInternal(updatedItems);
        return Promise.resolve(list.map((item) => ({ id: item.id }) as PK));
      };
      return restoreList;
    }, [getItems, setItemsInternal, setItemsState]);

  const useList: BaseApiHooks<T, PK>["useList"] = useCallback(
    <K extends keyof T>(
      filter?: ApiFilterObject<T>,
      options?: QueryOptions<T> & { columns?: K[] },
    ) => {
      const items = useGetList(filter, options);
      const setList = useSetList();
      const deleteList = useDeleteList();
      return [items, setList, deleteList] as [
        typeof items,
        typeof setList,
        typeof deleteList,
      ];
    },
    [useGetList, useSetList, useDeleteList],
  ) as BaseApiHooks<T, PK>["useList"];

  const useGetItem: BaseApiHooks<T, PK>["useGetItem"] = useCallback(
    <K extends keyof T>(
      filter?: ApiFilterObject<T>,
      options?: QueryOptions<T> & { columns?: K[] },
    ) => {
      const list =
        useGetList(
          filter,
          options
            ? ({ ...options, limit: 1 } as QueryOptions<T> & {
                columns?: (keyof T)[];
              })
            : { limit: 1 },
        ) || [];
      return list.length > 0 ? (list[0] as Pick<T, K>) : null;
    },
    [useGetList],
  );

  const useCreateItem: BaseApiHooks<T, PK>["useCreateItem"] = useCallback(
    (filter?: Partial<T>) => {
      if (!setItemsState) return undefined;
      const createItem = <V extends Partial<T>>(
        item: V,
      ): Promise<PK | null> => {
        const currentItems = getItems();
        const newItem: T = {
          ...preUpdater({ ...item, ...dropUndefined(filter ?? {}) }),
          id: item.id ? item.id : generateRandomId(),
          createdAt: getUnixTimestamp(),
          updatedAt: getUnixTimestamp(),
          deletedAt: null,
        } as T;
        setItemsInternal([...currentItems, newItem]);
        return Promise.resolve({ id: newItem.id } as PK);
      };
      return createItem;
    },
    [getItems, preUpdater, setItemsInternal, setItemsState, generateRandomId],
  );

  const useUpdateItem: BaseApiHooks<T, PK>["useUpdateItem"] =
    useCallback(() => {
      if (!setItemsState) return undefined;
      const updateItem = <V extends Partial<T>>(
        item: V,
      ): Promise<PK | null> => {
        if (!item.id) return Promise.resolve(null);
        const currentItems = getItems();
        const idx = currentItems.findIndex((i) => i.id === item.id);
        if (idx > -1) {
          const updatedItem = {
            ...currentItems[idx],
            ...preUpdater(item),
            updatedAt: getUnixTimestamp(),
          } as T;
          const nextItems = [...currentItems];
          nextItems[idx] = updatedItem;
          setItemsInternal(nextItems);
          return Promise.resolve({ id: updatedItem.id } as PK);
        }
        return Promise.resolve(null);
      };
      return updateItem;
    }, [getItems, preUpdater, setItemsInternal, setItemsState]);

  const useDeleteItem: BaseApiHooks<T, PK>["useDeleteItem"] =
    useCallback(() => {
      if (!setItemsState) return undefined;
      const deleteItem = <V extends Partial<T>>(
        item: V,
      ): Promise<PK | null> => {
        if (!item.id) return Promise.resolve(null);
        const currentItems = getItems();
        const idx = currentItems.findIndex((i) => i.id === item.id);
        if (idx > -1) {
          const updatedItem = {
            ...currentItems[idx],
            updatedAt: getUnixTimestamp(),
            deletedAt: getUnixTimestamp(),
          } as T;
          const nextItems = [...currentItems];
          nextItems[idx] = updatedItem;
          setItemsInternal(nextItems);
          return Promise.resolve({ id: updatedItem.id } as PK);
        }
        return Promise.resolve(null);
      };
      return deleteItem;
    }, [getItems, setItemsInternal, setItemsState]);

  const useRestoreItem: BaseApiHooks<T, PK>["useRestoreItem"] =
    useCallback(() => {
      if (!setItemsState) return undefined;
      const restoreItem = <V extends Partial<T>>(
        item: V,
      ): Promise<PK | null> => {
        const currentItems = getItems();
        const idx = currentItems.findIndex((i) => i.id === item.id);
        if (idx > -1) {
          const updatedItem = {
            ...currentItems[idx],
            updatedAt: getUnixTimestamp(),
            deletedAt: null,
          } as T;
          const nextItems = [...currentItems];
          nextItems[idx] = updatedItem;
          setItemsInternal(nextItems);
          return Promise.resolve({ id: updatedItem.id } as PK);
        }
        return Promise.resolve(null);
      };
      return restoreItem;
    }, [getItems, setItemsInternal, setItemsState]);

  const useSetItem: BaseApiHooks<T, PK>["useSetItem"] = (
    filter?: Partial<T>,
  ) => {
    const createFn = useCreateItem();
    const updateFn = useUpdateItem();
    const deleteFn = useDeleteItem();

    const setItemAsync: AsyncDispatch<Partial<T> | null> = useCallback(
      async (valueOrFn): Promise<Partial<T> | null> => {
        const filterObj = filter
          ? ({ ...filter } as ApiFilterObject<T>)
          : ({} as ApiFilterObject<T>);
        const existing = useGetItem(filterObj) as T | null | undefined;
        const newValue: Partial<T> | null = await getActionValue(
          valueOrFn,
          existing ?? null,
        );
        if (newValue === null) {
          if (existing && deleteFn) {
            await deleteFn(existing);
          }
          return null;
        }
        if (existing) {
          if (updateFn) {
            await updateFn({ ...existing, ...newValue });
            return getItems().find((i) => i.id === existing!.id) || null;
          }
        } else {
          if (createFn) {
            const toCreate = { ...newValue } as T;
            if (!toCreate.id) {
              toCreate.id = generateRandomId();
            }
            await createFn(toCreate);
            return getItems().find((i) => i.id === toCreate.id) || toCreate;
          }
        }
        return null;
      },
      [
        createFn,
        deleteFn,
        filter,
        getItems,
        updateFn,
        useGetItem,
        generateRandomId,
      ],
    );

    const [, internalSet] = useAsyncState<Partial<T> | null>(null);

    return setItemsState ? setItemAsync : internalSet;
  };

  const useItem: BaseApiHooks<T, PK>["useItem"] = <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & { columns?: K[] },
  ) => {
    const value = useGetItem(filter, options);
    const setter = useSetItem(filter as Partial<T>);
    return [value, setter] as any;
  };

  const useCount: BaseApiHooks<T, PK>["useCount"] = useCallback(
    (filter?: ApiFilterObject<T>) => {
      const currentItems = getItems();
      const filtered = filterItems(currentItems, filter);
      return filtered.length;
    },
    [filterItems, getItems],
  );

  const count: BaseApiHooks<T, PK>["count"] = useCallback(
    async (filter?: Partial<T>) => {
      const filterObj = filter
        ? ({ ...filter } as ApiFilterObject<T>)
        : undefined;
      return Promise.resolve(useCount(filterObj));
    },
    [useCount],
  );

  return {
    useGetList,
    useSetList,
    useCreateList,
    useUpdateList,
    useDeleteList,
    useRestoreList,
    useList,
    useGetItem,
    useSetItem,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
    useRestoreItem,
    useItem,
    useCount,
    get,
    count,
    CacheProvider: ({ children }) => children,
    FilterProvider: ({ children }) => children,
  };
};
