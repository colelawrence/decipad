import type { DocSyncEditor } from '@decipad/docsync';
import {
  ELEMENT_IMAGE,
  ELEMENT_LIVE_CONNECTION,
  type ImageElement,
  type TabElement,
  ELEMENT_TAB,
} from '@decipad/editor-types';
import type { TOperation } from '@udecode/plate-common';
import { useDeleteAttachment } from '@decipad/editor-utils';
import { useEffect } from 'react';

const singleAttachment =
  (
    editor: DocSyncEditor | undefined,
    actions: ReturnType<typeof useDeleteAttachment>
  ) =>
  (attachmentElement: ImageElement, op: TOperation) => {
    if (editor == null || editor.isMoving) {
      return;
    }

    const url = new URL(attachmentElement.url);

    //
    // Is the attachment bound to our server?
    // Or is it attached from somewhere else on the web?
    //

    if (url.origin !== window.location.origin) {
      return;
    }

    //
    // Everytime we insert, we attempt to undelete the attachment
    // This is because of undo/redo. If you delete an image,
    // and then redo, it comes through as an `insert_node` event,
    // and we must 'undelete' the attachment which was previously deleted.
    //

    if (op.type === 'insert_node') {
      actions.onUndeleteAttachment(attachmentElement.url);
      return;
    }

    //
    // Find, in all the tabs children. An element with the same URL
    // If you find more than one, then you can't delete the attachment
    //
    // This is incase the user duplicates the block, we can't delete the attachment.
    // based on one deletion, we can only delete when all blocks dependent on
    // the attachment are removed.
    //

    const tabs = editor.children.slice(1) as Array<TabElement>;

    const similarAttachmentElements = tabs
      .map((t) => t.children)
      .flat()
      .filter(
        (c) => c.type === ELEMENT_IMAGE && c.url === attachmentElement.url
      );

    if (similarAttachmentElements.length > 1) {
      return;
    }

    actions.onDeleteAttachment(attachmentElement.url);
  };

const attachmentManagement = (
  actions: ReturnType<typeof useDeleteAttachment>,
  editor: DocSyncEditor | undefined
) => {
  return (op: TOperation) => {
    if (editor == null) {
      return;
    }

    const singleAttachmentCurried = singleAttachment(editor, actions);

    if (op.type !== 'remove_node' && op.type !== 'insert_node') {
      return;
    }

    if (
      op.node.type !== ELEMENT_IMAGE &&
      op.node.type !== ELEMENT_LIVE_CONNECTION &&
      op.node.type !== ELEMENT_TAB
    ) {
      return;
    }

    if (op.node.type === ELEMENT_TAB) {
      const tab = op.node as TabElement;

      for (const child of tab.children) {
        if (child.type === ELEMENT_IMAGE) {
          singleAttachmentCurried(child, op);
        }
      }
    } else {
      singleAttachmentCurried(op.node as ImageElement, op);
    }
  };
};

/**
 *
 * Binds to the `events` observable and performs certain actions.
 *
 * So far, we use this for attachment management (when to delete, undelete)
 */
export const useEditorEvents = (editor: DocSyncEditor | undefined) => {
  const attachmentActions = useDeleteAttachment();

  const attachmentManagementFunc = attachmentManagement(
    attachmentActions,
    editor
  );

  useEffect(() => {
    if (editor == null) {
      return;
    }

    const sub = editor.events.subscribe((v) => {
      if (v.type !== 'any-change' || v.op == null) {
        return;
      }

      attachmentManagementFunc(v.op);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [attachmentManagementFunc, editor]);
};
