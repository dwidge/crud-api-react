// Copyright DWJ 2023.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

// https://stackoverflow.com/a/44622300

const rand5bit = () => Math.floor(Math.random() * 32).toString(32);

export const randId = (length = 7) =>
  Array.from(Array(length), rand5bit).join("");
