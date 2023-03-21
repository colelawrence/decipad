import { createContext, FC, PropsWithChildren } from 'react';
import { ExternalDataSourcesContextValue } from '@decipad/interfaces';

const NO_CONTEXT_ERROR_MESSAGE = 'No external data sources context';

const NullExternalDataSourcesContextValue: ExternalDataSourcesContextValue = {
  externalDataSources: [],
  createExternalDataSource: () =>
    Promise.reject(new Error(NO_CONTEXT_ERROR_MESSAGE)),
};

export const ExternalDataSourceContext =
  createContext<ExternalDataSourcesContextValue>(
    NullExternalDataSourcesContextValue
  );

interface ExternalDataSourcesContextProviderProps {
  provider: ExternalDataSourcesContextValue;
}

export const ExternalDataSourcesContextProvider: FC<
  PropsWithChildren<ExternalDataSourcesContextProviderProps>
> = ({ children, provider }) => {
  return (
    <ExternalDataSourceContext.Provider value={provider}>
      {children}
    </ExternalDataSourceContext.Provider>
  );
};
