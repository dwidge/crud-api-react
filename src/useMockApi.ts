// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Api } from "./Api.js";
import { FilterType } from "./useApi.js";
import { useMockState } from "./useMockState.js";

export const useMockApi = <
  Id,
  Key extends { id?: Id },
  Mini extends Key,
  Full extends Mini,
  Filter extends FilterType,
  Create,
  Update extends Key,
>(
  list = useMockState<Full[]>([]),
  createRandom: () => Full,
): Api<Id, Key, Mini, Full, Filter, Create, Update> => ({
  getList: async () => {
    const [currentList] = list;
    const filteredList = currentList.filter(() => true);
    return filteredList;
  },
  createList: async (newList) => {
    const [currentList, setList] = list;
    const createdItems: Full[] = newList.map((item) => ({
      ...createRandom(),
      ...item,
    }));

    setList([...currentList, ...createdItems]);
    return createdItems.map((item) => ({ id: item.id }) as Key);
  },
  updateList: async (updateList) => {
    const [currentList, setList] = list;
    const updated: Full[] = updateList.map((update) => {
      const prev = currentList.find((prop) => prop.id === update.id);
      if (prev) return { ...prev, ...update };
      else return { ...createRandom(), ...update };
    });
    setList(
      currentList.map((prop) => {
        const updatedItem = updated.find((u) => u.id === prop.id);
        return updatedItem ? updatedItem : prop;
      }),
    );
    return updated.map((v) => ({ id: v.id }) as Key);
  },
  deleteList: async (filterList) => {
    const [currentList, setList] = list;
    const deleted = currentList.filter((prop) =>
      filterList.find((f) => f.id === prop.id),
    );
    setList(
      currentList.filter((prop) => !filterList.find((f) => f.id === prop.id)),
    );
    return deleted.map((v) => ({ id: v.id }) as Key);
  },
  get: async (key) => {
    const [currentList] = list;
    const item = currentList.find((prop) => prop.id === key.id);
    return item ?? null;
  },
  update: async (key, value) => {
    const [currentList, setList] = list;
    const updatedList = currentList.map((prop) => {
      if (prop.id === key.id) {
        return value ? { ...prop, ...value } : null;
      }
      return prop;
    });
    setList(updatedList.filter((v): v is Full => v !== null));
    return key;
  },
  delete: async (key) => {
    const [currentList, setList] = list;
    const updatedList = currentList.filter((prop) => prop.id !== key.id);
    setList(updatedList);
    return updatedList.length !== currentList.length ? key : null;
  },
});
