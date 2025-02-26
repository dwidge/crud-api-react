export type FilterValue = string | string[] | undefined;

export type FilterObject = {
  [key: string]: FilterValue | FilterObject | (FilterValue | FilterObject)[];
};

/**
 * Converts a Record<string, string | string[]> from useLocalSearchParams
 * to an FilterObject using generic key parsing and deep merge with index handling.
 *
 * Assumes that:
 * - Keys with '$' indicate nested structure. e.g., 'filter$price$range$start'
 * - The structure of the key directly maps to the structure of FilterObject.
 */
export function getFilterObjectFromSearchParams(
  searchParams: Record<string, string | string[]>,
): FilterObject {
  let filterObject: FilterObject = {};

  for (const key in searchParams) {
    if (Object.prototype.hasOwnProperty.call(searchParams, key)) {
      const value = searchParams[key];
      const nestedObject = parseKeyToNestedObject(key, value);
      filterObject = deepMergeWithArrayConcat(filterObject, nestedObject);
    }
  }

  return normalizeFilterObject(filterObject);
}

/**
 * Converts an FilterObject to a Record<string, string | string[]>
 * using generic key flattening with index handling.
 */
export function getSearchParamsFromFilterObject(
  filterObject: FilterObject,
): Record<string, string | string[]> {
  const searchParams: Record<string, string | string[]> = {};
  // Pass the top-level keys count so that—for a sole key with a pure array—we can emit unflattened arrays.
  flattenObjectToSearchParams(filterObject, searchParams);
  return searchParams;
}

/**
 * Helper function to parse a key string with '$' delimiters into a nested object.
 * e.g., parseKeyToNestedObject('filter$price$range$start', '10')
 *      returns { filter: { price: { range: { start: '10' } } } }
 * Use numeric parts of keys as array indices.
 * e.g., parseKeyToNestedObject('items$0$property', 'value')
 *      returns { items: { '0': { property: 'value' } } }  (Note: '0' is a string key)
 */
function parseKeyToNestedObject(key: string, value: string | string[]): any {
  const keys = key.split("$");
  let currentObject: any = {};
  let temp = currentObject;

  for (let i = 0; i < keys.length - 1; i++) {
    const currentKey = keys[i];
    temp[currentKey] = temp[currentKey] || {};
    temp = temp[currentKey];
  }

  const lastKey = keys[keys.length - 1];
  if (Array.isArray(value)) {
    temp[lastKey] = value.map((item) => parseFilterValue(item, lastKey));
  } else {
    temp[lastKey] = parseFilterValue(value, lastKey);
  }

  return currentObject;
}

/**
 * Helper function for deep merge of objects, concatenating arrays.
 * In particular, if one value is an object and the other is an array,
 * the object is “lifted” into an array.
 */
function deepMergeWithArrayConcat(obj1: any, obj2: any): any {
  const output = { ...obj1 };

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      const val2 = obj2[key];
      const val1 = obj1 ? obj1[key] : undefined;

      if (Array.isArray(val2)) {
        if (val1 !== undefined && !Array.isArray(val1)) {
          // Merge an existing (non–array) value with an array:
          output[key] = [val1].concat(val2);
        } else {
          // Both are arrays (or undefined on left)
          const arr = val1 && Array.isArray(val1) ? [...val1] : [];
          val2.forEach((item: any, index: number) => {
            if (
              item &&
              typeof item === "object" &&
              arr[index] &&
              typeof arr[index] === "object"
            ) {
              arr[index] = deepMergeWithArrayConcat(arr[index], item);
            } else {
              arr[index] = item;
            }
          });
          output[key] = arr;
        }
      } else if (
        val1 !== undefined &&
        typeof val1 === "object" &&
        !Array.isArray(val1) &&
        typeof val2 === "object" &&
        !Array.isArray(val2)
      ) {
        output[key] = deepMergeWithArrayConcat(val1, val2);
      } else if (
        val1 !== undefined &&
        !Array.isArray(val1) &&
        !Array.isArray(val2)
      ) {
        // If both exist and are primitives, combine into an array.
        output[key] = output[key] !== undefined ? [output[key], val2] : val2;
      } else {
        output[key] = val2;
      }
    }
  }
  return output;
}

/**
 * After merging, some keys (especially those coming from indexed search-params)
 * may be plain objects whose keys are all numeric.
 * This helper recursively converts such objects into arrays.
 */
function normalizeFilterObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeFilterObject);
  } else if (obj !== null && typeof obj === "object") {
    const normalized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        normalized[key] = normalizeFilterObject(obj[key]);
      }
    }
    const keys = Object.keys(normalized);
    if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
      const sorted = keys.map(Number).sort((a, b) => a - b);
      if (sorted[0] === 0 && sorted[sorted.length - 1] === sorted.length - 1) {
        const arr: any[] = [];
        for (let i = 0; i < sorted.length; i++) {
          if (normalized[i] === undefined) {
            return normalized;
          }
          arr.push(normalized[i]);
        }
        return arr;
      }
    }
    return normalized;
  }
  return obj;
}

/**
 * Helper function to flatten a nested FilterObject into search params with index handling.
 *
 * The flattening strategy is as follows:
 * - At the top–level:
 *   • For a sole key with an array of primitives, we leave it unflattened.
 *   • For a sole key with a mixed array (object plus primitives),
 *     we “lift” the object element (if it came from non–indexed keys)
 *     so that its flattened keys appear without an index and assign the
 *     primitive remainder to the base key.
 * - Otherwise, we always add indices.
 *
 * For nested objects (i.e. when prefix !== ""), we always flatten with indices.
 */
function flattenObjectToSearchParams(
  filterObject: any,
  searchParams: Record<string, string | string[]>,
  prefix: string = "",
  topLevelKeysCount?: number,
) {
  if (prefix === "" && topLevelKeysCount === undefined) {
    topLevelKeysCount = Object.keys(filterObject).length;
  }
  for (const key in filterObject) {
    if (Object.prototype.hasOwnProperty.call(filterObject, key)) {
      const value = filterObject[key];
      const currentPrefix = prefix ? `${prefix}$${key}` : key;

      if (Array.isArray(value)) {
        const allObjects = value.every(
          (item) => item && typeof item === "object" && !(item instanceof Date),
        );
        const allPrimitives = value.every(
          (item) => typeof item !== "object" || item instanceof Date,
        );
        const isMixed = !allObjects && !allPrimitives;

        // At top-level and only key, try to preserve a simple array.
        if (prefix === "" && allPrimitives && topLevelKeysCount === 1) {
          searchParams[key] = value.map(String);
        } else if (
          prefix === "" &&
          !allObjects &&
          topLevelKeysCount === 1 &&
          isMixed &&
          value.length > 0 &&
          value[0] &&
          typeof value[0] === "object" &&
          !Array.isArray(value[0])
        ) {
          // For a mixed array at the sole top–level key (e.g. Complex combo encoding),
          // flatten the first (object) element without an index…
          flattenObjectToSearchParams(value[0], searchParams, key, 0);
          // …and assign the remaining primitives (if any) to the base key.
          const primitives = value
            .slice(1)
            .filter((item) => typeof item !== "object" || item instanceof Date)
            .map(String);
          if (primitives.length > 0) {
            searchParams[key] = primitives;
          }
        } else {
          // In all other cases (nested arrays, multiple top–level keys, homogeneous arrays)
          // always flatten with indices.
          value.forEach((item, index) => {
            const indexedKey = `${currentPrefix}$${index}`;
            if (item && typeof item === "object" && !(item instanceof Date)) {
              flattenObjectToSearchParams(item, searchParams, indexedKey);
            } else if (item !== undefined) {
              addSearchParam(searchParams, indexedKey, String(item));
            }
          });
        }
      } else if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        flattenObjectToSearchParams(value, searchParams, currentPrefix);
      } else if (value !== undefined) {
        addSearchParam(searchParams, currentPrefix, String(value));
      }
    }
  }
}

/**
 * Helper function to parse string values from search params.
 * Simply returns the value as a string.
 */
function parseFilterValue(value: string, key: string): FilterValue {
  return value;
}

/**
 * Helper function to add a search parameter, handling array values.
 */
function addSearchParam(
  searchParams: Record<string, string | string[]>,
  key: string,
  value: string,
) {
  if (searchParams[key] === undefined) {
    searchParams[key] = value;
  } else if (Array.isArray(searchParams[key])) {
    (searchParams[key] as string[]).push(value);
  } else {
    searchParams[key] = [searchParams[key] as string, value];
  }
}
