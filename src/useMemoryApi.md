## useMemoryApi

The `useMemoryApi` hook provides an in‑memory API implementation that follows a standardized interface for list and item operations. It is designed for managing records in local state (using an AsyncState tuple) and offers common CRUD (create, read, update, delete, restore) operations along with filtering, sorting, and pagination.

### Key Features

- **Typed API operations:** The hook uses TypeScript generics to enforce that records include required fields (such as `id`, `createdAt`, `updatedAt`, and `deletedAt`).
- **Flexible filtering:** Supports filtering by various conditions including value equality, ranges (`$range`), and negation (`$not`).
- **Sorting & Pagination:** Easily sort results based on one or more fields and paginate results with offset and limit.
- **In‑memory state management:** Designed for use with an AsyncState from `@dwidge/hooks-react` so that external state (or read‑only mode) can be integrated.
- **Extensible parsing:** Accept a custom `parse` function to transform items before they are returned.
- **Pre‑update processing:** Optionally preprocess items before creation or update.

### Installation

Ensure you have the necessary dependencies installed:

```bash
npm install @dwidge/hooks-react @dwidge/query-axios-zod
```

### Usage Example

Below is a basic example showing how to initialize and use the hook:

```tsx
import React, { useState } from "react";
import { useMemoryApi } from "./useMemoryApi";

// Define a record type
type User = {
  id: string;
  name: string;
  age: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

// Initial state as an AsyncState tuple
const App = () => {
  const [users, setUsers] = useState<User[] | undefined>([]);
  const asyncUsers: [
    User[] | undefined,
    React.Dispatch<React.SetStateAction<User[] | undefined>>,
  ] = [users, setUsers];

  // Initialize the hook (using default identity parser)
  const api = useMemoryApi<User>(asyncUsers);

  // Get all users
  const allUsers = api.useGetList();

  // Create a new user
  const createUser = async () => {
    const createFn = api.useCreateItem();
    if (createFn) {
      await createFn({ name: "Alice", age: 30 });
    }
  };

  // Update an existing user
  const updateUser = async (id: string) => {
    const updateFn = api.useUpdateItem();
    if (updateFn) {
      await updateFn({ id, age: 31 });
    }
  };

  // Delete a user (soft delete)
  const deleteUser = async (id: string) => {
    const deleteFn = api.useDeleteItem();
    if (deleteFn) {
      await deleteFn({ id });
    }
  };

  return (
    <div>
      <h1>Users</h1>
      <button onClick={createUser}>Add User</button>
      {allUsers?.map((user) => (
        <div key={user.id}>
          <p>
            {user.name} ({user.age})
          </p>
          <button onClick={() => updateUser(user.id)}>Update Age</button>
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default App;
```

### Rationale Behind the Implementation

**Overload Support:**

The hook provides overloaded versions for list and item retrieval. For example, if you specify a `columns` option, only those fields are returned (using TypeScript’s `Pick<>` utility).

**Parsing & Pre‑update Hooks:**

To keep data transformations flexible, you can supply a custom `parser` (to change the format of returned data) or a `pre‑update` hook (to modify data before it is stored).

**Read‑only Mode:**

If the provided AsyncState’s setter is not available (i.e. in read‑only mode), the setter hooks (like `create`/`update`/`delete`) will be undefined. This allows the hook to be used in both read‑only and mutable contexts.

**Type Safety:**

By enforcing that records conform to the `ApiRecord` type and required tracking fields, the hook minimizes runtime errors while providing a consistent API across your application.

### Summary

The `useMemoryApi` hook is a versatile solution for managing local in‑memory data that mimics remote API behavior. It abstracts common CRUD operations and offers built‑in support for filtering, sorting, and pagination—all while maintaining strong TypeScript type safety.
