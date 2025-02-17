// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import axios, { AxiosError, AxiosInstance } from "axios";

export type Fetch = <R, B>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: B,
  signal?: AbortSignal,
) => Promise<R>;

export const useFetch =
  (
    axiosInstance: AxiosInstance = axios,
    baseURL?: string,
    token?: string | null,
  ): Fetch =>
  (method, url, data, signal?: AbortSignal) =>
    axiosInstance
      .request({
        signal,
        url,
        method,
        data,
        baseURL,
        headers: token ? { Authorization: token } : {},
      })
      .then((r) => r.data);
// .catch((e) => {
//   throw e instanceof AxiosError
//     ? new Error(e.message, {
//         cause: {
//           code: e.code,
//           message: e.message,
//           url: e.config?.url,
//           method: e.config?.method,
//           headers: e.config?.headers,
//           data: e.response?.data,
//           status: e.response?.status,
//         },
//       })
//     : e;
// });

export const useAbortableFetch =
  (fetch: Fetch, defaultSignal?: AbortSignal): Fetch =>
  (method, url, data, signal?: AbortSignal) =>
    fetch(method, url, data, signal ?? defaultSignal);
