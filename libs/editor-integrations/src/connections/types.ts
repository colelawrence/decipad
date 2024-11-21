import type {
  ImportElementSource,
  IntegrationTypes,
} from '@decipad/editor-types';
import { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';
import { Dataset, TExecution } from '@decipad/interfaces';
import { Runner } from '@decipad/notebook-tabs';

export interface ConnectionProps {
  workspaceId: string;
  notebookId: string;

  connectionType: ImportElementSource;

  runner: Runner;
  onRun: () => void;

  externalData?: ExternalDataSourceFragmentFragment;
  setExternalData: (_: ExternalDataSourceFragmentFragment | undefined) => void;

  type: 'create' | 'edit';
  stage: 'connect' | 'map';

  id: string;

  onChangeVarName: (varName: string) => void;
  varName: string;

  info: Array<TExecution>;
  onExecute: (_: Array<TExecution>) => void;

  onChangeColumnName: (originalColumnName: string, columnName: string) => void;

  hiddenColumns: Array<string>;
  onToggleHideColumn: (columnName: string) => void;
}

export type IntegrationProps =
  | {
      type: 'create';
      workspaceId: string;
      integrationBlock?: undefined;
    }
  | {
      type: 'edit';
      integrationBlock: IntegrationTypes.IntegrationBlock;
      connectionType: ImportElementSource;
      workspaceId: string;
    };

export type UseConcreteIntegrationReturn = {
  onClose: () => void;
  stage: 'connect' | 'map';
  connectionProps: ConnectionProps;
  onContinue: () => void;
  onBack: () => void;
};

export type ConcreteIntegrationProps = IntegrationProps & {
  onReset: () => void;

  connectionType: ImportElementSource;
  existingDataset: Dataset | undefined;
};
