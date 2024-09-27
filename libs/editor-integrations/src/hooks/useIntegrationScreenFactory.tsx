import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useConnectionStore } from '@decipad/react-contexts';
import { useNotebookRoute } from '@decipad/routing';
import { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';
import { Connection } from '../connections/Connection';
import { ResultPreview } from '../connections/ResultPreview';
import { type GenericContainerRunner } from '../runners/types';
import { useComputer } from '@decipad/editor-hooks';

/**
 * Factory method to return different integrations based on state.
 * Used to abstract away the selection of integration screens.
 */
export const useIntegrationScreenFactory = (
  workspaceId: string,
  runner: GenericContainerRunner,
  onRun: () => void,
  externalData: ExternalDataSourceFragmentFragment | undefined,
  setExternalData: (_: ExternalDataSourceFragmentFragment | undefined) => void,
  loading: boolean
): ReactNode => {
  const { Set, ...store } = useConnectionStore();

  const { notebookId } = useNotebookRoute();
  const computer = useComputer();

  const screen = useMemo(() => {
    switch (store.stage) {
      case 'connect':
        return (
          <Connection
            type={store.connectionType!}
            workspaceId={workspaceId}
            notebookId={notebookId}
            runner={runner}
            onRun={onRun}
            externalData={externalData}
            setExternalData={setExternalData}
          />
        );
      case 'map':
        return (
          <ResultPreview
            computer={computer}
            loading={loading}
            blockId={store.blockId}
            name={store.varName || ''}
            setName={(name) => Set({ varName: name })}
            setTypeMapping={(index, type) => {
              runner.setTypeIndex(index, type);
              onRun();
            }}
            timeOfLastRun={store.timeOfLastRun}
            columnsToHide={store.columnsToHide}
            setColumnsToHide={(c) => Set({ columnsToHide: c })}
            isFirstRowHeader={runner.getIsFirstRowHeader()}
            setFirstRowHeader={(v) => {
              runner.setIsFirstRowHeader(v);
              onRun();
            }}
          />
        );
      case 'pick-integration':
        throw new Error('should not reach here if pick integration');
    }
  }, [
    Set,
    computer,
    externalData,
    loading,
    notebookId,
    onRun,
    runner,
    setExternalData,
    store.columnsToHide,
    store.connectionType,
    store.blockId,
    store.stage,
    store.timeOfLastRun,
    store.varName,
    workspaceId,
  ]);

  return screen;
};
