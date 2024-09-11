// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

export const useMockState = <T>(initialState: T): [T, (v: T) => void] => {
  const setList = (newList: T) => {
    list[0] = newList;
  };
  const list: [T, (v: T) => void] = [initialState, setList];
  return list;
};
