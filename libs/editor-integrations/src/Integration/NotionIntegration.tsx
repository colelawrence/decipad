import { pushResultToComputer } from '@decipad/live-connect';
import {
  useConnectionStore,
  useNotionConnectionStore,
} from '@decipad/react-contexts';
import {
  importFromUnknownJson,
  importFromNotion,
  columnTypeCoercionsToRec,
} from '@decipad/import';
import { useEffect } from 'react';
import { useIntegrationOptions } from '../hooks';
import { getNodeString } from '@udecode/plate-common';
import type { FC } from 'react';
import { type IntegrationTypes } from '@decipad/editor-types';
import { merge } from '@decipad/utils';
import { useComputer } from '@decipad/editor-hooks';

export const NotionIntegration: FC<
  IntegrationTypes.IntegrationBlock<'notion'> & {
    element: IntegrationTypes.IntegrationBlock;
  }
> = ({
  integrationType,
  typeMappings,
  id,
  children,
  latestResult,
  element,
}) => {
  const computer = useComputer();
  const varName = getNodeString(children[0]);

  useEffect(() => {
    const res = JSON.parse(latestResult);
    if (!res) return;

    async function getResult() {
      const [notionRes, cohersions] = importFromNotion(res);
      const mergedTypeMappings = merge(typeMappings, cohersions);

      const notionResult = await importFromUnknownJson(computer, notionRes, {
        columnTypeCoercions: columnTypeCoercionsToRec(mergedTypeMappings),
      });
      pushResultToComputer(computer, id, varName, notionResult);
    }

    getResult();
  }, [computer, id, varName, typeMappings, latestResult]);

  useIntegrationOptions(element, {
    async onRefresh() {
      const fetchResponse = await fetch(integrationType.notionUrl);
      const res = await fetchResponse.json();

      const [notionImported, cohersions] = importFromNotion(res);
      const mergedTypeMappings = merge(typeMappings, cohersions);

      const result = await importFromUnknownJson(computer, notionImported, {
        columnTypeCoercions: columnTypeCoercionsToRec(mergedTypeMappings),
      });

      pushResultToComputer(computer, id, varName, result);
      return JSON.stringify(res);
    },
    onShowSource() {
      const store = useConnectionStore.getState();
      const notionStore = useNotionConnectionStore.getState();

      store.abort();

      importFromUnknownJson(
        computer,
        importFromNotion(JSON.parse(latestResult)),
        {
          columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
        }
      ).then((notionResult) => {
        store.Set({
          connectionType: 'notion',
          stage: 'connect',
          existingIntegration: id,
          rawResult: latestResult,
          resultPreview: notionResult,
          varName,
        });

        store.setAllTypeMapping(typeMappings);
        store.changeOpen(true);

        notionStore.Set({
          NotionDatabaseUrl: integrationType.notionUrl,
          ExternalDataId: integrationType.externalDataId,
          ExternalDataName: integrationType.externalDataName,
          DatabaseName: integrationType.databaseName,
        });
      });
    },
  });

  return null;
};
