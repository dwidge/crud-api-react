// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { AsyncState } from "@dwidge/hooks-react";
import {
  ApiGetItemHook,
  ApiGetListHook,
  ApiRecord,
  ApiReturn,
  ApiSetItem,
  ApiSetList,
} from "./types.js";

export type BaseApiHooks<T extends ApiRecord, PK> = {
  useGetList: ApiGetListHook<T>;
  useSetList: () => ApiSetList<T, PK> | undefined;
  useCreateList: () => ApiSetList<T, PK> | undefined;
  useUpdateList: () => ApiSetList<T, PK> | undefined;
  useDeleteList: () => ApiSetList<T, PK> | undefined;
  useList: <K extends keyof T>(
    filter?: Partial<T>,
    options?: { columns?: K[] },
  ) => [
    items?: ApiReturn<T, K>[],
    setItems?: ApiSetList<T, PK>,
    delItems?: ApiSetList<T, PK>,
  ];

  useGetItem: ApiGetItemHook<T>;
  useSetItem: (filter?: Partial<T>) => AsyncState<Partial<T> | null>[1];
  useCreateItem: () => ApiSetItem<T, PK> | undefined;
  useUpdateItem: () => ApiSetItem<T, PK> | undefined;
  useDeleteItem: () => ApiSetItem<T, PK> | undefined;
  useItem: <K extends keyof T>(
    filter?: Partial<T>,
    options?: { columns?: K[] },
  ) => AsyncState<ApiReturn<T, K> | null, Partial<T> | null>;
};

export type ApiHooks<T extends ApiRecord, PK = Pick<T, "id">> = BaseApiHooks<
  T,
  PK
>;
