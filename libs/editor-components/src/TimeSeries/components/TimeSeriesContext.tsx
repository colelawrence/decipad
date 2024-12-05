import type { FC, ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Column } from '../types';

export interface TimeSeriesContextValue {
  columns: Column[] | undefined;
}

export const TimeSeriesContext = createContext<TimeSeriesContextValue>({
  columns: undefined,
});

export const TimeSeriesContextProvider: FC<
  TimeSeriesContextValue & { children: ReactNode }
> = ({ columns, children }) => {
  return (
    <TimeSeriesContext.Provider value={{ columns }}>
      {children}
    </TimeSeriesContext.Provider>
  );
};

export const useTimeSeriesContext = () => {
  return useContext(TimeSeriesContext);
};
