import { FC, PropsWithChildren } from 'react';
import { ExternalDataSourcesContextProvider } from '@decipad/react-contexts';
import type { ExternalDataSourcesContextValue } from '@decipad/interfaces';

interface ExternalDataSourcesProviderProps {
  externalData: ExternalDataSourcesContextValue;
}

export const ExternalDataSourcesProvider: FC<
  PropsWithChildren<ExternalDataSourcesProviderProps>
> = ({ externalData, children }) => (
  <ExternalDataSourcesContextProvider provider={externalData}>
    {children}
  </ExternalDataSourcesContextProvider>
);
