/**
 * Hook for filtering by Id.
 *
 * @template T - A string or number type for the Id.
 *
 * @param {T | null} [id] - The Id to filter by. If null or undefined, no filter is applied.
 *
 * @returns {Object | undefined} A filter object containing the Id if provided, or undefined if no Id is given.
 *
 * @example
 * const filtered = useIdFilter(1); // Returns { id: 1 }
 * const noFilter1 = useIdFilter(); // Returns undefined
 * const noFilter2 = useIdFilter(null); // Returns undefined
 */
export const useIdFilter = <T extends string | number>(id?: T | null) =>
  id != null ? { id } : undefined;
