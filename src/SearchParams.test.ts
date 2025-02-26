import { describe, test } from "node:test";
import { expect } from "expect";
import {
  getFilterObjectFromSearchParams,
  getSearchParamsFromFilterObject,
  FilterObject,
} from "./SearchParams.js";

describe("SearchParams", () => {
  test("getFilterObjectFromSearchParams: Range filter merging", () => {
    const searchParams = {
      id$range$start: "1",
      id$range$end: "3",
    };
    const expectedFilter = {
      id: { range: { start: "1", end: "3" } },
    } as FilterObject;
    const actualFilter = getFilterObjectFromSearchParams(searchParams);
    expect(actualFilter).toEqual(expectedFilter);
  });

  test("getFilterObjectFromSearchParams: Array creation for simple values", () => {
    const searchParams = {
      id: ["1", "2"],
    };
    const expectedFilter = {
      id: ["1", "2"],
    } as FilterObject;
    const actualFilter = getFilterObjectFromSearchParams(searchParams);
    expect(actualFilter).toEqual(expectedFilter);
  });

  test("getFilterObjectFromSearchParams: Complex combo - range and simple values", () => {
    const searchParams = {
      id$range$start: "1",
      id$range$end: "3",
      id: ["1", "2"],
    };
    const expectedFilter = {
      id: [{ range: { start: "1", end: "3" } }, "1", "2"],
    } as FilterObject;
    const actualFilter = getFilterObjectFromSearchParams(searchParams);
    expect(actualFilter).toEqual(expectedFilter);
  });

  test("getSearchParamsFromFilterObject: Range filter encoding", () => {
    const filterObject = {
      id: { range: { start: "1", end: "3" } },
    } as FilterObject;
    const expectedSearchParams = {
      id$range$start: "1",
      id$range$end: "3",
    };
    const actualSearchParams = getSearchParamsFromFilterObject(filterObject);
    expect(actualSearchParams).toEqual(expectedSearchParams);
  });

  test("getSearchParamsFromFilterObject: Array encoding for simple values", () => {
    const filterObject = {
      id: ["1", "2"],
    } as FilterObject;
    const expectedSearchParams = {
      id: ["1", "2"],
    };
    const actualSearchParams = getSearchParamsFromFilterObject(filterObject);
    expect(actualSearchParams).toEqual(expectedSearchParams);
  });

  test("getSearchParamsFromFilterObject: Complex combo encoding", () => {
    const filterObject = {
      id: [{ range: { start: "1", end: "3" } }, "1", "2"],
    } as FilterObject;
    const expectedSearchParams = {
      id$range$start: "1",
      id$range$end: "3",
      id: ["1", "2"],
    };
    const actualSearchParams = getSearchParamsFromFilterObject(filterObject);
    expect(actualSearchParams).toEqual(expectedSearchParams);
  });

  test("Round trip: ApiFilterObject -> SearchParams -> ApiFilterObject - Complex", () => {
    const initialFilterObject = {
      filter: {
        name: "Product A",
        price: { range: { start: "10", end: "50" } },
        isActive: { not: "true" },
        category: ["Electronics", "Books"],
        tags: ["featured", "new"],
        createdAt: {
          range: { start: "100000", end: undefined },
        },
        ids: ["1", "2", "3"],
        combined: [{ range: { start: "1", end: "3" } }, "4", "5"],
      },
    } as FilterObject;
    const searchParams = getSearchParamsFromFilterObject(initialFilterObject);
    const finalFilterObject = getFilterObjectFromSearchParams(searchParams);

    expect(finalFilterObject).toEqual(initialFilterObject);
  });

  test("getFilterObjectFromSearchParams: Multiple Range filters for same ID - Simplified Index", () => {
    const searchParams = {
      id$0$range$start: "1",
      id$1$range$start: "5",
      id$1$range$end: "7",
      id$0$range$end: "3",
    };
    const expectedFilter = {
      id: [
        { range: { start: "1", end: "3" } },
        { range: { start: "5", end: "7" } },
      ],
    } as FilterObject;
    const actualFilter = getFilterObjectFromSearchParams(searchParams);
    expect(actualFilter).toEqual(expectedFilter);
  });

  test("getFilterObjectFromSearchParams: Mixed Range and Simple values with indices - Simplified Index", () => {
    const searchParams = {
      id$0$range$start: "1",
      id$0$range$end: "3",
      id$1: "4",
      id$2: "5",
      category$0: "books",
      category$1: "electronics",
    };
    const expectedFilter = {
      id: [{ range: { start: "1", end: "3" } }, "4", "5"],
      category: ["books", "electronics"],
    } as FilterObject;
    const actualFilter = getFilterObjectFromSearchParams(searchParams);
    expect(actualFilter).toEqual(expectedFilter);
  });

  test("getSearchParamsFromFilterObject: Multiple Range filters encoding - Simplified Index", () => {
    const filterObject = {
      id: [
        { range: { start: "1", end: "3" } },
        { range: { start: "5", end: "7" } },
      ],
    } as FilterObject;
    const expectedSearchParams = {
      id$0$range$start: "1",
      id$0$range$end: "3",
      id$1$range$start: "5",
      id$1$range$end: "7",
    };
    const actualSearchParams = getSearchParamsFromFilterObject(filterObject);
    expect(actualSearchParams).toEqual(expectedSearchParams);
  });

  test("getSearchParamsFromFilterObject: Mixed Range and Simple values with indices encoding - Simplified Index", () => {
    const filterObject = {
      id: [{ range: { start: "1", end: "3" } }, "4", "5"],
      category: ["books", "electronics"],
    } as FilterObject;
    const expectedSearchParams = {
      id$0$range$start: "1",
      id$0$range$end: "3",
      id$1: "4",
      id$2: "5",
      category$0: "books",
      category$1: "electronics",
    };
    const actualSearchParams = getSearchParamsFromFilterObject(filterObject);
    expect(actualSearchParams).toEqual(expectedSearchParams);
  });

  test("Round trip: ApiFilterObject with indexed arrays -> SearchParams -> ApiFilterObject - Simplified Index", () => {
    const initialFilterObject = {
      filters: {
        ids: [{ range: { start: "1", end: "3" } }, "4", "5", { not: "6" }],
        categories: ["books", "electronics"],
        names: ["Product A", "Product B"],
      },
    } as FilterObject;
    const searchParams = getSearchParamsFromFilterObject(initialFilterObject);
    const finalFilterObject = getFilterObjectFromSearchParams(searchParams);
    expect(finalFilterObject).toEqual(initialFilterObject);
  });
});
