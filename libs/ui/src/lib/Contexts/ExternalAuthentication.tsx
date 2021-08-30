import { createContext } from 'react';

interface CreateOrUpdateExternalDataOptions {
  authUrl: string;
  padId: string;
  blockId: string;
  provider: string;
  externalId: string;
  externalDataSourceId?: string;
  error?: string;
}

export type ExternalAuthenticationContextValue = {
  createOrUpdateExternalData?: (
    options: CreateOrUpdateExternalDataOptions
  ) => void;
};

export const ExternalAuthenticationContext =
  createContext<ExternalAuthenticationContextValue>({});

export const ExternalAuthenticationContextProvider =
  ExternalAuthenticationContext.Provider;
export const ExternalAuthenticationContextConsumer =
  ExternalAuthenticationContext.Consumer;
