import { IntegrationTypes, useTEditorRef } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import {
  useCodeConnectionStore,
  useConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { findNode, insertNodes, insertText, setNodes } from '@udecode/plate';
import { useEffect } from 'react';
import { getDefined } from '@decipad/utils';
import { getNewIntegration } from '../utils';

/**
 * Used to create an integration with all its state in the editor
 */
export const useCreateIntegration = () => {
  const editor = useTEditorRef();
  const [createIntegration] = useConnectionStore((state) => [
    state.createIntegration,
  ]);

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
        } else {
          throw new Error('NOT SUPPORTED YET');
        }
        store.abort();
        return;
      }

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
  }, [editor, createIntegration]);
};
