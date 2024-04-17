import { pushResultToComputer } from '@decipad/live-connect';
import {
  useComputer,
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
import { findNodePath, getNodeString, setNodes } from '@udecode/plate-common';
import type { FC } from 'react';
import { useMyEditorRef, type IntegrationTypes } from '@decipad/editor-types';
import { merge } from '@decipad/utils';

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
  const editor = useMyEditorRef();

  useEffect(() => {
    const res = JSON.parse(latestResult);
    if (!res) return;

    async function getResult() {
      const [notionRes, cohersions] = importFromNotion(res);
      const mergedTypeMappings = merge(typeMappings, cohersions);

      const notionResult = await importFromUnknownJson(notionRes, {
        columnTypeCoercions: columnTypeCoercionsToRec(mergedTypeMappings),
      });
      pushResultToComputer(computer, id, varName, notionResult);
    }

    getResult();
  }, [computer, id, varName, typeMappings, latestResult]);

  useIntegrationOptions({
    onRefresh() {
      fetch(integrationType.notionUrl)
        .then((res) => res.json())
        .then(async (res) => {
          const notionImported = importFromNotion(res);
          const result = await importFromUnknownJson(notionImported, {
            columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
          });
          pushResultToComputer(computer, id, varName, result);

          const path = findNodePath(editor, element);
          if (path == null) {
            return;
          }

          setNodes(
            editor,
            {
              latestResult: JSON.stringify(res),
            } satisfies Partial<IntegrationTypes.IntegrationBlock>,
            { at: path }
          );
        });
    },
    onShowSource() {
      const store = useConnectionStore.getState();
      const notionStore = useNotionConnectionStore.getState();

      store.abort();

      importFromUnknownJson(importFromNotion(JSON.parse(latestResult)), {
        columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
      }).then((notionResult) => {
        if (notionResult) {
          store.Set({ resultPreview: notionResult });
        }

        store.Set({
          connectionType: 'notion',
          stage: 'connect',
          existingIntegration: id,
          rawResult: latestResult,
          varName,
        });

        store.setAllTypeMapping(typeMappings);
        store.changeOpen(true);

        notionStore.Set({
          NotionDatabaseUrl: integrationType.notionUrl,

          ExternalDataId: integrationType.externalDataId,
          ExternalDataName: integrationType.externalDataName,
          DatabaseName: integrationType.databaseName,

          latestResult,
        });
      });
    },
    onDelete() {
      pushResultToComputer(computer, id, varName, undefined);
    },
  });

  return null;
};
