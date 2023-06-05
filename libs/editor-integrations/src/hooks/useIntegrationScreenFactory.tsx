import { ReactNode, useMemo } from 'react';
import { SelectIntegration } from '@decipad/ui';
import { IntegrationStore, useConnectionStore } from '@decipad/react-contexts';
import { IntegrationList, Connection, ResultPreview } from '../Connections';

/**
 * Factory method to return different integrations based on state.
 * Used to abstract away the selection of integration screens.
 */
export const useIntegrationScreenFactory = () => {
  const store = useConnectionStore((state) => ({
    connectionType: state.connectionType,
    resultPreview: state.resultPreview,
    varName: state.varName,
    stage: state.stage,
    setVarName: state.setVarName,
    setResultPreview: state.setResultPreview,
  }));

  const componentMap: Record<IntegrationStore['stage'], ReactNode> = useMemo(
    () => ({
      'pick-integration': <SelectIntegration integrations={IntegrationList} />,
      'pick-source': null,
      connect: (
        <Connection
          type={store.connectionType}
          setResultPreview={store.setResultPreview}
        />
      ),
      'create-query': null,
      map: (
        <ResultPreview
          result={store.resultPreview}
          name={store.varName || ''}
          setName={store.setVarName}
        />
      ),
      settings: null,
    }),
    [store]
  );

  return useMemo(() => componentMap[store.stage], [componentMap, store.stage]);
};
