import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { ConnectionsMenu, SecretsMenu, SelectIntegration } from '@decipad/ui';
import type { IntegrationStore, TExecution } from '@decipad/react-contexts';
import {
  useConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { IntegrationList, Connection, ResultPreview } from '../Connections';
import { useToast } from '@decipad/toast';

/**
 * Factory method to return different integrations based on state.
 * Used to abstract away the selection of integration screens.
 */
export const useIntegrationScreenFactory = (workspaceId: string): ReactNode => {
  const { warning, Set, ...store } = useConnectionStore();
  const toast = useToast();

  useEffect(() => {
    if (warning) {
      toast('This type cannot be used for this value', 'warning');
      Set({ warning: undefined });
    }
  }, [Set, warning, toast]);

  const componentMap: Record<IntegrationStore['stage'], ReactNode> = useMemo(
    () => ({
      'pick-integration': <SelectIntegration integrations={IntegrationList} />,
      connect: (
        <Connection
          workspaceId={workspaceId}
          type={store.connectionType}
          typeMapping={store.resultTypeMapping}
          setResultPreview={(r) => Set({ resultPreview: r })}
          setRawResult={(r) => Set({ rawResult: r })}
        />
      ),
      map: (
        <ResultPreview
          result={store.rawResult != null ? store.resultPreview : undefined}
          name={store.varName || ''}
          setName={(name) => Set({ varName: name })}
          setTypeMapping={store.setResultTypeMapping}
        />
      ),
    }),
    [
      Set,
      store.connectionType,
      store.rawResult,
      store.resultPreview,
      store.resultTypeMapping,
      store.setResultTypeMapping,
      store.varName,
      workspaceId,
    ]
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
