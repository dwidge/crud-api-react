export type DbItem3<Id extends number = number> = {
  id: Id;
  updatedAt: number;
  createdAt: number;
  deletedAt: number | null;
  authorId: Id | null;
  companyId: Id | null;
};

export type DbCreate3<T extends DbItem3> = Partial<T> &
  Pick<T, "id" | "updatedAt">;
