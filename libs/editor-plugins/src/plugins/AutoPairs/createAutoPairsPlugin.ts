import { deleteText, getParentNode, moveSelection } from '@udecode/plate';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { Range } from 'slate';
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

        if (node.type === ELEMENT_CODE_LINE) {
          const activePair = pairs.find((pair) => pair.start === event.key);

          if (
            activePair &&
            isAtEndOfLine(node.children[0].text, cursor.offset)
          ) {
            event.preventDefault();
            editor.insertText(activePair.start + activePair.end);
            moveSelection(editor, {
              distance: 1,
              unit: 'offset',
              reverse: true,
            });
          }

          const endPair = pairs.find((pair) => pair.end === event.key);
          if (endPair && node.children[0].text[cursor.offset] === endPair.end) {
            event.preventDefault();
            moveSelection(editor, {
              distance: 1,
              unit: 'offset',
            });
          }

          if (event.key === 'Backspace') {
            const startPair = pairs.find(
              (p) => p.start === node.children[0].text[cursor.offset - 1]
            );
            const end = pairs.find(
              (p) => p.end === node.children[0].text[cursor.offset]
            );

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
