import { ELEMENT_CODE_LINE, getParent, PlatePlugin } from '@udecode/plate';
import { Range, Transforms } from 'slate';

export const createAutoPairsPlugin = (): PlatePlugin => ({
  onKeyDown: (editor) => (event) => {
    const { selection } = editor;

    const pairs = [
      {
        start: '{',
        end: '}',
      },
      { start: '[', end: ']' },
      {
        start: '(',
        end: ')',
      },
    ];

    if (selection) {
      const cursor = Range.start(selection);
      const parentEntry = getParent(editor, cursor);

      if (parentEntry) {
        const [node] = parentEntry;

        if (node.type === ELEMENT_CODE_LINE) {
          const activePair = pairs.find((pair) => pair.start === event.key);
          if (
            activePair &&
            node.children[0].text[cursor.offset] !== activePair.start
          ) {
            event.preventDefault();
            editor.insertText(activePair.start + activePair.end);
            Transforms.move(editor, {
              distance: 1,
              unit: 'offset',
              reverse: true,
            });
          }

          const endPair = pairs.find((pair) => pair.end === event.key);
          if (
            endPair &&
            node.children[0].text[cursor.offset - 1] === endPair.start
          ) {
            event.preventDefault();
            Transforms.move(editor, {
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
              Transforms.move(editor, { unit: 'offset', distance: 1 });
              Transforms.delete(editor, {
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
