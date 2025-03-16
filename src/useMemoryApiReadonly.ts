import { AsyncState } from "@dwidge/hooks-react";
import { filterDuplicatesBy } from "@dwidge/utils-js";
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
 * Creates read-only API hooks for accessing a list of items in memory.
 *
 * This implementation accepts an AsyncState as input for the items, enforcing read‑only access.
 * All setter hooks returned by `useMemoryReadonly` will be undefined.
 *
 * Each item is expected to have the following tracking fields:
 *   - id: string
 *   - createdAt: number (unix timestamp)
 *   - updatedAt: number (unix timestamp)
 *   - deletedAt: number | null (if non‑null, the item is “deleted” and can be restored)
 *
 * @typeparam T - The type of the API record. Must extend ApiRecord and include { id, createdAt, updatedAt, deletedAt }.
 * @typeparam PK - The type of the primary key, defaults to Pick<T, "id">.
 * @param initialItems - An AsyncState tuple containing the initial array of items (or undefined) and a setter function (which will be ignored in read-only mode).
 * @param parse - A function to parse items before returning them from hooks. Defaults to identity.
 * @param usePreUpdate - A hook that returns a function to preprocess items before update/create operations. Defaults to identity.  Ignored in read-only mode.
 * @returns BaseApiHooks<T, PK> – an object containing API hooks for list and item operations, all setters are undefined.
 */
export const useMemoryApiReadonly = <
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
    usePreUpdate, // ignored in readonly mode
    generateRandomId = () => randId(), // ignored in readonly mode
  }: {
    parse?: ParseItem<T>;
    usePreUpdate?: () => ParseItem<T>;
    generateRandomId?: () => string;
  } = {},
): BaseApiHooks<T, PK> => {
  // Use identity if no parse function is provided.
  const defaultParse: ParseItem<T> = (v: any) => v as T;
  const parser = parse ?? defaultParse;
  // const preUpdater = usePreUpdate?.() ?? defaultParse; // ignored in readonly mode

  const [itemsState] = initialItems; // only use itemsState, ignore setItemsState
  const uniqueItems = filterDuplicatesBy(itemsState ?? [], (v) => v.id);

  // Returns current items or an empty array.
  const getItems = (): T[] => uniqueItems;

  // Updates items if setter is available; otherwise logs a warning. // No setter in readonly
  const setItemsInternal = undefined; // readonly mode

  // Returns the current Unix timestamp. // not used in readonly setters
  const getUnixTimestamp = () => Math.floor(Date.now() / 1000); // not used in readonly setters

  // Filters items based on an optional filter object.
  const filterItems = (currentItems: T[], filter?: ApiFilterObject<T>): T[] => {
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
          } else if (typeof filterValue === "object" && filterValue !== null) {
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
  };

  // Sorts items based on query options. If options.order is undefined, an empty array is used.
  const sortItems = (
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
  };

  // Paginates items using offset and limit.
  const paginateItems = (
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
  };

  // ─── LIST OPERATIONS ─────────────────────────────────────────────

  const useGetList: BaseApiHooks<T, PK>["useGetList"] = <K extends keyof T>(
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
  };

  // The "get" function returns a Promise of parsed items.
  const get: BaseApiHooks<T, PK>["get"] = (async <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & { columns?: K[] },
  ) => {
    const items = useGetList(filter, options) || [];
    return items.map(parser);
  }) as BaseApiHooks<T, PK>["get"];

  const useSetList: BaseApiHooks<T, PK>["useSetList"] = () => {
    return undefined; // always undefined in readonly mode
  };

  const useCreateList: BaseApiHooks<T, PK>["useCreateList"] = (
    filter?: Partial<T>,
  ) => {
    return undefined; // always undefined in readonly mode
  };

  const useUpdateList: BaseApiHooks<T, PK>["useUpdateList"] = () => {
    return undefined; // always undefined in readonly mode
  };

  // Instead of removing items, mark them as deleted by setting deletedAt.
  const useDeleteList: BaseApiHooks<T, PK>["useDeleteList"] = () => {
    return undefined; // always undefined in readonly mode
  };

  // Restores items by setting deletedAt to null and updating updatedAt.
  const useRestoreList: BaseApiHooks<T, PK>["useRestoreList"] = () => {
    return undefined; // always undefined in readonly mode
  };

  const useList: BaseApiHooks<T, PK>["useList"] = (<K extends keyof T>(
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
  }) as BaseApiHooks<T, PK>["useList"];

  const useGetItem: BaseApiHooks<T, PK>["useGetItem"] = <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & { columns?: K[] },
  ) => {
    // When setting limit, we cast the options so that columns are (keyof T)[]
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
  };

  // ─── SINGLE ITEM OPERATIONS ─────────────────────────────────────

  const useCreateItem: BaseApiHooks<T, PK>["useCreateItem"] = (
    filter?: Partial<T>,
  ) => {
    return undefined; // always undefined in readonly mode
  };

  const useUpdateItem: BaseApiHooks<T, PK>["useUpdateItem"] = () => {
    return undefined; // always undefined in readonly mode
  };

  const useDeleteItem: BaseApiHooks<T, PK>["useDeleteItem"] = () => {
    return undefined; // always undefined in readonly mode
  };

  const useRestoreItem: BaseApiHooks<T, PK>["useRestoreItem"] = () => {
    return undefined; // always undefined in readonly mode
  };

  // The hook for an individual item returns an AsyncState tuple: [value, setter].
  const useSetItem: BaseApiHooks<T, PK>["useSetItem"] = (
    filter?: Partial<T>,
  ) => {
    return undefined; // always undefined in readonly mode
  };

  const useItem: BaseApiHooks<T, PK>["useItem"] = <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & { columns?: K[] },
  ) => {
    const value = useGetItem(filter, options);
    const setter = useSetItem(filter as Partial<T>);
    return [value, setter] as any;
  };

  const useCount: BaseApiHooks<T, PK>["useCount"] = (
    filter?: ApiFilterObject<T>,
  ) => {
    const currentItems = getItems();
    const filtered = filterItems(currentItems, filter);
    return filtered.length;
  };

  const count: BaseApiHooks<T, PK>["count"] = async (filter?: Partial<T>) => {
    const filterObj = filter
      ? ({ ...filter } as ApiFilterObject<T>)
      : undefined;
    return Promise.resolve(useCount(filterObj));
  };

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
  };
};
