import { FC, useEffect } from 'react';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  useComputer,
  useConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { IntegrationTypes } from '@decipad/editor-types';
import { useIntegrationContext } from '.';
import { importFromJSONAndCoercions } from '@decipad/import';
import { fetchQuery } from '../utils';

interface SQLIntegrationProps {
  id: string;
  varName: string;
  typeMappings: IntegrationTypes.IntegrationBlock['typeMappings'];
  blockOptions: IntegrationTypes.SQLBlockIntegration;
}

export const SQLIntegration: FC<SQLIntegrationProps> = ({
  typeMappings,
  blockOptions,
  id,
  varName,
}): null => {
  const computer = useComputer();
  const observable = useIntegrationContext();

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

  useEffect(() => {
    return () => {
      pushResultToComputer(computer, id, varName, undefined);
    };
  }, [computer, id, varName]);

  // REFACTOR: Depending on store and codeStore is inefficient and clunky.
  useEffect(() => {
    const sub = observable?.subscribe((action) => {
      switch (action) {
        case 'refresh':
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
          break;
        case 'show-source': {
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
          break;
        }
      }
    });
    return () => {
      sub?.unsubscribe();
    };
  }, [
    observable,
    store,
    sqlStore,
    varName,
    id,
    typeMappings,
    blockOptions,
    computer,
  ]);

  return null;
};
