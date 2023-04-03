import { ImportElementSource } from '@decipad/editor-types';

export interface ExternalDataSourceKey {
  lastError?: string | null;
  createdAt?: number;
  expiresAt?: number;
  lastUsedAt?: number;
}

export interface ExternalDataSource {
  id: string;
  padId: string;
  provider: ImportElementSource;
  dataUrl: string;
  authUrl: string;
  keys: ExternalDataSourceKey[];
}

export interface CreateExternalDataSourceParams {
  name: string;
  padId: string;
  provider: ImportElementSource;
  externalId: string;
}

export interface ExternalDataSourcesContextValue {
  externalDataSources: ExternalDataSource[];
  createExternalDataSource: (
    params: CreateExternalDataSourceParams
  ) => Promise<ExternalDataSource>;
}
