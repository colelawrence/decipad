import type {
  ImportElementSource,
  IntegrationTypes,
} from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import {
  useCodeConnectionStore,
  useConnectionStore,
  useNotionConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import {
  findNode,
  insertNodes,
  insertText,
  setNodes,
} from '@udecode/plate-common';
import { useCallback, useEffect } from 'react';
import { assertDefined, getDefined } from '@decipad/utils';
import { getNewIntegration } from '../utils';
import { useCreateExternalDataLinkMutation } from '@decipad/graphql-client';

const getNotionQueryDbLink = (databaseId: string) =>
  `https://api.notion.com/v1/databases/${databaseId}/query`;

type UseBeforeCreateConnectionReturn = (
  type: ImportElementSource | undefined
) => Promise<void>;

function useBeforeCreateConnection(): UseBeforeCreateConnectionReturn {
  const [, createDataLink] = useCreateExternalDataLinkMutation();

  return useCallback<UseBeforeCreateConnectionReturn>(
    async (type) => {
      if (type !== 'notion') {
        return;
      }

      const notionState = useNotionConnectionStore.getState();

      if (
        notionState.ExternalDataId == null ||
        notionState.DatabaseName == null ||
        notionState.DatabaseId == null
      ) {
        throw new Error('i probably dont want to throw here');
      }

      const res = await createDataLink({
        externalDataId: notionState.ExternalDataId,
        name: notionState.DatabaseName,
        url: getNotionQueryDbLink(notionState.DatabaseId),
        method: 'POST',
      });

      if (res.error != null) {
        throw res.error;
      }

      const data = res.data?.createExternalDataLink;
      assertDefined(data);

      const url = `${window.location.origin}/api/externaldatasources/${notionState.ExternalDataId}/data?externalDataLinkId=${data.id}`;

      notionState.Set({ NotionDatabaseUrl: url });
    },
    [createDataLink]
  );
}

/**
 * Used to create an integration with all its state in the editor
 */
export const useCreateIntegration = () => {
  const editor = useMyEditorRef();
  const [createIntegration] = useConnectionStore((state) => [
    state.createIntegration,
  ]);

  const beforeCreate = useBeforeCreateConnection();

  useEffect(() => {
    if (createIntegration) {
      // Using getState because I don't want the hook to refresh when store is changing.
      const store = useConnectionStore.getState();

      if (!store.connectionType || !store.varName) return;

      // Editing an existing integration
      if (store.existingIntegration) {
        const integrationBlock = findNode<IntegrationTypes.IntegrationBlock>(
          editor,
          {
            at: [],
            match: { id: store.existingIntegration },
          }
        );

        if (!integrationBlock) return;
        const [node, path] = integrationBlock;

        insertText(editor, store.varName, { at: path });

        // We were editing the integration
        if (node.integrationType.type === 'codeconnection') {
          const codeStore = useCodeConnectionStore.getState();
          setNodes(
            editor,
            {
              ...node,
              typeMappings: store.resultTypeMapping,
              integrationType: {
                code: codeStore.code,
                latestResult: codeStore.latestResult,
                timeOfLastRun: codeStore.timeOfLastRun,
                type: 'codeconnection',
              } satisfies IntegrationTypes.IntegrationBlock['integrationType'],
            },
            { at: path }
          );
        } else if (node.integrationType.type === 'mysql') {
          const sqlStore = useSQLConnectionStore.getState();
          setNodes(
            editor,
            {
              ...node,
              typeMappings: store.resultTypeMapping,
              integrationType: {
                query: sqlStore.Query,
                latestResult: sqlStore.latestResult,
                timeOfLastRun: sqlStore.timeOfLastRun,
                type: 'mysql',
                externalDataName: getDefined(sqlStore.ExternalDataName),
                externalDataUrl: getDefined(sqlStore.ExternalDataId),
              } satisfies IntegrationTypes.IntegrationBlock['integrationType'],
            },
            { at: path }
          );
        } else if (node.integrationType.type === 'notion') {
          const notionStore = useNotionConnectionStore.getState();

          setNodes(
            editor,
            {
              ...node,
              typeMappings: store.resultTypeMapping,
              integrationType: {
                type: 'notion',
                latestResult: notionStore.latestResult,
                timeOfLastRun: notionStore.timeOfLastRun,
                notionUrl: notionStore.NotionDatabaseUrl!,
                externalDataId: notionStore.ExternalDataId!,
                externalDataName: notionStore.ExternalDataName!,
                databaseName: notionStore.DatabaseName!,
              } satisfies IntegrationTypes.IntegrationBlock['integrationType'],
            },
            { at: path }
          );
        } else {
          throw new Error('NOT SUPPORTED YET');
        }
        store.abort();
        return;
      }

      // eslint-disable-next-line no-inner-declarations
      async function createNewIntegration() {
        if (store.connectionType == null || store.varName == null) {
          return;
        }

        await beforeCreate(store.connectionType);

        const newIntegration = getNewIntegration(
          store.connectionType,
          store.varName
        );

        // 1 is the first thing after h1, shouldn't happen but
        const path = editor.selection?.anchor.path[0] || 1;
        insertNodes(editor, newIntegration, {
          at: [path],
        });

        const anchor = { offset: 0, path: [path, 0] };
        setTimeout(() => setSelection(editor, { anchor, focus: anchor }), 0);
        store.abort();
      }

      createNewIntegration();
    }
  }, [editor, createIntegration, beforeCreate]);
};
