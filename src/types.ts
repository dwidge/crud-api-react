import { AsyncState } from "@dwidge/hooks-react";

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

export type ApiGetListHook<T> = {
  <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {
      columns: K[];
    },
  ): Pick<T, K>[] | undefined;
  (
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {},
  ): T[] | undefined;
};

export type ApiGetList<T> = {
  <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {
      columns?: K[];
    },
  ): Promise<Pick<T, K>[]>;
  (filter?: ApiFilterObject<T>, options?: QueryOptions<T> & {}): Promise<T[]>;
};

export type ApiSetList<T, PK> = <V extends Partial<T>>(
  list: V[],
) => Promise<PK[]>;

export type ApiGetItemHook<T> = {
  <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {
      columns: K[];
    },
  ): Pick<T, K> | null | undefined;
  (
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {},
  ): T | null | undefined;
};

export type ApiGetItem<T> = {
  <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {
      columns: K[];
    },
  ): Promise<Pick<T, K> | null>;
  (
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {},
  ): Promise<T | null>;
};

export type ApiSetItem<T, PK> = <V extends Partial<T>>(
  item: Partial<T>,
) => Promise<PK | null>;

export interface QueryOptions<T> {
  offset?: number;
  limit?: number;
  order?: [column: keyof T, direction: "ASC" | "DESC"][];
  history?: number;
  from?: number;
}

export type StringKey<T> = keyof T extends string ? keyof T : never;

export type ApiListHook<T, PK> = {
  <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {
      columns: K[];
    },
  ): [
    items: Pick<T, K>[] | undefined,
    setItems: ApiSetList<T, PK> | undefined,
    delItems: ApiSetList<T, PK> | undefined,
  ];
  (
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {},
  ): [
    items: T[] | undefined,
    setItems: ApiSetList<T, PK> | undefined,
    delItems: ApiSetList<T, PK> | undefined,
  ];
};

export type ApiItemHook<T> = {
  <K extends keyof T>(
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {
      columns: K[];
    },
  ): AsyncState<Pick<T, K> | null, Partial<T> | null>;
  (
    filter?: ApiFilterObject<T>,
    options?: QueryOptions<T> & {},
  ): AsyncState<T | null, Partial<T> | null>;
};
