import { useCallback, useEffect, useState } from 'react';
import { BaseRange, Path, Range } from 'slate';
import { isText } from '@udecode/plate';
import { MyDecorateEntry } from '@decipad/editor-types';
import { Cursor } from '../model';
import { relativePositionToAbsolutePosition } from '../cursor/utils';
import { CursorEditor } from './cursorEditor';

interface WithData {
  data: Record<string, unknown>;
}

type RangeWithData = BaseRange &
  WithData & {
    isForward: boolean;
    isCaret: boolean;
  };

export const useCursors = (
  editor: CursorEditor
): {
  decorate: MyDecorateEntry;
  cursors: Cursor[];
} => {
  const [cursors, setCursorData] = useState<Cursor[]>([]);

  useEffect(() => {
    editor.awareness.on('update', () => {
      const newCursorData = Array.from(editor.awareness.getStates())
        .filter(([clientId]) => clientId !== editor.sharedType.doc?.clientID)
        .map(([, awareness]) => {
          let anchor = null;
          let focus = null;

          if (awareness.anchor) {
            anchor = relativePositionToAbsolutePosition(
              editor.sharedType,
              awareness.anchor
            );
          }

          if (awareness.focus) {
            focus = relativePositionToAbsolutePosition(
              editor.sharedType,
              awareness.focus
            );
          }

          return { anchor, focus, data: awareness };
        })
        .filter((cursor) => cursor.anchor && cursor.focus);

      setCursorData(newCursorData as unknown as Cursor[]);
    });
  }, [editor]);

  const decorate: MyDecorateEntry = useCallback(
    ([node, path]) => {
      const ranges: RangeWithData[] = [];

      if (isText(node) && cursors?.length) {
        cursors.forEach((cursor: Cursor) => {
          if (Range.includes(cursor, path)) {
            const { focus, anchor, data } = cursor;

            const isFocusNode = Path.equals(focus.path, path);
            const isAnchorNode = Path.equals(anchor.path, path);
            const isForward = Range.isForward({ anchor, focus });

            ranges.push({
              data,
              isForward,
              isCaret: isFocusNode,
              anchor: {
                path,
                // eslint-disable-next-line no-nested-ternary
                offset: isAnchorNode
                  ? anchor.offset
                  : isForward
                  ? 0
                  : node.text.length,
              },
              focus: {
                path,
                // eslint-disable-next-line no-nested-ternary
                offset: isFocusNode
                  ? focus.offset
                  : isForward
                  ? node.text.length
                  : 0,
              },
            });
          }
        });
      }

      return ranges;
    },
    [cursors]
  );

  return { decorate, cursors };
};

export default useCursors;
