import { ApiRecord } from "./BaseApi";
import { BaseApiHooks } from "./BaseApiHooks";

export const createApiPlaceholder = <T extends ApiRecord>(
  name: string,
  warn = () =>
    console.warn(
      `createApiContext1: Please wrap App with <${name}.Provider value={{...}}></${name}.Provider>`,
    ),
): BaseApiHooks<Partial<T>> => ({
  useGetList: () => (warn(), undefined),
  useSetList: () => (warn(), undefined),
  useCreateList: () => (warn(), undefined),
  useUpdateList: () => (warn(), undefined),
  useDeleteList: () => (warn(), undefined),
  useList: () => (warn(), []),
  useGetItem: () => (warn(), undefined),
  useSetItem: () => (warn(), undefined),
  useCreateItem: () => (warn(), undefined),
  useUpdateItem: () => (warn(), undefined),
  useDeleteItem: () => (warn(), undefined),
  useItem: () => (warn(), []),
});
