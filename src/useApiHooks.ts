// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { assert } from "@dwidge/query-axios-zod";
import { SetStateAction } from "react";
import { useMutation } from "./useMutation";
import { useQuery } from "./useQuery";
import { BaseApiHooks } from "./BaseApiHooks";
import { ApiRecord, ExtendedApi } from ".";

export const useApiHooks = <T extends ApiRecord>(
  table: string,
  useApi: () => ExtendedApi<T>,
  useToken: () => string | undefined,
  useCompanyId: () => number | null | undefined,
): BaseApiHooks<T> => {
  const useGetList = (filter?: T, api = useApi()): T[] | undefined =>
    useQuery(
      [useCompanyId(), table, filter],
      () => api.getList(filter),
      !!useToken() && !!filter,
    );

  const useSetList = (
    api = useApi(),
  ): ((list: T[]) => Promise<T[]>) | undefined =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.setList(list),
      !!useToken(),
    );

  const useCreateList = (
    api = useApi(),
  ): undefined | ((list: T[]) => Promise<T[]>) =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.createList(list),
      !!useToken(),
    );

  const useUpdateList = (
    api = useApi(),
  ): ((list: T[]) => Promise<T[]>) | undefined =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.updateList(list),
      !!useToken(),
    );

  const useDeleteList = (
    api = useApi(),
  ): ((list: T[]) => Promise<T[]>) | undefined =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.deleteList(list),
      !!useToken(),
    );

  const useList = (
    filter?: T,
    api = useApi(),
  ): [T[]?, ((list: T[]) => Promise<T[]>)?, ((list: T[]) => Promise<T[]>)?] => [
    useGetList(filter, api),
    useSetList(api),
    useDeleteList(api),
  ];

  const useGetItem = (
    filter?: T | null,
    api = useApi(),
  ): T | null | undefined =>
    useQuery(
      [useCompanyId(), table, filter],
      async () => (assert(filter != null), [await api.getItem(filter)]),
      !!useToken() && filter != null,
    )?.[0];

  const useSetItem = (
    filter?: T | null,
    api = useApi(),
  ): ((item: SetStateAction<T | null>) => Promise<T | null>) | undefined =>
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
            ? api.deleteItem(filter)
            : Promise.resolve(null),
      !!useToken() && filter != null,
    );

  const useCreateItem = (
    api = useApi(),
  ): ((filter: T) => Promise<T | null>) | undefined =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.createItem(list),
      !!useToken(),
    );

  const useUpdateItem = (
    api = useApi(),
  ): ((filter: T) => Promise<T | null>) | undefined =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.updateItem(list),
      !!useToken(),
    );

  const useDeleteItem = (
    api = useApi(),
  ): ((filter: T) => Promise<T | null>) | undefined =>
    useMutation(
      [useCompanyId(), table],
      (list) => api.deleteItem(list),
      !!useToken(),
    );

  const useItem = (
    filter?: T | null,
    api = useApi(),
  ): [ReturnType<typeof useGetItem>, ReturnType<typeof useSetItem>] => [
    useGetItem(filter, api),
    useSetItem(filter, api),
  ];

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
  };
};
