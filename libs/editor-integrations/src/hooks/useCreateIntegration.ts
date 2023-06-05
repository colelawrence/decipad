import { IntegrationTypes, useTEditorRef } from '@decipad/editor-types';
import {
  useCodeConnectionStore,
  useConnectionStore,
} from '@decipad/react-contexts';
import { findNode, insertNodes, setNodes, setSelection } from '@udecode/plate';
import { useEffect } from 'react';
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
      const codeStore = useCodeConnectionStore.getState();

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

        // We were editing the integration
        setNodes(
          editor,
          {
            ...node,
            integrationType: {
              code: codeStore.code,
              latestResult: codeStore.latestResult,
              type: 'codeconnection',
            } satisfies IntegrationTypes.IntegrationBlock['integrationType'],
          },
          { at: path }
        );
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
