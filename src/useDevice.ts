// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import useSWR from "swr";
import z from "zod";
import { randId } from "./randId.js";

export const useDeviceId = (key = "deviceId"): string | undefined => {
  const h = useSWR<string, Error>(() => key);
  let r = h.data;
  if (
    !h.isLoading &&
    !h.isValidating &&
    (h.data === undefined || z.ostring().safeParse(h.data).success === false)
  ) {
    r = z.string().parse(randId(12));
    h.mutate(r);
  }
  return z.ostring().parse(r);
};
