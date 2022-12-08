import { MyEditor } from '@decipad/editor-types';
import { TOperation } from '@udecode/plate';
import { useEffect } from 'react';

/**
 * This hook prevents editor from jumping out of the block.
 * Cursor will not move if you for example press left when the cursor is at the beginning of the block.
 * It prevents only navigation with arrow keys. You can still click outside of the block.
 * Right now it is used in the teleported code lines.
 *
 * @param editor - Slate editor
 * @param shouldPreventJumpingOut - If true, the editor will prevent jumping out of the block.
 */
export const useSelectionTrap = (
  editor: MyEditor,
  shouldPreventJumpingOut: boolean
) => {
  useEffect(() => {
    if (!shouldPreventJumpingOut) return;

    const { apply } = editor;
    const tracker = trackArrowKeys();

    const overrideApply: typeof apply = (operation) => {
      if (operation.type === 'set_selection') {
        const shouldPreventAction =
          tracker.arrowKeyUsed && !isSelectionInsideBlock(operation);

        if (shouldPreventAction) {
          return apply(cancelSetSelectionOperation(operation));
        }
      }
      return apply(operation);
    };

    // eslint-disable-next-line no-param-reassign
    editor.apply = overrideApply;

    return () => {
      // eslint-disable-next-line no-param-reassign
      editor.apply = apply;
      tracker.unsubscribe();
    };
  }, [editor, shouldPreventJumpingOut]);
};

const isSelectionInsideBlock = (operation: TOperation) => {
  if (operation.type !== 'set_selection') return null;

  const newFocus = operation.newProperties?.focus?.path[0];
  const newAnchor = operation.newProperties?.anchor?.path[0];

  const focusRoot = operation.properties?.focus?.path[0];
  const anchorRoot = operation.properties?.anchor?.path[0];

  const allDefined = newFocus && newAnchor && focusRoot && anchorRoot;

  if (allDefined == null) return true;

  return (
    focusRoot === anchorRoot &&
    focusRoot === newFocus &&
    anchorRoot === newAnchor
  );
};

const cancelSetSelectionOperation = (operation: TOperation): TOperation => {
  if (operation.type !== 'set_selection') return operation;

  if (!operation.properties) return operation;
  if (!operation.newProperties) return operation;

  return {
    ...operation,
    newProperties: operation.properties,
  };
};

const trackArrowKeys = () => {
  const tracker = {
    arrowKeyUsed: false,
    unsubscribe: () => {
      document.removeEventListener('keydown', onWindowKeyDown, true);
    },
  };

  const onWindowKeyDown = (event: KeyboardEvent) => {
    if (!event.key.startsWith('Arrow')) return;

    tracker.arrowKeyUsed = true;

    setTimeout(() => {
      tracker.arrowKeyUsed = false;
    }, 50);
  };

  document.addEventListener('keydown', onWindowKeyDown, true);

  return tracker;
};
