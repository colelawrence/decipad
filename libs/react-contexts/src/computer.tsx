import { createContext, FC, ReactNode, useContext } from 'react';
import {
  type RemoteComputer,
  getRemoteComputer,
} from '@decipad/remote-computer';

export type ComputerContextValue = RemoteComputer;

const ComputerContext = createContext<ComputerContextValue>(
  getRemoteComputer()
);

export const ComputerContextProvider: FC<{
  children?: ReactNode;
  computer?: RemoteComputer;
}> = ({ children, computer }) => {
  return (
    <ComputerContext.Provider value={computer ?? getRemoteComputer()}>
      {children}
    </ComputerContext.Provider>
  );
};

export const useComputer = (): RemoteComputer => useContext(ComputerContext);
