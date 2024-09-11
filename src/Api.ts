// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { FilterType } from "./useApi.js";

export type Api<
  Id,
  Key extends { id: Id },
  Mini extends Key,
  Full extends Mini,
  Filter extends FilterType,
  Create,
  Update extends Key
> = {
  getList: (filter?: Filter) => Promise<Mini[]>;
  createList: (list: Create[]) => Promise<Key[]>;
  updateList: (list: Update[]) => Promise<Key[]>;
  deleteList: (list: (Filter & Key)[]) => Promise<Key[]>;
  get: (key: Key) => Promise<Full | null>;
  update: (key: Key, value: Update | null) => Promise<Key | null>;
  delete: (key: Key) => Promise<Key | null>;
};
