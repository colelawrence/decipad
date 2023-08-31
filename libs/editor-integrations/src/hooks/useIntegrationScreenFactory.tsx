import { ReactNode, useMemo } from 'react';
import { ConnectionsMenu, SecretsMenu, SelectIntegration } from '@decipad/ui';
import {
  IntegrationStore,
  TExecution,
  useConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { IntegrationList, Connection, ResultPreview } from '../Connections';

/**
 * Factory method to return different integrations based on state.
 * Used to abstract away the selection of integration screens.
 */
export const useIntegrationScreenFactory = (): ReactNode => {
  const store = useConnectionStore((state) => ({
    connectionType: state.connectionType,
    resultPreview: state.resultPreview,
    resultTypeMapping: state.resultTypeMapping,
    rawResult: state.rawResult,
    varName: state.varName,
    stage: state.stage,
    setVarName: state.setVarName,
    setResultPreview: state.setResultPreview,
    setResultTypeMapping: state.setResultTypeMapping,
    setRawResult: state.setRawResult,
  }));

  const componentMap: Record<IntegrationStore['stage'], ReactNode> = useMemo(
    () => ({
      'pick-integration': <SelectIntegration integrations={IntegrationList} />,
      connect: (
        <Connection
          type={store.connectionType}
          typeMapping={store.resultTypeMapping}
          setResultPreview={store.setResultPreview}
          setRawResult={store.setRawResult}
        />
      ),
      map: (
        <ResultPreview
          result={store.rawResult != null ? store.resultPreview : undefined}
          name={store.varName || ''}
          setName={store.setVarName}
          setTypeMapping={store.setResultTypeMapping}
        />
      ),
    }),
    [store]
  );

  return useMemo(() => componentMap[store.stage], [componentMap, store.stage]);
};

export function useConnectionActionMenu(
  workspaceId: string,
  onExecute: (arg: TExecution<boolean>) => void
): ReactNode {
  const [connectionType, stage] = useConnectionStore((state) => [
    state.connectionType,
    state.stage,
  ]);
  const sqlStore = useSQLConnectionStore();

  // Currently, we only need action menus in the connect stage.
  if (stage !== 'connect') {
    return null;
  }

  switch (connectionType) {
    case 'codeconnection':
      return (
        <SecretsMenu
          workspaceId={workspaceId}
          onAddSecret={(secretName) =>
            onExecute({
              status: 'secret',
              name: secretName,
            })
          }
        />
      );
    case 'mysql':
      return (
        <ConnectionsMenu
          workspaceId={workspaceId}
          selectedDataSource={sqlStore.ExternalDataName}
          onSelectConnection={(ExternalDataId, ExternalDataName) => {
            sqlStore.Set({
              ExternalDataId,
              ExternalDataName,
            });
          }}
        />
      );
    default:
      return null;
  }
}
