// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { AsyncDispatch, AsyncState } from "@dwidge/hooks-react";
import useSWR, { Fetcher } from "swr";

export const useGetLocal = <T>(
  key: string,
  fetcher?: () => Promise<T>,
): T | undefined => useSWR<T>(() => key, fetcher as Fetcher<T>).data;

export const useSetLocal = <T>(key: string): ((v: T | undefined) => void) =>
  useSWR<T>(() => key).mutate;

export const useLocal = <T>(key: string, init?: T): AsyncState<T> => [
  useGetLocal<T>(key) ?? init,
  useSetLocal<T>(key) as AsyncDispatch<T>,
];
