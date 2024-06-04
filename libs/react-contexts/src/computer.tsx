import type { FC, ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Computer } from '@decipad/computer-interfaces';
import { getRemoteComputer } from '@decipad/remote-computer';

export type ComputerContextValue = Computer;

const ComputerContext = createContext<ComputerContextValue>(
  getRemoteComputer()
);

export const ComputerContextProvider: FC<{
  children?: ReactNode;
  computer?: Computer;
}> = ({ children, computer }) => {
  return (
    <ComputerContext.Provider value={computer ?? getRemoteComputer()}>
      {children}
    </ComputerContext.Provider>
  );
};

export const useComputer = (): Computer => useContext(ComputerContext);
