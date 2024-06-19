import type { ImportElementSource } from '@decipad/editor-types';
import { GenericContainerRunner } from '../runners';
import { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';

export interface ConnectionProps {
  workspaceId: string;
  notebookId: string;

  type: ImportElementSource;

  runner: GenericContainerRunner;
  onRun: () => void;

  setExternalData: (_: ExternalDataSourceFragmentFragment | undefined) => void;
  externalData: ExternalDataSourceFragmentFragment | undefined;
}
