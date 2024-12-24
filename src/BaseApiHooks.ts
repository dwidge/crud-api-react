// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { AsyncDispatch, AsyncState } from "@dwidge/hooks-react";
import { SetStateAction } from "react";
import { ApiRecord } from "./BaseApi";

export type BaseApiHooks<T extends ApiRecord> = {
  useGetList: (filter?: T) => T[] | undefined;
  useSetList: () => ((list: T[]) => Promise<T[]>) | undefined;
  useCreateList: () => ((list: T[]) => Promise<T[]>) | undefined;
  useUpdateList: () => ((list: T[]) => Promise<T[]>) | undefined;
  useDeleteList: () => ((list: T[]) => Promise<T[]>) | undefined;
  useList: (
    filter?: T,
  ) => [
    items?: T[],
    setItems?: (v: T[]) => Promise<T[]>,
    delItems?: (v: T[]) => Promise<T[]>,
  ];

  useGetItem: (filter?: T) => T | null | undefined;
  useSetItem: (
    filter?: T,
  ) => AsyncDispatch<SetStateAction<T | null>> | undefined;
  useCreateItem: () => ((item: T) => Promise<T | null>) | undefined;
  useUpdateItem: () => ((item: T) => Promise<T | null>) | undefined;
  useDeleteItem: () => ((item: T) => Promise<T | null>) | undefined;
  useItem: (filter?: T) => AsyncState<T | null>;
};

export type ApiHooks<T extends ApiRecord> = BaseApiHooks<Partial<T>>;
