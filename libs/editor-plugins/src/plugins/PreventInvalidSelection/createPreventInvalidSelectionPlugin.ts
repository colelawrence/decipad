import { MyPlatePlugin } from '@decipad/editor-types';
import { hasPoint } from '@decipad/editor-utils';
import {
  hasNode,
  isText,
  getNode,
  TOperation,
  getStartPoint,
} from '@udecode/plate';
import { Point } from 'slate';

export const createPreventInvalidSelectionPlugin = (): MyPlatePlugin => ({
  key: 'PREVENT_INVALID_SELECTION_PLUGIN',
  withOverrides: (editor) => {
    const { apply } = editor;

    const isValidPoint = (point?: Point): point is Point =>
      point
        ? hasNode(editor, point.path) && isText(getNode(editor, point.path))
        : true;

    const fixPoint = (point: Point): Point | undefined => {
      if (!hasPoint(editor, point)) {
        return;
      }
      const start = getStartPoint(editor, point.path);
      return {
        ...start,
        offset: point.offset,
      };
    };

    const tryApply = (op: TOperation, attempts = 0): void => {
      if (op.type === 'set_selection') {
        if (attempts > 1) {
          return;
        }
        const newSelection = op.newProperties;
        const points = newSelection
          ? [newSelection.anchor, newSelection.focus]
          : [];
        if (!points.every(isValidPoint)) {
          const newPoints = (points as Point[]).map(fixPoint);
          if (newPoints.every(Boolean)) {
            return tryApply(
              {
                ...op,
                newProperties: {
                  ...op.newProperties,
                  anchor: (newPoints as [Point, Point])[0],
                  focus: (newPoints as [Point, Point])[1],
                },
              },
              attempts + 1
            );
          }
          console.warn('prevented set_selection', op);
          return;
        }
      }
      apply(op);
    };

    // eslint-disable-next-line no-param-reassign
    editor.apply = tryApply;

    return editor;
  },
});
