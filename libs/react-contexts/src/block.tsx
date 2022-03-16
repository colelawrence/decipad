import { createContext, FC, useContext } from 'react';

export const BlockActiveContext = createContext(false);
export const BlockIsActiveProvider: FC = ({ children }) => (
  <BlockActiveContext.Provider value>{children}</BlockActiveContext.Provider>
);
export const useIsBlockActive = (): boolean => useContext(BlockActiveContext);
