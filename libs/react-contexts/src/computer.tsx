import { createContext, FC, ReactNode, useContext } from 'react';
import { Computer } from '@decipad/computer';

export type ComputerContextValue = Computer;

const ComputerContext = createContext<ComputerContextValue>(new Computer());

export const ComputerContextProvider: FC<{
  children?: ReactNode;
  computer?: Computer;
}> = ({ children, computer }) => {
  return (
    <ComputerContext.Provider value={computer ?? new Computer()}>
      {children}
    </ComputerContext.Provider>
  );
};

export const useComputer = (): Computer => useContext(ComputerContext);
