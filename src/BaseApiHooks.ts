// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { AsyncState } from "@dwidge/hooks-react";
import {
  ApiFilterObject,
  ApiGetItemHook,
  ApiGetList,
  ApiGetListHook,
  ApiItemHook,
  ApiListHook,
  ApiRecord,
  ApiSetItem,
  ApiSetList,
} from "./types.js";

export type BaseApiHooks<T extends ApiRecord, PK> = {
  useGetList: ApiGetListHook<T>;
  useSetList: () => ApiSetList<T, PK> | undefined;
  useCreateList: (filter?: Partial<T>) => ApiSetList<T, PK> | undefined;
  useUpdateList: () => ApiSetList<T, PK> | undefined;
  useDeleteList: () => ApiSetList<T, PK> | undefined;
  useRestoreList: () => ApiSetList<T, PK> | undefined;
  useList: ApiListHook<T, PK>;

  useGetItem: ApiGetItemHook<T>;
  useSetItem: (filter?: Partial<T>) => AsyncState<Partial<T> | null>[1];
  useCreateItem: (filter?: Partial<T>) => ApiSetItem<T, PK> | undefined;
  useUpdateItem: () => ApiSetItem<T, PK> | undefined;
  useDeleteItem: () => ApiSetItem<T, PK> | undefined;
  useRestoreItem: () => ApiSetItem<T, PK> | undefined;
  useItem: ApiItemHook<T>;
  useCount: (filter?: ApiFilterObject<T>) => number | undefined;

  get: ApiGetList<T>;
  count: (filter?: Partial<T>) => Promise<number | undefined>;
};

export type ApiHooks<T extends ApiRecord, PK = Pick<T, "id">> = BaseApiHooks<
  T,
  PK
>;
