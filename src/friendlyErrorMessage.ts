// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { AxiosError, isAxiosError } from "axios";

export const friendlyErrorMessage = (v: string | Error) =>
  getUserMessage(v instanceof Error ? getErrorMessage(v) : `${v}`);

const getUserMessage = (message?: string) =>
  message === "Network Error"
    ? "Could not connect to server"
    : (message?.split(":").at(-1) ?? "Something went wrong");

const getErrorMessage = (e: Error) =>
  isAxiosError(e) ? getAxiosMessage(e) : e.message;

const getAxiosMessage = (e: AxiosError) => getResponseMessage(e.response?.data);

const getResponseMessage = (data: unknown): string | undefined =>
  data && typeof data === "object"
    ? (getDataMessage(data) ?? getDataError(data))
    : typeof data === "string"
      ? data
      : undefined;

const getDataMessage = (data: object): string | undefined =>
  "message" in data && typeof data.message === "string"
    ? data.message
    : undefined;

const getDataError = (data: object): string | undefined =>
  "error" in data && typeof data.error === "string" ? data.error : undefined;
