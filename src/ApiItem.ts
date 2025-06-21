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

export type ApiCreate3<T extends ApiItem3> = Partial<T> &
  Omit<
    T,
    "id" | "createdAt" | "updatedAt" | "deletedAt" | "authorId" | "companyId"
  >;
