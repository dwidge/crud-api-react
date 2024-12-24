// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import {
  assert,
  Fetch,
  getQueryStringFromObject,
} from "@dwidge/query-axios-zod";

export type ConvertItem<A, D> = (v: A) => D;
export type AssertItem<T> = ConvertItem<T, T>;
export type ParseItem<T> = ConvertItem<any, T>;

export type ApiRecord = Record<
  string,
  string | number | boolean | null | undefined
>;
export type ApiItem<Id extends string = string> = {
  id: Id;
  updatedAt: number;
  createdAt: number;
  deletedAt: number | null;
  authorId: Id | null;
  companyId: Id | null;
};

export type BaseApi<T extends ApiRecord> = {
  getList: (filter?: T) => Promise<T[]>;
  setList: (list: T[]) => Promise<T[]>;
};
export const useBaseApi = <T extends ApiRecord>(
  parse: ParseItem<T>,
  routePath: string,
  fetch: Fetch,
): BaseApi<T> => ({
  getList: async (filter?: T) =>
    fetch(
      "get",
      routePath + "?" + getQueryStringFromObject(parse(filter ?? {})),
    ).then((v) => (assert(Array.isArray(v), "getList1"), v.map(parse))),
  setList: (v: T[]) =>
    fetch("put", routePath, (assert(Array.isArray(v)), v.map(parse))).then(
      (v) => (assert(Array.isArray(v), "setList1"), v.map(parse)),
    ),
});

export type ExtendedApi<T extends ApiRecord> = BaseApi<T> & {
  createList: (list: T[]) => Promise<T[]>;
  updateList: (list: T[]) => Promise<T[]>;
  deleteList: (list: T[]) => Promise<T[]>;
  getItem: (item: T) => Promise<T | null>;
  setItem: (item: T) => Promise<T | null>;
  createItem: (item: T) => Promise<T | null>;
  updateItem: (item: T) => Promise<T | null>;
  deleteItem: (item: T) => Promise<T | null>;
};
export const useExtendedApi = <T extends ApiRecord>(
  base: BaseApi<T>,
): ExtendedApi<T> => ({
  ...base,
  createList: (list: T[]) => base.setList(list),
  updateList: (list: T[]) => base.setList(list),
  deleteList: (list: T[]) => base.setList(list.map(deleteItem)),
  getItem: (item: T) => base.getList(item).then(firstItem),
  setItem: (item: T) => base.setList([item]).then(firstItem),
  createItem: (item: T) => base.setList([item]).then(firstItem),
  updateItem: (item: T) => base.setList([item]).then(firstItem),
  deleteItem: (item: T) => base.setList([item].map(deleteItem)).then(firstItem),
});

const firstItem = <T>(a: T[]) => a[0] ?? null;
const deleteItem = <T>(v: T) => ({ deletedAt: unixTime(), ...v });

const unixTime = () => (Date.now() / 1000) | 0;
