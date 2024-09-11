import type { IntegrationTypes, MyEditor } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import {
  useConnectionStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { insertNodes } from '@udecode/plate-common';
import { useCallback, useEffect } from 'react';
import { getNewIntegration } from '../utils';
import { GenericContainerRunner } from '../runners';
import { useAddAttachmentToNotebookMutation } from '@decipad/graphql-client';
import assert from 'assert';

/**
 * Returns the attachment ID from a file handle
 *
 * @example /workspaces/{workspaceId}/attachments/{attachmentId}
 * @throws if you supply an incorrect URL
 */
const getAttachmentId = (url: string) => {
  const splitValues = url.split('/');
  assert(splitValues.length > 0);

  const attachmentId = splitValues.at(-1);
  assert(attachmentId != null);

  return attachmentId;
};

const useOnBeforeCreateIntegration = (notebookId: string) => {
  const [, addAttachmentToNotebook] = useAddAttachmentToNotebookMutation();

  const onBeforeCreateIntegration = useCallback(
    async (
      block: IntegrationTypes.IntegrationBlock
    ): Promise<IntegrationTypes.IntegrationBlock> => {
      switch (block.integrationType.type) {
        case 'csv': {
          const attachmentId = getAttachmentId(block.integrationType.csvUrl);
          const res = await addAttachmentToNotebook({
            attachmentId,
            notebookId,
          });

          if (res.data?.addAttachmentToPad == null) {
            return block;
          }

          const newBlock: IntegrationTypes.IntegrationBlock = {
            ...block,
            integrationType: {
              ...block.integrationType,
              csvUrl: res.data.addAttachmentToPad.url,
            },
          };

          return newBlock;
        }
        default: {
          return block;
        }
      }
    },
    [addAttachmentToNotebook, notebookId]
  );

  return onBeforeCreateIntegration;
};

/**
 * Used to create an integration with all its state in the editor
 */
export const useCreateIntegration = (
  editor: MyEditor,
  runner: GenericContainerRunner,
  notebookId: string
) => {
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);
  const onBeforeCreateIntegration = useOnBeforeCreateIntegration(notebookId);
  const createIntegration = useConnectionStore(
    (state) => state.createIntegration
  );

  useEffect(() => {
    if (!createIntegration) return;

    // Using getState because I don't want the hook to refresh when store is changing.
    const store = useConnectionStore.getState();

    if (!store.connectionType || !store.varName) return;
    if (store.connectionType == null || store.varName == null) return;

    const newIntegration = getNewIntegration(store.connectionType, runner);

    async function onCreateIntegration() {
      const newBlock = await onBeforeCreateIntegration(newIntegration);

      // 1 is the first thing after h1, shouldn't happen but
      const path = editor.selection?.anchor.path[0] || 1;
      insertNodes(editor, newBlock, {
        at: [path],
      });

      const anchor = { offset: 0, path: [path, 0] };
      setTimeout(() => setSelection(editor, { anchor, focus: anchor }), 0);

      store.abort();
      setSidebar({ type: 'closed' });
    }

    onCreateIntegration();
  }, [
    editor,
    createIntegration,
    runner,
    setSidebar,
    onBeforeCreateIntegration,
  ]);
};
