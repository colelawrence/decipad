import { FC, useEffect } from 'react';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  useComputer,
  useConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { IntegrationTypes } from '@decipad/editor-types';
import { mapResultType } from '@decipad/computer';
import { useIntegrationContext } from '.';
import { MaybeResultFromWorker, fetchQuery } from '../utils';

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
    const result = MaybeResultFromWorker(blockOptions.latestResult);
    if (!result) return;

    const mappedResult = mapResultType(result, typeMappings);
    pushResultToComputer(computer, id, varName, mappedResult);
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
                const result = MaybeResultFromWorker(JSON.stringify(res.data));
                if (!result) return;

                const mappedResult = mapResultType(result, typeMappings);
                pushResultToComputer(computer, id, varName, mappedResult);
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

          const res = MaybeResultFromWorker(blockOptions.latestResult);
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
