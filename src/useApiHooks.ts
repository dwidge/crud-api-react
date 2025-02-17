// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { assert } from "@dwidge/query-axios-zod";
import { ExtendedApi } from "./BaseApi.js";
import { BaseApiHooks } from "./BaseApiHooks.js";
import { ApiGetItemHook, ApiRecord } from "./types.js";
import { useMutation } from "./useMutation.js";
import { useQuery } from "./useQuery.js";

export const useApiSwr = <T extends ApiRecord, PK = Pick<T, "id">>(
  table: string,
  useApi: () => ExtendedApi<T, PK>,
  useToken: () => string | null | undefined,
  useCompanyId: () => number | null | undefined,
): BaseApiHooks<T, PK> => {
  const useGetList = (filter, options, api = useApi()) =>
    useQuery(
      [useCompanyId(), table, filter],
      () => api.getList(filter, options),
      !!useToken() && !!filter,
    );

  const useSetList = (api = useApi()) =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.setList(list as any),
      !!useToken(),
    );

  const useCreateList = (api = useApi()) =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.createList(list as any),
      !!useToken(),
    );

  const useUpdateList = (api = useApi()) =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.updateList(list as any),
      !!useToken(),
    );

  const useDeleteList = (api = useApi()) =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.deleteList(list as any),
      !!useToken(),
    );

  const useList = (filter?: T, columns?: (keyof T)[], api = useApi()) =>
    [
      useGetList(filter, columns, api),
      useSetList(api),
      useDeleteList(api),
    ] as const;

  const useGetItem = ((filter, options, api = useApi()) =>
    useQuery(
      [useCompanyId(), table, filter],
      async () => (assert(filter != null), [await api.getItem(filter)]),
      !!useToken() && filter != null,
    )?.[0]) satisfies ApiGetItemHook<T>;

  const useSetItem = (filter?: T | null, api = useApi()) =>
    useMutation(
      [useCompanyId(), table],
      (
        prevValue,
        nextValue = typeof prevValue === "function"
          ? prevValue({} as T)
          : prevValue,
      ) =>
        nextValue
          ? api.updateItem(nextValue)
          : filter != null
            ? api.deleteItem(filter as any)
            : Promise.resolve(null),
      !!useToken() && filter != null,
    );

  const useCreateItem = (api = useApi()) =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.createItem(list as any),
      !!useToken(),
    );

  const useUpdateItem = (api = useApi()) =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.updateItem(list as any),
      !!useToken(),
    );

  const useDeleteItem = (api = useApi()) =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.deleteItem(list as any),
      !!useToken(),
    );

  const useItem = <K extends keyof T>(
    filter?: Partial<T> | null,
    options?: {
      columns?: K[];
    },
    api = useApi(),
  ) =>
    [
      useGetItem(filter as any, options, api),
      useSetItem(filter as any, api),
    ] as const;

  return {
    useGetList,
    useSetList,
    useCreateList,
    useUpdateList,
    useDeleteList,
    useList,

    useGetItem,
    useSetItem,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
    useItem,
  } as any;
};
