// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import useSWR from "swr";
import { randId } from "./randId.js";

export const useDeviceId = (): string | undefined => {
  const h = useSWR<string, Error>(() => "deviceId");
  if (!h.isLoading && !h.isValidating && h.data === undefined)
    h.mutate(randId(12));
  return h.data;
};
