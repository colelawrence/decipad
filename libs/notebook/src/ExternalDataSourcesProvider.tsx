import { FC, PropsWithChildren } from 'react';
import { ExternalDataSourcesContextProvider } from '@decipad/react-contexts';
import type { ExternalDataSourcesContextValue } from '@decipad/interfaces';

interface ExternalDataSourcesProviderProps {
  notebookId: string;
  useExternalDataSources: (
    notebookId: string
  ) => ExternalDataSourcesContextValue;
}

export const ExternalDataSourcesProvider: FC<
  PropsWithChildren<ExternalDataSourcesProviderProps>
> = ({ notebookId, useExternalDataSources, children }) => (
  <ExternalDataSourcesContextProvider
    provider={useExternalDataSources(notebookId)}
  >
    {children}
  </ExternalDataSourcesContextProvider>
);
