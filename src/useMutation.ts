// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import useSWRMutation from "swr/mutation";
import { Arguments, useSWRConfig } from "swr";

export const useMutation = <Req, Res>(
  key: Arguments,
  fetcher: (extra: Req) => Promise<Res>,
  enable: boolean,
) => {
  const m = useSWRMutation(key, useArg(fetcher));
  const u = useUpdater(key);

  type F = (extra: Req) => Promise<Res>;
  const request = (extra: Req) => (m.trigger as F)(extra).then(u);
  return enable ? request : undefined;
};

const useArg =
  <R, B>(f: (v: B) => Promise<R>) =>
  (_k: unknown, { arg }: { arg: B }) =>
    f(arg);

const useUpdater =
  (keyFilter: Arguments, swr = useSWRConfig()) =>
  <T>(r: T): Promise<T> =>
    swr
      .mutate(
        (key) =>
          key instanceof Array &&
          keyFilter instanceof Array &&
          keyFilter.every((k, i) => k === key[i]),
      )
      .then(() => r);
