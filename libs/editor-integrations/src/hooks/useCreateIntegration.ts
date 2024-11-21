import {
  ELEMENT_INTEGRATION,
  type IntegrationTypes,
} from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { insertNodes } from '@udecode/plate-common';
import { useCallback } from 'react';
import { getNewIntegration } from '../utils';
import { useAddAttachmentToNotebookMutation } from '@decipad/graphql-client';
import { useActiveEditor } from '@decipad/editor-hooks';
import { assert } from '@decipad/utils';
import { useNotebookRoute } from '@decipad/routing';
import { ConnectionProps, IntegrationProps } from '../connections';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import omit from 'lodash/omit';
import { useClientEvents } from '@decipad/client-events';
import { Runner } from '@decipad/notebook-tabs';

/**
 * Returns the attachment ID from a file handle
 *
 * @example /workspaces/{workspaceId}/attachments/{attachmentId}
 * @throws if you supply an incorrect URL
 */
const getAttachmentId = (url: string) => {
  const splitValues = url.split('/');

  if (splitValues.length > 0) {
    const attachmentId = splitValues.at(-1);

    return attachmentId;
  }

  return null;
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
          if (attachmentId) {
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

          return block;
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
  runner: Runner,
  props: IntegrationProps
): ((state: ConnectionProps) => void) => {
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);
  const track = useClientEvents();

  const editor = useActiveEditor();
  assert(editor != null, 'editor cannot be null when creating an integration');

  const controller = useNotebookWithIdState((s) => s.controller);

  const { notebookId } = useNotebookRoute();

  const onBeforeCreateIntegration = useOnBeforeCreateIntegration(notebookId);

  const onEditIntegrationCallback = useCallback(
    (_: ConnectionProps) => {
      assert(
        controller != null,
        'controller cannot be null when editing the integration'
      );
      assert(props.type === 'edit');

      const entry = controller.getEntryFromId(props.integrationBlock.id!);
      if (entry == null) {
        throw new Error(
          'cannot find the integration. TODO: better errors, this can happen when the user deletes the block'
        );
      }

      const [node, path] = entry;

      if (node.type !== ELEMENT_INTEGRATION) {
        throw new Error(
          'editing block is not an integration: TODO: better errors'
        );
      }

      const childlessNode = omit(node, 'children');

      controller.apply({
        type: 'set_node',
        path,
        properties: childlessNode,
        newProperties: {
          ...childlessNode,
          isFirstRowHeader:
            'isFirstHeaderRow' in runner.options.importer &&
            typeof runner.options.importer.isFirstHeaderRow === 'boolean'
              ? runner.options.importer.isFirstHeaderRow
              : false,
          typeMappings: runner.types,
        } satisfies Omit<IntegrationTypes.IntegrationBlock, 'children'>,
      });
    },
    [controller, props, runner]
  );

  const onCreateIntegrationCallback = useCallback(
    (state: ConnectionProps) => {
      const newIntegration = getNewIntegration(state.varName, runner);

      async function onCreateIntegration() {
        const newBlock = await onBeforeCreateIntegration(newIntegration);
        assert(
          editor != null,
          'editor cannot be null when creating an integration'
        );

        const path =
          editor.selection?.anchor.path[0] ?? editor.children.length - 1;

        insertNodes(editor, newBlock, {
          at: [path],
        });

        const anchor = { offset: 0, path: [path, 0] };
        setTimeout(() => setSelection(editor, { anchor, focus: anchor }), 0);

        setSidebar({ type: 'closed' });
      }

      onCreateIntegration();
      track({
        segmentEvent: {
          type: 'action',
          action: 'Notebook Integration Created',
          props: {
            integration_type: state.connectionType as any,
            analytics_source: 'frontend',
          },
        },
      });
    },
    [editor, onBeforeCreateIntegration, runner, setSidebar, track]
  );

  return props.type === 'create'
    ? onCreateIntegrationCallback
    : onEditIntegrationCallback;
};
