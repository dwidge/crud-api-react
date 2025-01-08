// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import {
  assert,
  Fetch,
  getQueryStringFromObject,
} from "@dwidge/query-axios-zod";
import {
  ApiGetList,
  ApiSetList,
  ApiRecord,
  ParseItem,
  ApiGetItem,
  ApiSetItem,
  ApiWmdbItem1,
} from "./types.js";

export type BaseApi<T extends ApiRecord, PK = Pick<T, "id">> = {
  getList: ApiGetList<T>;
  setList: ApiSetList<T, PK>;
  delList: ApiSetList<T, PK>;
};

export const useBaseApi = <T extends ApiRecord, PK = Pick<T, "id">>(
  parse: ParseItem<Partial<T>>,
  routePath: string,
  fetch: Fetch,
): BaseApi<T, PK> => ({
  getList: async (filter, options) =>
    fetch(
      "get",
      routePath +
        "?" +
        getQueryStringFromObject(
          parse({
            ...Object.fromEntries(
              options?.columns?.map((k) => [k, undefined]) ?? [],
            ),
            ...filter,
          }),
        ),
    ).then(
      (v) => (assert(Array.isArray(v), "getList1"), v.map(parse) as any[]),
    ),
  setList: (v) =>
    fetch("put", routePath, (assert(Array.isArray(v)), v.map(parse))).then(
      (v) => (assert(Array.isArray(v), "setList1"), v.map(parse)),
    ) as any,
  delList: (v) =>
    fetch("delete", routePath, (assert(Array.isArray(v)), v.map(parse))).then(
      (v) => (assert(Array.isArray(v), "delList1"), v.map(parse)),
    ) as any,
});

export type ExtendedApi<T extends ApiRecord, PK = Pick<T, "id">> = BaseApi<
  T,
  PK
> & {
  createList: ApiSetList<T, PK>;
  updateList: ApiSetList<T, PK>;
  deleteList: ApiSetList<T, PK>;
  getItem: ApiGetItem<T>;
  setItem: ApiSetItem<T, PK>;
  createItem: ApiSetItem<T, PK>;
  updateItem: ApiSetItem<T, PK>;
  deleteItem: ApiSetItem<T, PK>;
};
1;
export const useExtendedApi = <T extends ApiWmdbItem1, PK = Pick<T, "id">>({
  getList,
  setList,
  delList,
}: BaseApi<T, PK>): ExtendedApi<T, PK> => ({
  getList,
  setList,
  delList,
  ...{
    getItem: (item) => getList(item).then(firstItem),
  },
  ...{
    createList: (list) => setList(list),
    updateList: (list) => setList(list),
    deleteList: (list) => delList(list),
    setItem: (item) => setList([item]).then(firstItem) as any,
    createItem: (item) => setList([item]).then(firstItem) as any,
    updateItem: (item) => setList([item]).then(firstItem) as any,
    deleteItem: (item) => delList([item]).then(firstItem) as any,
  },
});

const firstItem = <T>(a: T[]) => a[0] ?? null;
const deleteItem = <T extends ApiRecord, V extends Partial<T>>(v: V) =>
  ({ deletedAt: unixTime(), ...v }) as V;

const unixTime = () => (Date.now() / 1000) | 0;
