import { FC, useEffect } from 'react';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  useComputer,
  useConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { importFromJSONAndCoercions } from '@decipad/import';
import { fetchQuery } from '../utils';
import { ConcreteIntegrationBlock } from 'libs/editor-types/src/integrations';
import { useIntegrationOptions } from '../hooks';

export const SQLIntegration: FC<ConcreteIntegrationBlock<'mysql'>> = ({
  typeMappings,
  blockOptions,
  id,
  varName,
}): null => {
  const computer = useComputer();

  const store = useConnectionStore();
  const sqlStore = useSQLConnectionStore();

  useEffect(() => {
    const result = importFromJSONAndCoercions(
      blockOptions.latestResult,
      typeMappings
    );
    if (result) {
      pushResultToComputer(computer, id, varName, result);
    }
  }, [computer, blockOptions.latestResult, id, varName, typeMappings]);

  useIntegrationOptions({
    onRefresh() {
      fetchQuery(blockOptions.externalDataUrl, blockOptions.query).then(
        (res) => {
          if (res?.type === 'success') {
            const result = importFromJSONAndCoercions(
              JSON.stringify(res.data),
              typeMappings
            );
            if (result) {
              pushResultToComputer(computer, id, varName, result);
            }
          }
          // TODO: Handle error case
        }
      );
    },
    onShowSource() {
      store.abort();
      store.setConnectionType('mysql');
      store.setStage('connect');
      store.setExistingIntegration(id);

      const res = importFromJSONAndCoercions(
        blockOptions.latestResult,
        typeMappings
      );
      if (res) {
        store.setResultPreview(res);
      }

      store.setAllTypeMapping(typeMappings);
      store.setVarName(varName);
      store.changeOpen(true);

      sqlStore.Set({
        Query: blockOptions.query,
        latestResult: blockOptions.latestResult,
        ExternalDataName: blockOptions.externalDataName,
        ExternalDataId: blockOptions.externalDataUrl,
      });
    },
    onDelete() {
      pushResultToComputer(computer, id, varName, undefined);
    },
  });

  return null;
};
