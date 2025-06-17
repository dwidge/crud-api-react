import React, { ReactNode, Suspense, useContext } from "react";
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

export const useLoader = <T,>(v: T | undefined): T => {
  if (v === undefined)
    throw new Error("useLoaderE1: Must wrap component with withLoader()");
  return v;
};
