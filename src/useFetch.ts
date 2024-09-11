// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import axios, { AxiosError, AxiosInstance } from "axios";
import { responseErrorMessage } from "./friendlyErrorMessage.js";

export type Fetch = <R, B>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: B
) => Promise<R>;

export const useFetch =
  (
    axiosInstance: AxiosInstance = axios,
    baseURL?: string,
    token?: string
  ): Fetch =>
  (method, url, data) =>
    axiosInstance
      .request({
        url,
        method,
        data,
        baseURL,
        headers: token ? { Authorization: token } : {},
      })
      .then((r) => r.data)
      .catch((e) => {
        throw e instanceof AxiosError
          ? new Error(responseErrorMessage(e) ?? e.message, {
              cause: {
                code: e.code,
                message: e.message,
                url: e.config?.url,
                method: e.config?.method,
                headers: e.config?.headers,
                data: e.response?.data,
                status: e.response?.status,
              },
            })
          : e;
      });
