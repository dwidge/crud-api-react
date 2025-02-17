export type ConvertItem<A, D> = (v: A) => D;
export type AssertItem<T> = ConvertItem<T, T>;
export type ParseItem<T> = ConvertItem<any, T>;

export type ApiRecord = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ApiItem<Id extends string = string> = {
  id: Id;
};
export type ApiItem1<Id extends string = string> = {
  id: Id;
  created: boolean;
  createdAt: number;
  createdBy: number | null;
};
export type ApiItem2<Id extends string = string> = {
  id: Id;
  updatedAt: number;
  createdAt: number;
  deletedAt: number | null;
  createdBy: number | null;
};
export type ApiItem3<Id extends string = string> = {
  id: Id;
  updatedAt: number;
  createdAt: number;
  deletedAt: number | null;
  authorId: Id | null;
  companyId: Id | null;
};
export type ApiWmdbItem1<Id extends string = string> = {
  id: Id;
  updatedAt: number;
  createdAt: number;
  deletedAt: number | null;
};

export type ApiReturn<T, K extends keyof T> = K[] extends undefined
  ? T
  : Pick<T, K>;
export type ApiFilter<T> = {
  [P in keyof T]?: T[P] | T[P][];
};

export type ApiFilterValue<T> =
  | T[keyof T]
  | { $range: [T[keyof T] | undefined, T[keyof T] | undefined] }
  | { $not: T[keyof T] };
export type ApiFilterObject<T> = {
  [P in keyof T]?: ApiFilterValue<T> | ApiFilterValue<T>[];
};
export type ApiDefaultObject<T> = {
  [P in keyof T]?: T[P];
};

export type ApiGetListHook<T> = <K extends keyof T>(
  filter?: ApiFilterObject<T>,
  options?: QueryOptions<K>,
) => ApiReturn<T, K>[] | undefined;

export type ApiGetList<T> = <K extends keyof T>(
  filter?: ApiFilterObject<T>,
  options?: QueryOptions<K>,
) => Promise<ApiReturn<T, K>[]>;

export type ApiSetList<T, PK> = <V extends Partial<T>>(
  list: V[],
) => Promise<PK[]>;

export type ApiGetItemHook<T> = <K extends keyof T>(
  filter?: ApiDefaultObject<T>,
  options?: QueryOptions<K>,
) => ApiReturn<T, K> | null | undefined;

export type ApiGetItem<T> = {
  <K extends keyof T>(
    filter?: ApiDefaultObject<T>,
    options?: QueryOptions<K>,
  ): Promise<ApiReturn<T, K> | null>;
};

export type ApiSetItem<T, PK> = <V extends Partial<T>>(
  item: Partial<T>,
) => Promise<PK | null>;

export interface QueryOptions<K> {
  offset?: number;
  limit?: number;
  columns?: K[];
  order?: [column: K, direction: "ASC" | "DESC"][];
}

export type StringKey<T> = keyof T extends string ? keyof T : never;
