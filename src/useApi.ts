// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { getQueryStringFromObject } from "@dwidge/query-axios-zod";
import { ZodType } from "zod";
import { Fetch } from "./useFetch.js";
import { Api } from "./Api.js";

export type FilterType = Record<
  string,
  string | number | boolean | Date | null | undefined
>;

export const useApi = <
  Id,
  Key extends { id: Id },
  Mini extends Key,
  Full extends Mini,
  Filter extends FilterType,
  Create,
  Update extends Key
>(
  fetch: Fetch,
  route: string,
  KeySchema: ZodType<Key, any, any>,
  MiniSchema: ZodType<Mini, any, any>,
  FullSchema: ZodType<Full, any, any>,
  FilterSchema: ZodType<Filter, any, any>,
  CreateSchema: ZodType<Create, any, any>,
  UpdateSchema: ZodType<Update, any, any>
): Api<Id, Key, Mini, Full, Filter, Create, Update> => ({
  getList: (filter) =>
    fetch(
      "get",
      route +
        "?" +
        getQueryStringFromObject(FilterSchema.optional().parse(filter))
    ).then((v) => MiniSchema.array().parse(v)),
  createList: (list) =>
    fetch("post", route, CreateSchema.array().parse(list)).then((r) =>
      KeySchema.array().parse(r)
    ),
  updateList: (list) =>
    fetch("put", route, UpdateSchema.array().parse(list)).then((r) =>
      KeySchema.array().parse(r)
    ),
  deleteList: (list) =>
    fetch("delete", route, FilterSchema.array().parse(list)).then((r) =>
      KeySchema.array().parse(r)
    ),
  get: (key) =>
    fetch("get", route + "/" + KeySchema.parse(key).id).then((r) =>
      FullSchema.nullable().parse(r)
    ),
  update: (key, value) =>
    fetch(
      "put",
      route + "/" + KeySchema.parse(key).id,
      UpdateSchema.parse(value)
    ).then((r) => KeySchema.nullable().parse(r)),
  delete: (key) =>
    fetch("delete", route + "/" + KeySchema.parse(key).id).then((r) =>
      KeySchema.nullable().parse(r)
    ),
});
