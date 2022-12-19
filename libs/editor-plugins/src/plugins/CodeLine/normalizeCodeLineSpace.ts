import { MyEditor } from '@decipad/editor-types';
import {
  deleteText,
  getEditorString,
  getEndPoint,
  getPointAfter,
  getPointBefore,
  getStartPoint,
  isRangeAcrossBlocks,
  TNodeEntry,
} from '@udecode/plate';
import { Point, Range } from 'slate';

export const normalizeCodeLineSpace = (editor: MyEditor, entry: TNodeEntry) => {
  // const firstLine =
  const [, path] = entry;

  const normalizeEdge = (firstPoint: Point, secondPoint?: Point) => {
    if (!secondPoint) return;

    const range = {
      anchor: firstPoint,
      focus: secondPoint,
    } as Range;

    if (
      !isRangeAcrossBlocks(editor, {
        at: range,
      })
    ) {
      const char = getEditorString(editor, {
        anchor: firstPoint,
        focus: secondPoint,
      });

      if (/\s/.test(char)) {
        deleteText(editor, { at: range });

        normalizeCodeLineSpace(editor, entry);
      }
    }
  };

  const firstPoint = getStartPoint(editor, path);
  if (firstPoint) {
    normalizeEdge(firstPoint, getPointAfter(editor, firstPoint));
  }

  const lastPoint = getEndPoint(editor, path);
  if (lastPoint) {
    normalizeEdge(lastPoint, getPointBefore(editor, lastPoint));
  }
};
