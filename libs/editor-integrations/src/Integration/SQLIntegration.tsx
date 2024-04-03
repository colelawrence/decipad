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

      const res = importFromJSONAndCoercions(
        blockOptions.latestResult,
        typeMappings
      );

      if (res) {
        store.Set({ resultPreview: res });
      }

      store.Set({
        connectionType: 'mysql',
        stage: 'connect',
        existingIntegration: id,
        varName,
      });

      store.setAllTypeMapping(typeMappings);
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
