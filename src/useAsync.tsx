// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useState } from "react";

export const useAsync = <F extends (...args: any[]) => Promise<any>>(
  f: F | undefined
): [f: F | undefined, busy: boolean, error: Error | undefined] => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error>();

  const wrappedFunction =
    f &&
    (async (...args: Parameters<F>): Promise<ReturnType<F>> => {
      setBusy(true);
      setError(undefined);
      try {
        const result = await f(...args);
        return result;
      } catch (e) {
        setError(e as Error);
        throw e;
      } finally {
        setBusy(false);
      }
    });

  return [wrappedFunction as F, busy, error];
};
