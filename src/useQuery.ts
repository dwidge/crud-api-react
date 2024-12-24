// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import useSWR, { Arguments } from "swr";

export const useQuery = <Res>(
  key: Arguments,
  fetcher: () => Promise<Res>,
  enable: boolean
) => {
  const { data, error } = useSWR(key, () => (enable ? fetcher() : undefined));
  if (error) {
    console.log("useQuery1", key, error.message);
    throw error;
  }
  return data;
};
