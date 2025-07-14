import React, {
  PropsWithChildren,
  ReactNode,
  Suspense,
  useContext,
  useEffect,
  useRef,
} from "react";
import { SWRConfig } from "swr";

export const LoaderContext = React.createContext<ReactNode | undefined>(
  undefined,
);

export function withLoader<P>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return function (props: P) {
    const Loader = useContext(LoaderContext);
    return (
      <SWRConfig value={{ suspense: true }}>
        <Suspense fallback={Loader}>
          <Component {...(props as React.JSX.IntrinsicAttributes & P)} />
        </Suspense>
      </SWRConfig>
    );
  };
}

export const Loader = ({ children }: PropsWithChildren) => (
  <SWRConfig value={{ suspense: true }}>
    <Suspense fallback={useContext(LoaderContext)}>{children}</Suspense>
  </SWRConfig>
);

/**
 * React hook that watches a value and throws a Promise if the value is `undefined`.
 * This is useful for implementing React Suspense-like behavior for any value.
 *
 * If the value is `undefined`, the hook throws a Promise that will resolve when the value becomes defined.
 * If the value is defined, it is returned directly.
 *
 * The hook also ensures that the Promise is resolved and cleaned up when the value changes to a defined state.
 *
 * @template T - The type of the value being watched.
 * @param {T | undefined} value - The value to watch. If `undefined`, the hook will suspend.
 * @returns {T} - The defined value.
 * @throws {Promise<void>} - Throws a Promise if the value is `undefined`, causing React Suspense to suspend rendering.
 *
 * @example
 * ```tsx
 * const data = useLoader(resource);
 * // If resource is undefined, this component will suspend until resource is defined.
 * ```
 */
export const useLoader = <T,>(value: T | undefined): T => {
  const promiseRef = useRef<{
    promise: Promise<void>;
    resolve: (() => void) | null;
  } | null>(null);

  if (value === undefined) {
    if (!promiseRef.current) {
      let resolve: () => void;
      const promise = new Promise<void>((res) => {
        resolve = res;
      });
      promiseRef.current = { promise, resolve: resolve! };
    }
    throw promiseRef.current.promise;
  } else if (promiseRef.current) {
    promiseRef.current.resolve?.();
    promiseRef.current = null;
  }

  useEffect(() => {
    if (value !== undefined && promiseRef.current) {
      promiseRef.current.resolve?.();
      promiseRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return value;
};
