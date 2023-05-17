import { MyPlatePlugin } from '@decipad/editor-types';
import { hasNode } from '@udecode/plate';
import { Point } from 'slate';

export const createPreventInvalidSelectionPlugin = (): MyPlatePlugin => ({
  key: 'PREVENT_INVALID_SELECTION_PLUGIN',
  withOverrides: (editor) => {
    const { apply } = editor;

    const hasPathPoint = (point?: Point): boolean =>
      point ? hasNode(editor, point.path) : true;

    // eslint-disable-next-line no-param-reassign
    editor.apply = (op) => {
      if (op.type === 'set_selection') {
        const newSelection = op.newProperties;
        const paths = newSelection
          ? [newSelection.anchor, newSelection.focus]
          : [];
        if (!paths.every(hasPathPoint)) {
          return;
        }
      }
      apply(op);
    };

    return editor;
  },
});
