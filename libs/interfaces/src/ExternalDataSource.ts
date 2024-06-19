import type { ImportElementSource } from '@decipad/editor-types';
import type {
  AttachmentFragmentFragment,
  ExternalDataSourceFragmentFragment,
} from '@decipad/graphql-client';

export interface ExternalDataSourceKey {
  lastError?: string | null;
  createdAt?: number;
  expiresAt?: number;
  lastUsedAt?: number;
}

export interface CreateExternalDataSourceParams {
  name: string;
  padId: string;
  provider: ImportElementSource;
  externalId: string;
}

export interface ExternalDataSourcesContextValue {
  externalDataSources: ExternalDataSourceFragmentFragment[];
  createExternalDataSource: (
    params: CreateExternalDataSourceParams
  ) => Promise<ExternalDataSourceFragmentFragment>;
}

export type Dataset =
  | {
      type: 'attachment';
      dataset: AttachmentFragmentFragment;
    }
  | {
      type: 'data-source';
      dataset: ExternalDataSourceFragmentFragment;
    };
