import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useConnectionStore } from '@decipad/react-contexts';
import { Connection, ResultPreview } from '../connections';
import { notebooks, useRouteParams } from '@decipad/routing';
import { GenericContainerRunner } from '../runners';
import { ExternalDataSourceFragmentFragment } from '@decipad/graphql-client';

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

  const {
    notebook: { id: notebookId },
  } = useRouteParams(notebooks({}).notebook);

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
            loading={loading}
            result={store.rawResult != null ? store.resultPreview : undefined}
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
    externalData,
    loading,
    notebookId,
    onRun,
    runner,
    setExternalData,
    store.columnsToHide,
    store.connectionType,
    store.rawResult,
    store.resultPreview,
    store.stage,
    store.timeOfLastRun,
    store.varName,
    workspaceId,
  ]);

  return screen;
};
