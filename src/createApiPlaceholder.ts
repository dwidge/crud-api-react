import { BaseApiHooks } from "./BaseApiHooks.js";
import { ApiRecord } from "./types.js";

export const createApiPlaceholder = <T extends ApiRecord, PK = Pick<T, "id">>(
  name: string,
  warn = () =>
    console.warn(
      `createApiContext1: Please wrap App with <${name}.Provider value={{...}}></${name}.Provider>`,
    ),
): BaseApiHooks<T, PK> => ({
  useGetList: () => (warn(), undefined),
  useSetList: () => (warn(), undefined),
  useCreateList: () => (warn(), undefined),
  useUpdateList: () => (warn(), undefined),
  useDeleteList: () => (warn(), undefined),
  useRestoreList: () => (warn(), undefined),
  useList: () => (warn(), [] as any),
  useGetItem: () => (warn(), undefined),
  useSetItem: () => (warn(), undefined),
  useCreateItem: () => (warn(), undefined),
  useUpdateItem: () => (warn(), undefined),
  useDeleteItem: () => (warn(), undefined),
  useRestoreItem: () => (warn(), undefined),
  useItem: () => (warn(), [] as any),
  useCount: () => (warn(), undefined),
  get: async () => (warn(), []),
  count: async () => (warn(), undefined),
  CacheProvider: ({ children }) => children,
  FilterProvider: ({ children }) => children,
});
