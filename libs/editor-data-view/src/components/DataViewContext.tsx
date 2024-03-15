import { createContext, FC, ReactNode, useContext } from 'react';
import { Column } from '../types';

export interface DataViewContextValue {
  columns: Column[] | undefined;
}

export const DataViewContext = createContext<DataViewContextValue>({
  columns: undefined,
});

export const DataViewContextProvider: FC<
  DataViewContextValue & { children: ReactNode }
> = ({ columns, children }) => {
  return (
    <DataViewContext.Provider value={{ columns }}>
      {children}
    </DataViewContext.Provider>
  );
};

export const useDataViewContext = () => {
  return useContext(DataViewContext);
};
