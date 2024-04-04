import type { FC, PropsWithChildren } from 'react';
import { createContext, useEffect } from 'react';

export type UpdatesContextValue = boolean;

const UpdatesContext = createContext<UpdatesContextValue>(false);

let globalHasUpdate = false;

export const UpdatesContextProvider: FC<
  PropsWithChildren<{
    hasUpdate: boolean;
  }>
> = ({ hasUpdate, children }) => {
  useEffect(() => {
    globalHasUpdate = hasUpdate;
  }, [hasUpdate]);
  return (
    <UpdatesContext.Provider value={hasUpdate}>
      {children}
    </UpdatesContext.Provider>
  );
};

export const hasUpdate = () => globalHasUpdate;
