import { useEffect } from 'react';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  useComputer,
  useConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { importFromJSONAndCoercions } from '@decipad/import';
import { fetchQuery } from '../utils';
import { useIntegrationOptions } from '../hooks';
import { getNodeString } from '@udecode/plate-common';
import { type IntegrationTypes } from '@decipad/editor-types';
import type { FC } from 'react';

export const SQLIntegration: FC<
  IntegrationTypes.IntegrationBlock<'mysql'> & {
    element: IntegrationTypes.IntegrationBlock;
  }
> = ({
  typeMappings,
  integrationType,
  latestResult,
  id,
  children,
  element,
}) => {
  const computer = useComputer();
  const varName = getNodeString(children[0]);

  useEffect(() => {
    async function getResult() {
      const result = await importFromJSONAndCoercions(
        latestResult,
        typeMappings
      );

      if (!result) return;

      pushResultToComputer(computer, id, varName, result);
    }

    getResult();
  }, [computer, id, varName, typeMappings, latestResult]);

  useIntegrationOptions(element, {
    async onRefresh() {
      const res = await fetchQuery(
        integrationType.externalDataUrl,
        integrationType.query
      );
      if (res?.type !== 'success') {
        return;
      }

      const result = await importFromJSONAndCoercions(
        JSON.stringify(res.data),
        typeMappings
      );
      if (!result) return;
      pushResultToComputer(computer, id, varName, result);

      return JSON.stringify(res.data);
    },
    onShowSource() {
      const store = useConnectionStore.getState();
      const sqlStore = useSQLConnectionStore.getState();

      store.abort();

      importFromJSONAndCoercions(latestResult, typeMappings).then((res) => {
        store.Set({
          connectionType: 'mysql',
          stage: 'connect',
          existingIntegration: id,
          rawResult: latestResult,
          resultPreview: res,
          varName,
        });

        store.setAllTypeMapping(typeMappings);
        store.changeOpen(true);

        sqlStore.Set({
          Query: integrationType.query,
          ExternalDataName: integrationType.externalDataName,
          ExternalDataId: integrationType.externalDataUrl,
        });
      });
    },
  });

  return null;
};
