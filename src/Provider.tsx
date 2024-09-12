// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import React, { PropsWithChildren } from "react";
import { Cache, SWRConfig } from "swr";

export const Provider = ({
  baseUrl,
  cache,
  children,
}: PropsWithChildren<{
  baseUrl?: string;
  cache?: (cache: Readonly<Cache<any>>) => Cache<any>;
}>) => {
  return (
    <SWRConfig
      value={{
        provider: cache,
        fallback: { baseUrl },
        shouldRetryOnError: true,
        errorRetryCount: 1,
        errorRetryInterval: 1000,
        // onErrorRetry: console.log,
        // onError: console.log,
        // revalidateOnMount: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};
