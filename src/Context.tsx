type Context<T> = {
  Provider: ({ value, children }: { value: any; children: any }) => any;
  useContext: () => T;
};

export function createContext<T>(defaultValue: T) {
  let contextValue = defaultValue; // Store the context value in the closure

  function Provider({ value, children }) {
    contextValue = value; // Set the context value for this scope
    return children; // Just render the children
  }

  function useContext() {
    return contextValue; // Get the current context value from the closure
  }

  return { Provider, useContext };
}

export const useContext = <T,>(c: Context<T>) => c.useContext();
