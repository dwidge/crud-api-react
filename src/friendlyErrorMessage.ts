// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { AxiosError } from "axios";

export const friendlyErrorMessage = (v: string | Error) =>
  v instanceof Error ? errorMessage(v) ?? "Something went wrong" : v;

const errorMessage = (e: Error) =>
  e instanceof AxiosError ? responseUserMessage(e) : undefined;

const responseUserMessage = (e: AxiosError) =>
  e.message === "Network Error"
    ? "Could not connect to server"
    : responseErrorMessage(e)?.split(":").at(-1);

export const responseErrorMessage = (e: AxiosError): string | undefined =>
  typeof e.response?.data === "object" &&
  e.response?.data &&
  "message" in e.response.data &&
  typeof e.response.data.message === "string"
    ? e.response.data.message
    : typeof e.response?.data === "string"
    ? e.response?.data
    : undefined;
