import {
  deleteText,
  getNodeString,
  getParentNode,
  moveSelection,
} from '@udecode/plate';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { Range } from 'slate';
import { isElementOfType } from '@decipad/editor-utils';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

const pairs = [
  { start: '{', end: '}' },
  { start: '[', end: ']' },
  { start: '(', end: ')' },
];

const isAtEndOfLine = (text: string, cursorOffset: number) =>
  text[cursorOffset] === '\n' || text[cursorOffset] === undefined;

export const createAutoPairsPlugin = createOnKeyDownPluginFactory({
  name: 'AUTO_PAIR_PLUGIN',
  plugin: (editor) => (event) => {
    const { selection } = editor;

    if (selection) {
      const cursor = Range.start(selection);
      const parentEntry = getParentNode(editor, cursor);

      if (parentEntry) {
        const [node] = parentEntry;

        if (isElementOfType(node, ELEMENT_CODE_LINE)) {
          const activePair = pairs.find((pair) => pair.start === event.key);

          const nodeText = getNodeString(node);

          if (activePair && isAtEndOfLine(nodeText, cursor.offset)) {
            event.preventDefault();
            editor.insertText(activePair.start + activePair.end);
            moveSelection(editor, {
              distance: 1,
              unit: 'offset',
              reverse: true,
            });
          }

          const endPair = pairs.find((pair) => pair.end === event.key);
          if (endPair && nodeText[cursor.offset] === endPair.end) {
            event.preventDefault();
            moveSelection(editor, {
              distance: 1,
              unit: 'offset',
            });
          }

          if (event.key === 'Backspace') {
            const startPair = pairs.find(
              (p) => p.start === nodeText[cursor.offset - 1]
            );
            const end = pairs.find((p) => p.end === nodeText[cursor.offset]);

            if (startPair && end && startPair === end) {
              moveSelection(editor, { unit: 'offset', distance: 1 });
              deleteText(editor, {
                unit: 'character',
                distance: 1,
                reverse: true,
              });
            }
          }
        }
      }
    }
  },
});
