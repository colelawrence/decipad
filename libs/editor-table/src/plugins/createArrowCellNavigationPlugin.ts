import { createOnKeyDownPluginFactory } from '@decipad/editor-plugins';
import { ELEMENT_TD, MyGenericEditor, MyValue } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import { getBlockAbove, getNode, TElement, Value } from '@udecode/plate-common';
import { nextCellPath } from '../utils/nextCellPath';

const withoutCurrentKeyboardEvent = <
  TV extends Value = MyValue,
  TE extends MyGenericEditor<TV> = MyGenericEditor<TV>
>(
  editor: TE,
  callback: () => void
) => {
  const { currentKeyboardEvent } = editor;
  // eslint-disable-next-line no-param-reassign
  editor.currentKeyboardEvent = null;
  callback();
  // eslint-disable-next-line no-param-reassign
  editor.currentKeyboardEvent = currentKeyboardEvent;
};

export const createArrowCellNavigationPlugin = createOnKeyDownPluginFactory({
  name: 'ARROW_CELL_NAVIGATION_PLUGIN',
  plugin: (editor) => (event) => {
    /**
     * Only override shift+arrow key behaviour. Plate's withSelectionTable is
     * sufficient for standard arrow key behaviour.
     */
    if (!event.shiftKey) return false;

    const edges: Record<string, 'top' | 'left' | 'bottom' | 'right'> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'top',
      ArrowDown: 'bottom',
    };

    const edge = edges[event.key];
    if (!edge) return false;

    // Make sure the focus is in a cell
    const cellEntry = getBlockAbove(editor, {
      at: editor.selection?.focus,
      match: { type: ELEMENT_TD },
    });
    if (!cellEntry) return false;

    event.preventDefault();
    event.stopPropagation();

    // Make sure the new focus will be in a cell
    const focusPath = nextCellPath(cellEntry[1], edge);
    const focusNode = getNode<TElement>(editor, focusPath);
    if (focusNode?.type !== ELEMENT_TD) return false;

    // Hack: Prevent withSelectionTable from reversing the selection
    withoutCurrentKeyboardEvent<Value>(editor, () => {
      setSelection(editor, {
        focus: { path: focusPath.concat([0]), offset: 0 },
      });
    });

    return true;
  },
});
