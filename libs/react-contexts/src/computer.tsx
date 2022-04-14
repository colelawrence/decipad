import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { Computer } from '@decipad/language';

export type ComputerContextValue = Computer;

const ComputerContext = createContext<ComputerContextValue>(new Computer());

export const ComputerContextProvider: FC<{
  children?: ReactNode;
  computer?: Computer;
}> = ({ children, computer }) => {
  const [value] = useState(() => computer ?? new Computer());
  return (
    <ComputerContext.Provider value={value}>
      {children}
    </ComputerContext.Provider>
  );
};

export const useComputer = (): Computer => useContext(ComputerContext);
